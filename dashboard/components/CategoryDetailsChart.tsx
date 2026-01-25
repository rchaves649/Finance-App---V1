
import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, LabelList } from 'recharts';
import { TrendingUp, BarChart3, Eye } from 'lucide-react';
import { TimeSeriesEntry } from '../../types/finance';
import { formatCurrency } from '../../shared/formatUtils';

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f59e0b', '#10b981', '#14b8a6', '#f97316', '#a855f7', '#64748b'];

/**
 * Função utilitária para clarear ou escurecer uma cor hex.
 */
function adjustColor(color: string, percent: number): string {
  const num = parseInt(color.replace("#", ""), 16);
  const amt = Math.round(2.55 * percent);
  const R = (num >> 16) + amt;
  const G = (num >> 8 & 0x00FF) + amt;
  const B = (num & 0x0000FF) + amt;
  
  const clamp = (val: number) => Math.max(0, Math.min(255, val));
  
  return "#" + (
    0x1000000 + 
    clamp(R) * 0x10000 + 
    clamp(G) * 0x100 + 
    clamp(B)
  ).toString(16).slice(1);
}

interface CategoryDetailsChartProps {
  data: TimeSeriesEntry[];
  categoryName: string | null;
  onClose?: () => void;
}

export const CategoryDetailsChart: React.FC<CategoryDetailsChartProps> = ({ data, categoryName }) => {
  const [selectedSubkey, setSelectedSubkey] = useState<string | null>(null);
  const [showAllLabels, setShowAllLabels] = useState(false);

  // Resetar seleção de subcategoria ao mudar a categoria pai
  useEffect(() => {
    setSelectedSubkey(null);
  }, [categoryName]);

  const activeKeys = React.useMemo(() => {
    const keys = new Set<string>();
    const prefix = categoryName ? `${categoryName}::` : '';

    data.forEach(entry => {
      Object.keys(entry).forEach(key => {
        if (key === 'bucketKey' || key === 'label' || key === 'total') return;
        
        if (categoryName) {
          if (key.startsWith(prefix)) keys.add(key);
        } else {
          if (!key.includes('::')) keys.add(key);
        }
      });
    });
    return Array.from(keys).sort();
  }, [data, categoryName]);

  const baseColor = React.useMemo(() => {
    const parentNames = new Set<string>();
    data.forEach(e => Object.keys(e).forEach(k => {
      if (k !== 'bucketKey' && k !== 'label' && k !== 'total' && !k.includes('::')) {
        parentNames.add(k);
      }
    }));
    
    const sortedParents = Array.from(parentNames).sort();
    
    if (!categoryName) return '#6366f1';
    
    const index = sortedParents.indexOf(categoryName);
    return index !== -1 ? COLORS[index % COLORS.length] : '#6366f1';
  }, [categoryName, data]);

  const totalInPeriod = React.useMemo(() => {
    if (!categoryName) return data.reduce((acc, curr) => acc + curr.total, 0);
    return data.reduce((acc, entry) => acc + (Number(entry[categoryName]) || 0), 0);
  }, [data, categoryName]);

  const handleSelectSubkey = (key: string) => {
    setSelectedSubkey(prev => prev === key ? null : key);
  };

  const renderCustomizedLabel = (props: any) => {
    const { x, y, width, height, value } = props;
    if (value === 0 || !value) return null;

    const labelText = `R$ ${Math.round(value)}`;
    const centerX = x + width / 2;
    const centerY = y + height / 2;

    return (
      <g>
        {/* Background pill for better contrast - slightly larger for 10px text */}
        <rect 
          x={centerX - 24} 
          y={centerY - 9} 
          width={48} 
          height={18} 
          rx={6} 
          fill="rgba(0,0,0,0.8)" 
          className="pointer-events-none"
        />
        <text 
          x={centerX} 
          y={centerY} 
          fill="#fff" 
          textAnchor="middle" 
          dominantBaseline="middle"
          className="text-[10px] font-black pointer-events-none tracking-tighter"
        >
          {labelText}
        </text>
      </g>
    );
  };

  return (
    <div className="bg-white p-8 rounded-2xl shadow-sm border border-indigo-100 flex flex-col min-h-[400px] h-full transition-all duration-300 group/details">
      <div className="flex items-center justify-between mb-6">
        <div className="flex flex-col">
          <div className="flex items-center gap-2 mb-1">
            {categoryName ? <TrendingUp size={20} style={{ color: baseColor }} /> : <BarChart3 size={20} className="text-gray-400" />}
            <h3 className="text-lg font-bold text-gray-900">
              {categoryName ? 'Detalhamento:' : 'Visão Geral:'} <span style={{ color: baseColor }}>{categoryName || 'Todos os Gastos'}</span>
            </h3>
          </div>
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
            Total no período: <span className="text-gray-900">{formatCurrency(totalInPeriod)}</span>
          </p>
        </div>

        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 cursor-pointer group/toggle select-none">
            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-tight group-hover/toggle:text-indigo-600 transition-colors">
              MOSTRAR TODOS OS VALORES
            </span>
            <div className="relative">
              <input 
                type="checkbox"
                checked={showAllLabels}
                onChange={(e) => setShowAllLabels(e.target.checked)}
                className="sr-only"
              />
              <div className={`w-7 h-4 rounded-full transition-colors ${showAllLabels ? 'bg-indigo-600' : 'bg-gray-300'}`} />
              <div className={`absolute top-0.5 left-0.5 w-3 h-3 bg-white rounded-full transition-transform ${showAllLabels ? 'translate-x-3' : ''}`} />
            </div>
          </label>
        </div>
      </div>

      <div className="flex-1 min-h-[250px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart 
            data={data} 
            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
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
              formatter={(value: number, name: string) => {
                const cleanName = name.includes('::') ? name.split('::')[1] : name;
                return [formatCurrency(value), cleanName];
              }}
              contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', padding: '12px' }}
              labelStyle={{ fontWeight: 'bold', marginBottom: '4px', color: '#1e293b' }}
            />
            <Legend 
              verticalAlign="bottom" 
              height={36} 
              iconType="circle"
              onClick={(e) => handleSelectSubkey(e.dataKey as string)}
              formatter={(value: string) => {
                const cleanName = value.includes('::') ? value.split('::')[1] : value;
                const isSelected = selectedSubkey === value;
                return (
                  <span className={`text-[10px] font-bold uppercase tracking-tighter transition-all cursor-pointer ${
                    isSelected ? 'text-indigo-600 scale-110' : 'text-gray-500 hover:text-gray-700'
                  }`}>
                    {cleanName}
                  </span>
                );
              }}
              wrapperStyle={{ paddingTop: '20px' }}
            />
            {activeKeys.map((key, index) => {
              const isSelected = selectedSubkey === key;
              const hasSelection = selectedSubkey !== null;
              const shouldShowLabel = showAllLabels || isSelected;
              
              const barColor = categoryName 
                ? adjustColor(baseColor, index * 15)
                : COLORS[index % COLORS.length];

              return (
                <Bar 
                  key={key} 
                  dataKey={key} 
                  stackId="details" 
                  fill={barColor} 
                  fillOpacity={hasSelection ? (isSelected ? 1 : 0.3) : 1}
                  radius={index === activeKeys.length - 1 ? [4, 4, 0, 0] : [0, 0, 0, 0]}
                  barSize={32}
                  animationDuration={1000}
                  onClick={() => handleSelectSubkey(key)}
                  className="cursor-pointer transition-all duration-300"
                >
                  {shouldShowLabel && (
                    <LabelList 
                      dataKey={key} 
                      content={renderCustomizedLabel}
                    />
                  )}
                </Bar>
              );
            })}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
