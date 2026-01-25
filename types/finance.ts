
export type ScopeType = 'individual' | 'shared';

export const TransactionNatures = {
  EXPENSE: 'expense',
  CREDIT: 'credit',
  REFUND: 'refund',
  PAYMENT: 'payment',
  INSTALLMENT_EXPENSE: 'installment_expense',
  TRANSFER: 'transfer',
} as const;

export type TransactionNature = typeof TransactionNatures[keyof typeof TransactionNatures];

export const UserKeys = {
  A: 'A',
  B: 'B',
} as const;

export type UserID = typeof UserKeys[keyof typeof UserKeys];

export interface Scope {
  scopeId: string;
  scopeType: ScopeType;
  name: string;
  defaultSplit?: { A: number; B: number };
}

export interface Category {
  id: string;
  scopeId: string;
  name: string;
  isDeleted?: boolean;
}

export interface Subcategory {
  id: string;
  scopeId: string;
  categoryId: string;
  name: string;
  isDeleted?: boolean;
}

export interface Transaction {
  id: string;
  externalId?: string;
  scopeId: string;
  userId?: string; 
  date: string;
  description: string;
  amount: number;
  categoryId?: string;
  subcategoryId?: string;
  isConfirmed: boolean;
  isSuggested?: boolean;
  isAutoConfirmed?: boolean;
  isRecurring?: boolean;
  isNeutralized?: boolean;
  migratedFromShared?: string | boolean;
  visibleInShared?: boolean;
  classificationStatus?: 'auto' | 'manual' | 'pending';
  transactionNature: TransactionNature;
  payerShare?: {
    A: number | null;
    B: number | null;
  };
  auditTrail?: {
    originId: string;
    migratedAt: string;
    previousScopeId: string;
  };
}

export interface ClassificationMemoryEntry {
  scopeId: string;
  normalizedKey: string;
  categoryId: string;
  subcategoryId: string;
  transactionNature?: TransactionNature;
  usageCount: number;
  lastUsedAt: string;
}

export interface RecurringMemoryEntry {
  scopeId: string;
  normalizedKey: string;
  categoryId: string;
  subcategoryId: string;
  transactionNature?: TransactionNature;
  payerShare?: { A: number; B: number };
  isRecurring: boolean;
}

export type Period = 
  | { kind: 'month'; year: number; month: number }
  | { kind: 'year'; year: number }
  | { kind: 'range'; startISO: string; endISO: string };

export type ViewType = 'dashboard' | 'transactions' | 'settings';

export interface TopDriver {
  categoryName: string;
  subcategoryName: string;
  amount: number;
}

export interface CategorySummary {
  categoryId?: string;
  name: string;
  value: number;
  subcategories: { subcategoryId: string; name: string; value: number }[];
  isDeleted?: boolean;
}

/**
 * TimeSeriesEntry: DTO padronizado para Recharts.
 * O mapeamento de categorias é tipado como numérico para evitar bugs de agregação.
 */
export interface TimeSeriesEntry {
  bucketKey: string;
  label: string;
  total: number;
  [categoryKey: string]: number | string; // Permitimos string apenas para label e bucketKey
}

export interface NatureTotalsDTO {
  expenses: number;
  installments: number;
  refunds: number;
  credits: number;
  transfers: number;
  invoiceTotal: number;
}

export interface Summary {
  totalSpent: number;
  pendingCount: number;
  needsAttention: boolean;
  totalsByCategory: CategorySummary[];
  timeSeries: TimeSeriesEntry[];
  monthlyEvolution: TimeSeriesEntry[]; 
  natureTotals: NatureTotalsDTO;
}

export interface CoupleInsightMetrics {
  baselineSpending: number;
  currentSpending: number;
  percentageChange: number;
  fixedContribution: number;
  variableContribution: number;
  responsibilitySplit: { userId: string; amount: number; percentage: number }[];
  dominantContributor: 'personA' | 'personB' | 'balanced';
}

export interface CoupleInsightData {
  period: Period;
  baselineTotal: number;
  currentTotal: number;
  changePct: number;
  mainDriver: 'fixed' | 'variable';
  fixedTotal: number;
  variableTotal: number;
  responsibilitySplit: {
    personA: { amount: number; pct: number };
    personB: { amount: number; pct: number };
    shared: { amount: number; pct: number };
  };
  dominantContributor: 'personA' | 'personB' | 'balanced';
}

export interface CoupleInsightDTO {
  metrics: CoupleInsightMetrics;
  summaryText: string;
  explanationText: string;
  topDrivers: TopDriver[];
  data: CoupleInsightData;
}

export interface RawCSVTransaction {
  date: string;
  description: string;
  amount: number;
  externalId?: string;
}
