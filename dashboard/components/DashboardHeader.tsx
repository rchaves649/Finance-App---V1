import React from 'react';
import { PeriodSelector } from './PeriodSelector';
import { Period } from '../../types/finance';

interface DashboardHeaderProps {
  scopeName: string;
  period: Period;
  onPeriodChange: (p: Period) => void;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({ scopeName, period, onPeriodChange }) => {
  return (
    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Dashboard: {scopeName}</h2>
        <p className="text-gray-500">Acompanhe o desempenho financeiro deste escopo em tempo real.</p>
      </div>

      <PeriodSelector period={period} onPeriodChange={onPeriodChange} />
    </div>
  );
};