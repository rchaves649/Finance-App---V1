
import { TransactionRepository, CategoryRepository, SubcategoryRepository } from './localRepositories';
import { Period, Transaction, Category, CoupleInsightDTO, CoupleInsightData, CoupleInsightMetrics, TopDriver } from '../types';
import { inPeriod } from '../shared/dateUtils';

// Simple heuristic: Housing and Education are considered fixed.
const FIXED_CATEGORIES = ['Moradia', 'Educação'];

export const CoupleInsightService = {
  getInsight: (scopeId: string, period: Period): CoupleInsightDTO | null => {
    // Only applies to month-based periods for now to establish baseline
    if (period.kind !== 'month') return null;

    const allTransactions = TransactionRepository.getAll(scopeId).filter(t => t.isConfirmed);
    const categories = CategoryRepository.getAll(scopeId);
    const subcategories = SubcategoryRepository.getAll(scopeId);

    // 1. Current Period Data
    const currentTxs = allTransactions.filter(t => inPeriod(t.date, period));
    const currentTotal = currentTxs.reduce((acc, t) => acc + t.amount, 0);

    // 2. Baseline Calculation (last 3 full months)
    let baselineTotalSum = 0;
    let monthsWithData = 0;

    for (let i = 1; i <= 3; i++) {
      const targetDate = new Date(period.year, period.month - 1 - i, 1);
      const pastPeriod: Period = { 
        kind: 'month', 
        year: targetDate.getFullYear(), 
        month: targetDate.getMonth() + 1 
      };
      const pastTxs = allTransactions.filter(t => inPeriod(t.date, pastPeriod));
      if (pastTxs.length > 0) {
        baselineTotalSum += pastTxs.reduce((acc, t) => acc + t.amount, 0);
        monthsWithData++;
      }
    }

    const baselineSpending = monthsWithData > 0 ? baselineTotalSum / monthsWithData : currentTotal;
    const percentageChange = baselineSpending > 0 ? ((currentTotal - baselineSpending) / baselineSpending) * 100 : 0;

    // 3. Fixed vs Variable contribution and Top Drivers
    let fixedAmount = 0;
    let variableAmount = 0;
    const splitMap = { personA: 0, personB: 0, shared: 0 };
    const driverMap = new Map<string, number>();

    currentTxs.forEach(t => {
      const cat = categories.find(c => c.id === t.categoryId);
      const sub = subcategories.find(s => s.id === t.subcategoryId);
      const isFixed = cat ? FIXED_CATEGORIES.includes(cat.name) : false;
      
      const driverKey = `${cat?.name || 'Sem Categoria'}|${sub?.name || 'Outros'}`;
      driverMap.set(driverKey, (driverMap.get(driverKey) || 0) + t.amount);

      if (isFixed) {
        fixedAmount += t.amount;
      } else {
        variableAmount += t.amount;
        if (t.userId === 'Pessoa A') splitMap.personA += t.amount;
        else if (t.userId === 'Pessoa B') splitMap.personB += t.amount;
        else splitMap.shared += t.amount;
      }
    });

    const topDrivers: TopDriver[] = Array.from(driverMap.entries())
      .map(([key, amount]) => {
        const [catName, subName] = key.split('|');
        return { categoryName: catName, subcategoryName: subName, amount };
      })
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 3);

    const totalCurrent = fixedAmount + variableAmount;
    const fixedContribution = totalCurrent > 0 ? (fixedAmount / totalCurrent) * 100 : 0;
    const variableContribution = totalCurrent > 0 ? (variableAmount / totalCurrent) * 100 : 0;

    const legacySplit = [
      { userId: 'Pessoa A', amount: splitMap.personA, percentage: variableAmount > 0 ? (splitMap.personA / variableAmount) * 100 : 0 },
      { userId: 'Pessoa B', amount: splitMap.personB, percentage: variableAmount > 0 ? (splitMap.personB / variableAmount) * 100 : 0 },
      { userId: 'Shared', amount: splitMap.shared, percentage: variableAmount > 0 ? (splitMap.shared / variableAmount) * 100 : 0 }
    ].filter(i => i.amount > 0).sort((a, b) => b.amount - a.amount);

    let dominantContributor: 'personA' | 'personB' | 'balanced' = 'balanced';
    if (variableAmount > 0) {
      const pctA = (splitMap.personA / variableAmount) * 100;
      const pctB = (splitMap.personB / variableAmount) * 100;
      if (Math.abs(pctA - pctB) > 10) dominantContributor = pctA > pctB ? 'personA' : 'personB';
    }

    const metrics: CoupleInsightMetrics = {
      baselineSpending,
      currentSpending: currentTotal,
      percentageChange,
      fixedContribution,
      variableContribution,
      responsibilitySplit: legacySplit,
      dominantContributor
    };

    const changeWord = percentageChange >= 0 ? 'acima da' : 'abaixo da';
    const summaryText = `Gastos totais estão ${Math.abs(percentageChange).toFixed(0)}% ${changeWord} média histórica.`;
    
    const mainDriver = variableAmount > fixedAmount ? 'variable' : 'fixed';
    const mainDriverLabel = mainDriver === 'variable' ? 'despesas variáveis' : 'custos fixos';
    
    let explanationText = `O comportamento deste mês é impulsionado principalmente por ${mainDriverLabel}, com destaque para `;
    if (topDrivers.length > 0) {
      explanationText += `${topDrivers[0].categoryName} (${topDrivers[0].subcategoryName}).`;
    } else {
      explanationText += "as movimentações recentes.";
    }

    const data: CoupleInsightData = {
      period,
      baselineTotal: baselineSpending,
      currentTotal: totalCurrent,
      changePct: percentageChange,
      mainDriver,
      fixedTotal: fixedAmount,
      variableTotal: variableAmount,
      responsibilitySplit: {
        personA: { amount: splitMap.personA, pct: variableAmount > 0 ? (splitMap.personA / variableAmount) * 100 : 0 },
        personB: { amount: splitMap.personB, pct: variableAmount > 0 ? (splitMap.personB / variableAmount) * 100 : 0 },
        shared: { amount: splitMap.shared, pct: variableAmount > 0 ? (splitMap.shared / variableAmount) * 100 : 0 }
      },
      dominantContributor
    };

    return { metrics, summaryText, explanationText, topDrivers, data };
  }
};
