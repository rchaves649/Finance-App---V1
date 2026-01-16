
import React from 'react';
import { Transaction, Category, Subcategory } from '../types';
import { FileUp, Check, Trash2, AlertCircle, CheckCircle2, Sparkles, Beaker } from 'lucide-react';

interface TransactionsViewProps {
  transactions: Transaction[];
  categories: Category[];
  subcategories: Subcategory[];
  onImport: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onUpdate: (id: string, updates: Partial<Transaction>) => void;
  onConfirm: (id: string) => void;
  onDelete: (id: string) => void;
  onLoadDemo: () => void;
}

export const TransactionsView: React.FC<TransactionsViewProps> = ({
  transactions,
  categories,
  subcategories,
  onImport,
  onUpdate,
  onConfirm,
  onDelete,
  onLoadDemo
}) => {
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

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Data</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Descrição</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Valor</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Categoria</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Subcategoria</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {transactions.length > 0 ? (
                transactions.map(tx => {
                  const filteredSubs = subcategories.filter(s => s.categoryId === tx.categoryId);
                  const canConfirm = !!tx.categoryId && !!tx.subcategoryId;

                  return (
                    <tr key={tx.id} className={`${!tx.isConfirmed ? 'bg-amber-50/20' : ''} hover:bg-gray-50 transition-colors`}>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(tx.date).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className={`text-sm font-medium ${tx.isConfirmed ? 'text-gray-500' : 'text-gray-900'}`}>{tx.description}</span>
                          <div className="flex items-center gap-2 mt-0.5">
                            {!tx.isConfirmed ? (
                              <span className="text-[10px] text-amber-600 font-bold uppercase flex items-center gap-1">
                                <AlertCircle size={10} /> Pendente
                              </span>
                            ) : (
                              <span className="text-[10px] text-emerald-600 font-bold uppercase flex items-center gap-1">
                                <CheckCircle2 size={10} /> Confirmado
                              </span>
                            )}
                            {tx.isSuggested && !tx.isConfirmed && (
                              <span className="text-[10px] text-indigo-600 font-bold uppercase flex items-center gap-1 bg-indigo-50 px-1.5 py-0.5 rounded">
                                <Sparkles size={10} /> Sugerido
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                        R$ {tx.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-6 py-4">
                        <select
                          disabled={tx.isConfirmed}
                          value={tx.categoryId || ''}
                          onChange={(e) => onUpdate(tx.id, { categoryId: e.target.value, subcategoryId: undefined })}
                          className={`p-2 border border-gray-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-indigo-500 outline-none w-full max-w-[160px] ${tx.isConfirmed ? 'opacity-60 bg-gray-50 cursor-not-allowed' : ''}`}
                        >
                          <option value="">Selecionar...</option>
                          {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                      </td>
                      <td className="px-6 py-4">
                        <select
                          disabled={tx.isConfirmed || !tx.categoryId}
                          value={tx.subcategoryId || ''}
                          onChange={(e) => onUpdate(tx.id, { subcategoryId: e.target.value })}
                          className={`p-2 border border-gray-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-indigo-500 outline-none w-full max-w-[160px] ${tx.isConfirmed || !tx.categoryId ? 'opacity-60 bg-gray-50 cursor-not-allowed' : ''}`}
                        >
                          <option value="">Selecionar...</option>
                          {filteredSubs.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </select>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {!tx.isConfirmed ? (
                            <button
                              onClick={() => onConfirm(tx.id)}
                              disabled={!canConfirm}
                              className={`p-2 rounded-lg transition-all ${
                                canConfirm 
                                  ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100 shadow-sm' 
                                  : 'bg-gray-100 text-gray-300 cursor-not-allowed'
                              }`}
                              title={canConfirm ? "Confirmar Lançamento" : "Selecione categoria e subcategoria"}
                            >
                              <Check size={18} />
                            </button>
                          ) : (
                            <div className="p-2 text-emerald-500" title="Confirmado">
                              <CheckCircle2 size={18} />
                            </div>
                          )}
                          <button
                            onClick={() => onDelete(tx.id)}
                            className="p-2 rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                            title="Excluir"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <p className="text-gray-400 italic">Nenhuma transação encontrada.</p>
                      <button 
                        onClick={onLoadDemo}
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-lg text-sm font-semibold transition-colors"
                      >
                        <Beaker size={16} />
                        Carregar dados de exemplo
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
