import React from 'react';
import { CategorySummary } from '../../types/finance';
import { useScope } from '../../shared/ScopeContext';
import { formatCurrency } from '../../shared/formatUtils';

interface InsightBreakdownProps {
  categories: CategorySummary[];
  totalSpent: number;
}

export const InsightBreakdown: React.FC<InsightBreakdownProps> = ({ categories, totalSpent }) => {
  const { currentScope } = useScope();
  const topCategories = categories.slice(0, 5);

  return (
    <div className="mt-6 space-y-4">
      <div className="flex items-center justify-between">
        <h5 className="text-xs font-bold text-indigo-200 uppercase tracking-widest">Impacto por Categoria - {currentScope.name}</h5>
        <span className="text-[10px] text-indigo-300 font-medium">Top 5</span>
      </div>
      
      <div className="space-y-3">
        {topCategories.map((cat, index) => {
          const percentage = totalSpent > 0 ? (cat.value / totalSpent) * 100 : 0;
          return (
            <div key={cat.categoryId || index} className="relative group">
              <div className="flex justify-between items-center mb-1.5 relative z-10 px-2">
                <span className="text-sm font-semibold text-white truncate max-w-[200px]">
                  {cat.name}
                </span>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-white">
                    {formatCurrency(cat.value)}
                  </span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 bg-white/10 rounded-md text-indigo-100 min-w-[45px] text-center">
                    {percentage.toFixed(1)}%
                  </span>
                </div>
              </div>
              
              {/* Bar Chart Background */}
              <div className="h-8 w-full bg-white/5 rounded-xl overflow-hidden absolute top-0 left-0">
                <div 
                  className="h-full bg-white/10 transition-all duration-1000 ease-out"
                  style={{ width: `${percentage}%` }}
                />
              </div>
              
              {/* Spacer to give height to relative row */}
              <div className="h-8" />
            </div>
          );
        })}
      </div>
      
      {categories.length > 5 && (
        <p className="text-[10px] text-indigo-300 italic text-right pr-2">
          +{categories.length - 5} outras categorias em {currentScope.name}
        </p>
      )}
    </div>
  );
};
