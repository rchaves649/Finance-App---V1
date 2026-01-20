import React from 'react';
import { Sparkles, Lightbulb, ChevronUp, ChevronDown, TrendingUp, Tag, ArrowRight, Scale } from 'lucide-react';
import { CoupleInsightDTO, CategorySummary } from '../../types/finance';
import { InsightBreakdown } from './InsightBreakdown';
import { useScope } from '../../shared/ScopeContext';
import { formatCurrency } from '../../shared/formatUtils';

interface InsightPanelProps {
  insight: CoupleInsightDTO;
  categorySummaries: CategorySummary[];
  isExpanded: boolean;
  onToggle: () => void;
}

export const InsightPanel: React.FC<InsightPanelProps> = ({ insight, categorySummaries, isExpanded, onToggle }) => {
  const { currentScope } = useScope();

  return (
    <div className="bg-indigo-600 rounded-2xl p-6 shadow-lg shadow-indigo-100 text-white relative overflow-hidden group border border-indigo-500 animate-in fade-in slide-in-from-top-4 duration-500">
      <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-500 pointer-events-none">
        <Lightbulb size={100} />
      </div>
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 text-indigo-100 text-xs font-bold uppercase tracking-widest">
            <Sparkles size={14} className="text-amber-400" />
            <span>Análise de Padrões - {currentScope.name}</span>
          </div>
          <button 
            onClick={onToggle}
            className="flex items-center gap-1.5 px-3 py-1 bg-white/10 hover:bg-white/20 rounded-lg text-xs font-bold transition-colors border border-white/5"
          >
            {isExpanded ? <><ChevronUp size={14} /> Recolher</> : <><ChevronDown size={14} /> Ver detalhes</>}
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
          
          {!isExpanded && insight.topDrivers.length > 0 && (
            <div className="flex items-center gap-2 text-[10px] font-bold text-indigo-200 border-l border-white/10 pl-3 ml-1">
              Principais categorias: {insight.topDrivers.map(d => d.categoryName).join(', ')}
            </div>
          )}
        </div>

        {isExpanded && (
          <div className="mt-8 pt-8 border-t border-white/10 animate-in zoom-in-95 duration-300">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Column: Traditional Metrics */}
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                    <span className="text-[10px] font-bold text-indigo-200 uppercase tracking-wider block mb-2">Comparativo Geral</span>
                    <div className="flex items-center gap-3">
                      <div>
                        <div className="text-[10px] text-indigo-300">Média anterior</div>
                        <div className="text-sm font-bold">{formatCurrency(insight.data.baselineTotal)}</div>
                      </div>
                      <ArrowRight size={14} className="text-indigo-400" />
                      <div>
                        <div className="text-[10px] text-indigo-300">Este período</div>
                        <div className="text-sm font-bold text-white">{formatCurrency(insight.data.currentTotal)}</div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                    <span className="text-[10px] font-bold text-indigo-200 uppercase tracking-wider block mb-2">Composição de Gastos</span>
                    <div className="space-y-2">
                       <div className="flex justify-between text-xs">
                          <span className="text-indigo-100">Fixos</span>
                          <span className="font-bold">{formatCurrency(insight.data.fixedTotal)}</span>
                       </div>
                       <div className="flex justify-between text-xs">
                          <span className="text-indigo-100">Variáveis</span>
                          <span className="font-bold">{formatCurrency(insight.data.variableTotal)}</span>
                       </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white/5 p-4 rounded-xl border border-white/5">
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

              {/* Right Column: Structured Category Breakdown */}
              <InsightBreakdown 
                categories={categorySummaries} 
                totalSpent={insight.data.currentTotal} 
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
