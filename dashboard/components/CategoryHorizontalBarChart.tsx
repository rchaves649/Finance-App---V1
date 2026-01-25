
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { LayoutList, AlertCircle, MousePointer2, Filter } from 'lucide-react';
import { CategorySummary } from '../../types/finance';
import { formatCurrency } from '../../shared/formatUtils';

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f59e0b', '#10b981', '#14b8a6', '#f97316', '#a855f7', '#64748b'];

interface CategoryHorizontalBarChartProps {
  data: CategorySummary[];
  scopeName: string;
  focusedMonthLabel?: string;
  selectedCategory: string | null;
  onSelectCategory: (cat: string) => void;
  isFiltering?: boolean;
}

export const CategoryHorizontalBarChart: React.FC<CategoryHorizontalBarChartProps> = ({ 
  data, 
  scopeName, 
  focusedMonthLabel,
  selectedCategory, 
  onSelectCategory,
  isFiltering
}) => {
  // Re-ordena sempre do maior para o menor para manter consistência visual
  const sortedData = React.useMemo(() => 
    [...data].sort((a, b) => b.value - a.value)
  , [data]);

  return (
    <div className={`bg-white p-8 rounded-2xl shadow-sm border transition-all duration-500 min-h-[400px] flex flex-col group/hchart ${
      isFiltering ? 'border-indigo-200 ring-4 ring-indigo-50/50' : 'border-gray-100'
    }`}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex flex-col gap-1">
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <LayoutList size={20} className="text-indigo-600" /> 
            <span>Categorias em {scopeName}</span>
          </h3>
          {focusedMonthLabel && (
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md self-start animate-in slide-in-from-left-2 duration-300">
              <Filter size={10} /> Visualizando apenas {focusedMonthLabel}
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          {isFiltering && (
            <button 
              onClick={() => onSelectCategory('')} // Placeholder para ação de limpar no futuro
              className="text-[10px] font-bold text-indigo-400 bg-gray-50 px-2 py-1 rounded flex items-center gap-1 opacity-0 group-hover/hchart:opacity-100 transition-opacity"
            >
              <MousePointer2 size={10} /> Clique na Evolução para limpar
            </button>
          )}
        </div>
      </div>
      
      <div className="flex-1 w-full">
        {sortedData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart 
              data={sortedData} 
              layout="vertical"
              margin={{ top: 5, right: 40, left: 10, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
              <XAxis 
                type="number"
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 600 }}
                tickFormatter={(value) => `R$ ${value}`}
              />
              <YAxis 
                type="category"
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#475569', fontSize: 11, fontWeight: 700 }}
                width={130}
              />
              <Tooltip 
                cursor={{ fill: '#f8fafc' }}
                formatter={(value: number) => [formatCurrency(value), 'Valor']}
                contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', padding: '12px' }}
                labelStyle={{ fontWeight: 'bold', marginBottom: '4px', color: '#1e293b' }}
              />
              <Bar 
                dataKey="value" 
                radius={[0, 6, 6, 0]}
                barSize={28}
                animationDuration={800}
                animationEasing="ease-out"
                onClick={(data) => onSelectCategory(data.name)}
                style={{ cursor: 'pointer' }}
              >
                {sortedData.map((entry, index) => {
                  const isSelected = selectedCategory === entry.name;
                  const someSelected = selectedCategory !== null;
                  const opacity = someSelected ? (isSelected ? 1 : 0.3) : 1;
                  
                  return (
                    <Cell 
                      key={`cell-${entry.name}-${index}`} 
                      fill={COLORS[index % COLORS.length]} 
                      fillOpacity={opacity}
                      stroke={isSelected ? '#4338ca' : 'none'}
                      strokeWidth={isSelected ? 2 : 0}
                      className="transition-all duration-500"
                    />
                  );
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-gray-400 gap-4 border-2 border-dashed border-gray-50 rounded-2xl py-20 animate-in fade-in duration-500">
            <div className="p-4 bg-gray-50 rounded-full text-gray-300">
              <AlertCircle size={40} />
            </div>
            <p className="font-medium text-sm text-center px-4">Nenhum dado encontrado para o filtro selecionado.</p>
          </div>
        )}
      </div>
    </div>
  );
};
