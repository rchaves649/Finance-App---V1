import React, { useMemo } from 'react';
import { Transaction, Category, Subcategory, TransactionNatures } from '../../types/finance';
import { formatCurrency, toCents, fromCents } from '../../shared/formatUtils';
import { X, CheckCircle2, TrendingDown, Info, Save, Repeat, RotateCcw } from 'lucide-react';

interface ImportPreviewModalProps {
  transactions: Transaction[];
  categories: Category[];
  subcategories: Subcategory[];
  onConfirm: () => void;
  onCancel: () => void;
}

export const ImportPreviewModal: React.FC<ImportPreviewModalProps> = ({
  transactions,
  categories,
  subcategories,
  onConfirm,
  onCancel
}) => {
  const summary = useMemo(() => {
    const expensesCents = transactions
      .filter(tx => tx.transactionNature === TransactionNatures.EXPENSE)
      .reduce((acc, tx) => acc + toCents(tx.amount), 0);
    
    const installmentCents = transactions
      .filter(tx => tx.transactionNature === TransactionNatures.INSTALLMENT_EXPENSE)
      .reduce((acc, tx) => acc + toCents(tx.amount), 0);
    
    const refundsCents = transactions
      .filter(tx => tx.transactionNature === TransactionNatures.REFUND)
      .reduce((acc, tx) => acc + toCents(tx.amount), 0);

    const invoiceCents = expensesCents + installmentCents;

    return {
      expenses: fromCents(expensesCents),
      installments: fromCents(installmentCents),
      refunds: fromCents(refundsCents),
      invoiceTotal: fromCents(invoiceCents),
      count: transactions.length
    };
  }, [transactions]);

  const getNatureLabel = (nature: string) => {
    switch (nature) {
      case TransactionNatures.EXPENSE: return 'DESPESA';
      case TransactionNatures.CREDIT: return 'CRÉDITO';
      case TransactionNatures.REFUND: return 'ESTORNO';
      case TransactionNatures.PAYMENT: return 'PAGAMENTO';
      case TransactionNatures.INSTALLMENT_EXPENSE: return 'PARCELADO';
      case TransactionNatures.TRANSFER: return 'TRANSFERÊNCIA';
      default: return 'DESPESA';
    }
  };

  const getNatureColor = (nature: string) => {
    switch (nature) {
      case TransactionNatures.EXPENSE: return 'bg-gray-100 text-gray-600';
      case TransactionNatures.CREDIT: return 'bg-emerald-100 text-emerald-800';
      case TransactionNatures.REFUND: return 'bg-amber-100 text-amber-800';
      case TransactionNatures.PAYMENT: return 'bg-blue-100 text-blue-800';
      case TransactionNatures.INSTALLMENT_EXPENSE: return 'bg-purple-100 text-purple-800';
      case TransactionNatures.TRANSFER: return 'bg-slate-100 text-slate-800';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-gray-900/60 backdrop-blur-md p-4 md:p-8 animate-in fade-in duration-300">
      <div className="bg-white rounded-[2.5rem] shadow-2xl border border-gray-100 w-full max-w-7xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="p-8 pb-4 flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-bold text-gray-900">Prévia da Importação</h3>
            <p className="text-sm text-gray-500 mt-1 font-medium">Revise os lançamentos antes de salvar definitivamente.</p>
          </div>
          <button 
            onClick={onCancel}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all"
          >
            <X size={24} />
          </button>
        </div>

        {/* Summary Cards */}
        <div className="px-8 py-6 grid grid-cols-1 md:grid-cols-5 gap-3">
          <div className="p-5 bg-indigo-50/40 rounded-2xl border border-indigo-100">
            <div className="flex items-center gap-2 text-indigo-600 mb-2">
              <Info size={14} strokeWidth={3} />
              <span className="text-[10px] font-black uppercase tracking-widest">Total Itens</span>
            </div>
            <div className="text-2xl font-medium text-indigo-900 tracking-tight">{summary.count}</div>
          </div>
          
          <div className="p-5 bg-red-50/40 rounded-2xl border border-red-100">
            <div className="flex items-center gap-2 text-red-600 mb-2">
              <TrendingDown size={14} strokeWidth={3} />
              <span className="text-[10px] font-black uppercase tracking-widest">Despesas</span>
            </div>
            <div className="text-2xl font-medium text-red-900 tracking-tight">{formatCurrency(summary.expenses)}</div>
          </div>

          <div className="p-5 bg-purple-50/40 rounded-2xl border border-purple-100">
            <div className="flex items-center gap-2 text-purple-600 mb-2">
              <Repeat size={14} strokeWidth={3} />
              <span className="text-[10px] font-black uppercase tracking-widest">Parceladas</span>
            </div>
            <div className="text-2xl font-medium text-purple-900 tracking-tight">{formatCurrency(summary.installments)}</div>
          </div>

          <div className="p-5 bg-amber-50/40 rounded-2xl border border-amber-100">
            <div className="flex items-center gap-2 text-amber-600 mb-2">
              <RotateCcw size={14} strokeWidth={3} />
              <span className="text-[10px] font-black uppercase tracking-widest">Reembolsos</span>
            </div>
            <div className="text-2xl font-medium text-amber-900 tracking-tight">{formatCurrency(summary.refunds)}</div>
          </div>

          <div className="p-5 bg-slate-800 rounded-2xl border border-slate-700 shadow-xl shadow-gray-200 ring-1 ring-white/10">
            <div className="flex items-center gap-2 text-gray-300 mb-1">
              <CheckCircle2 size={14} strokeWidth={3} />
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-200">Total da Fatura</span>
            </div>
            <div className="text-2xl font-medium text-white tracking-tight">{formatCurrency(summary.invoiceTotal)}</div>
            <span className="text-[9px] text-gray-400 font-black uppercase tracking-widest opacity-80">(Desp. + Parceladas)</span>
          </div>
        </div>

        {/* Table Content */}
        <div className="flex-1 overflow-auto px-8 pb-8">
          <div className="border border-gray-100 rounded-3xl overflow-hidden shadow-sm">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100 sticky top-0 z-10">
                  <th className="px-4 py-4 text-[10px] font-bold text-gray-900 uppercase tracking-widest">Data</th>
                  <th className="px-4 py-4 text-[10px] font-bold text-gray-900 uppercase tracking-widest">Descrição</th>
                  <th className="px-4 py-4 text-[10px] font-bold text-gray-900 uppercase tracking-widest">Valor</th>
                  <th className="px-4 py-4 text-[10px] font-bold text-gray-900 uppercase tracking-widest text-center">Status</th>
                  <th className="px-4 py-4 text-[10px] font-bold text-gray-900 uppercase tracking-widest text-center">Natureza</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 bg-white">
                {transactions.map((tx) => {
                  const cat = categories.find(c => c.id === tx.categoryId);
                  const sub = subcategories.find(s => s.id === tx.subcategoryId);
                  const isPositive = tx.transactionNature === TransactionNatures.CREDIT || tx.transactionNature === TransactionNatures.REFUND || tx.transactionNature === TransactionNatures.TRANSFER;

                  return (
                    <tr key={tx.id} className="hover:bg-gray-50/50 transition-colors text-gray-600">
                      <td className="px-4 py-3 font-medium text-sm">
                        {new Date(tx.date).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {tx.description}
                      </td>
                      <td className={`px-4 py-3 font-bold text-sm ${isPositive ? 'text-emerald-600' : 'text-gray-900'}`}>
                        {formatCurrency(tx.amount)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {cat ? (
                          <div className="inline-flex flex-col items-center">
                            <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded uppercase">{cat.name}</span>
                            <span className="text-[9px] text-gray-400 font-medium mt-0.5">{sub?.name || 'Outros'}</span>
                          </div>
                        ) : (
                          <span className="text-[10px] text-amber-600 font-bold uppercase tracking-tight bg-amber-50 px-3 py-1 rounded-md">
                            PENDENTE
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`text-[10px] font-bold px-3 py-1 rounded-md uppercase tracking-tight ${getNatureColor(tx.transactionNature)}`}>
                          {getNatureLabel(tx.transactionNature)}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-8 bg-gray-50/30 border-t border-gray-100 flex flex-col md:flex-row items-center justify-end gap-4">
          <button 
            onClick={onCancel}
            className="w-full md:w-auto px-10 py-4 bg-white border border-gray-200 text-gray-600 hover:text-gray-900 hover:border-gray-300 rounded-2xl text-sm font-bold transition-all shadow-sm"
          >
            Descartar Importação
          </button>
          <button 
            onClick={onConfirm}
            className="w-full md:w-auto px-12 py-4 bg-indigo-600 text-white hover:bg-indigo-700 rounded-2xl text-sm font-black transition-all shadow-xl shadow-indigo-100 flex items-center justify-center gap-3 active:scale-95"
          >
            <Save size={20} /> Salvar {transactions.length} Lançamentos
          </button>
        </div>
      </div>
    </div>
  );
};