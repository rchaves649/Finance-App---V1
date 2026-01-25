
import { Transaction, Category, Subcategory, Summary, Period } from '../types/finance';
import { TransactionRepository, CategoryRepository, SubcategoryRepository } from '../services/localRepositories';
import { SummaryService } from '../services/summaryService';

export interface ConsolidatedScopeData {
  transactions: Transaction[];
  categories: Category[];
  subcategories: Subcategory[];
}

export const DashboardRepository = {
  getConsolidatedData: (scopeId: string): ConsolidatedScopeData => {
    // Busca SEMPRE todos os dados do escopo para permitir cálculos históricos
    return {
      transactions: TransactionRepository.getAll(scopeId),
      categories: CategoryRepository.getAll(scopeId),
      subcategories: SubcategoryRepository.getAll(scopeId)
    };
  },

  getSummaryDTO: (scopeId: string, period: Period): Summary => {
    // Garante que o SummaryService tenha acesso ao histórico total (TransactionsRepository.getAll)
    const data = DashboardRepository.getConsolidatedData(scopeId);
    
    return SummaryService.getSummary(scopeId, period, {
      allTransactions: data.transactions,
      categories: data.categories,
      subcategories: data.subcategories
    });
  },

  isScopeEmpty: (scopeId: string): boolean => {
    const txs = TransactionRepository.getAll(scopeId);
    return txs.length === 0;
  }
};
