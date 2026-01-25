import { useState, useCallback, useEffect } from 'react';
import { Transaction, Category, Subcategory, Scope, Period } from '../../types/finance';
import { TransactionRepository, CategoryRepository, SubcategoryRepository } from '../../services/localRepositories';
import { TransactionService } from '../../services/transactionService';
import { CategoryService } from '../../services/categoryService';
import { parseMonthYearString } from '../../shared/dateUtils';

export const useTransactionData = (currentScope: Scope) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);
  const [availableMonths, setAvailableMonths] = useState<string[]>([]);

  /**
   * loadData: Agora solicita apenas os dados necessários do repositório.
   * "Fat Payload Protection": Não baixamos mais todas as transações da história do usuário.
   */
  const loadData = useCallback(() => {
    // 1. Obtemos todos os meses disponíveis (Metadado leve) para construir o seletor
    const allTxsForMetadata = TransactionRepository.getAll(currentScope.scopeId);
    const months = TransactionService.getAvailableMonths(allTxsForMetadata);
    setAvailableMonths(months);

    // 2. Definimos o período de busca baseado no filtro selecionado
    let filteredTxs: Transaction[] = [];
    if (selectedMonth) {
      const parsed = parseMonthYearString(selectedMonth);
      if (parsed) {
        const period: Period = { kind: 'month', year: parsed.year, month: parsed.month };
        // Query otimizada: Apenas o mês selecionado
        filteredTxs = TransactionRepository.getByPeriod(currentScope.scopeId, period);
      }
    } else if (months.length > 0) {
      // Fallback para o mês mais recente se nada estiver selecionado
      const parsed = parseMonthYearString(months[0]);
      if (parsed) {
        const period: Period = { kind: 'month', year: parsed.year, month: parsed.month };
        filteredTxs = TransactionRepository.getByPeriod(currentScope.scopeId, period);
      }
    } else {
      // Escopo vazio
      filteredTxs = [];
    }

    // Ordenação final de UI
    const sorted = filteredTxs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    setTransactions(sorted);
    setCategories(CategoryService.getAllCategories(currentScope.scopeId));
    setSubcategories(CategoryService.getAllSubcategories(currentScope.scopeId));
  }, [currentScope.scopeId, selectedMonth]);

  useEffect(() => {
    setSelectedMonth(null);
  }, [currentScope.scopeId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return {
    transactions,
    setTransactions,
    categories,
    subcategories,
    availableMonths,
    selectedMonth,
    setSelectedMonth,
    loadData
  };
};