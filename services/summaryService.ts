import { TransactionRepository, CategoryRepository, SubcategoryRepository, SummarySnapshotRepository } from "./localRepositories";
import { Period, Transaction, Category, CategorySummary, Summary, TimeSeriesEntry, TransactionNatures } from "../types/finance";
import { inPeriod, toISODate } from "../shared/dateUtils";
import { toCents, fromCents } from "../shared/formatUtils";

export const SummaryService = {
  /**
   * Computa o resumo financeiro centralizado para Dashboard e Lançamentos.
   * PERFORMANCE: Utiliza Snapshots pré-calculados para períodos passados.
   */
  getSummary: (scopeId: string, period: Period): Summary => {
    // Só usamos snapshots para períodos fechados (mês completo) para evitar bugs de tempo real
    const isFullMonth = period.kind === 'month';
    const periodKey = isFullMonth ? `${period.year}-${period.month.toString().padStart(2, '0')}` : null;
    
    const now = new Date();
    const currentPeriodKey = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}`;
    const isPastPeriod = periodKey && periodKey < currentPeriodKey;

    if (isPastPeriod) {
      const snapshot = SummarySnapshotRepository.get(scopeId, periodKey!);
      if (snapshot) return snapshot;
    }

    const allTxs = TransactionRepository.getAll(scopeId);
    const categories = CategoryRepository.getAll(scopeId);
    const subcategories = SubcategoryRepository.getAll(scopeId);
    
    const periodTransactions = allTxs.filter(t => inPeriod(t.date, period));
    
    const validForCalc = periodTransactions.filter(t => 
      !t.migratedFromShared && 
      !t.isNeutralized && 
      t.transactionNature !== TransactionNatures.TRANSFER
    );
    
    const confirmed = validForCalc.filter(t => t.isConfirmed);
    
    let totalExpenseCents = 0;
    let totalInstallmentCents = 0;
    let totalRefundCents = 0;
    let totalCreditCents = 0;
    let totalTransferCents = 0;

    periodTransactions.forEach(t => {
      if (t.migratedFromShared || t.isNeutralized) return;
      const cents = toCents(t.amount);
      if (t.transactionNature === TransactionNatures.EXPENSE) totalExpenseCents += cents;
      else if (t.transactionNature === TransactionNatures.INSTALLMENT_EXPENSE) totalInstallmentCents += cents;
      else if (t.transactionNature === TransactionNatures.REFUND) totalRefundCents += cents;
      else if (t.transactionNature === TransactionNatures.CREDIT) totalCreditCents += cents;
      else if (t.transactionNature === TransactionNatures.TRANSFER) totalTransferCents += cents;
    });

    let confExpenseCents = 0;
    let confInstallmentCents = 0;
    let confRefundCents = 0;
    let confCreditCents = 0;

    confirmed.forEach(t => {
      const cents = toCents(t.amount);
      if (t.transactionNature === TransactionNatures.EXPENSE) confExpenseCents += cents;
      else if (t.transactionNature === TransactionNatures.INSTALLMENT_EXPENSE) confInstallmentCents += cents;
      else if (t.transactionNature === TransactionNatures.REFUND) confRefundCents += cents;
      else if (t.transactionNature === TransactionNatures.CREDIT) confCreditCents += cents;
    });

    const totalSpentCents = confExpenseCents + confInstallmentCents - confRefundCents - confCreditCents;
    const totalSpent = fromCents(totalSpentCents);
    const pendingCount = periodTransactions.filter(t => !t.isConfirmed).length;

    const categoryMap = new Map<string, { totalCents: number; subs: Map<string, number> }>();
    
    confirmed.forEach(t => {
      if (t.transactionNature === TransactionNatures.PAYMENT) return;

      const catId = t.categoryId || 'unclassified';
      const subId = t.subcategoryId || 'unclassified';
      if (!categoryMap.has(catId)) categoryMap.set(catId, { totalCents: 0, subs: new Map() });
      const catData = categoryMap.get(catId)!;
      
      const txCents = toCents(t.amount);
      const isNegativeEffect = t.transactionNature === TransactionNatures.REFUND || t.transactionNature === TransactionNatures.CREDIT;
      
      if (isNegativeEffect) {
        catData.totalCents -= txCents;
        const currentSubCents = catData.subs.get(subId) || 0;
        catData.subs.set(subId, currentSubCents - txCents);
      } else {
        catData.totalCents += txCents;
        const currentSubCents = catData.subs.get(subId) || 0;
        catData.subs.set(subId, currentSubCents + txCents);
      }
    });

    const totalsByCategory: CategorySummary[] = Array.from(categoryMap.entries())
      .map(([catId, data]) => {
        const cat = categories.find(c => c.id === catId);
        const subSummaries = Array.from(data.subs.entries()).map(([subId, valueCents]) => {
          const sub = subcategories.find(s => s.id === subId);
          return { subcategoryId: subId, name: sub ? sub.name : 'Outros', value: fromCents(valueCents) };
        });
        return {
          categoryId: catId === 'unclassified' ? undefined : catId,
          name: cat ? (cat.isDeleted ? `${cat.name} (Excluída)` : cat.name) : 'Outros',
          value: fromCents(data.totalCents),
          subcategories: subSummaries,
          isDeleted: cat?.isDeleted
        };
      })
      .filter(c => Math.abs(c.value) > 0.001)
      .sort((a, b) => b.value - a.value);

    const timeSeries: TimeSeriesEntry[] = [];
    const bucketMap = new Map<string, number>();
    const relevantForTrend = confirmed.filter(t => t.transactionNature !== TransactionNatures.PAYMENT);

    if (period.kind === 'year') {
      for (let m = 1; m <= 12; m++) {
        const key = `${period.year}-${m.toString().padStart(2, '0')}`;
        bucketMap.set(key, 0);
      }
      relevantForTrend.forEach(t => {
        const key = t.date.substring(0, 7); 
        if (bucketMap.has(key)) {
          const cents = toCents(t.amount);
          const current = bucketMap.get(key)!;
          const isNegative = t.transactionNature === TransactionNatures.REFUND || t.transactionNature === TransactionNatures.CREDIT;
          bucketMap.set(key, isNegative ? current - cents : current + cents);
        }
      });
      bucketMap.forEach((valCents, key) => {
        const monthLabel = new Date(parseInt(key.split('-')[0]), parseInt(key.split('-')[1]) - 1).toLocaleString('pt-BR', { month: 'short' });
        timeSeries.push({ bucketKey: key, label: monthLabel, total: fromCents(valCents) });
      });
    } else if (period.kind === 'month') {
      const daysInMonth = new Date(period.year, period.month, 0).getDate();
      for (let d = 1; d <= daysInMonth; d++) {
        const key = `${period.year}-${period.month.toString().padStart(2, '0')}-${d.toString().padStart(2, '0')}`;
        bucketMap.set(key, 0);
      }
      relevantForTrend.forEach(t => {
        const key = t.date;
        if (bucketMap.has(key)) {
          const cents = toCents(t.amount);
          const current = bucketMap.get(key)!;
          const isNegative = t.transactionNature === TransactionNatures.REFUND || t.transactionNature === TransactionNatures.CREDIT;
          bucketMap.set(key, isNegative ? current - cents : current + cents);
        }
      });
      bucketMap.forEach((valCents, key) => {
        timeSeries.push({ bucketKey: key, label: key.split('-')[2], total: fromCents(valCents) });
      });
    }

    const result: Summary = { 
      totalSpent, 
      pendingCount, 
      totalsByCategory, 
      timeSeries,
      natureTotals: {
        expenses: fromCents(totalExpenseCents),
        installments: fromCents(totalInstallmentCents),
        refunds: fromCents(totalRefundCents),
        credits: fromCents(totalCreditCents),
        transfers: fromCents(totalTransferCents),
        invoiceTotal: fromCents(totalExpenseCents + totalInstallmentCents)
      }
    };

    // Salva snapshot se for um período passado
    if (isPastPeriod) {
      SummarySnapshotRepository.save(scopeId, periodKey!, result);
    }

    return result;
  }
};
