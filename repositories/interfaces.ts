
import { Category, Subcategory, Transaction, ClassificationMemoryEntry, RecurringMemoryEntry } from '../types/finance';

export interface ICategoryRepository {
  getAll(scopeId: string): Category[];
  save(category: Category): void;
  delete(id: string): void;
}

export interface ISubcategoryRepository {
  getAll(scopeId: string): Subcategory[];
  getByCategory(scopeId: string, categoryId: string): Subcategory[];
  save(sub: Subcategory): void;
  delete(id: string): void;
  deleteByCategory(scopeId: string, categoryId: string): void;
}

export interface ITransactionRepository {
  getAll(scopeId: string): Transaction[];
  getSharedView(scopeId: string): Transaction[];
  save(tx: Transaction): void;
  saveMany(txs: Transaction[]): void;
  delete(id: string): void;
}

export interface IClassificationRepository {
  getAll(scopeId: string): ClassificationMemoryEntry[];
  find(scopeId: string, normalizedKey: string): ClassificationMemoryEntry | undefined;
  save(entry: ClassificationMemoryEntry): void;
  delete(scopeId: string, normalizedKey: string): void;
}

export interface IRecurringRepository {
  getAll(scopeId: string): RecurringMemoryEntry[];
  find(scopeId: string, normalizedKey: string): RecurringMemoryEntry | undefined;
  save(entry: RecurringMemoryEntry): void;
  delete(scopeId: string, normalizedKey: string): void;
}

export interface IAppRepository {
  clearAll(): void;
}
