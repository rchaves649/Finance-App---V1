
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useScope } from '../shared/ScopeContext';
import { usePeriod } from '../shared/PeriodContext';
import { DashboardRepository } from '../repositories/dashboardRepository';
import { DashboardService } from '../services/dashboardService';
import { CoupleInsightService } from '../services/coupleInsightService';
import { DemoSeedService } from '../services/demoSeed';
import { CoupleInsightDTO, Summary } from '../types/finance';
import { DashboardView } from './DashboardView';
import { useDashboardState } from './hooks/useDashboardState';

interface DashboardContainerProps {
  onNavigateToTransactions: () => void;
}

export const DashboardContainer: React.FC<DashboardContainerProps> = ({ onNavigateToTransactions }) => {
  const { currentScope } = useScope();
  const { period, setPeriod } = usePeriod();
  
  // UI Interaction State
  const dashboardState = useDashboardState(currentScope, period);
  
  // Data State
  const [summary, setSummary] = useState<Summary | null>(null);
  const [isEmpty, setIsEmpty] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const loadDashboardData = useCallback(async () => {
    setIsLoading(true);
    // Simulação de latência controlada para UX
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const scopeEmpty = DashboardRepository.isScopeEmpty(currentScope.scopeId);
    setIsEmpty(scopeEmpty);

    if (!scopeEmpty) {
      // Repositório Forte: Uma única chamada retorna o DTO pronto para o serviço
      const summaryDTO = DashboardRepository.getSummaryDTO(currentScope.scopeId, period);
      setSummary(summaryDTO);
    }
    
    setIsLoading(false);
  }, [currentScope.scopeId, period]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  // Insights Derivados (Agregação de 2ª Ordem)
  const stats = useMemo(() => {
    if (!summary) return null;

    const isPeriodEmpty = summary.totalSpent === 0 && summary.pendingCount === 0;

    let insight: CoupleInsightDTO | null = null;
    if (currentScope.scopeType === 'shared') {
      insight = CoupleInsightService.getInsight(currentScope.scopeId, period);
    }

    return { 
      totalSpent: summary.totalSpent, 
      pendingCount: summary.pendingCount, 
      needsAttention: summary.needsAttention,
      currentMonthTotal: summary.totalSpent, 
      categorySummaries: summary.totalsByCategory,
      timeSeries: summary.timeSeries,
      monthlyEvolution: summary.monthlyEvolution,
      isEmpty,
      isPeriodEmpty,
      insight
    };
  }, [currentScope, period, summary, isEmpty]);

  const categoryData = useMemo(() => {
    if (!stats || !summary) return [];
    return DashboardService.getCategoryBreakdownForMonth(
      summary.monthlyEvolution, 
      dashboardState.focusedMonthKey, 
      summary.totalsByCategory
    );
  }, [dashboardState.focusedMonthKey, stats, summary]);

  const handleLoadDemo = async () => {
    DemoSeedService.seed(currentScope.scopeId);
    await loadDashboardData();
  };

  if (!stats && !isLoading) return null;

  return (
    <DashboardView 
      {...stats!} 
      categorySummaries={categoryData}
      isLoading={isLoading}
      scopeType={currentScope.scopeType}
      period={period}
      onPeriodChange={setPeriod}
      onLoadDemo={handleLoadDemo} 
      isInsightExpanded={dashboardState.isInsightExpanded}
      onToggleInsight={dashboardState.toggleInsight}
      selectedCategory={dashboardState.selectedCategory}
      onSelectCategory={dashboardState.handleSelectCategory}
      horizontalSelectedCategory={dashboardState.horizontalSelectedCategory}
      onSelectHorizontalCategory={dashboardState.handleSelectHorizontalCategory}
      onNavigateToTransactions={onNavigateToTransactions}
      onSelectMonth={dashboardState.handleSelectMonth}
      focusedMonthKey={dashboardState.focusedMonthKey}
    />
  );
};
