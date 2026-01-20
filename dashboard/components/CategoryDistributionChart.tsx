
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Wallet, AlertCircle } from 'lucide-react';
import { formatCurrency } from '../../shared/formatUtils';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

interface CategoryDistributionChartProps {
  data: { name: string; value: number }[];
  scopeName: string;
}

export const CategoryDistributionChart: React.FC<CategoryDistributionChartProps> = ({ data, scopeName }) => {
  return (
    <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 min-h-[450px] flex flex-col">
      <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
        <Wallet size={20} className="text-indigo-600" /> Distribuição por Categoria em {scopeName}
      </h3>
      <div className="flex-1 w-full">
        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={100}
                outerRadius={140}
                paddingAngle={8}
                dataKey="value"
                stroke="none"
              >
                {data.map((_, index) => (
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
  );
};
