import { Transaction, ClassificationMemoryEntry, RecurringMemoryEntry, TransactionNature, TransactionNatures } from '../types/finance';
import { ClassificationRepository, RecurringRepository } from '../services/localRepositories';
import { roundToTwo } from '../shared/formatUtils';

/**
 * Normaliza a descrição para comparação consistente.
 * Remove acentos, caracteres especiais, números isolados no final (comum em IDs de transação) e excesso de espaços.
 */
export function normalizeDescription(description: string): string {
  return description
    .toUpperCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove acentos
    .replace(/[*]/g, ' ') // Substitui asteriscos por espaço antes de remover especiais
    .replace(/[^\w\s]/gi, '') // Remove caracteres especiais
    .replace(/\s+/g, ' ') // Normaliza espaços internos
    .trim();
}

/**
 * Detecta a natureza da transação com base em palavras-chave e sinais.
 * Prioriza palavras-chave para identificar Créditos, Estornos e Pagamentos de Fatura.
 * O sinal é usado como critério secundário.
 */
export function detectNature(description: string, amount: number = 0): TransactionNature {
  const normalized = normalizeDescription(description);
  
  // 1. Regras de Transferência Interna (Patrimônio não altera)
  const transferKeywords = [
    "TRANSFERENCIA ENTRE CONTAS", "TRANSF ENTRE CONTAS", "APLICACAO", "RESGATE", 
    "INVESTIMENTO", "APLICACAO FINANCEIRA", "TRANSFERENCIA MESMO TITULAR",
    "TED MESMO TITULAR", "DOC MESMO TITULAR"
  ];
  if (transferKeywords.some(k => normalized.includes(k))) return TransactionNatures.TRANSFER;

  // 2. Regras de Estorno (Prioridade Máxima - Filtro de Exclusão)
  const refundKeywords = [
    "ESTORNO", "REEMBOLSO", "DEVOLUCAO", "CANCELAMENTO", "REVERSAO", 
    "AJUSTE REF", "DEVOLUCAO DE VALOR", "CANCELAMENTO COMPRA", "ESTORNO DE"
  ];
  if (refundKeywords.some(k => normalized.includes(k))) return TransactionNatures.REFUND;

  // 3. Regras de Pagamento de Fatura
  const paymentKeywords = [
    "PAGAMENTO FATURA", 
    "PAGAMENTO DA FATURA",
    "PAGAMENTO DE CARTAO", 
    "PAGAMENTO CARTAO", 
    "LIQUIDACAO", 
    "PAGTO FATURA", 
    "FATURA PAGA", 
    "PAGAMENTO RECEBIDO", 
    "FATURA MES ANTERIOR"
  ];
  if (paymentKeywords.some(k => normalized.includes(k))) return TransactionNatures.PAYMENT;

  // 4. Regras de Crédito (Entradas claras de dinheiro)
  const creditKeywords = [
    "TRANSFERENCIA RECEBIDA", "PIX RECEBIDO", "RECEBIMENTO", "DOC RECEBIDO", 
    "TED RECEBIDA", "CASHBACK", "RENDIMENTO", "PROVENTOS", "CREDITO", "VALE"
  ];
  if (creditKeywords.some(k => normalized.includes(k))) return TransactionNatures.CREDIT;

  // 5. Regras de Despesa Parcelada
  const installmentKeywords = ["PARCELA", "PARC", "PARCELAMENTO"];
  const hasInstallmentPattern = /\d{1,2}\/\d{1,2}/.test(description); // Detecta padrões como 01/10 ou 1/12
  
  if (installmentKeywords.some(k => normalized.includes(k)) || hasInstallmentPattern) {
    return TransactionNatures.INSTALLMENT_EXPENSE;
  }

  /**
   * 6. Fallback Inteligente
   * Se não houver palavras-chave indicando entrada (Crédito/Pagamento/Estorno):
   * Assumimos que a transação é uma DESPESA comum.
   */
  return TransactionNatures.EXPENSE;
}

/**
 * Motor de Classificação Inteligente.
 */
export const ClassificationEngine = {
  /**
   * Sugere categoria, subcategoria e natureza.
   */
  suggest: (scopeId: string, description: string, amount: number = 0): { 
    categoryId: string; 
    subcategoryId: string; 
    payerShare?: { A: number; B: number };
    nature: TransactionNature;
  } | null => {
    const normalizedKey = normalizeDescription(description);
    const naturalNature = detectNature(description, amount);
    
    // Prioridade 1: Regras de Recorrência
    const recurring = RecurringRepository.find(scopeId, normalizedKey);
    if (recurring && recurring.isRecurring) {
      return {
        categoryId: recurring.categoryId,
        subcategoryId: recurring.subcategoryId,
        payerShare: recurring.payerShare,
        nature: recurring.transactionNature || naturalNature
      };
    }

    // Prioridade 2: Histórico de Memória
    const match = ClassificationRepository.find(scopeId, normalizedKey);
    if (match) {
      return {
        categoryId: match.categoryId,
        subcategoryId: match.subcategoryId,
        nature: match.transactionNature || naturalNature
      };
    }
    
    // Fallback: Apenas detecção natural
    return {
      categoryId: '',
      subcategoryId: '',
      nature: naturalNature
    };
  },

  /**
   * Treina o motor com base em confirmações manuais.
   */
  learnFromConfirmation: (tx: Transaction, options?: { learnCategory?: boolean; isRecurring?: boolean }): void => {
    const normalizedKey = normalizeDescription(tx.description);
    
    // 1. Persiste aprendizado de Categoria (opcional)
    if (options?.learnCategory) {
      const existingMemory = ClassificationRepository.find(tx.scopeId, normalizedKey);
      const entry: ClassificationMemoryEntry = {
        scopeId: tx.scopeId,
        normalizedKey,
        categoryId: tx.categoryId || '',
        subcategoryId: tx.subcategoryId || '',
        transactionNature: tx.transactionNature,
        usageCount: (existingMemory?.usageCount || 0) + 1,
        lastUsedAt: new Date().toISOString()
      };
      ClassificationRepository.save(entry);
    }

    // 2. Persiste como regra de recorrência (Divisão de valores)
    if (options?.isRecurring) {
      const roundedPayerShare = tx.payerShare ? {
        A: tx.payerShare.A !== null ? roundToTwo(tx.payerShare.A) : null,
        B: tx.payerShare.B !== null ? roundToTwo(tx.payerShare.B) : null
      } : undefined;

      const recurringEntry: RecurringMemoryEntry = {
        scopeId: tx.scopeId,
        normalizedKey,
        categoryId: tx.categoryId || '',
        subcategoryId: tx.subcategoryId || '',
        transactionNature: tx.transactionNature,
        isRecurring: true,
        payerShare: roundedPayerShare ? { A: roundedPayerShare.A || 0, B: roundedPayerShare.B || 0 } : undefined
      };
      RecurringRepository.save(recurringEntry);
    }
  }
};
