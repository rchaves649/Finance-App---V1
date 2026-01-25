import { Category, Subcategory, Transaction, ClassificationMemoryEntry, RecurringMemoryEntry, Summary } from '../types/finance';
import { 
  ICategoryRepository, 
  ISubcategoryRepository, 
  ITransactionRepository, 
  IClassificationRepository, 
  IRecurringRepository, 
  IImportLogRepository,
  ISummarySnapshotRepository,
  IAppRepository 
} from '../repositories/interfaces';
import { toCents } from '../shared/formatUtils';

const STORAGE_KEYS = {
  CATEGORIES: 'fc_categories',
  SUBCATEGORIES: 'fc_subcategories',
  TRANSACTIONS: 'fc_transactions',
  CLASSIFICATION: 'fc_classification',
  RECURRING: 'fc_recurring',
  IMPORT_LOGS: 'fc_import_logs',
  SNAPSHOTS: 'fc_summary_snapshots'
};

const GC_LIMITS = {
  CLASSIFICATION: 1000 
};

/**
 * Caches em memória O(1).
 * Estrutura: Map<ScopeId, Map<NormalizedKey, Entry>>
 */
const classificationCache = new Map<string, Map<string, ClassificationMemoryEntry>>();
const recurringCache = new Map<string, Map<string, RecurringMemoryEntry>>();

function getLocal<T>(key: string): T[] {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : [];
}

function setLocal<T>(key: string, data: T[]): void {
  localStorage.setItem(key, JSON.stringify(data));
}

function getPeriodKeyFromDate(date: string): string {
  return date.substring(0, 7);
}

function validateTransaction(tx: Transaction): void {
  if (!tx.transactionNature) {
    throw new Error(`Transação [${tx.id}] salva sem natureza definida.`);
  }

  if (tx.payerShare) {
    const totalCents = toCents(tx.amount);
    const shareACents = toCents(tx.payerShare.A || 0);
    const shareBCents = toCents(tx.payerShare.B || 0);
    
    if (Math.abs(totalCents - (shareACents + shareBCents)) > 0) {
      throw new Error(`Inconsistência de PayerShare na transação [${tx.id}]: Soma das partes (${shareACents + shareBCents}) diferente do total (${totalCents}).`);
    }
  }
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
    SummarySnapshotRepository.invalidateAll(category.scopeId);
  },
  delete: (id: string) => {
    const all = getLocal<Category>(STORAGE_KEYS.CATEGORIES);
    const cat = all.find(c => c.id === id);
    setLocal(STORAGE_KEYS.CATEGORIES, all.filter(c => c.id !== id));
    if (cat) SummarySnapshotRepository.invalidateAll(cat.scopeId);
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
    SummarySnapshotRepository.invalidateAll(sub.scopeId);
  },
  delete: (id: string) => {
    const all = getLocal<Subcategory>(STORAGE_KEYS.SUBCATEGORIES);
    const sub = all.find(s => s.id === id);
    setLocal(STORAGE_KEYS.SUBCATEGORIES, all.filter(s => s.id !== id));
    if (sub) SummarySnapshotRepository.invalidateAll(sub.scopeId);
  },
  deleteByCategory: (scopeId: string, categoryId: string) => {
    const all = getLocal<Subcategory>(STORAGE_KEYS.SUBCATEGORIES);
    setLocal(STORAGE_KEYS.SUBCATEGORIES, all.filter(s => !(s.scopeId === scopeId && s.categoryId === categoryId)));
    SummarySnapshotRepository.invalidateAll(scopeId);
  }
};

export const TransactionRepository: ITransactionRepository = {
  getAll: (scopeId: string) => getLocal<Transaction>(STORAGE_KEYS.TRANSACTIONS).filter(t => t.scopeId === scopeId),
  getSharedView: (scopeId: string) => getLocal<Transaction>(STORAGE_KEYS.TRANSACTIONS).filter(t => t.scopeId === scopeId || (t.visibleInShared && t.migratedFromShared)),
  save: (tx: Transaction) => {
    validateTransaction(tx);
    const all = getLocal<Transaction>(STORAGE_KEYS.TRANSACTIONS);
    const index = all.findIndex(t => t.id === tx.id);
    
    SummarySnapshotRepository.invalidate(tx.scopeId, getPeriodKeyFromDate(tx.date));

    if (index > -1) {
      all[index] = tx;
      setLocal(STORAGE_KEYS.TRANSACTIONS, all);
    } else {
      setLocal(STORAGE_KEYS.TRANSACTIONS, [...all, tx]);
    }
  },
  saveMany: (txs: Transaction[]) => {
    if (txs.length === 0) return;
    txs.forEach(validateTransaction);
    
    const all = getLocal<Transaction>(STORAGE_KEYS.TRANSACTIONS);
    const txMap = new Map<string, Transaction>(all.map(t => [t.id, t]));
    
    const affectedPeriods = new Set<string>();

    txs.forEach(newTx => {
      affectedPeriods.add(`${newTx.scopeId}_${getPeriodKeyFromDate(newTx.date)}`);
      txMap.set(newTx.id, newTx);
    });
    
    affectedPeriods.forEach(key => {
      const [sId, pKey] = key.split('_');
      SummarySnapshotRepository.invalidate(sId, pKey);
    });

    setLocal(STORAGE_KEYS.TRANSACTIONS, Array.from(txMap.values()));
  },
  delete: (id: string) => {
    const all = getLocal<Transaction>(STORAGE_KEYS.TRANSACTIONS);
    const tx = all.find(t => t.id === id);
    if (tx) {
      SummarySnapshotRepository.invalidate(tx.scopeId, getPeriodKeyFromDate(tx.date));
      setLocal(STORAGE_KEYS.TRANSACTIONS, all.filter(t => t.id !== id));
    }
  }
};

export const SummarySnapshotRepository: ISummarySnapshotRepository = {
  get: (scopeId: string, periodKey: string) => {
    const snapshots = JSON.parse(localStorage.getItem(STORAGE_KEYS.SNAPSHOTS) || '{}');
    return snapshots[`${scopeId}_${periodKey}`];
  },
  save: (scopeId: string, periodKey: string, summary: Summary) => {
    const snapshots = JSON.parse(localStorage.getItem(STORAGE_KEYS.SNAPSHOTS) || '{}');
    snapshots[`${scopeId}_${periodKey}`] = summary;
    localStorage.setItem(STORAGE_KEYS.SNAPSHOTS, JSON.stringify(snapshots));
  },
  invalidate: (scopeId: string, periodKey: string) => {
    const snapshots = JSON.parse(localStorage.getItem(STORAGE_KEYS.SNAPSHOTS) || '{}');
    if (snapshots[`${scopeId}_${periodKey}`]) {
      delete snapshots[`${scopeId}_${periodKey}`];
      localStorage.setItem(STORAGE_KEYS.SNAPSHOTS, JSON.stringify(snapshots));
    }
  },
  invalidateAll: (scopeId: string) => {
    const snapshots = JSON.parse(localStorage.getItem(STORAGE_KEYS.SNAPSHOTS) || '{}');
    let changed = false;
    const prefix = `${scopeId}_`;
    for (const key in snapshots) {
      if (key.startsWith(prefix)) {
        delete snapshots[key];
        changed = true;
      }
    }
    if (changed) {
      localStorage.setItem(STORAGE_KEYS.SNAPSHOTS, JSON.stringify(snapshots));
    }
  }
};

export const ClassificationRepository: IClassificationRepository = {
  getAll: (scopeId: string) => {
    if (!classificationCache.has(scopeId)) {
      const data = getLocal<ClassificationMemoryEntry>(STORAGE_KEYS.CLASSIFICATION).filter(e => e.scopeId === scopeId);
      const scopeMap = new Map<string, ClassificationMemoryEntry>(data.map(e => [e.normalizedKey, e]));
      classificationCache.set(scopeId, scopeMap);
    }
    const scopeMap = classificationCache.get(scopeId)!;
    return Array.from(scopeMap.values());
  },
  find: (scopeId: string, normalizedKey: string) => {
    // Garante que o cache do escopo está carregado
    if (!classificationCache.has(scopeId)) {
      ClassificationRepository.getAll(scopeId);
    }
    return classificationCache.get(scopeId)?.get(normalizedKey);
  },
  save: (entry: ClassificationMemoryEntry) => {
    const all = getLocal<ClassificationMemoryEntry>(STORAGE_KEYS.CLASSIFICATION);
    const existingIndex = all.findIndex(e => e.scopeId === entry.scopeId && e.normalizedKey === entry.normalizedKey);
    
    let updatedAll = [...all];
    if (existingIndex > -1) {
      updatedAll[existingIndex] = entry;
    } else {
      updatedAll.push(entry);
    }

    if (updatedAll.length > GC_LIMITS.CLASSIFICATION) {
      updatedAll = updatedAll
        .sort((a, b) => new Date(b.lastUsedAt).getTime() - new Date(a.lastUsedAt).getTime())
        .slice(0, Math.floor(GC_LIMITS.CLASSIFICATION * 0.9));
    }

    setLocal(STORAGE_KEYS.CLASSIFICATION, updatedAll);
    
    // Atualiza cache O(1)
    const scopeMap = new Map<string, ClassificationMemoryEntry>(
      updatedAll.filter(e => e.scopeId === entry.scopeId).map(e => [e.normalizedKey, e])
    );
    classificationCache.set(entry.scopeId, scopeMap);
  },
  delete: (scopeId: string, normalizedKey: string) => {
    const all = getLocal<ClassificationMemoryEntry>(STORAGE_KEYS.CLASSIFICATION);
    const filtered = all.filter(e => !(e.scopeId === scopeId && e.normalizedKey === normalizedKey));
    setLocal(STORAGE_KEYS.CLASSIFICATION, filtered);
    
    if (classificationCache.has(scopeId)) {
      classificationCache.get(scopeId)?.delete(normalizedKey);
    }
  }
};

export const RecurringRepository: IRecurringRepository = {
  getAll: (scopeId: string) => {
    if (!recurringCache.has(scopeId)) {
      const data = getLocal<RecurringMemoryEntry>(STORAGE_KEYS.RECURRING).filter(e => e.scopeId === scopeId);
      const scopeMap = new Map<string, RecurringMemoryEntry>(data.map(e => [e.normalizedKey, e]));
      recurringCache.set(scopeId, scopeMap);
    }
    const scopeMap = recurringCache.get(scopeId)!;
    return Array.from(scopeMap.values());
  },
  find: (scopeId: string, normalizedKey: string) => {
    if (!recurringCache.has(scopeId)) {
      RecurringRepository.getAll(scopeId);
    }
    return recurringCache.get(scopeId)?.get(normalizedKey);
  },
  save: (entry: RecurringMemoryEntry) => {
    const all = getLocal<RecurringMemoryEntry>(STORAGE_KEYS.RECURRING);
    const existingIndex = all.findIndex(e => e.scopeId === entry.scopeId && e.normalizedKey === entry.normalizedKey);
    let updatedAll;
    if (existingIndex > -1) {
      updatedAll = [...all];
      updatedAll[existingIndex] = entry;
    } else {
      updatedAll = [...all, entry];
    }
    setLocal(STORAGE_KEYS.RECURRING, updatedAll);
    
    const scopeMap = new Map<string, RecurringMemoryEntry>(
      updatedAll.filter(e => e.scopeId === entry.scopeId).map(e => [e.normalizedKey, e])
    );
    recurringCache.set(entry.scopeId, scopeMap);
  },
  delete: (scopeId: string, normalizedKey: string) => {
    const all = getLocal<RecurringMemoryEntry>(STORAGE_KEYS.RECURRING);
    const filtered = all.filter(e => !(e.scopeId === scopeId && e.normalizedKey === normalizedKey));
    setLocal(STORAGE_KEYS.RECURRING, filtered);
    
    if (recurringCache.has(scopeId)) {
      recurringCache.get(scopeId)?.delete(normalizedKey);
    }
  }
};

export const ImportLogRepository: IImportLogRepository = {
  isAlreadyImported: (scopeId: string, fileName: string) => {
    const logs = getLocal<{ scopeId: string; fileName: string }>(STORAGE_KEYS.IMPORT_LOGS);
    return logs.some(l => l.scopeId === scopeId && l.fileName === fileName);
  },
  logImport: (scopeId: string, fileName: string) => {
    const logs = getLocal<{ scopeId: string; fileName: string }>(STORAGE_KEYS.IMPORT_LOGS);
    setLocal(STORAGE_KEYS.IMPORT_LOGS, [...logs, { scopeId, fileName }]);
  }
};

export const AppRepository: IAppRepository = {
  clearAll: () => {
    Object.values(STORAGE_KEYS).forEach(key => localStorage.removeItem(key));
    classificationCache.clear();
    recurringCache.clear();
  }
};
