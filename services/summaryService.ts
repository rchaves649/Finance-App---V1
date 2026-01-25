
import { 
  Period, 
  Transaction, 
  Category, 
  Subcategory,
  CategorySummary, 
  Summary, 
  TimeSeriesEntry, 
  TransactionNatures,
  NatureTotalsDTO
} from "../types/finance";
import { SummarySnapshotRepository } from "./localRepositories";
import { inPeriod } from "../shared/dateUtils";
import { toCents, fromCents } from "../shared/formatUtils";

export const SummaryService = {
  getSummary: (
    scopeId: string, 
    period: Period, 
    rawData: { allTransactions: Transaction[], categories: Category[], subcategories: Subcategory[] }
  ): Summary => {
    const { allTransactions, categories, subcategories } = rawData;
    
    const periodKey = period.kind === 'month' 
      ? `${period.year}-${period.month.toString().padStart(2, '0')}` 
      : null;
    
    if (period.kind === 'month' && periodKey && isPastMonth(period.year, period.month)) {
      const snapshot = SummarySnapshotRepository.get(scopeId, periodKey);
      if (snapshot) return snapshot;
    }

    const periodTransactions = allTransactions.filter(t => inPeriod(t.date, period));
    
    const analyzableTxs = periodTransactions.filter(t => 
      !t.migratedFromShared && !t.isNeutralized && t.transactionNature !== TransactionNatures.TRANSFER
    );

    const natureTotals = calculateNatureTotals(periodTransactions);
    const totalsByCategory = calculateCategorySummaries(analyzableTxs, categories);
    
    // CORREÇÃO: Passando subcategories para o builder de evolução
    const monthlyEvolution = buildMonthlyEvolution(allTransactions, categories, subcategories);

    const result: Summary = {
      totalSpent: fromCents(natureTotals.expensesCents + natureTotals.installmentsCents - natureTotals.refundsCents - natureTotals.creditsCents),
      pendingCount: countPending(periodTransactions),
      needsAttention: countPending(periodTransactions) > 0,
      totalsByCategory,
      timeSeries: monthlyEvolution,
      monthlyEvolution,
      natureTotals: formatNatureTotals(natureTotals)
    };

    if (periodKey) SummarySnapshotRepository.save(scopeId, periodKey, result);
    
    return result;
  }
};

function isPastMonth(year: number, month: number): boolean {
  const now = new Date();
  const currentKey = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}`;
  const targetKey = `${year}-${month.toString().padStart(2, '0')}`;
  return targetKey < currentKey;
}

function calculateNatureTotals(txs: Transaction[]) {
  const totals = { expensesCents: 0, installmentsCents: 0, refundsCents: 0, creditsCents: 0, transfersCents: 0, paymentsCents: 0 };
  txs.forEach(t => {
    if (t.migratedFromShared || t.isNeutralized) return;
    const c = toCents(t.amount);
    switch (t.transactionNature) {
      case TransactionNatures.EXPENSE: totals.expensesCents += c; break;
      case TransactionNatures.INSTALLMENT_EXPENSE: totals.installmentsCents += c; break;
      case TransactionNatures.REFUND: totals.refundsCents += c; break;
      case TransactionNatures.CREDIT: totals.creditsCents += c; break;
      case TransactionNatures.TRANSFER: totals.transfersCents += c; break;
      case TransactionNatures.PAYMENT: totals.paymentsCents += c; break;
    }
  });
  return totals;
}

function formatNatureTotals(raw: ReturnType<typeof calculateNatureTotals>): NatureTotalsDTO {
  return {
    expenses: fromCents(raw.expensesCents),
    installments: fromCents(raw.installmentsCents),
    refunds: fromCents(raw.refundsCents),
    credits: fromCents(raw.creditsCents),
    transfers: fromCents(raw.transfersCents),
    invoiceTotal: fromCents(raw.expensesCents + raw.installmentsCents)
  };
}

function calculateCategorySummaries(txs: Transaction[], categories: Category[]): CategorySummary[] {
  const map = new Map<string, number>();
  txs.filter(t => t.transactionNature !== TransactionNatures.PAYMENT).forEach(t => {
    const catId = t.categoryId || 'unclassified';
    const cents = toCents(t.amount);
    const isNeg = t.transactionNature === TransactionNatures.REFUND || t.transactionNature === TransactionNatures.CREDIT;
    map.set(catId, (map.get(catId) || 0) + (isNeg ? -cents : cents));
  });

  return Array.from(map.entries())
    .map(([id, cents]) => ({
      categoryId: id === 'unclassified' ? undefined : id,
      name: categories.find(c => c.id === id)?.name || (id === 'unclassified' ? 'Não Classificados' : 'Outros'),
      value: fromCents(cents),
      subcategories: []
    }))
    .filter(c => Math.abs(c.value) > 0.01)
    .sort((a, b) => b.value - a.value);
}

/**
 * buildMonthlyEvolution O(n):
 * Agora mapeia subcategorias na convenção "Categoria::Subcategoria" exigida pelos componentes de detalhamento.
 */
function buildMonthlyEvolution(allTxs: Transaction[], categories: Category[], subcategories: Subcategory[]): TimeSeriesEntry[] {
  const now = new Date();
  const buckets = new Map<string, TimeSeriesEntry>();
  const last6MonthsKeys: string[] = [];

  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}`;
    const label = d.toLocaleString('pt-BR', { month: 'short' }).replace('.', '');
    
    last6MonthsKeys.push(key);
    buckets.set(key, { bucketKey: key, label, total: 0 });
  }

  allTxs.forEach(t => {
    if (t.isNeutralized || t.migratedFromShared || t.transactionNature === TransactionNatures.PAYMENT || t.transactionNature === TransactionNatures.TRANSFER) return;
    
    const monthKey = t.date.substring(0, 7);
    const entry = buckets.get(monthKey);
    if (entry) {
      const diffCents = toCents(t.amount) * (t.transactionNature === TransactionNatures.REFUND || t.transactionNature === TransactionNatures.CREDIT ? -1 : 1);
      const val = fromCents(diffCents);
      
      entry.total = Number((entry.total + val).toFixed(2));
      
      const catName = categories.find(c => c.id === t.categoryId)?.name || 'Não Classificados';
      const subName = subcategories.find(s => s.id === t.subcategoryId)?.name || 'Outros';

      // Agregação por Categoria (Gráfico principal)
      entry[catName] = Number(((entry[catName] as number || 0) + val).toFixed(2));

      // Agregação por Categoria::Subcategoria (Gráfico de Detalhamento)
      const subKey = `${catName}::${subName}`;
      entry[subKey] = Number(((entry[subKey] as number || 0) + val).toFixed(2));
    }
  });

  return last6MonthsKeys.map(key => buckets.get(key)!);
}

function countPending(txs: Transaction[]): number {
  return txs.filter(t => {
    const isExcluded = t.transactionNature === TransactionNatures.REFUND || t.transactionNature === TransactionNatures.PAYMENT || t.isNeutralized;
    return !t.isConfirmed || (!isExcluded && (!t.categoryId || !t.subcategoryId));
  }).length;
}
