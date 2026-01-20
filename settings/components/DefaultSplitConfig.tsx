
import React from 'react';
import { Scale } from 'lucide-react';
import { Scope } from '../../types/finance';

interface DefaultSplitConfigProps {
  currentScope: Scope;
  onUpdateSplit: (split: { A: number, B: number }) => void;
}

export const DefaultSplitConfig: React.FC<DefaultSplitConfigProps> = ({ currentScope, onUpdateSplit }) => {
  // Apenas renderiza se for um escopo compartilhado ou tiver um split definido
  if (currentScope.scopeType !== 'shared' && !currentScope.defaultSplit) return null;

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
      <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
        <Scale size={20} className="text-indigo-600" /> Divisão Padrão
      </h3>
      <p className="text-sm text-gray-500 mb-4">
        Define a proporção automática ao importar novas despesas neste escopo compartilhado.
      </p>
      <div className="flex items-center gap-6">
        <div className="flex-1 space-y-2">
          <div className="flex justify-between text-xs font-bold text-gray-500 uppercase">
            <span>Pessoa A: {currentScope.defaultSplit?.A ?? 50}%</span>
            <span>Pessoa B: {currentScope.defaultSplit?.B ?? 50}%</span>
          </div>
          <input 
            type="range"
            min="0"
            max="100"
            value={currentScope.defaultSplit?.A ?? 50}
            onChange={(e) => {
              const val = parseInt(e.target.value);
              onUpdateSplit({ A: val, B: 100 - val });
            }}
            className="w-full h-2 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
          />
          <div className="flex justify-between text-[10px] text-gray-400">
            <span>A paga tudo</span>
            <span>50/50</span>
            <span>B paga tudo</span>
          </div>
        </div>
      </div>
    </div>
  );
};
