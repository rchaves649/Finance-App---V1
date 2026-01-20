
import React from 'react';
import { Trash2, User, Repeat } from 'lucide-react';
import { Category, Subcategory, ClassificationMemoryEntry, RecurringMemoryEntry, Scope } from '../../types/finance';

interface MappingRowProps {
  mapping: ClassificationMemoryEntry;
  currentScope: Scope;
  category?: Category;
  subcategory?: Subcategory;
  recurringRule?: RecurringMemoryEntry;
  onDelete: (key: string) => void;
}

export const MappingRow: React.FC<MappingRowProps> = ({
  mapping,
  currentScope,
  category,
  subcategory,
  recurringRule,
  onDelete
}) => {
  const renderSplitInfo = () => {
    // If there is a manual recurring rule with a specific share
    if (recurringRule?.payerShare) {
      const { A, B } = recurringRule.payerShare;
      const total = (A || 0) + (B || 0);
      const pctA = total > 0 ? Math.round(((A || 0) / total) * 100) : 0;
      const pctB = 100 - pctA;
      
      return (
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-600">
            <User size={12} className="text-indigo-400" />
            {pctA}% A / {pctB}% B
          </div>
          <span className="text-[10px] text-gray-400 font-medium">Divisão Manual</span>
        </div>
      );
    }

    // Default split visualization for "Automatic" items
    const defA = currentScope.defaultSplit?.A ?? 50;
    const defB = currentScope.defaultSplit?.B ?? 50;
    
    return (
      <div className="flex flex-col">
        <div className="flex items-center gap-1.5 text-xs font-medium text-gray-600">
          <User size={12} className="text-gray-400" />
          {defA}% A / {defB}% B
        </div>
        <span className="text-[10px] text-gray-400 italic font-medium">Automático (Padrão)</span>
      </div>
    );
  };

  return (
    <tr className="hover:bg-gray-50/50 transition-colors">
      <td className="px-6 py-4">
        <span className="text-sm font-medium text-gray-900">{mapping.normalizedKey}</span>
      </td>
      <td className="px-6 py-4">
        <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-lg font-medium">
          {category?.name || 'Excluída'}
        </span>
      </td>
      <td className="px-6 py-4">
        <span className="text-xs text-gray-500">
          {subcategory?.name || 'Excluída'}
        </span>
      </td>
      <td className="px-6 py-4">
        {renderSplitInfo()}
      </td>
      <td className="px-6 py-4">
        <div className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-tighter ${
          recurringRule ? 'bg-indigo-50 text-indigo-700' : 'bg-amber-50 text-amber-700'
        }`}>
          {recurringRule ? <><Repeat size={10}/> Recorrente</> : 'Pontual'}
        </div>
      </td>
      <td className="px-6 py-4">
        <button 
          onClick={() => onDelete(mapping.normalizedKey)}
          className="p-2 text-gray-300 hover:text-red-500 transition-colors"
          title="Remover Aprendizado"
        >
          <Trash2 size={16} />
        </button>
      </td>
    </tr>
  );
};
