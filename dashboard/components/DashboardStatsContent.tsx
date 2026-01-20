import React from 'react';
import { Period, CoupleInsightDTO, CategorySummary } from '../../types/finance';
import { InsightPanel } from './InsightPanel';
import { SummaryGrid } from './SummaryGrid';
import { CategoryDistributionChart } from './CategoryDistributionChart';
import { useScope } from '../../shared/ScopeContext';

interface DashboardStatsContentProps {
  insight: CoupleInsightDTO | null;
  categorySummaries: CategorySummary[];
  totalSpent: number;
  pendingCount: number;
  currentMonthTotal: number;
  period: Period;
  chartData: { name: string; value: number }[];
  isInsightExpanded: boolean;
  onToggleInsight: () => void;
}

export const DashboardStatsContent: React.FC<DashboardStatsContentProps> = ({
  insight,
  categorySummaries,
  totalSpent,
  pendingCount,
  currentMonthTotal,
  period,
  chartData,
  isInsightExpanded,
  onToggleInsight
}) => {
  const { currentScope } = useScope();

  return (
    <>
      {insight && (
        <InsightPanel 
          insight={insight} 
          categorySummaries={categorySummaries}
          isExpanded={isInsightExpanded} 
          onToggle={onToggleInsight} 
        />
      )}

      <SummaryGrid 
        totalSpent={totalSpent}
        pendingCount={pendingCount}
        currentMonthTotal={currentMonthTotal}
        period={period}
      />

      <CategoryDistributionChart 
        data={chartData} 
        scopeName={currentScope.name} 
      />
    </>
  );
};