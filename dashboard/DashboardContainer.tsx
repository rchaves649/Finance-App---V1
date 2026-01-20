import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useScope } from '../shared/ScopeContext';
import { usePeriod } from '../shared/PeriodContext';
import { TransactionRepository, CategoryRepository } from '../services/localRepositories';
import { SummaryService } from '../services/summaryService';
import { CoupleInsightService } from '../services/coupleInsightService';
import { DemoSeedService } from '../services/demoSeed';
import { Transaction, Category, CoupleInsightDTO } from '../types/finance';
import { DashboardView } from './DashboardView';
import { formatCurrency } from '../shared/formatUtils';

export const DashboardContainer: React.FC = () => {
  const { currentScope } = useScope();
  const { period, setPeriod } = usePeriod();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    // Simulate brief network delay for UX satisfaction
    await new Promise(resolve => setTimeout(resolve, 300));

    const txs = TransactionRepository.getAll(currentScope.scopeId);
    const cats = CategoryRepository.getAll(currentScope.scopeId);
    
    setTransactions(txs);
    setCategories(cats);
    setIsLoading(false);
  }, [currentScope.scopeId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Derive stats and insights from the scoped data and current period
  const stats = useMemo(() => {
    const summary = SummaryService.getSummary(currentScope.scopeId, period);
    
    const isEmpty = transactions.length === 0 && categories.length === 0;
    const isPeriodEmpty = summary.totalSpent === 0 && summary.pendingCount === 0;

    let insight: CoupleInsightDTO | null = null;
    if (currentScope.scopeType === 'shared') {
      insight = CoupleInsightService.getInsight(currentScope.scopeId, period);
    }

    return { 
      totalSpent: summary.totalSpent, 
      pendingCount: summary.pendingCount, 
      currentMonthTotal: summary.totalSpent, 
      chartData: summary.totalsByCategory.map(c => ({ name: c.name, value: c.value })),
      categorySummaries: summary.totalsByCategory,
      isEmpty,
      isPeriodEmpty,
      insight
    };
  }, [currentScope.scopeId, currentScope.scopeType, period, transactions, categories]);

  const [isInsightExpanded, setIsInsightExpanded] = useState(false);

  // Reset insight expansion when scope or period changes
  useEffect(() => {
    setIsInsightExpanded(false);
  }, [currentScope.scopeId, period]);

  const handleLoadDemo = async () => {
    DemoSeedService.seed(currentScope.scopeId);
    await loadData();
  };

  return (
    <DashboardView 
      {...stats} 
      isLoading={isLoading}
      scopeType={currentScope.scopeType}
      period={period}
      onPeriodChange={setPeriod}
      onLoadDemo={handleLoadDemo} 
      isInsightExpanded={isInsightExpanded}
      onToggleInsight={() => setIsInsightExpanded(!isInsightExpanded)}
    />
  );
};
