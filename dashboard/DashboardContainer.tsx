
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useScope } from '../shared/ScopeContext';
import { TransactionRepository, CategoryRepository } from '../services/localRepositories';
import { SummaryService } from '../services/summaryService';
import { CoupleInsightService } from '../services/coupleInsightService';
import { DemoSeedService } from '../services/demoSeed';
import { Transaction, Category, Period, CoupleInsightDTO } from '../types';
import { DashboardView } from './DashboardView';

export const DashboardContainer: React.FC = () => {
  const { currentScope } = useScope();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [insight, setInsight] = useState<CoupleInsightDTO | null>(null);
  const [isInsightExpanded, setIsInsightExpanded] = useState(false);

  // Period state management
  const [period, setPeriod] = useState<Period>(() => {
    const now = new Date();
    return {
      kind: 'month',
      year: now.getFullYear(),
      month: now.getMonth() + 1
    };
  });

  const loadData = useCallback(() => {
    const txs = TransactionRepository.getAll(currentScope.scopeId);
    const cats = CategoryRepository.getAll(currentScope.scopeId);
    setTransactions(txs);
    setCategories(cats);

    if (currentScope.scopeType === 'shared') {
      const insightData = CoupleInsightService.getInsight(currentScope.scopeId, period);
      setInsight(insightData);
    } else {
      setInsight(null);
      setIsInsightExpanded(false);
    }
  }, [currentScope.scopeId, currentScope.scopeType, period]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const stats = useMemo(() => {
    const summary = SummaryService.getSummary(currentScope.scopeId, period);
    
    const isEmpty = transactions.length === 0 && categories.length === 0;

    return { 
      totalSpent: summary.totalSpent, 
      pendingCount: summary.pendingCount, 
      currentMonthTotal: summary.totalSpent, 
      chartData: summary.totalsByCategory.map(c => ({ name: c.name, value: c.value })),
      isEmpty 
    };
  }, [currentScope.scopeId, period, transactions.length, categories.length]);

  const handleLoadDemo = () => {
    DemoSeedService.seed(currentScope.scopeId);
    loadData();
  };

  return (
    <DashboardView 
      {...stats} 
      scopeType={currentScope.scopeType}
      insight={insight}
      period={period}
      onPeriodChange={setPeriod}
      onLoadDemo={handleLoadDemo} 
      isInsightExpanded={isInsightExpanded}
      onToggleInsight={() => setIsInsightExpanded(!isInsightExpanded)}
    />
  );
};
