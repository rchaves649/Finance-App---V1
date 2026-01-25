
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Tag, AlertCircle, MousePointer2 } from 'lucide-react';
import { TimeSeriesEntry } from '../../types/finance';
import { formatCurrency } from '../../shared/formatUtils';

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f59e0b', '#10b981', '#14b8a6', '#f97316', '#a855f7', '#64748b'];

interface CategoryBarChartProps {
  data: TimeSeriesEntry[];
  scopeName: string;
  selectedCategory: string | null;
  onSelectCategory: (cat: string) => void;
}

export const CategoryBarChart: React.FC<CategoryBarChartProps> = ({ data, scopeName, selectedCategory, onSelectCategory }) => {
  // Filtra apenas chaves de categorias de primeiro nível (ignora as que contêm ::)
  const categoryNames = React.useMemo(() => {
    const names = new Set<string>();
    data.forEach(entry => {
      Object.keys(entry).forEach(key => {
        if (
          key !== 'bucketKey' && 
          key !== 'label' && 
          key !== 'total' && 
          !key.includes('::') && // Ignora subcategorias
          typeof entry[key] === 'number'
        ) {
          names.add(key);
        }
      });
    });
    return Array.from(names).sort();
  }, [data]);

  const handleLegendClick = (e: any) => {
    if (e && e.dataKey) {
      onSelectCategory(e.dataKey);
    }
  };

  return (
    <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 min-h-[400px] flex flex-col group/chart">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <Tag size={20} className="text-indigo-600" /> Evolução por Categoria em {scopeName}
        </h3>
        <span className="text-[10px] font-bold text-indigo-400 bg-indigo-50 px-2 py-1 rounded flex items-center gap-1 opacity-0 group-hover/chart:opacity-100 transition-opacity">
          <MousePointer2 size={10} /> Clique para detalhar
        </span>
      </div>
      
      <div className="flex-1 w-full">
        {data.length > 0 && categoryNames.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart 
              data={data} 
              margin={{ top: 0, right: 10, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis 
                dataKey="label" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 600 }}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 600 }}
                tickFormatter={(value) => `R$ ${value}`}
              />
              <Tooltip 
                cursor={{ fill: '#f8fafc' }}
                formatter={(value: number, name: string) => [formatCurrency(value), name]}
                contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', padding: '12px' }}
                labelStyle={{ fontWeight: 'bold', marginBottom: '4px', color: '#1e293b' }}
              />
              <Legend 
                verticalAlign="bottom" 
                height={36} 
                iconType="circle"
                onClick={handleLegendClick}
                wrapperStyle={{ paddingTop: '20px', fontSize: '10px', fontWeight: 'bold', color: '#64748b', cursor: 'pointer' }}
              />
              {categoryNames.map((name, index) => {
                const isSelected = selectedCategory === name;
                const someSelected = selectedCategory !== null;
                const opacity = someSelected ? (isSelected ? 1 : 0.2) : 1;

                return (
                  <Bar 
                    key={name} 
                    dataKey={name} 
                    stackId="a" 
                    fill={COLORS[index % COLORS.length]} 
                    fillOpacity={opacity}
                    radius={index === categoryNames.length - 1 ? [4, 4, 0, 0] : [0, 0, 0, 0]}
                    barSize={32}
                    style={{ cursor: 'pointer', transition: 'all 0.3s ease' }}
                    onClick={() => onSelectCategory(name)}
                  />
                );
              })}
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-gray-400 gap-4 border-2 border-dashed border-gray-50 rounded-2xl py-20">
            <div className="p-4 bg-gray-50 rounded-full text-gray-300">
              <AlertCircle size={40} />
            </div>
            <p className="font-medium text-sm text-center px-4">Sem dados históricos para exibir a evolução por categoria.</p>
          </div>
        )}
      </div>
    </div>
  );
};
