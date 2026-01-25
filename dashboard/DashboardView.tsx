
import React from 'react';
import { Period, ScopeType, CoupleInsightDTO, CategorySummary, TimeSeriesEntry } from '../types/finance';
import { DashboardHeader } from './components/DashboardHeader';
import { DashboardStatsContent } from './components/DashboardStatsContent';
import { DashboardLoadingView } from './components/DashboardLoadingView';
import { DashboardEmptyState } from './components/DashboardEmptyState';
import { DashboardNoDataState } from './components/DashboardNoDataState';
import { useScope } from '../shared/ScopeContext';
import { AlertTriangle, ArrowRight } from 'lucide-react';

interface DashboardViewProps {
  totalSpent: number;
  pendingCount: number;
  needsAttention: boolean;
  currentMonthTotal: number;
  timeSeries: TimeSeriesEntry[];
  monthlyEvolution: TimeSeriesEntry[];
  categorySummaries: CategorySummary[];
  isEmpty: boolean;
  isPeriodEmpty: boolean;
  isLoading: boolean;
  scopeType: ScopeType;
  insight: CoupleInsightDTO | null;
  onLoadDemo: () => void;
  period: Period;
  onPeriodChange: (p: Period) => void;
  isInsightExpanded: boolean;
  onToggleInsight: () => void;
  selectedCategory: string | null;
  onSelectCategory: (cat: string) => void;
  horizontalSelectedCategory: string | null;
  onSelectHorizontalCategory: (cat: string) => void;
  onNavigateToTransactions: () => void;
  onSelectMonth?: (bucketKey: string) => void;
  focusedMonthKey?: string | null;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ 
  totalSpent, 
  pendingCount, 
  needsAttention,
  currentMonthTotal, 
  timeSeries,
  monthlyEvolution,
  categorySummaries,
  isEmpty,
  isPeriodEmpty,
  isLoading,
  insight,
  onLoadDemo,
  period,
  onPeriodChange,
  isInsightExpanded,
  onToggleInsight,
  selectedCategory,
  onSelectCategory,
  horizontalSelectedCategory,
  onSelectHorizontalCategory,
  onNavigateToTransactions,
  onSelectMonth,
  focusedMonthKey
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

      {needsAttention && !isPeriodEmpty && (
        <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl flex items-center justify-between gap-4 animate-in slide-in-from-top-2 duration-300">
          <div className="flex items-center gap-3">
            <div className="bg-amber-100 p-2 rounded-xl text-amber-600">
              <AlertTriangle size={20} />
            </div>
            <div>
              <p className="text-sm font-bold text-amber-900">Atenção: Dados parciais</p>
              <p className="text-xs text-amber-700">Existem lançamentos não categorizados ou confirmados na aba de lançamentos. Verifique as informações para uma visualização assertiva!</p>
            </div>
          </div>
          <button 
            className="flex items-center gap-1 px-4 py-2 bg-white border border-amber-200 text-amber-700 rounded-xl text-xs font-bold hover:bg-amber-100 transition-colors shadow-sm active:scale-95"
            onClick={onNavigateToTransactions}
          >
            Ir para Lançamentos <ArrowRight size={14} />
          </button>
        </div>
      )}

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
          timeSeries={timeSeries}
          monthlyEvolution={monthlyEvolution}
          isInsightExpanded={isInsightExpanded}
          onToggleInsight={onToggleInsight}
          selectedCategory={selectedCategory}
          onSelectCategory={onSelectCategory}
          horizontalSelectedCategory={horizontalSelectedCategory}
          onSelectHorizontalCategory={onSelectHorizontalCategory}
          onSelectMonth={onSelectMonth}
          focusedMonthKey={focusedMonthKey}
        />
      )}
    </div>
  );
};
