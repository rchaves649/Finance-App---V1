import React, { useState, useEffect } from 'react';
import { Transaction, Category, Subcategory, ScopeType } from '../types/finance';
import { FileUp, Beaker } from 'lucide-react';
import { TransactionTable } from './components/TransactionTable';

interface TransactionsViewProps {
  transactions: Transaction[];
  categories: Category[];
  subcategories: Subcategory[];
  scopeType: ScopeType;
  currentScopeId: string;
  onImport: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onUpdate: (id: string, updates: Partial<Transaction>) => void;
  onConfirm: (id: string, isRecurring?: boolean) => void;
  onDelete: (id: string) => void;
  onMoveToIndividual: (id: string, userId: 'A' | 'B') => void;
  onRevertToShared: (id: string) => void;
  onLoadDemo: () => void;
  selectedMonth: string | null;
  setSelectedMonth: (month: string) => void;
  availableMonths: string[];
}

export const TransactionsView: React.FC<TransactionsViewProps> = ({
  transactions, categories, subcategories, scopeType, currentScopeId,
  onImport, onUpdate, onConfirm, onDelete, onMoveToIndividual, onRevertToShared, onLoadDemo,
  selectedMonth, setSelectedMonth, availableMonths
}) => {
  const isShared = scopeType === 'shared';
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedMonth && availableMonths.length > 0) {
      setSelectedMonth(availableMonths[0]);
    }
  }, [availableMonths]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Lançamentos</h2>
          <p className="text-gray-500">Importe seus extratos e classifique seus gastos.</p>
        </div>
        <label className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-colors cursor-pointer shadow-sm">
          <FileUp size={20} />
          <span>Importar CSV</span>
          <input type="file" accept=".csv" onChange={onImport} className="hidden" />
        </label>
      </div>

      {availableMonths.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {availableMonths.map(month => (
            <button
              key={month}
              onClick={() => setSelectedMonth(month)}
              className={`px-4 py-1 rounded-full text-sm font-medium transition-colors ${
                selectedMonth === month
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {month}
            </button>
          ))}
        </div>
      )}

      {transactions.length > 0 ? (
        <TransactionTable 
          transactions={transactions}
          categories={categories}
          subcategories={subcategories}
          isShared={isShared}
          currentScopeId={currentScopeId}
          onUpdate={onUpdate}
          onConfirm={onConfirm}
          onDelete={onDelete}
          onMoveToIndividual={onMoveToIndividual}
          onRevertToShared={onRevertToShared}
          openMenuId={openMenuId}
          onSetOpenMenuId={setOpenMenuId}
        />
      ) : (
        <div className="bg-white rounded-2xl p-20 text-center border border-gray-100">
          <div className="flex flex-col items-center gap-4">
            <p className="text-gray-400 italic">Nenhuma transação encontrada.</p>
            <button onClick={onLoadDemo} className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-lg text-sm font-semibold">
              <Beaker size={16} /> Carregar dados de exemplo
            </button>
          </div>
        </div>
      )}
      
      {openMenuId && <div className="fixed inset-0 z-50" onClick={() => setOpenMenuId(null)}></div>}
    </div>
  );
};