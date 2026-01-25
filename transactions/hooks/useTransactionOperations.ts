
import React, { useCallback } from 'react';
import { Transaction, Scope } from '../../types/finance';
import { TransactionService } from '../../services/transactionService';
import { useToast } from '../../shared/ToastContext';
import { DraftTransaction } from '../components/ManualEntryRow';

// Added React import to fix namespace error for React.Dispatch and React.SetStateAction
export const useTransactionOperations = (
  currentScope: Scope,
  setTransactions: React.Dispatch<React.SetStateAction<Transaction[]>>,
  loadData: () => void
) => {
  const { showToast } = useToast();

  const handleUpdate = useCallback((id: string, updates: Partial<Transaction>) => {
    setTransactions(prev => {
      const tx = prev.find(t => t.id === id);
      if (!tx) return prev;
      const newTransactions = prev.map(t => t.id === id ? { ...t, ...updates } : t);
      TransactionService.updateTransaction(tx, updates);
      return newTransactions;
    });
  }, [setTransactions]);

  const handleConfirm = useCallback((id: string, options: { learnCategory: boolean; isRecurring: boolean }) => {
    setTransactions(prev => {
      const tx = prev.find(t => t.id === id);
      if (!tx) return prev;
      try {
        TransactionService.confirmTransaction(tx, options, currentScope);
        showToast('Lançamento confirmado.', 'success');
        return prev.map(t => t.id === id ? { ...t, isConfirmed: true, isRecurring: options.isRecurring } : t);
      } catch (error: any) {
        showToast(error.message || 'Erro ao confirmar.', 'error');
        return prev;
      }
    });
  }, [currentScope, setTransactions, showToast]);

  const handleMoveToIndividual = useCallback((id: string, userId: 'A' | 'B') => {
    setTransactions(prev => {
      const tx = prev.find(t => t.id === id);
      if (!tx) return prev;
      TransactionService.moveToIndividual(tx, userId, currentScope.scopeId);
      showToast(`Movido para Pessoa ${userId}`, 'info');
      return prev.filter(t => t.id !== id);
    });
  }, [currentScope.scopeId, setTransactions, showToast]);

  const handleRevertToShared = useCallback((id: string) => {
    setTransactions(prev => {
      const tx = prev.find(t => t.id === id);
      if (!tx) return prev;
      TransactionService.revertToShared(tx, currentScope.scopeId, currentScope.defaultSplit);
      showToast('Revertido para Conjunto.', 'info');
      return prev.map(t => t.id === id ? { ...t, migratedFromShared: undefined, visibleInShared: undefined } : t);
    });
  }, [currentScope.scopeId, currentScope.defaultSplit, setTransactions, showToast]);

  const handleDelete = useCallback((id: string) => {
    if (window.confirm('Excluir este lançamento?')) {
      TransactionService.deleteTransaction(id);
      showToast('Excluído.', 'info');
      setTransactions(prev => prev.filter(t => t.id !== id));
    }
  }, [setTransactions, showToast]);

  const handleSaveManual = useCallback((drafts: DraftTransaction[]) => {
    const newTxs: Transaction[] = drafts.map(d => ({
      id: crypto.randomUUID(),
      scopeId: currentScope.scopeId,
      date: d.date,
      description: d.description,
      amount: d.amount,
      categoryId: d.categoryId,
      subcategoryId: d.subcategoryId,
      payerShare: d.payerShare,
      isConfirmed: true,
      isSuggested: false,
      isAutoConfirmed: false,
      isRecurring: false,
      classificationStatus: 'manual',
      transactionNature: d.transactionNature
    }));
    TransactionService.saveTransactions(newTxs);
    showToast(`${newTxs.length} lançamento(s) salvo(s).`, 'success');
    loadData();
  }, [currentScope.scopeId, loadData, showToast]);

  return {
    handleUpdate,
    handleConfirm,
    handleMoveToIndividual,
    handleRevertToShared,
    handleDelete,
    handleSaveManual
  };
};
