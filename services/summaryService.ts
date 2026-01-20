
import { TransactionRepository, CategoryRepository, SubcategoryRepository } from "./localRepositories";
import { Period, Transaction, Category, CategorySummary, Summary, TimeSeriesEntry } from "../types/finance";
import { inPeriod, toISODate } from "../shared/dateUtils";

export const SummaryService = {
  /**
   * Computes a full summary for a specific scope and period, including time-series trends.
   * Excludes migrated transactions from shared scope totals.
   */
  getSummary: (scopeId: string, period: Period): Summary => {
    // Summary logic should only count transactions actually belonging to the scope for totals
    // In shared scope, migrated transactions are visible but excluded from math.
    const allTxs = TransactionRepository.getAll(scopeId);
    const categories = CategoryRepository.getAll(scopeId);
    const subcategories = SubcategoryRepository.getAll(scopeId);
    
    const periodTransactions = allTxs.filter(t => inPeriod(t.date, period));
    
    // EXCLUSION LOGIC: If we are in a shared scope (e.g. casal), we usually don't have migratedFromShared
    // unless they were moved. The prompt says individual scope includes them normally, 
    // shared excludes them from totals.
    const validForSummary = periodTransactions.filter(t => !t.migratedFromShared);
    const confirmed = validForSummary.filter(t => t.isConfirmed);
    
    const totalSpent = confirmed.reduce((acc, t) => acc + t.amount, 0);
    const pendingCount = periodTransactions.filter(t => !t.isConfirmed).length;

    // 1. Categorical Distribution
    const categoryMap = new Map<string, { total: number; subs: Map<string, number> }>();
    confirmed.forEach(t => {
      const catId = t.categoryId || 'unclassified';
      const subId = t.subcategoryId || 'unclassified';
      if (!categoryMap.has(catId)) categoryMap.set(catId, { total: 0, subs: new Map() });
      const catData = categoryMap.get(catId)!;
      catData.total += t.amount;
      catData.subs.set(subId, (catData.subs.get(subId) || 0) + t.amount);
    });

    const totalsByCategory: CategorySummary[] = Array.from(categoryMap.entries()).map(([catId, data]) => {
      const cat = categories.find(c => c.id === catId);
      const subSummaries = Array.from(data.subs.entries()).map(([subId, value]) => {
        const sub = subcategories.find(s => s.id === subId);
        return { subcategoryId: subId, name: sub ? sub.name : 'Outros', value };
      });
      return {
        categoryId: catId === 'unclassified' ? undefined : catId,
        name: cat ? cat.name : 'Outros',
        value: data.total,
        subcategories: subSummaries
      };
    }).sort((a, b) => b.value - a.value);

    // 2. Time Series Generation
    const timeSeries: TimeSeriesEntry[] = [];
    const bucketMap = new Map<string, number>();

    if (period.kind === 'year') {
      for (let m = 1; m <= 12; m++) {
        const key = `${period.year}-${m.toString().padStart(2, '0')}`;
        bucketMap.set(key, 0);
      }
      confirmed.forEach(t => {
        const key = t.date.substring(0, 7); 
        if (bucketMap.has(key)) bucketMap.set(key, bucketMap.get(key)! + t.amount);
      });
      bucketMap.forEach((val, key) => {
        const monthLabel = new Date(parseInt(key.split('-')[0]), parseInt(key.split('-')[1]) - 1).toLocaleString('pt-BR', { month: 'short' });
        timeSeries.push({ bucketKey: key, label: monthLabel, total: val });
      });
    } else if (period.kind === 'month') {
      const daysInMonth = new Date(period.year, period.month, 0).getDate();
      for (let d = 1; d <= daysInMonth; d++) {
        const key = `${period.year}-${period.month.toString().padStart(2, '0')}-${d.toString().padStart(2, '0')}`;
        bucketMap.set(key, 0);
      }
      confirmed.forEach(t => {
        const key = t.date;
        if (bucketMap.has(key)) bucketMap.set(key, bucketMap.get(key)! + t.amount);
      });
      bucketMap.forEach((val, key) => {
        timeSeries.push({ bucketKey: key, label: key.split('-')[2], total: val });
      });
    } else if (period.kind === 'range') {
      const start = new Date(period.startISO);
      const end = new Date(period.endISO);
      const diffDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
      const isLongRange = diffDays > 45;

      if (isLongRange) {
        confirmed.forEach(t => {
          const d = new Date(t.date);
          const weekNum = Math.floor(d.getTime() / (1000 * 60 * 60 * 24 * 7));
          const key = `W${weekNum}`;
          bucketMap.set(key, (bucketMap.get(key) || 0) + t.amount);
        });
        Array.from(bucketMap.keys()).sort().forEach(key => {
          timeSeries.push({ bucketKey: key, label: 'Semana', total: bucketMap.get(key)! });
        });
      } else {
        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
          bucketMap.set(toISODate(d), 0);
        }
        confirmed.forEach(t => {
          if (bucketMap.has(t.date)) bucketMap.set(t.date, bucketMap.get(t.date)! + t.amount);
        });
        bucketMap.forEach((val, key) => {
          timeSeries.push({ bucketKey: key, label: key.split('-')[2] + '/' + key.split('-')[1], total: val });
        });
      }
    }

    return { totalSpent, pendingCount, totalsByCategory, timeSeries };
  }
};
