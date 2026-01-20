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
  onConfirm: (id: string, isRecurring: boolean) => void;
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
        <table className="w-full text-left">
          <thead>
            <tr className="bg-gray-50/50 border-b border-gray-100">
              <th className="px-6 py-5 text-[10px] font-bold text-gray-900 uppercase tracking-widest">Data</th>
              <th className="px-6 py-5 text-[10px] font-bold text-gray-900 uppercase tracking-widest">Descrição</th>
              <th className="px-6 py-5 text-[10px] font-bold text-gray-900 uppercase tracking-widest">Valor</th>
              {isShared && (
                <>
                  <th className="px-6 py-5 text-[10px] font-bold text-gray-900 uppercase tracking-widest">Valor A</th>
                  <th className="px-6 py-5 text-[10px] font-bold text-gray-900 uppercase tracking-widest">Valor B</th>
                </>
              )}
              <th className="px-6 py-5 text-[10px] font-bold text-gray-900 uppercase tracking-widest">Categoria</th>
              <th className="px-6 py-5 text-[10px] font-bold text-gray-900 uppercase tracking-widest">Subcategoria</th>
              <th className="px-6 py-5 text-[10px] font-bold text-gray-900 uppercase tracking-widest">Status</th>
              <th className="px-6 py-5 text-[10px] font-bold text-gray-900 uppercase tracking-widest text-center">Ação</th>
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