
import React, { useState, useEffect, useCallback } from 'react';
import { useScope } from '../shared/ScopeContext';
import { 
  TransactionRepository, 
  CategoryRepository, 
  SubcategoryRepository 
} from '../services/localRepositories';
import { DemoSeedService } from '../services/demoSeed';
import { TransactionService } from '../services/transactionService';
import { Transaction, Category, Subcategory } from '../types/finance';
import { TransactionsView } from './TransactionsView';

export const TransactionsContainer: React.FC = () => {
  const { currentScope } = useScope();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);

  const loadData = useCallback(() => {
    const sortedTxs = TransactionService.getScopedTransactions(currentScope);
    
    setTransactions(sortedTxs);
    setCategories(CategoryRepository.getAll(currentScope.scopeId));
    setSubcategories(SubcategoryRepository.getAll(currentScope.scopeId));
  }, [currentScope]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleImportCSV = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      TransactionService.processCSVImport(text, currentScope);
      loadData();
    } catch (error) {
      console.error('Erro ao importar CSV:', error);
      alert('Falha ao processar o arquivo CSV. Verifique o formato.');
    } finally {
      e.target.value = '';
    }
  };

  const handleUpdate = (id: string, updates: Partial<Transaction>) => {
    const tx = transactions.find(t => t.id === id);
    if (!tx) return;
    
    TransactionService.updateTransaction(tx, updates);
    loadData();
  };

  const handleConfirm = (id: string, isRecurring?: boolean) => {
    const tx = transactions.find(t => t.id === id);
    if (!tx) return;

    try {
      TransactionService.confirmTransaction(tx, !!isRecurring, currentScope);
      loadData();
    } catch (error: any) {
      alert(error.message || 'Erro ao confirmar transação.');
    }
  };

  const handleMoveToIndividual = (id: string, userId: 'A' | 'B') => {
    const tx = transactions.find(t => t.id === id);
    if (!tx) return;

    TransactionService.moveToIndividual(tx, userId, currentScope.scopeId);
    loadData();
  };

  const handleRevertToShared = (id: string) => {
    const tx = transactions.find(t => t.id === id);
    if (!tx) return;

    TransactionService.revertToShared(tx, currentScope.scopeId, currentScope.defaultSplit);
    loadData();
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Deseja realmente excluir este lançamento?')) {
      TransactionRepository.delete(id);
      loadData();
    }
  };

  const handleLoadDemo = () => {
    DemoSeedService.seed(currentScope.scopeId);
    loadData();
  };

  return (
    <TransactionsView 
      transactions={transactions}
      categories={categories}
      subcategories={subcategories}
      scopeType={currentScope.scopeType}
      currentScopeId={currentScope.scopeId}
      onImport={handleImportCSV}
      onUpdate={handleUpdate}
      onConfirm={handleConfirm}
      onDelete={handleDelete}
      onMoveToIndividual={handleMoveToIndividual}
      onRevertToShared={handleRevertToShared}
      onLoadDemo={handleLoadDemo}
    />
  );
};
