
import { Transaction, ClassificationMemoryEntry, RecurringMemoryEntry } from '../types/finance';
import { ClassificationRepository, RecurringRepository } from '../services/localRepositories';
import { roundToTwo } from '../shared/formatUtils';

/**
 * Normalizes a transaction description for consistent matching.
 */
export function normalizeDescription(description: string): string {
  return description
    .toUpperCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s]/gi, '')
    .replace(/\s+/g, ' ');
}

/**
 * Classification Engine: Responsável por sugerir categorias baseadas em histórico e regras.
 */
export const ClassificationEngine = {
  /**
   * Sugere categoria e subcategoria baseada em regras de recorrência ou histórico.
   */
  suggest: (scopeId: string, description: string): { categoryId: string; subcategoryId: string; payerShare?: { A: number; B: number } } | null => {
    const normalizedKey = normalizeDescription(description);
    
    // Prioridade 1: Regras de Recorrência (exatas)
    const recurring = RecurringRepository.find(scopeId, normalizedKey);
    if (recurring && recurring.isRecurring) {
      return {
        categoryId: recurring.categoryId,
        subcategoryId: recurring.subcategoryId,
        payerShare: recurring.payerShare
      };
    }

    // Prioridade 2: Memória de Classificação (histórico mais frequente)
    const match = ClassificationRepository.find(scopeId, normalizedKey);
    if (match) {
      return {
        categoryId: match.categoryId,
        subcategoryId: match.subcategoryId
      };
    }
    
    return null;
  },

  /**
   * Learning Engine: Processa um evento de confirmação para treinar o motor.
   * Este é um evento isolado da persistência da transação em si.
   */
  learnFromConfirmation: (tx: Transaction, options?: { isRecurring?: boolean }): void => {
    if (!tx.categoryId || !tx.subcategoryId) return;

    const normalizedKey = normalizeDescription(tx.description);
    const roundedPayerShare = tx.payerShare ? {
      A: tx.payerShare.A !== null ? roundToTwo(tx.payerShare.A) : null,
      B: tx.payerShare.B !== null ? roundToTwo(tx.payerShare.B) : null
    } : undefined;

    // 1. Atualiza Memória de Classificação (Learning logic)
    const existingMemory = ClassificationRepository.find(tx.scopeId, normalizedKey);
    const entry: ClassificationMemoryEntry = {
      scopeId: tx.scopeId,
      normalizedKey,
      categoryId: tx.categoryId,
      subcategoryId: tx.subcategoryId,
      usageCount: (existingMemory?.usageCount || 0) + 1,
      lastUsedAt: new Date().toISOString()
    };
    ClassificationRepository.save(entry);

    // 2. Atualiza Regras de Recorrência se solicitado
    if (options?.isRecurring) {
      const recurringEntry: RecurringMemoryEntry = {
        scopeId: tx.scopeId,
        normalizedKey,
        categoryId: tx.categoryId,
        subcategoryId: tx.subcategoryId,
        isRecurring: true,
        payerShare: roundedPayerShare ? { A: roundedPayerShare.A || 0, B: roundedPayerShare.B || 0 } : undefined
      };
      RecurringRepository.save(recurringEntry);
    }
  }
};

// Mantendo exportações individuais para compatibilidade se necessário, 
// mas incentivando o uso do objeto ClassificationEngine.
export const suggestCategory = ClassificationEngine.suggest;
export const confirmClassification = ClassificationEngine.learnFromConfirmation;
