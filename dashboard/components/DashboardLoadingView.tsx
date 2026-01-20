
import React from 'react';
import { Loader2 } from 'lucide-react';

interface DashboardLoadingViewProps {
  scopeName: string;
}

export const DashboardLoadingView: React.FC<DashboardLoadingViewProps> = ({ scopeName }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-indigo-600 animate-pulse">
      <Loader2 className="animate-spin mb-4" size={48} />
      <p className="font-bold text-lg">Carregando dados de {scopeName}...</p>
    </div>
  );
};
