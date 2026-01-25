
import React from 'react';
import { Transaction, Category, Subcategory } from '../../types/finance';
import { TransactionRow } from './TransactionRow';

interface TransactionTableProps {
  transactions: Transaction[];
  categories: Category[];
  subcategories: Subcategory[];
  isShared: boolean;
  currentScopeId: string;
  onUpdate: (id: string, updates: Partial<Transaction>) => void;
  // Fixed signature to accept options object instead of a simple boolean
  onConfirm: (id: string, options: { learnCategory: boolean; isRecurring: boolean }) => void;
  onDelete: (id: string) => void;
  onMoveToIndividual: (id: string, userId: 'A' | 'B') => void;
  onRevertToShared: (id: string) => void;
  openMenuId: string | null;
  onSetOpenMenuId: (id: string | null) => void;
}

export const TransactionTable: React.FC<TransactionTableProps> = ({
  transactions, categories, subcategories, isShared, currentScopeId,
  onUpdate, onConfirm, onDelete, onMoveToIndividual, onRevertToShared,
  openMenuId, onSetOpenMenuId
}) => {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left table-auto min-w-[980px]">
          <thead>
            <tr className="bg-gray-50/50 border-b border-gray-100">
              <th className="px-4 py-4 text-[10px] font-bold text-gray-900 uppercase tracking-widest whitespace-nowrap min-w-[85px]">Data</th>
              <th className="px-4 py-4 text-[10px] font-bold text-gray-900 uppercase tracking-widest whitespace-nowrap min-w-[150px]">Descrição</th>
              <th className="px-4 py-4 text-[10px] font-bold text-gray-900 uppercase tracking-widest whitespace-nowrap min-w-[95px]">Valor</th>
              {isShared && (
                <>
                  <th className="px-3 py-4 text-[10px] font-bold text-gray-900 uppercase tracking-widest whitespace-nowrap text-center min-w-[85px]">Valor A</th>
                  <th className="px-3 py-4 text-[10px] font-bold text-gray-900 uppercase tracking-widest whitespace-nowrap text-center min-w-[85px]">Valor B</th>
                </>
              )}
              <th className="px-4 py-4 text-[10px] font-bold text-gray-900 uppercase tracking-widest whitespace-nowrap min-w-[115px]">Categoria</th>
              <th className="px-4 py-4 text-[10px] font-bold text-gray-900 uppercase tracking-widest whitespace-nowrap min-w-[110px]">Subcategoria</th>
              <th className="px-4 py-4 text-[10px] font-bold text-gray-900 uppercase tracking-widest text-center min-w-[100px]">Natureza</th>
              <th className="px-4 py-4 text-[10px] font-bold text-gray-900 uppercase tracking-widest text-center min-w-[100px]">Classificação</th>
              <th className="px-4 py-4 text-[10px] font-bold text-gray-900 uppercase tracking-widest text-center min-w-[90px] whitespace-nowrap">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {transactions.map(tx => (
              <TransactionRow 
                key={tx.id}
                tx={tx}
                categories={categories}
                subcategories={subcategories}
                isShared={isShared}
                currentScopeId={currentScopeId}
                onUpdate={onUpdate}
                onConfirm={onConfirm}
                onDelete={onDelete}
                onMoveToIndividual={onMoveToIndividual}
                onRevertToShared={onRevertToShared}
                isMenuOpen={openMenuId === tx.id}
                onToggleMenu={() => onSetOpenMenuId(openMenuId === tx.id ? null : tx.id)}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
