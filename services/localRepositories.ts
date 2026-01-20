
import { Category, Subcategory, Transaction, ClassificationMemoryEntry, RecurringMemoryEntry } from '../types/finance';
import { 
  ICategoryRepository, 
  ISubcategoryRepository, 
  ITransactionRepository, 
  IClassificationRepository, 
  IRecurringRepository, 
  IAppRepository 
} from '../repositories/interfaces';

const STORAGE_KEYS = {
  CATEGORIES: 'fc_categories',
  SUBCATEGORIES: 'fc_subcategories',
  TRANSACTIONS: 'fc_transactions',
  CLASSIFICATION: 'fc_classification',
  RECURRING: 'fc_recurring'
};

/**
 * Helper to fetch and parse data from localStorage
 */
function getLocal<T>(key: string): T[] {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : [];
}

/**
 * Helper to stringify and save data to localStorage
 */
function setLocal<T>(key: string, data: T[]): void {
  localStorage.setItem(key, JSON.stringify(data));
}

export const CategoryRepository: ICategoryRepository = {
  getAll: (scopeId: string) => getLocal<Category>(STORAGE_KEYS.CATEGORIES).filter(c => c.scopeId === scopeId),
  save: (category: Category) => {
    const all = getLocal<Category>(STORAGE_KEYS.CATEGORIES);
    const index = all.findIndex(c => c.id === category.id);
    if (index > -1) {
      all[index] = category;
      setLocal(STORAGE_KEYS.CATEGORIES, all);
    } else {
      setLocal(STORAGE_KEYS.CATEGORIES, [...all, category]);
    }
  },
  delete: (id: string) => {
    const all = getLocal<Category>(STORAGE_KEYS.CATEGORIES);
    setLocal(STORAGE_KEYS.CATEGORIES, all.filter(c => c.id !== id));
  }
};

export const SubcategoryRepository: ISubcategoryRepository = {
  getAll: (scopeId: string) => getLocal<Subcategory>(STORAGE_KEYS.SUBCATEGORIES).filter(s => s.scopeId === scopeId),
  getByCategory: (scopeId: string, categoryId: string) => 
    getLocal<Subcategory>(STORAGE_KEYS.SUBCATEGORIES).filter(s => s.scopeId === scopeId && s.categoryId === categoryId),
  save: (sub: Subcategory) => {
    const all = getLocal<Subcategory>(STORAGE_KEYS.SUBCATEGORIES);
    const index = all.findIndex(s => s.id === sub.id);
    if (index > -1) {
      all[index] = sub;
      setLocal(STORAGE_KEYS.SUBCATEGORIES, all);
    } else {
      setLocal(STORAGE_KEYS.SUBCATEGORIES, [...all, sub]);
    }
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

export const TransactionRepository: ITransactionRepository = {
  getAll: (scopeId: string) => getLocal<Transaction>(STORAGE_KEYS.TRANSACTIONS).filter(t => t.scopeId === scopeId),
  getSharedView: (scopeId: string) => getLocal<Transaction>(STORAGE_KEYS.TRANSACTIONS).filter(t => t.scopeId === scopeId || (t.visibleInShared && t.migratedFromShared)),
  save: (tx: Transaction) => {
    const all = getLocal<Transaction>(STORAGE_KEYS.TRANSACTIONS);
    const index = all.findIndex(t => t.id === tx.id);
    if (index > -1) {
      all[index] = tx;
      setLocal(STORAGE_KEYS.TRANSACTIONS, all);
    } else {
      setLocal(STORAGE_KEYS.TRANSACTIONS, [...all, tx]);
    }
  },
  saveMany: (txs: Transaction[]) => {
    const all = getLocal<Transaction>(STORAGE_KEYS.TRANSACTIONS);
    const updatedAll = [...all];
    
    txs.forEach(newTx => {
      const idx = updatedAll.findIndex(t => t.id === newTx.id);
      if (idx > -1) {
        updatedAll[idx] = newTx;
      } else {
        updatedAll.push(newTx);
      }
    });
    
    setLocal(STORAGE_KEYS.TRANSACTIONS, updatedAll);
  },
  delete: (id: string) => {
    const all = getLocal<Transaction>(STORAGE_KEYS.TRANSACTIONS);
    setLocal(STORAGE_KEYS.TRANSACTIONS, all.filter(t => t.id !== id));
  }
};

export const ClassificationRepository: IClassificationRepository = {
  getAll: (scopeId: string) => getLocal<ClassificationMemoryEntry>(STORAGE_KEYS.CLASSIFICATION).filter(e => e.scopeId === scopeId),
  find: (scopeId: string, normalizedKey: string) => 
    getLocal<ClassificationMemoryEntry>(STORAGE_KEYS.CLASSIFICATION).find(e => e.scopeId === scopeId && e.normalizedKey === normalizedKey),
  save: (entry: ClassificationMemoryEntry) => {
    const all = getLocal<ClassificationMemoryEntry>(STORAGE_KEYS.CLASSIFICATION);
    const existingIndex = all.findIndex(e => e.scopeId === entry.scopeId && e.normalizedKey === entry.normalizedKey);
    if (existingIndex > -1) {
      const updatedAll = [...all];
      updatedAll[existingIndex] = entry;
      setLocal(STORAGE_KEYS.CLASSIFICATION, updatedAll);
    } else {
      setLocal(STORAGE_KEYS.CLASSIFICATION, [...all, entry]);
    }
  }
};

export const RecurringRepository: IRecurringRepository = {
  find: (scopeId: string, normalizedKey: string) => 
    getLocal<RecurringMemoryEntry>(STORAGE_KEYS.RECURRING).find(e => e.scopeId === scopeId && e.normalizedKey === normalizedKey),
  save: (entry: RecurringMemoryEntry) => {
    const all = getLocal<RecurringMemoryEntry>(STORAGE_KEYS.RECURRING);
    const existingIndex = all.findIndex(e => e.scopeId === entry.scopeId && e.normalizedKey === entry.normalizedKey);
    if (existingIndex > -1) {
      const updatedAll = [...all];
      updatedAll[existingIndex] = entry;
      setLocal(STORAGE_KEYS.RECURRING, updatedAll);
    } else {
      setLocal(STORAGE_KEYS.RECURRING, [...all, entry]);
    }
  }
};

export const AppRepository: IAppRepository = {
  clearAll: () => {
    Object.values(STORAGE_KEYS).forEach(key => localStorage.removeItem(key));
  }
};
