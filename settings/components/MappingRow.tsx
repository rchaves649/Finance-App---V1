
import React from 'react';
import { Trash2, User, Repeat } from 'lucide-react';
import { Category, Subcategory, ClassificationMemoryEntry, RecurringMemoryEntry } from '../../types/finance';

interface MappingRowProps {
  mapping: ClassificationMemoryEntry;
  category?: Category;
  subcategory?: Subcategory;
  recurringRule?: RecurringMemoryEntry;
  onDelete: (key: string) => void;
}

export const MappingRow: React.FC<MappingRowProps> = ({
  mapping,
  category,
  subcategory,
  recurringRule,
  onDelete
}) => {
  const formatSplitLabel = (rule?: RecurringMemoryEntry) => {
    if (!rule || !rule.payerShare) return 'Automático';
    const { A, B } = rule.payerShare;
    const total = (A || 0) + (B || 0);
    if (total === 0) return '0% A / 0% B';
    const pctA = Math.round(((A || 0) / total) * 100);
    const pctB = 100 - pctA;
    return `${pctA}% A / ${pctB}% B`;
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
        <div className="flex items-center gap-1.5 text-xs text-gray-600">
          <User size={12} className="text-gray-400" />
          {formatSplitLabel(recurringRule)}
        </div>
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
