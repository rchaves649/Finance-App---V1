
import { Category, Subcategory, Transaction, ClassificationMemoryEntry } from '../types';

const STORAGE_KEYS = {
  CATEGORIES: 'fc_categories',
  SUBCATEGORIES: 'fc_subcategories',
  TRANSACTIONS: 'fc_transactions',
  CLASSIFICATION: 'fc_classification'
};

function getLocal<T>(key: string): T[] {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : [];
}

function setLocal<T>(key: string, data: T[]): void {
  localStorage.setItem(key, JSON.stringify(data));
}

export const CategoryRepository = {
  getAll: (scopeId: string) => getLocal<Category>(STORAGE_KEYS.CATEGORIES).filter(c => c.scopeId === scopeId),
  save: (category: Category) => {
    const all = getLocal<Category>(STORAGE_KEYS.CATEGORIES);
    setLocal(STORAGE_KEYS.CATEGORIES, [...all.filter(c => c.id !== category.id), category]);
  },
  delete: (id: string) => {
    const all = getLocal<Category>(STORAGE_KEYS.CATEGORIES);
    setLocal(STORAGE_KEYS.CATEGORIES, all.filter(c => c.id !== id));
  }
};

export const SubcategoryRepository = {
  getAll: (scopeId: string) => getLocal<Subcategory>(STORAGE_KEYS.SUBCATEGORIES).filter(s => s.scopeId === scopeId),
  getByCategory: (scopeId: string, categoryId: string) => 
    getLocal<Subcategory>(STORAGE_KEYS.SUBCATEGORIES).filter(s => s.scopeId === scopeId && s.categoryId === categoryId),
  save: (sub: Subcategory) => {
    const all = getLocal<Subcategory>(STORAGE_KEYS.SUBCATEGORIES);
    setLocal(STORAGE_KEYS.SUBCATEGORIES, [...all.filter(s => s.id !== sub.id), sub]);
  },
  delete: (id: string) => {
    const all = getLocal<Subcategory>(STORAGE_KEYS.SUBCATEGORIES);
    setLocal(STORAGE_KEYS.SUBCATEGORIES, all.filter(s => s.id !== id));
  },
  deleteByCategory: (scopeId: string, categoryId: string) => {
    const all = getLocal<Subcategory>(STORAGE_KEYS.SUBCATEGORIES);
    setLocal(STORAGE_KEYS.SUBCATEGORIES, all.filter(s => !(s.scopeId === scopeId && s.categoryId === categoryId)));
  }
};

export const TransactionRepository = {
  getAll: (scopeId: string) => getLocal<Transaction>(STORAGE_KEYS.TRANSACTIONS).filter(t => t.scopeId === scopeId),
  save: (tx: Transaction) => {
    const all = getLocal<Transaction>(STORAGE_KEYS.TRANSACTIONS);
    setLocal(STORAGE_KEYS.TRANSACTIONS, [...all.filter(t => t.id !== tx.id), tx]);
  },
  saveMany: (txs: Transaction[]) => {
    const all = getLocal<Transaction>(STORAGE_KEYS.TRANSACTIONS);
    const newIds = txs.map(t => t.id);
    setLocal(STORAGE_KEYS.TRANSACTIONS, [...all.filter(t => !newIds.includes(t.id)), ...txs]);
  },
  delete: (id: string) => {
    const all = getLocal<Transaction>(STORAGE_KEYS.TRANSACTIONS);
    setLocal(STORAGE_KEYS.TRANSACTIONS, all.filter(t => t.id !== id));
  }
};

export const ClassificationRepository = {
  getAll: (scopeId: string) => getLocal<ClassificationMemoryEntry>(STORAGE_KEYS.CLASSIFICATION).filter(e => e.scopeId === scopeId),
  find: (scopeId: string, normalizedKey: string) => 
    getLocal<ClassificationMemoryEntry>(STORAGE_KEYS.CLASSIFICATION).find(e => e.scopeId === scopeId && e.normalizedKey === normalizedKey),
  save: (entry: ClassificationMemoryEntry) => {
    const all = getLocal<ClassificationMemoryEntry>(STORAGE_KEYS.CLASSIFICATION);
    const existingIndex = all.findIndex(e => e.scopeId === entry.scopeId && e.normalizedKey === entry.normalizedKey);
    if (existingIndex > -1) {
      all[existingIndex] = entry;
      setLocal(STORAGE_KEYS.CLASSIFICATION, all);
    } else {
      setLocal(STORAGE_KEYS.CLASSIFICATION, [...all, entry]);
    }
  }
};

export const AppRepository = {
  clearAll: () => {
    Object.values(STORAGE_KEYS).forEach(key => localStorage.removeItem(key));
  }
};
