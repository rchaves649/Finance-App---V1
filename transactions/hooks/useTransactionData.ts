
import { useState, useCallback, useEffect } from 'react';
import { Transaction, Category, Subcategory, Scope } from '../../types/finance';
import { TransactionService } from '../../services/transactionService';
import { CategoryService } from '../../services/categoryService';
import { formatMonthYear } from '../../shared/dateUtils';

export const useTransactionData = (currentScope: Scope) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);
  const [availableMonths, setAvailableMonths] = useState<string[]>([]);

  const loadData = useCallback(() => {
    const allTxs = TransactionService.getScopedTransactions(currentScope);
    const months = TransactionService.getAvailableMonths(allTxs);
    
    setAvailableMonths(months);

    // Se houver um mês selecionado, filtra. Caso contrário, mostra tudo ou o primeiro mês.
    const filteredTxs = selectedMonth && months.includes(selectedMonth)
      ? allTxs.filter(tx => formatMonthYear(tx.date) === selectedMonth)
      : allTxs;

    setTransactions(filteredTxs);
    setCategories(CategoryService.getAllCategories(currentScope.scopeId));
    setSubcategories(CategoryService.getAllSubcategories(currentScope.scopeId));
  }, [currentScope.scopeId, selectedMonth]);

  useEffect(() => {
    // Ao mudar de escopo, reseta o filtro de mês para mostrar os dados mais recentes do novo escopo
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
