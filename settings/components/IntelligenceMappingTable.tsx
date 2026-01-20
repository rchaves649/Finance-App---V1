
import React from 'react';
import { Sparkles } from 'lucide-react';
import { Category, Subcategory, ClassificationMemoryEntry, RecurringMemoryEntry, Scope } from '../../types/finance';
import { MappingRow } from './MappingRow';

interface IntelligenceMappingTableProps {
  mappings: ClassificationMemoryEntry[];
  recurringRules: RecurringMemoryEntry[];
  categories: Category[];
  subcategories: Subcategory[];
  currentScope: Scope;
  onDeleteMapping: (normalizedKey: string) => void;
}

export const IntelligenceMappingTable: React.FC<IntelligenceMappingTableProps> = ({
  mappings,
  recurringRules,
  categories,
  subcategories,
  currentScope,
  onDeleteMapping
}) => {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-6 border-b border-gray-50 flex items-center justify-between">
        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <Sparkles size={20} className="text-indigo-600" /> Mapeamento de Despesas
        </h3>
        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">{mappings.length} Aprendizados</span>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Descrição Aprendida</th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Categoria</th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Subcategoria</th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Divisão</th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Tipo</th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Ação</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {mappings.length > 0 ? mappings.map((mapping, idx) => (
              <MappingRow 
                key={idx}
                mapping={mapping}
                currentScope={currentScope}
                category={categories.find(c => c.id === mapping.categoryId)}
                subcategory={subcategories.find(s => s.id === mapping.subcategoryId)}
                recurringRule={recurringRules.find(r => r.normalizedKey === mapping.normalizedKey)}
                onDelete={onDeleteMapping}
              />
            )) : (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center">
                  <p className="text-gray-400 text-sm italic">Nenhum mapeamento de despesa aprendido ainda.</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
