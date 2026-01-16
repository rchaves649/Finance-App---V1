
import React, { useState, useEffect, useCallback } from 'react';
import { useScope } from '../shared/ScopeContext';
import { 
  TransactionRepository, 
  CategoryRepository, 
  SubcategoryRepository, 
  ClassificationRepository 
} from '../services/localRepositories';
import { DemoSeedService } from '../services/demoSeed';
import { CSVService } from '../services/csvService';
import { Transaction, Category, Subcategory } from '../types';
import { TransactionsView } from './TransactionsView';
import { normalizeDescription } from '../classification/classificationService';

export const TransactionsContainer: React.FC = () => {
  const { currentScope } = useScope();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);

  const loadData = useCallback(() => {
    const txs = TransactionRepository.getAll(currentScope.scopeId);
    const sortedTxs = [...txs].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    setTransactions(sortedTxs);
    setCategories(CategoryRepository.getAll(currentScope.scopeId));
    setSubcategories(SubcategoryRepository.getAll(currentScope.scopeId));
  }, [currentScope.scopeId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleImportCSV = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const rawData = CSVService.parse(text);
      
      // Load classification memory to optimize lookup during mapping
      const memory = ClassificationRepository.getAll(currentScope.scopeId);
      const memoryMap = new Map(memory.map(m => [m.normalizedKey, m]));

      const newTransactions: Transaction[] = rawData.map(item => {
        const normalized = normalizeDescription(item.description);
        const match = memoryMap.get(normalized);

        return {
          id: crypto.randomUUID(),
          scopeId: currentScope.scopeId,
          date: item.date,
          description: item.description,
          amount: item.amount,
          categoryId: match?.categoryId,
          subcategoryId: match?.subcategoryId,
          isConfirmed: false,
          isSuggested: !!match
        };
      });

      TransactionRepository.saveMany(newTransactions);
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
    if (!tx || tx.isConfirmed) return;
    
    const updated = { ...tx, ...updates };
    // If the user manually changes the classification, remove the suggested flag
    if (updates.categoryId || updates.subcategoryId) {
      updated.isSuggested = false;
    }
    
    TransactionRepository.save(updated);
    loadData();
  };

  const handleConfirm = (id: string) => {
    const tx = transactions.find(t => t.id === id);
    if (!tx || !tx.categoryId || !tx.subcategoryId) return;

    // 1. Persist transaction as confirmed
    const confirmedTx: Transaction = { ...tx, isConfirmed: true, isSuggested: false };
    TransactionRepository.save(confirmedTx);

    // 2. Update classification memory
    const normalizedKey = normalizeDescription(tx.description);
    const existingMemory = ClassificationRepository.find(currentScope.scopeId, normalizedKey);
    
    ClassificationRepository.save({
      scopeId: currentScope.scopeId,
      normalizedKey,
      categoryId: tx.categoryId,
      subcategoryId: tx.subcategoryId,
      usageCount: (existingMemory?.usageCount || 0) + 1,
      lastUsedAt: new Date().toISOString()
    });

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
      onImport={handleImportCSV}
      onUpdate={handleUpdate}
      onConfirm={handleConfirm}
      onDelete={handleDelete}
      onLoadDemo={handleLoadDemo}
    />
  );
};
