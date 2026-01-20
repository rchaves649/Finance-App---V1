
import React from 'react';
import { Wallet, Sparkles, Beaker } from 'lucide-react';

interface DashboardEmptyStateProps {
  scopeName: string;
  onLoadDemo: () => void;
}

export const DashboardEmptyState: React.FC<DashboardEmptyStateProps> = ({ scopeName, onLoadDemo }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4 animate-in fade-in duration-700">
      <div className="bg-indigo-50 p-8 rounded-full mb-8 relative">
        <Wallet size={64} className="text-indigo-600" />
        <Sparkles className="absolute -top-1 -right-1 text-amber-400 animate-pulse" size={32} />
      </div>
      <h2 className="text-3xl font-extrabold text-gray-900 mb-4 tracking-tight">
        Gestão Financeira em {scopeName}
      </h2>
      <p className="text-gray-500 max-w-lg mb-10 text-lg leading-relaxed">
        O FinanceConnect ajuda você a ter clareza total sobre os gastos. 
        Comece importando um extrato CSV ou veja os dados de exemplo para o escopo selecionado.
      </p>
      <div className="flex flex-col sm:flex-row gap-4">
        <button 
          onClick={onLoadDemo}
          className="flex items-center justify-center gap-3 px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold transition-all shadow-lg shadow-indigo-200 hover:scale-[1.02]"
        >
          <Beaker size={20} />
          <span>Ver Dados de Exemplo</span>
        </button>
      </div>
    </div>
  );
};
