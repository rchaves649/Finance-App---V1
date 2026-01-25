
import React from 'react';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { TrendingUp, AlertCircle, MousePointer2, CheckCircle2 } from 'lucide-react';
import { TimeSeriesEntry, Period } from '../../types/finance';
import { formatCurrency } from '../../shared/formatUtils';

interface EvolutionLineChartProps {
  data: TimeSeriesEntry[];
  scopeName: string;
  period: Period;
  onSelectMonth?: (bucketKey: string) => void;
  focusedMonthKey?: string | null;
}

export const EvolutionLineChart: React.FC<EvolutionLineChartProps> = ({ 
  data, 
  scopeName, 
  onSelectMonth,
  focusedMonthKey 
}) => {
  // Captura o clique em qualquer lugar da fatia vertical (tooltip ativa)
  const handleClick = (e: any) => {
    if (onSelectMonth && e && e.activePayload && e.activePayload.length > 0) {
      const bucketKey = e.activePayload[0].payload.bucketKey;
      onSelectMonth(bucketKey);
    }
  };

  return (
    <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 min-h-[400px] flex flex-col group/lchart">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <TrendingUp size={20} className="text-indigo-600" /> Evolução Mensal em {scopeName}
        </h3>
        <div className="flex items-center gap-2">
          {focusedMonthKey && (
            <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded flex items-center gap-1 animate-in zoom-in duration-300">
              <CheckCircle2 size={10} /> Mês Selecionado
            </span>
          )}
          <span className="text-[10px] font-bold text-indigo-400 bg-indigo-50 px-2 py-1 rounded flex items-center gap-1 opacity-0 group-hover/lchart:opacity-100 transition-opacity">
            <MousePointer2 size={10} /> Clique para filtrar categorias
          </span>
        </div>
      </div>
      <div className="flex-1 w-full">
        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart 
              data={data} 
              margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
              onClick={handleClick}
              style={{ cursor: onSelectMonth ? 'pointer' : 'default' }}
            >
              <defs>
                <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis 
                dataKey="label" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 600 }}
                dy={10}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 600 }}
                tickFormatter={(value) => `R$ ${value}`}
              />
              <Tooltip 
                cursor={{ stroke: '#6366f1', strokeWidth: 2, strokeDasharray: '5 5' }}
                formatter={(value: number) => [formatCurrency(value), 'Gasto Total']}
                contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', padding: '12px' }}
                labelStyle={{ fontWeight: 'bold', marginBottom: '4px', color: '#1e293b' }}
              />
              <Area 
                type="monotone" 
                dataKey="total" 
                stroke="#6366f1" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorTotal)" 
                activeDot={{ r: 8, strokeWidth: 0, fill: '#4338ca' }}
                dot={(props: any) => {
                  const isSelected = props.payload.bucketKey === focusedMonthKey;
                  return (
                    <circle 
                      key={`dot-${props.payload.bucketKey}`}
                      cx={props.cx} 
                      cy={props.cy} 
                      r={isSelected ? 7 : 5} 
                      fill={isSelected ? '#4338ca' : '#6366f1'} 
                      strokeWidth={isSelected ? 4 : 2} 
                      stroke={isSelected ? 'rgba(99, 102, 241, 0.2)' : '#fff'} 
                      className="transition-all duration-300"
                    />
                  );
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-gray-400 gap-4 border-2 border-dashed border-gray-50 rounded-2xl py-20">
            <div className="p-4 bg-gray-50 rounded-full text-gray-300">
              <AlertCircle size={40} />
            </div>
            <p className="font-medium text-sm text-center px-4">Sem dados para exibir a evolução mensal.</p>
          </div>
        )}
      </div>
    </div>
  );
};
