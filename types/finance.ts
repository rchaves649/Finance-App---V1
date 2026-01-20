
export type ScopeType = 'individual' | 'shared';

export interface Scope {
  scopeId: string;
  scopeType: ScopeType;
  name: string;
  defaultSplit?: { A: number; B: number }; // Percentages, e.g. { A: 50, B: 50 }
}

export interface Category {
  id: string;
  scopeId: string;
  name: string;
}

export interface Subcategory {
  id: string;
  scopeId: string;
  categoryId: string;
  name: string;
}

export interface Transaction {
  id: string;
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
  migratedFromShared?: string | boolean;
  visibleInShared?: boolean;
  classificationStatus?: 'auto' | 'manual' | 'pending';
  payerShare?: {
    A: number | null;
    B: number | null;
  };
}

export interface ClassificationMemoryEntry {
  scopeId: string;
  normalizedKey: string;
  categoryId: string;
  subcategoryId: string;
  usageCount: number;
  lastUsedAt: string;
}

export interface RecurringMemoryEntry {
  scopeId: string;
  normalizedKey: string;
  categoryId: string;
  subcategoryId: string;
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
}

export interface CoupleInsightData {
  period: Period;
  baselineTotal: number;
  currentTotal: number;
  changePct: number;
  mainDriver: "fixed" | "variable";
  fixedTotal: number;
  variableTotal: number;
  responsibilitySplit: {
    personA: { amount: number; pct: number };
    personB: { amount: number; pct: number };
    shared: { amount: number; pct: number };
  };
  dominantContributor: "personA" | "personB" | "balanced";
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

export interface CoupleInsightDTO {
  metrics: CoupleInsightMetrics;
  summaryText: string;
  explanationText: string;
  topDrivers: TopDriver[];
  data: CoupleInsightData;
}

export interface TimeSeriesEntry {
  bucketKey: string;
  label: string;
  total: number;
}

export interface Summary {
  totalSpent: number;
  pendingCount: number;
  totalsByCategory: CategorySummary[];
  timeSeries: TimeSeriesEntry[];
}

export interface RawCSVTransaction {
  date: string;
  description: string;
  amount: number;
}
