import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Transaction, Category, Subcategory, ScopeType, TransactionNatures, Scope, Summary } from '../types/finance';
import { FileUp, Beaker, ChevronLeft, ChevronRight, PlusCircle, TrendingDown, Repeat, RotateCcw, TrendingUp, CheckCircle2 } from 'lucide-react';
import { TransactionTable } from './components/TransactionTable';
import { ManualEntryForm } from './components/ManualEntryForm';
import { DraftTransaction } from './components/ManualEntryRow';
import { ImportPreviewModal } from './components/ImportPreviewModal';
import { formatCurrency } from '../shared/formatUtils';

interface TransactionsViewProps {
  transactions: Transaction[];
  categories: Category[];
  subcategories: Subcategory[];
  scopeType: ScopeType;
  currentScopeId: string;
  defaultSplit?: { A: number, B: number };
  summary: Summary['natureTotals']; // Recebe resumo centralizado
  onImport: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onUpdate: (id: string, updates: Partial<Transaction>) => void;
  onConfirm: (id: string, options: { learnCategory: boolean; isRecurring: boolean }) => void;
  onDelete: (id: string) => void;
  onMoveToIndividual: (id: string, userId: 'A' | 'B') => void;
  onRevertToShared: (id: string) => void;
  onLoadDemo: () => void;
  onSaveManual: (drafts: DraftTransaction[]) => void;
  selectedMonth: string | null;
  setSelectedMonth: (month: string | null) => void;
  availableMonths: string[];
  previewTransactions: Transaction[] | null;
  onConfirmImport: () => void;
  onCancelImport: () => void;
}

export const TransactionsView: React.FC<TransactionsViewProps> = ({
  transactions, categories, subcategories, scopeType, currentScopeId, defaultSplit,
  summary, // Usando o resumo injetado
  onImport, onUpdate, onConfirm, onDelete, onMoveToIndividual, onRevertToShared, onLoadDemo,
  onSaveManual, selectedMonth, setSelectedMonth, availableMonths,
  previewTransactions, onConfirmImport, onCancelImport
}) => {
  const isShared = scopeType === 'shared';
  const [viewMode, setViewMode] = useState<'list' | 'manual'>('list');
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const tableRef = useRef<HTMLDivElement>(null);

  const [itemsPerPage, setItemsPerPage] = useState(() => {
    const saved = localStorage.getItem('fc_tx_items_per_page');
    const val = saved ? Number(saved) : 25;
    return (val === 25 || val === 50) ? val : 25;
  });
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    localStorage.setItem('fc_tx_items_per_page', itemsPerPage.toString());
  }, [itemsPerPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [transactions.length, selectedMonth, currentScopeId]);

  const totalPages = useMemo(() => 
    Math.max(1, Math.ceil(transactions.length / itemsPerPage)),
    [transactions.length, itemsPerPage]
  );

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  useEffect(() => {
    if (!selectedMonth && availableMonths.length > 0) {
      setSelectedMonth(availableMonths[0]);
    }
  }, [availableMonths]);

  const paginatedTxs = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return transactions.slice(start, end);
  }, [transactions, currentPage, itemsPerPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    if (tableRef.current) {
      tableRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  if (viewMode === 'manual') {
    return (
      <ManualEntryForm 
        categories={categories}
        subcategories={subcategories}
        scopeType={scopeType}
        defaultSplit={defaultSplit}
        onBack={() => setViewMode('list')}
        onSaveBatch={onSaveManual}
      />
    );
  }

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Lançamentos</h2>
          <p className="text-gray-500">Importe seus extratos ou adicione gastos manualmente.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setViewMode('manual')}
            className="flex items-center gap-2 px-5 py-3 bg-white border border-gray-200 hover:border-indigo-200 text-indigo-600 rounded-xl font-bold transition-all shadow-sm active:scale-95"
          >
            <PlusCircle size={20} />
            <span>Adicionar Lançamentos</span>
          </button>
          <label className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-colors cursor-pointer shadow-sm">
            <FileUp size={20} />
            <span>Importar CSV</span>
            <input type="file" accept=".csv" onChange={onImport} className="hidden" />
          </label>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 group hover:border-indigo-100 transition-colors">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 group-hover:scale-110 transition-transform">
            <TrendingDown size={20} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Despesas</p>
            <p className="text-lg font-bold text-gray-900">{formatCurrency(summary.expenses)}</p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 group hover:border-purple-100 transition-colors">
          <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600 group-hover:scale-110 transition-transform">
            <Repeat size={20} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Parcelados</p>
            <p className="text-lg font-bold text-gray-900">{formatCurrency(summary.installments)}</p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 group hover:border-amber-100 transition-colors">
          <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 group-hover:scale-110 transition-transform">
            <RotateCcw size={20} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Estornos</p>
            <p className="text-lg font-bold text-gray-900">{formatCurrency(summary.refunds)}</p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 group hover:border-emerald-100 transition-colors">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform">
            <TrendingUp size={20} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Créditos</p>
            <p className="text-lg font-bold text-emerald-700">{formatCurrency(summary.credits)}</p>
          </div>
        </div>
        <div className="bg-slate-800 p-4 rounded-2xl shadow-md border border-slate-700 flex items-center gap-4 group hover:bg-slate-900 transition-colors">
          <div className="w-10 h-10 rounded-xl bg-slate-700 flex items-center justify-center text-white group-hover:scale-110 transition-transform">
            <CheckCircle2 size={20} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Total da Fatura</p>
            <p className="text-lg font-bold text-white">{formatCurrency(summary.invoiceTotal)}</p>
          </div>
        </div>
      </div>

      <div ref={tableRef} className="scroll-mt-8 space-y-4">
        {availableMonths.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {availableMonths.map(month => (
              <button
                key={month}
                onClick={() => setSelectedMonth(month)}
                className={`px-4 py-1.5 rounded-full text-sm font-bold transition-all ${
                  selectedMonth === month
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100'
                    : 'bg-white border border-gray-200 text-gray-500 hover:border-indigo-200 hover:text-indigo-600'
                }`}
              >
                {month}
              </button>
            ))}
          </div>
        )}

        {transactions.length > 0 ? (
          <>
            <TransactionTable 
              transactions={paginatedTxs}
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

            <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
              <div className="text-sm text-gray-500 font-medium">
                Mostrando <span className="font-bold text-gray-900">{(currentPage - 1) * itemsPerPage + 1}</span> a <span className="font-bold text-gray-900">{Math.min(currentPage * itemsPerPage, transactions.length)}</span> de <span className="font-bold text-gray-900">{transactions.length}</span> lançamentos
              </div>
              
              <div className="flex flex-wrap items-center gap-6">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-lg border border-gray-100">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Itens:</span>
                  <select 
                    value={itemsPerPage}
                    onChange={(e) => setItemsPerPage(Number(e.target.value))}
                    className="text-sm font-bold text-gray-700 bg-transparent outline-none cursor-pointer"
                  >
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  
                  <div className="flex items-center gap-1">
                    <span className="text-sm font-medium text-gray-500">Página</span>
                    <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 font-bold text-sm">
                      {currentPage}
                    </span>
                    <span className="text-sm font-medium text-gray-500">de {totalPages}</span>
                  </div>

                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>
              </div>
            </div>
          </>
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
      </div>
      
      {openMenuId && <div className="fixed inset-0 z-50" onClick={() => setOpenMenuId(null)}></div>}

      {previewTransactions && (
        <ImportPreviewModal 
          transactions={previewTransactions}
          categories={categories}
          subcategories={subcategories}
          onConfirm={onConfirmImport}
          onCancel={onCancelImport}
        />
      )}
    </div>
  );
};