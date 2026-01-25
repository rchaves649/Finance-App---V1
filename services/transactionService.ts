import { Transaction, Scope, TransactionNatures } from '../types/finance';
import { TransactionRepository, ImportLogRepository } from './localRepositories';
import { fromCents, toCents, allocateCents } from '../shared/formatUtils';
import { ClassificationEngine, detectNature } from '../classification/classificationService';
import { TransactionImportService } from './transactionImportService';
import { TransactionMigrationService } from './transactionMigrationService';
import { formatMonthYear } from '../shared/dateUtils';

export const TransactionService = {
  getScopedTransactions: (scope: Scope): Transaction[] => {
    const txs = scope.scopeType === 'shared' 
      ? TransactionRepository.getSharedView(scope.scopeId)
      : TransactionRepository.getAll(scope.scopeId);
    
    return txs.sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      if (dateB !== dateA) return dateB - dateA;
      return b.id.localeCompare(a.id);
    });
  },

  getAvailableMonths: (transactions: Transaction[]): string[] => {
    return Array.from(
      new Set(
        transactions.map(tx => formatMonthYear(tx.date))
      )
    ).filter(m => !!m).sort((a, b) => b.localeCompare(a));
  },

  deleteTransaction: (id: string): void => {
    TransactionRepository.delete(id);
  },

  sanitizeTransactions: (scope: Scope): void => {
    const txs = scope.scopeType === 'shared' 
      ? TransactionRepository.getSharedView(scope.scopeId)
      : TransactionRepository.getAll(scope.scopeId);
    
    let modifiedTxs: Transaction[] = [];

    txs.forEach(t => {
      let isModified = false;
      
      if (!t.transactionNature) {
        t.transactionNature = detectNature(t.description, t.amount);
        isModified = true;
      }

      if (scope.scopeType === 'shared' && t.scopeId === scope.scopeId && !t.payerShare) {
        isModified = true;
        const totalCents = toCents(t.amount);
        const splitA = scope.defaultSplit?.A ?? 50;
        
        // Uso da nova lógica de alocação segura de centavos
        const { centsA, centsB } = allocateCents(totalCents, splitA);

        t.payerShare = { 
          A: fromCents(centsA), 
          B: fromCents(centsB) 
        };
      }

      if (!t.classificationStatus) {
        isModified = true;
        t.classificationStatus = (!t.categoryId || !t.subcategoryId) ? 'pending' : (t.isSuggested ? 'auto' : 'manual');
      }

      if (isModified) modifiedTxs.push(t);
    });

    if (modifiedTxs.length > 0) {
      TransactionRepository.saveMany(modifiedTxs);
    }
  },

  prepareCSVTransactions: TransactionImportService.prepareCSVTransactions,

  saveTransactions: (txs: Transaction[], fileName?: string): void => {
    const cleaned = txs.map(t => {
      if (!t.classificationStatus) {
        const isExcluded = t.transactionNature === TransactionNatures.REFUND || 
                          t.transactionNature === TransactionNatures.PAYMENT ||
                          t.isNeutralized;
        t.classificationStatus = (!isExcluded && (!t.categoryId || !t.subcategoryId)) ? 'pending' : (t.isSuggested ? 'auto' : 'manual');
      }
      return t;
    });
    TransactionRepository.saveMany(cleaned);
    
    if (fileName && txs.length > 0) {
      ImportLogRepository.logImport(txs[0].scopeId, fileName);
    }
  },

  updateTransaction: (tx: Transaction, updates: Partial<Transaction>): void => {
    const updated = { ...tx, ...updates };
    
    // Normalização de centavos para valores financeiros
    if (updates.amount !== undefined) updated.amount = fromCents(toCents(updates.amount));
    if (updates.payerShare) {
      updated.payerShare = {
        A: updates.payerShare.A !== null ? fromCents(toCents(updates.payerShare.A)) : null,
        B: updates.payerShare.B !== null ? fromCents(toCents(updates.payerShare.B)) : null,
      };
    }

    const coreFields = ['description', 'amount', 'date', 'categoryId', 'subcategoryId', 'transactionNature', 'payerShare'];
    const hasCoreUpdate = Object.keys(updates).some(k => coreFields.includes(k));

    const isUnconfirming = tx.isConfirmed === true && updates.isConfirmed === false;

    if (hasCoreUpdate || isUnconfirming) {
      updated.isSuggested = false;
      
      const isMissingClassification = !updated.categoryId || !updated.subcategoryId;
      const isSystemNature = updated.transactionNature === TransactionNatures.REFUND || 
                            updated.transactionNature === TransactionNatures.PAYMENT;

      if (isMissingClassification && !isSystemNature) {
        updated.classificationStatus = 'pending';
      } else {
        updated.classificationStatus = 'manual';
      }
    }
    
    TransactionRepository.save(updated);
  },

  confirmTransaction: (tx: Transaction, options: { learnCategory: boolean; isRecurring: boolean }, scope: Scope): void => {
    if (scope.scopeType === 'shared' && tx.payerShare && !tx.migratedFromShared) {
      const totalCents = toCents(tx.amount);
      const shareCentsA = toCents(tx.payerShare.A || 0);
      const shareCentsB = toCents(tx.payerShare.B || 0);
      if (shareCentsA + shareCentsB !== totalCents) {
        throw new Error('A soma dos valores A e B deve ser exatamente igual ao total.');
      }
    }

    const finalStatus = tx.classificationStatus === 'auto' ? 'auto' : 'manual';
    const confirmedTx: Transaction = { 
      ...tx,
      isConfirmed: true, 
      isSuggested: false,
      isAutoConfirmed: false,
      isRecurring: options.isRecurring,
      classificationStatus: finalStatus
    };
    TransactionRepository.save(confirmedTx);
    ClassificationEngine.learnFromConfirmation(confirmedTx, options);
  },

  moveToIndividual: TransactionMigrationService.moveToIndividual,

  revertToShared: TransactionMigrationService.revertToShared
};
