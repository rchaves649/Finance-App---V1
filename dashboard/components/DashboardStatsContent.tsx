
import React from 'react';
import { Period, CoupleInsightDTO, CategorySummary, TimeSeriesEntry } from '../../types/finance';
import { InsightPanel } from './InsightPanel';
import { SummaryGrid } from './SummaryGrid';
import { EvolutionLineChart } from './EvolutionLineChart';
import { CategoryBarChart } from './CategoryBarChart';
import { CategoryDetailsChart } from './CategoryDetailsChart';
import { CategoryHorizontalBarChart } from './CategoryHorizontalBarChart';
import { useScope } from '../../shared/ScopeContext';

interface DashboardStatsContentProps {
  insight: CoupleInsightDTO | null;
  categorySummaries: CategorySummary[];
  totalSpent: number;
  pendingCount: number;
  currentMonthTotal: number;
  period: Period;
  timeSeries: TimeSeriesEntry[];
  monthlyEvolution: TimeSeriesEntry[];
  isInsightExpanded: boolean;
  onToggleInsight: () => void;
  selectedCategory: string | null;
  onSelectCategory: (cat: string) => void;
  horizontalSelectedCategory: string | null;
  onSelectHorizontalCategory: (cat: string) => void;
  onSelectMonth?: (bucketKey: string) => void;
  focusedMonthKey?: string | null;
}

export const DashboardStatsContent: React.FC<DashboardStatsContentProps> = ({
  insight,
  categorySummaries,
  totalSpent,
  pendingCount,
  currentMonthTotal,
  period,
  timeSeries,
  monthlyEvolution,
  isInsightExpanded,
  onToggleInsight,
  selectedCategory,
  onSelectCategory,
  horizontalSelectedCategory,
  onSelectHorizontalCategory,
  onSelectMonth,
  focusedMonthKey
}) => {
  const { currentScope } = useScope();

  // Determina o rótulo legível do mês focado (ex: "Jan") para o cabeçalho do gráfico vinculado
  const focusedMonthLabel = React.useMemo(() => {
    if (focusedMonthKey) {
      const entry = monthlyEvolution.find(e => e.bucketKey === focusedMonthKey);
      return entry ? entry.label : undefined;
    }
    return undefined;
  }, [focusedMonthKey, monthlyEvolution]);

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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Gráfico de Evolução (Origem da Interação) */}
        <EvolutionLineChart 
          data={monthlyEvolution} 
          scopeName={currentScope.name} 
          period={period}
          onSelectMonth={onSelectMonth}
          focusedMonthKey={focusedMonthKey}
        />
        
        {/* Gráfico de Barras Empilhadas (Evolução por Categoria) */}
        <CategoryBarChart 
          data={monthlyEvolution} 
          scopeName={currentScope.name} 
          selectedCategory={selectedCategory}
          onSelectCategory={onSelectCategory}
        />
        
        {/* Gráfico de Categorias (Destino da Interação - Vinculado ao mês da Evolução) */}
        <CategoryHorizontalBarChart
          data={categorySummaries}
          scopeName={currentScope.name}
          focusedMonthLabel={focusedMonthLabel}
          selectedCategory={horizontalSelectedCategory}
          onSelectCategory={onSelectHorizontalCategory}
          isFiltering={!!focusedMonthKey}
        />

        {/* Detalhamento (Vinculado à seleção de categoria) */}
        <div className="animate-in slide-in-from-top-4 duration-500">
          <CategoryDetailsChart 
            data={monthlyEvolution} 
            categoryName={selectedCategory}
            onClose={() => onSelectCategory('')}
          />
        </div>
      </div>
    </>
  );
};
