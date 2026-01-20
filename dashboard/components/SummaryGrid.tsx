import React from 'react';
import { TrendingUp, AlertCircle, Calendar } from 'lucide-react';
import { Period } from '../../types/finance';
import { SummaryCard } from './SummaryCard';
import { formatCurrency } from '../../shared/formatUtils';

interface SummaryGridProps {
  totalSpent: number;
  pendingCount: number;
  currentMonthTotal: number;
  period: Period;
}

export const SummaryGrid: React.FC<SummaryGridProps> = ({ 
  totalSpent, 
  pendingCount, 
  currentMonthTotal, 
  period 
}) => {
  return (
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
  );
};