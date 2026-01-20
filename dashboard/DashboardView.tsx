import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { TrendingUp, AlertCircle, Calendar, Wallet, Sparkles, Beaker, Loader2, SearchX } from 'lucide-react';
import { Period, ScopeType, CoupleInsightDTO, CategorySummary } from '../types/finance';
import { SummaryCard } from './components/SummaryCard';
import { PeriodSelector } from './components/PeriodSelector';
import { InsightPanel } from './components/InsightPanel';
import { useScope } from '../shared/ScopeContext';
import { formatCurrency } from '../shared/formatUtils';

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

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

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
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-indigo-600 animate-pulse">
        <Loader2 className="animate-spin mb-4" size={48} />
        <p className="font-bold text-lg">Carregando dados de {currentScope.name}...</p>
      </div>
    );
  }

  if (isEmpty) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4 animate-in fade-in duration-700">
        <div className="bg-indigo-50 p-8 rounded-full mb-8 relative">
          <Wallet size={64} className="text-indigo-600" />
          <Sparkles className="absolute -top-1 -right-1 text-amber-400 animate-pulse" size={32} />
        </div>
        <h2 className="text-3xl font-extrabold text-gray-900 mb-4 tracking-tight">
          Gestão Financeira em {currentScope.name}
        </h2>
        <p className="text-gray-500 max-w-lg mb-10 text-lg leading-relaxed">
          O FinanceConnect ajuda você a ter clareza total sobre os gastos. 
          Comece importando um extrato CSV ou veja os dados de exemplo para o escopo selecionado.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <button 
            onClick={onLoadDemo}
            className="flex items-center justify-center gap-3 px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold transition-all shadow-lg shadow-indigo-200 hover:scale-[1.02]"
          >
            <Beaker size={20} />
            <span>Ver Dados de Exemplo</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Dashboard: {currentScope.name}</h2>
          <p className="text-gray-500">Acompanhe o desempenho financeiro deste escopo em tempo real.</p>
        </div>

        <PeriodSelector period={period} onPeriodChange={onPeriodChange} />
      </div>

      {isPeriodEmpty ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border-2 border-dashed border-gray-100 text-center animate-in fade-in">
          <div className="bg-gray-50 p-6 rounded-full text-gray-300 mb-4">
            <SearchX size={48} />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Nenhum dado em {currentScope.name} para este período</h3>
          <p className="text-gray-500 max-w-md mb-8">
            Não encontramos transações registradas ou confirmadas no intervalo selecionado para este escopo.
          </p>
          <button 
            onClick={() => onPeriodChange({ kind: 'month', year: new Date().getFullYear(), month: new Date().getMonth() + 1 })}
            className="text-indigo-600 font-bold hover:underline"
          >
            Voltar para o mês atual
          </button>
        </div>
      ) : (
        <>
          {insight && (
            <InsightPanel 
              insight={insight} 
              categorySummaries={categorySummaries}
              isExpanded={isInsightExpanded} 
              onToggle={onToggleInsight} 
            />
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <SummaryCard 
              title="Total de Gastos" 
              value={formatCurrency(totalSpent)}
              icon={TrendingUp}
              colorClass="bg-indigo-600 shadow-indigo-100 shadow-lg"
            />
            <SummaryCard 
              title="Pendentes de Revisão" 
              value={pendingCount.toString()}
              icon={AlertCircle}
              colorClass="bg-amber-500 shadow-amber-100 shadow-lg"
            />
            <SummaryCard 
              title={period.kind === 'month' ? 'Gasto no Mês' : 'Gasto no Período'}
              value={formatCurrency(currentMonthTotal)}
              icon={Calendar}
              colorClass="bg-emerald-600 shadow-emerald-100 shadow-lg"
            />
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 min-h-[450px] flex flex-col">
            <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Wallet size={20} className="text-indigo-600" /> Distribuição por Categoria em {currentScope.name}
            </h3>
            <div className="flex-1 w-full">
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={100}
                      outerRadius={140}
                      paddingAngle={8}
                      dataKey="value"
                      stroke="none"
                    >
                      {chartData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} className="focus:outline-none" />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value: number) => formatCurrency(value)}
                      contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', padding: '12px' }}
                    />
                    <Legend 
                      verticalAlign="bottom" 
                      height={36} 
                      iconType="circle" 
                      formatter={(value) => <span className="text-gray-600 font-medium text-sm">{value}</span>}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-gray-400 gap-4 border-2 border-dashed border-gray-50 rounded-2xl py-20">
                  <div className="p-4 bg-gray-50 rounded-full text-gray-300">
                    <AlertCircle size={40} />
                  </div>
                  <p className="font-medium">Nenhum gasto confirmado para este período.</p>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
