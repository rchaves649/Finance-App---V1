import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { TrendingUp, AlertCircle, Calendar, Wallet, Sparkles, Beaker, Filter, Lightbulb, User, ChevronDown, ChevronUp, Scale, ArrowRight, Tag, Check } from 'lucide-react';
import { Period, ScopeType, CoupleInsightDTO } from '../types';
import { clampRange } from '../shared/dateUtils';

interface SummaryCardProps {
  title: string;
  value: string;
  icon: React.ElementType;
  colorClass: string;
}

const SummaryCard: React.FC<SummaryCardProps> = ({ title, value, icon: Icon, colorClass }) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between">
    <div className={`w-12 h-12 rounded-xl ${colorClass} flex items-center justify-center mb-4`}>
      <Icon size={24} className="text-white" />
    </div>
    <div>
      <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
      <h3 className="text-2xl font-bold text-gray-900 tracking-tight">{value}</h3>
    </div>
  </div>
);

interface DashboardViewProps {
  totalSpent: number;
  pendingCount: number;
  currentMonthTotal: number;
  chartData: { name: string; value: number }[];
  isEmpty: boolean;
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
  isEmpty,
  scopeType,
  insight,
  onLoadDemo,
  period,
  onPeriodChange,
  isInsightExpanded,
  onToggleInsight
}) => {
  const [rangeStart, setRangeStart] = useState('');
  const [rangeEnd, setRangeEnd] = useState('');
  const [rangeError, setRangeError] = useState(false);

  useEffect(() => {
    if (period.kind === 'range') {
      setRangeStart(period.startISO);
      setRangeEnd(period.endISO);
    }
  }, [period]);

  if (isEmpty) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4 animate-in fade-in duration-700">
        <div className="bg-indigo-50 p-8 rounded-full mb-8 relative">
          <Wallet size={64} className="text-indigo-600" />
          <Sparkles className="absolute -top-1 -right-1 text-amber-400 animate-pulse" size={32} />
        </div>
        <h2 className="text-3xl font-extrabold text-gray-900 mb-4 tracking-tight">
          Sua gestão financeira começa aqui
        </h2>
        <p className="text-gray-500 max-w-lg mb-10 text-lg leading-relaxed">
          O FinanceConnect ajuda você (ou seu casal) a ter clareza total sobre os gastos. 
          Comece importando um extrato CSV ou veja os dados de exemplo.
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

  const handleModeChange = (kind: 'month' | 'year' | 'range') => {
    const now = new Date();
    setRangeError(false);
    if (kind === 'month') {
      onPeriodChange({ kind: 'month', year: now.getFullYear(), month: now.getMonth() + 1 });
    } else if (kind === 'year') {
      onPeriodChange({ kind: 'year', year: now.getFullYear() });
    } else {
      const today = now.toISOString().split('T')[0];
      const thirtyDaysAgo = new Date(new Date().setDate(now.getDate() - 30)).toISOString().split('T')[0];
      setRangeStart(thirtyDaysAgo);
      setRangeEnd(today);
      onPeriodChange({ kind: 'range', startISO: thirtyDaysAgo, endISO: today });
    }
  };

  const handleApplyRange = () => {
    if (!rangeStart || !rangeEnd) {
      setRangeError(true);
      return;
    }
    setRangeError(false);
    const clamped = clampRange(rangeStart, rangeEnd);
    onPeriodChange({ kind: 'range', ...clamped });
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Dashboard</h2>
          <p className="text-gray-500">Acompanhe seu desempenho financeiro em tempo real.</p>
        </div>

        <div className="flex flex-col items-end gap-2">
          <div className="flex flex-wrap items-center gap-3 bg-white p-2 rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex items-center gap-2 px-3 border-r border-gray-100 mr-2">
              <Filter size={16} className="text-gray-400" />
              <select 
                value={period.kind}
                onChange={(e) => handleModeChange(e.target.value as any)}
                className="text-sm font-semibold text-gray-700 bg-transparent outline-none cursor-pointer"
              >
                <option value="month">Mês</option>
                <option value="year">Ano</option>
                <option value="range">Período</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              {period.kind === 'month' && (
                <>
                  <select 
                    value={period.month}
                    onChange={(e) => onPeriodChange({ ...period, month: parseInt(e.target.value) })}
                    className="text-sm p-1.5 bg-gray-50 rounded-lg outline-none border border-transparent focus:border-indigo-200"
                  >
                    {Array.from({ length: 12 }, (_, i) => (
                      <option key={i + 1} value={i + 1}>
                        {new Date(0, i).toLocaleString('pt-BR', { month: 'long' })}
                      </option>
                    ))}
                  </select>
                  <input 
                    type="number"
                    value={period.year}
                    onChange={(e) => onPeriodChange({ ...period, year: parseInt(e.target.value) })}
                    className="text-sm w-20 p-1.5 bg-gray-50 rounded-lg outline-none border border-transparent focus:border-indigo-200"
                  />
                </>
              )}

              {period.kind === 'year' && (
                <input 
                  type="number"
                  value={period.year}
                  onChange={(e) => onPeriodChange({ ...period, year: parseInt(e.target.value) })}
                  className="text-sm w-24 p-1.5 bg-gray-50 rounded-lg outline-none border border-transparent focus:border-indigo-200"
                />
              )}

              {period.kind === 'range' && (
                <div className="flex items-center gap-2">
                  <input 
                    type="date"
                    value={rangeStart}
                    onChange={(e) => { setRangeStart(e.target.value); setRangeError(false); }}
                    className={`text-sm p-1.5 bg-gray-50 rounded-lg outline-none border ${rangeError && !rangeStart ? 'border-red-300' : 'border-transparent'} focus:border-indigo-200`}
                  />
                  <span className="text-gray-400 text-xs">até</span>
                  <input 
                    type="date"
                    value={rangeEnd}
                    onChange={(e) => { setRangeEnd(e.target.value); setRangeError(false); }}
                    className={`text-sm p-1.5 bg-gray-50 rounded-lg outline-none border ${rangeError && !rangeEnd ? 'border-red-300' : 'border-transparent'} focus:border-indigo-200`}
                  />
                  <button 
                    onClick={handleApplyRange}
                    className="p-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm ml-1"
                    title="Aplicar Período"
                  >
                    <Check size={16} />
                  </button>
                </div>
              )}
            </div>
          </div>
          {rangeError && (
            <span className="text-[10px] font-bold text-red-500 mr-2 animate-pulse flex items-center gap-1">
              <AlertCircle size={10} /> Informe as duas datas
            </span>
          )}
        </div>
      </div>

      {/* Insight Card at the Top */}
      {insight && (
        <div className="bg-indigo-600 rounded-2xl p-6 shadow-lg shadow-indigo-100 text-white relative overflow-hidden group border border-indigo-500 animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-500 pointer-events-none">
            <Lightbulb size={100} />
          </div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-indigo-100 text-xs font-bold uppercase tracking-widest">
                <Sparkles size={14} className="text-amber-400" />
                <span>Análise de Padrões</span>
              </div>
              <button 
                onClick={onToggleInsight}
                className="flex items-center gap-1.5 px-3 py-1 bg-white/10 hover:bg-white/20 rounded-lg text-xs font-bold transition-colors border border-white/5"
              >
                {isInsightExpanded ? <><ChevronUp size={14} /> Recolher</> : <><ChevronDown size={14} /> Ver detalhes</>}
              </button>
            </div>
            
            <h4 className="text-xl md:text-2xl font-bold leading-tight mb-2">
              {insight.summaryText}
            </h4>
            <p className="text-indigo-100 opacity-90 text-sm md:text-base leading-relaxed max-w-3xl">
              {insight.explanationText}
            </p>
            
            <div className="flex flex-wrap items-center gap-3 mt-4">
              <div className={`px-3 py-1 rounded-full text-xs font-bold ${insight.metrics.percentageChange >= 0 ? 'bg-indigo-700' : 'bg-emerald-500'} text-white border border-white/10 flex items-center gap-1.5`}>
                <TrendingUp size={12} />
                {insight.metrics.percentageChange >= 0 ? '+' : ''}{insight.metrics.percentageChange.toFixed(0)}% vs média
              </div>
              <div className="px-3 py-1 rounded-full text-xs font-bold bg-white/20 text-white border border-white/10 flex items-center gap-1.5">
                <Tag size={12} />
                Foco: {insight.data.mainDriver === 'fixed' ? 'Fixos' : 'Variáveis'}
              </div>
              
              {!isInsightExpanded && insight.topDrivers.length > 0 && (
                <div className="flex items-center gap-2 text-[10px] font-bold text-indigo-200 border-l border-white/10 pl-3 ml-1">
                  Principais categorias: {insight.topDrivers.map(d => d.categoryName).join(', ')}
                </div>
              )}
            </div>

            {isInsightExpanded && (
              <div className="mt-8 pt-8 border-t border-white/10 animate-in zoom-in-95 duration-300">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                    <span className="text-[10px] font-bold text-indigo-200 uppercase tracking-wider block mb-2">Comparativo Geral</span>
                    <div className="flex items-center gap-3">
                      <div>
                        <div className="text-[10px] text-indigo-300">Média anterior</div>
                        <div className="text-sm font-bold">R$ {insight.data.baselineTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
                      </div>
                      <ArrowRight size={14} className="text-indigo-400" />
                      <div>
                        <div className="text-[10px] text-indigo-300">Este período</div>
                        <div className="text-sm font-bold text-white">R$ {insight.data.currentTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                    <span className="text-[10px] font-bold text-indigo-200 uppercase tracking-wider block mb-2">Maiores Impactos</span>
                    <div className="space-y-2">
                      {insight.topDrivers.map((driver, i) => (
                        <div key={i} className="flex justify-between items-center text-xs">
                          <span className="text-indigo-100 truncate max-w-[100px]">{driver.categoryName}</span>
                          <span className="font-bold">R$ {driver.amount.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-white/5 p-4 rounded-xl border border-white/5 col-span-1 md:col-span-2">
                    <span className="text-[10px] font-bold text-indigo-200 uppercase tracking-wider block mb-2">Responsabilidade (Variáveis)</span>
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden flex">
                          <div 
                            className="h-full bg-indigo-400 transition-all duration-1000" 
                            style={{ width: `${insight.data.responsibilitySplit.personA.pct}%` }} 
                          />
                          <div 
                            className="h-full bg-emerald-400 transition-all duration-1000" 
                            style={{ width: `${insight.data.responsibilitySplit.personB.pct}%` }} 
                          />
                          <div 
                            className="h-full bg-gray-400 transition-all duration-1000" 
                            style={{ width: `${insight.data.responsibilitySplit.shared.pct}%` }} 
                          />
                        </div>
                        <Scale size={14} className="text-indigo-300" />
                      </div>
                      <div className="flex justify-between items-center text-[10px]">
                        <span className="flex items-center gap-1">
                          <div className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                          Pessoa A: {insight.data.responsibilitySplit.personA.pct.toFixed(0)}%
                        </span>
                        <span className="flex items-center gap-1">
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                          Pessoa B: {insight.data.responsibilitySplit.personB.pct.toFixed(0)}%
                        </span>
                        <span className="flex items-center gap-1">
                          <div className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                          Conjunto: {insight.data.responsibilitySplit.shared.pct.toFixed(0)}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <SummaryCard 
          title="Total de Gastos" 
          value={`R$ ${totalSpent.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
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
          value={`R$ ${currentMonthTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
          icon={Calendar}
          colorClass="bg-emerald-600 shadow-emerald-100 shadow-lg"
        />
      </div>

      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 min-h-[450px] flex flex-col">
        <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
          <Wallet size={20} className="text-indigo-600" /> Distribuição por Categoria
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
                  formatter={(value: number) => `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
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
    </div>
  );
};