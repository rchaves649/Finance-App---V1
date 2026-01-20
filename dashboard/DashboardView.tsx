import React from 'react';
import { Period, ScopeType, CoupleInsightDTO, CategorySummary } from '../types/finance';
import { DashboardHeader } from './components/DashboardHeader';
import { DashboardStatsContent } from './components/DashboardStatsContent';
import { DashboardLoadingView } from './components/DashboardLoadingView';
import { DashboardEmptyState } from './components/DashboardEmptyState';
import { DashboardNoDataState } from './components/DashboardNoDataState';
import { useScope } from '../shared/ScopeContext';

interface DashboardViewProps {
  totalSpent: number;
  pendingCount: number;
  currentMonthTotal: number;
  chartData: { name: string; value: number }[];
  categorySummaries: CategorySummary[];
  isEmpty: boolean; // App is totally empty
  isPeriodEmpty: boolean; // Selected period has no data
  isLoading: boolean;
  scopeType: ScopeType;
  insight: CoupleInsightDTO | null;
  onLoadDemo: () => void;
  period: Period;
  onPeriodChange: (p: Period) => void;
  isInsightExpanded: boolean;
  onToggleInsight: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ 
  totalSpent, 
  pendingCount, 
  currentMonthTotal, 
  chartData,
  categorySummaries,
  isEmpty,
  isPeriodEmpty,
  isLoading,
  insight,
  onLoadDemo,
  period,
  onPeriodChange,
  isInsightExpanded,
  onToggleInsight
}) => {
  const { currentScope } = useScope();

  if (isLoading) {
    return <DashboardLoadingView scopeName={currentScope.name} />;
  }

  if (isEmpty) {
    return <DashboardEmptyState scopeName={currentScope.name} onLoadDemo={onLoadDemo} />;
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
      <DashboardHeader 
        scopeName={currentScope.name} 
        period={period} 
        onPeriodChange={onPeriodChange} 
      />

      {isPeriodEmpty ? (
        <DashboardNoDataState scopeName={currentScope.name} onPeriodChange={onPeriodChange} />
      ) : (
        <DashboardStatsContent 
          insight={insight}
          categorySummaries={categorySummaries}
          totalSpent={totalSpent}
          pendingCount={pendingCount}
          currentMonthTotal={currentMonthTotal}
          period={period}
          chartData={chartData}
          isInsightExpanded={isInsightExpanded}
          onToggleInsight={onToggleInsight}
        />
      )}
    </div>
  );
};