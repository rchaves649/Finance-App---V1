
import React from 'react';
import { useScope } from '../../shared/ScopeContext';

interface SummaryCardProps {
  title: string;
  value: string;
  icon: React.ElementType;
  colorClass: string;
}

export const SummaryCard: React.FC<SummaryCardProps> = ({ title, value, icon: Icon, colorClass }) => {
  const { currentScope } = useScope();

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between" title={`Visualizando ${currentScope.name}`}>
      <div className={`w-12 h-12 rounded-xl ${colorClass} flex items-center justify-center mb-4`}>
        <Icon size={24} className="text-white" />
      </div>
      <div>
        <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
        <h3 className="text-2xl font-bold text-gray-900 tracking-tight">{value}</h3>
      </div>
    </div>
  );
};
