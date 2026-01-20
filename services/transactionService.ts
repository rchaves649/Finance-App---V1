
import { Transaction, Scope } from '../types/finance';
import { TransactionRepository } from './localRepositories';
import { roundToTwo } from '../shared/formatUtils';
import { ClassificationEngine } from '../classification/classificationService';
import { CSVService } from './csvService';
import { ScopeDomainService } from './scopeDomainService';

export const TransactionService = {
  /**
   * Obtém as transações do escopo, aplica sanitização (splits e status) e ordena por data.
   * Utiliza o ID como critério de desempate para garantir ordenação estável e estática.
   */
  getScopedTransactions: (scope: Scope): Transaction[] => {
    const txs = scope.scopeType === 'shared' 
      ? TransactionRepository.getSharedView(scope.scopeId)
      : TransactionRepository.getAll(scope.scopeId);
    
    let needsUpdate = false;
    const sanitizedTxs = txs.map(t => {
      let isModified = false;

      // Aplica split padrão se for escopo compartilhado e não tiver split definido
      if (scope.scopeType === 'shared' && t.scopeId === scope.scopeId && !t.payerShare) {
        isModified = true;
        const splitA = scope.defaultSplit?.A ?? 50;
        const splitB = scope.defaultSplit?.B ?? 50;
        
        t.payerShare = { 
          A: roundToTwo((t.amount * splitA) / 100), 
          B: roundToTwo((t.amount * splitB) / 100) 
        };
      }

      // Garante status de classificação para dados legados ou demo
      if (!t.classificationStatus) {
        isModified = true;
        if (!t.categoryId || !t.subcategoryId) {
          t.classificationStatus = 'pending';
        } else {
          t.classificationStatus = t.isSuggested ? 'auto' : 'manual';
        }
      }

      if (isModified) needsUpdate = true;
      return t;
    });

    if (needsUpdate) {
      TransactionRepository.saveMany(sanitizedTxs);
    }

    // Ordenação determinística: Data decrescente, ID como desempate (preserva ordem relativa estável)
    return sanitizedTxs.sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      if (dateB !== dateA) return dateB - dateA;
      return b.id.localeCompare(a.id);
    });
  },

  /**
   * Processa o texto CSV, gera transações com sugestões e salva no repositório.
   */
  processCSVImport: (csvText: string, scope: Scope): void => {
    const rawData = CSVService.parse(csvText);
    
    const newTransactions: Transaction[] = rawData.map(item => {
      const suggestion = ClassificationEngine.suggest(scope.scopeId, item.description);

      let isRecurring = false;
      let payerShare = undefined;
      let classificationStatus: 'auto' | 'manual' | 'pending' = 'pending';

      if (suggestion) {
        classificationStatus = 'auto';
        if (suggestion.payerShare) {
          isRecurring = true;
          payerShare = {
            A: suggestion.payerShare.A !== null ? roundToTwo(suggestion.payerShare.A) : null,
            B: suggestion.payerShare.B !== null ? roundToTwo(suggestion.payerShare.B) : null
          };
        }
      }

      const tx: Transaction = {
        id: crypto.randomUUID(),
        scopeId: scope.scopeId,
        date: item.date,
        description: item.description,
        amount: roundToTwo(item.amount),
        categoryId: suggestion?.categoryId,
        subcategoryId: suggestion?.subcategoryId,
        payerShare: payerShare,
        isConfirmed: false,
        isSuggested: !!suggestion,
        isAutoConfirmed: false,
        isRecurring,
        classificationStatus
      };

      // Aplica split padrão no import se for compartilhado
      if (scope.scopeType === 'shared' && !tx.payerShare) {
        const splitA = scope.defaultSplit?.A ?? 50;
        const splitB = scope.defaultSplit?.B ?? 50;
        tx.payerShare = { 
          A: roundToTwo((item.amount * splitA) / 100), 
          B: roundToTwo((item.amount * splitB) / 100) 
        };
      }

      return tx;
    });

    TransactionRepository.saveMany(newTransactions);
  },

  /**
   * Sanitiza e salva atualizações em uma transação existente.
   */
  updateTransaction: (tx: Transaction, updates: Partial<Transaction>): void => {
    if (tx.isConfirmed && !tx.isAutoConfirmed) return;

    const sanitizedUpdates = { ...updates };
    if (sanitizedUpdates.amount !== undefined) {
      sanitizedUpdates.amount = roundToTwo(sanitizedUpdates.amount);
    }
    if (sanitizedUpdates.payerShare) {
      sanitizedUpdates.payerShare = {
        A: sanitizedUpdates.payerShare.A !== null && sanitizedUpdates.payerShare.A !== undefined ? roundToTwo(sanitizedUpdates.payerShare.A) : null,
        B: sanitizedUpdates.payerShare.B !== null && sanitizedUpdates.payerShare.B !== undefined ? roundToTwo(sanitizedUpdates.payerShare.B) : null,
      };
    }

    const updated = { ...tx, ...sanitizedUpdates };
    
    if (updates.categoryId || updates.subcategoryId) {
      updated.isSuggested = false;
      updated.isAutoConfirmed = false;
      updated.isConfirmed = false;
      updated.classificationStatus = 'manual';
    }
    
    TransactionRepository.save(updated);
  },

  /**
   * Confirma a transação e treina o motor de aprendizado.
   */
  confirmTransaction: (tx: Transaction, isRecurring: boolean, scope: Scope): void => {
    if (scope.scopeType === 'shared' && tx.payerShare && !tx.migratedFromShared) {
      const sum = (tx.payerShare.A || 0) + (tx.payerShare.B || 0);
      if (Math.abs(sum - tx.amount) > 0.01) {
        throw new Error('A soma dos valores A e B deve ser igual ao total da transação.');
      }
    }

    // 1. Persistência do estado da transação (Responsabilidade do TransactionService)
    const confirmedTx: Transaction = { 
      ...tx,
      isConfirmed: true, 
      isSuggested: false,
      isAutoConfirmed: false,
      isRecurring: isRecurring,
      classificationStatus: 'manual'
    };
    TransactionRepository.save(confirmedTx);

    // 2. Disparo do evento de aprendizado (Responsabilidade da Intelligence Layer)
    ClassificationEngine.learnFromConfirmation(confirmedTx, { isRecurring });
  },

  /**
   * Move uma transação do escopo compartilhado para uma conta individual.
   */
  moveToIndividual: (tx: Transaction, userId: 'A' | 'B', sharedScopeId: string): void => {
    const updated: Transaction = { 
      ...tx,
      scopeId: ScopeDomainService.createChildScopeId(sharedScopeId, userId),
      migratedFromShared: sharedScopeId,
      visibleInShared: true,
      isConfirmed: false
    };
    TransactionRepository.save(updated);
  },

  /**
   * Reverte uma transação migrada de volta para o escopo compartilhado.
   */
  revertToShared: (tx: Transaction, sharedScopeId: string, defaultSplit?: {A: number, B: number}): void => {
    if (!tx.migratedFromShared) return;

    const updated: Transaction = {
      ...tx,
      scopeId: sharedScopeId,
      migratedFromShared: undefined,
      visibleInShared: undefined,
      isConfirmed: false
    };

    const splitA = defaultSplit?.A ?? 50;
    const splitB = defaultSplit?.B ?? 50;
    updated.payerShare = {
      A: roundToTwo((updated.amount * splitA) / 100),
      B: roundToTwo((updated.amount * splitB) / 100),
    };

    TransactionRepository.save(updated);
  }
};
