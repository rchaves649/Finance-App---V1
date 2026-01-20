
import React from 'react';
import { SearchX } from 'lucide-react';
import { Period } from '../../types/finance';

interface DashboardNoDataStateProps {
  scopeName: string;
  onPeriodChange: (p: Period) => void;
}

export const DashboardNoDataState: React.FC<DashboardNoDataStateProps> = ({ scopeName, onPeriodChange }) => {
  return (
    <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border-2 border-dashed border-gray-100 text-center animate-in fade-in">
      <div className="bg-gray-50 p-6 rounded-full text-gray-300 mb-4">
        <SearchX size={48} />
      </div>
      <h3 className="text-xl font-bold text-gray-900 mb-2">Nenhum dado em {scopeName} para este período</h3>
      <p className="text-gray-500 max-w-md mb-8">
        Não encontramos transações registradas ou confirmadas no intervalo selecionado para este escopo.
      </p>
      <button 
        onClick={() => onPeriodChange({ kind: 'month', year: new Date().getFullYear(), month: new Date().getMonth() + 1 })}
        className="text-indigo-600 font-bold hover:underline"
      >
        Voltar para o mês atual
      </button>
    </div>
  );
};
