import { TransactionRepository, CategoryRepository, SubcategoryRepository } from './localRepositories';
import { Period, Transaction, Category, CoupleInsightDTO, CoupleInsightData, CoupleInsightMetrics, TopDriver, TransactionNatures } from '../types/finance';
import { inPeriod } from '../shared/dateUtils';
import { toCents, fromCents } from '../shared/formatUtils';

// Simple heuristic: Housing and Education are considered fixed.
const FIXED_CATEGORIES = ['Moradia', 'Educação'];

/**
 * Filtra transações excepcionais (outliers) que podem distorcer o baseline.
 * Ex: Compra de um carro, viagem atípica, etc.
 * Heurística: Qualquer transação individual > 3x o desvio padrão ou simplesmente um limite estatístico robusto.
 * Usamos aqui uma abordagem simplificada de IQR para remover extremos.
 */
function filterOutliers(txs: Transaction[]): Transaction[] {
  if (txs.length < 5) return txs;
  const sortedValues = [...txs].map(t => t.amount).sort((a, b) => a - b);
  const q1 = sortedValues[Math.floor(sortedValues.length * 0.25)];
  const q3 = sortedValues[Math.floor(sortedValues.length * 0.75)];
  const iqr = q3 - q1;
  const upperLimit = q3 + (iqr * 3); // Limite conservador para "excepcional"
  
  return txs.filter(t => t.amount <= upperLimit);
}

export const CoupleInsightService = {
  getInsight: (scopeId: string, period: Period): CoupleInsightDTO | null => {
    // Only applies to month-based periods for now to establish baseline
    if (period.kind !== 'month') return null;

    // Inclui tanto Despesas comuns quanto Parceladas para gerar os insights
    const allTransactions = TransactionRepository.getAll(scopeId)
      .filter(t => 
        t.isConfirmed && 
        !t.migratedFromShared && 
        (t.transactionNature === TransactionNatures.EXPENSE || t.transactionNature === TransactionNatures.INSTALLMENT_EXPENSE)
      );

    const categories = CategoryRepository.getAll(scopeId);
    const subcategories = SubcategoryRepository.getAll(scopeId);

    // 1. Current Period Data (using cents)
    const currentTxs = allTransactions.filter(t => inPeriod(t.date, period));
    const currentTotalCents = currentTxs.reduce((acc, t) => acc + toCents(t.amount), 0);

    // 2. Baseline Calculation (last 3 full months)
    let baselineTotalSumCents = 0;
    let monthsWithData = 0;

    for (let i = 1; i <= 3; i++) {
      const targetDate = new Date(period.year, period.month - 1 - i, 1);
      const pastPeriod: Period = { 
        kind: 'month', 
        year: targetDate.getFullYear(), 
        month: targetDate.getMonth() + 1 
      };
      
      let pastTxs = allTransactions.filter(t => inPeriod(t.date, pastPeriod));
      
      if (pastTxs.length > 0) {
        // QUALIDADE ANALÍTICA: Remove outliers do baseline para não distorcer metas
        const filteredPastTxs = filterOutliers(pastTxs);
        baselineTotalSumCents += filteredPastTxs.reduce((acc, t) => acc + toCents(t.amount), 0);
        monthsWithData++;
      }
    }

    const baselineSpendingCents = monthsWithData > 0 ? (baselineTotalSumCents / monthsWithData) : currentTotalCents;
    const currentSpending = fromCents(currentTotalCents);
    const baselineSpending = fromCents(baselineSpendingCents);
    
    const percentageChange = baselineSpendingCents > 0 
      ? ((currentTotalCents - baselineSpendingCents) / baselineSpendingCents) * 100 
      : 0;

    // 3. Fixed vs Variable contribution and Top Drivers
    let fixedAmountCents = 0;
    let variableAmountCents = 0;
    const splitMapCents = { personA: 0, personB: 0, shared: 0 };
    const driverMapCents = new Map<string, number>();

    currentTxs.forEach(t => {
      const cat = categories.find(c => c.id === t.categoryId);
      const sub = subcategories.find(s => s.id === t.subcategoryId);
      const isFixed = cat ? FIXED_CATEGORIES.includes(cat.name) : false;
      
      const driverKey = `${cat?.name || 'Sem Categoria'}|${sub?.name || 'Outros'}`;
      const amountCents = toCents(t.amount);
      driverMapCents.set(driverKey, (driverMapCents.get(driverKey) || 0) + amountCents);

      if (isFixed) {
        fixedAmountCents += amountCents;
      } else {
        variableAmountCents += amountCents;
        if (t.userId === 'Pessoa A') splitMapCents.personA += amountCents;
        else if (t.userId === 'Pessoa B') splitMapCents.personB += amountCents;
        else splitMapCents.shared += amountCents;
      }
    });

    const topDrivers: TopDriver[] = Array.from(driverMapCents.entries())
      .map(([key, amountCents]) => {
        const [catName, subName] = key.split('|');
        return { categoryName: catName, subcategoryName: subName, amount: fromCents(amountCents) };
      })
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 3);

    const totalCurrentCents = fixedAmountCents + variableAmountCents;
    const fixedContribution = totalCurrentCents > 0 ? (fixedAmountCents / totalCurrentCents) * 100 : 0;
    const variableContribution = totalCurrentCents > 0 ? (variableAmountCents / totalCurrentCents) * 100 : 0;

    const legacySplit = [
      { userId: 'Pessoa A', amount: fromCents(splitMapCents.personA), percentage: variableAmountCents > 0 ? (splitMapCents.personA / variableAmountCents) * 100 : 0 },
      { userId: 'Pessoa B', amount: fromCents(splitMapCents.personB), percentage: variableAmountCents > 0 ? (splitMapCents.personB / variableAmountCents) * 100 : 0 },
      { userId: 'Shared', amount: fromCents(splitMapCents.shared), percentage: variableAmountCents > 0 ? (splitMapCents.shared / variableAmountCents) * 100 : 0 }
    ].filter(i => i.amount > 0).sort((a, b) => b.amount - a.amount);

    let dominantContributor: 'personA' | 'personB' | 'balanced' = 'balanced';
    if (variableAmountCents > 0) {
      const pctA = (splitMapCents.personA / variableAmountCents) * 100;
      const pctB = (splitMapCents.personB / variableAmountCents) * 100;
      if (Math.abs(pctA - pctB) > 10) dominantContributor = pctA > pctB ? 'personA' : 'personB';
    }

    const metrics: CoupleInsightMetrics = {
      baselineSpending,
      currentSpending,
      percentageChange,
      fixedContribution,
      variableContribution,
      responsibilitySplit: legacySplit,
      dominantContributor
    };

    const changeWord = percentageChange >= 0 ? 'acima da' : 'abaixo da';
    const summaryText = `Gastos totais estão ${Math.abs(percentageChange).toFixed(0)}% ${changeWord} média histórica.`;
    
    const mainDriver = variableAmountCents > fixedAmountCents ? 'variable' : 'fixed';
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
      currentTotal: currentSpending,
      changePct: percentageChange,
      mainDriver,
      fixedTotal: fromCents(fixedAmountCents),
      variableTotal: fromCents(variableAmountCents),
      responsibilitySplit: {
        personA: { amount: fromCents(splitMapCents.personA), pct: variableAmountCents > 0 ? (splitMapCents.personA / variableAmountCents) * 100 : 0 },
        personB: { amount: fromCents(splitMapCents.personB), pct: variableAmountCents > 0 ? (splitMapCents.personB / variableAmountCents) * 100 : 0 },
        shared: { amount: fromCents(splitMapCents.shared), pct: variableAmountCents > 0 ? (splitMapCents.shared / variableAmountCents) * 100 : 0 }
      },
      dominantContributor
    };

    return { metrics, summaryText, explanationText, topDrivers, data };
  }
};
