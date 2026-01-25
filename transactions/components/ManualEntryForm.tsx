
import React, { useState, useCallback } from 'react';
import { ArrowLeft, Plus, Save, AlertCircle } from 'lucide-react';
import { Category, Subcategory, ScopeType, TransactionNatures } from '../../types/finance';
import { ManualEntryRow, DraftTransaction } from './ManualEntryRow';
import { toISODate } from '../../shared/dateUtils';
import { toCents } from '../../shared/formatUtils';
import { useToast } from '../../shared/ToastContext';

interface ManualEntryFormProps {
  categories: Category[];
  subcategories: Subcategory[];
  scopeType: ScopeType;
  defaultSplit?: { A: number, B: number };
  onBack: () => void;
  onSaveBatch: (drafts: DraftTransaction[]) => void;
}

const createInitialDraft = (isShared: boolean): DraftTransaction => ({
  id: crypto.randomUUID(),
  date: toISODate(new Date()),
  description: '',
  amount: 0,
  transactionNature: TransactionNatures.EXPENSE,
  payerShare: isShared ? { A: 0, B: 0 } : undefined
});

export const ManualEntryForm: React.FC<ManualEntryFormProps> = ({
  categories,
  subcategories,
  scopeType,
  defaultSplit,
  onBack,
  onSaveBatch
}) => {
  const isShared = scopeType === 'shared';
  const { showToast } = useToast();
  const [drafts, setDrafts] = useState<DraftTransaction[]>([createInitialDraft(isShared)]);
  const [showValidation, setShowValidation] = useState(false);

  const handleUpdate = useCallback((id: string, updates: Partial<DraftTransaction>) => {
    setDrafts(prev => prev.map(d => d.id === id ? { ...d, ...updates } : d));
  }, []);

  const handleRemove = useCallback((id: string) => {
    setDrafts(prev => prev.length > 1 ? prev.filter(d => d.id !== id) : prev);
  }, []);

  const validateDraft = (d: DraftTransaction) => {
    if (!d.date || !d.description.trim() || d.description.trim().length < 2 || d.amount <= 0) return false;
    
    const isExcluded = d.transactionNature === TransactionNatures.REFUND || 
                      d.transactionNature === TransactionNatures.PAYMENT;

    if (!isExcluded) {
      if (!d.categoryId || !d.subcategoryId) return false;
    }

    if (isShared && d.payerShare) {
      const totalCents = toCents(d.amount);
      const shareACents = toCents(d.payerShare.A);
      const shareBCents = toCents(d.payerShare.B);
      if (Math.abs(totalCents - (shareACents + shareBCents)) > 1) return false;
    }
    return true;
  };

  const handleSaveAll = () => {
    setShowValidation(true);
    const activeDrafts = drafts.filter(d => d.description.trim() !== '' || d.amount > 0);
    
    if (activeDrafts.length === 0) {
      showToast('Nenhum lançamento preenchido para salvar.', 'info');
      return;
    }

    const invalidRows = activeDrafts.filter(d => !validateDraft(d));
    if (invalidRows.length > 0) {
      showToast(`Verifique as ${invalidRows.length} linha(s) com erros destacados.`, 'error');
      return;
    }

    onSaveBatch(activeDrafts);
    onBack();
  };

  const handleAddNewRow = useCallback(() => {
    setDrafts(prev => [...prev, createInitialDraft(isShared)]);
  }, [isShared]);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Entrada Manual</h2>
          <p className="text-gray-500">Preencha os campos e salve em lote.</p>
        </div>
        <button 
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2 text-gray-500 hover:text-indigo-600 font-medium transition-colors bg-white border border-gray-200 rounded-xl shadow-sm"
        >
          <ArrowLeft size={18} />
          <span>Voltar para lista</span>
        </button>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse table-fixed min-w-[1100px]">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="px-4 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest w-32">Data</th>
                <th className="px-4 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest min-w-[200px]">Descrição</th>
                <th className="px-4 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest w-28">Valor</th>
                {isShared && (
                  <>
                    <th className="px-4 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest w-28">Valor A</th>
                    <th className="px-4 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest w-28">Valor B</th>
                  </>
                )}
                <th className="px-4 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest w-32">Natureza</th>
                <th className="px-4 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest w-40">Categoria</th>
                <th className="px-4 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest w-40">Subcategoria</th>
                <th className="px-4 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center w-20">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {drafts.map((draft, idx) => (
                <ManualEntryRow 
                  key={draft.id}
                  draft={draft}
                  categories={categories}
                  subcategories={subcategories}
                  scopeType={scopeType}
                  defaultSplit={defaultSplit}
                  isFirst={drafts.length === 1}
                  showValidation={showValidation}
                  onUpdate={handleUpdate}
                  onSave={handleAddNewRow}
                  onDelete={handleRemove}
                />
              ))}
              <tr className="h-10 border-none"><td colSpan={isShared ? 9 : 7}></td></tr>
            </tbody>
          </table>
        </div>
        
        <div className="p-8 bg-gray-50/50 flex flex-col md:flex-row items-center justify-center gap-6 border-t border-gray-100">
          <button 
            onClick={handleAddNewRow}
            className="flex items-center gap-2 px-6 py-3.5 bg-white border border-gray-200 text-gray-600 hover:text-indigo-600 hover:border-indigo-200 rounded-2xl text-sm font-bold transition-all shadow-sm"
          >
            <Plus size={18} /> Adicionar outra linha (Enter)
          </button>

          <button 
            onClick={handleSaveAll}
            className="flex items-center gap-2 px-10 py-3.5 bg-indigo-600 text-white hover:bg-indigo-700 rounded-2xl text-sm font-bold transition-all shadow-lg shadow-indigo-100 active:scale-95"
          >
            <Save size={18} /> Salvar Lançamentos
          </button>
        </div>
      </div>

      <div className="bg-indigo-50/50 p-5 rounded-2xl border border-indigo-100/50 flex items-start gap-3">
        <AlertCircle size={18} className="text-indigo-600 mt-0.5" />
        <div className="text-xs text-indigo-700 leading-relaxed font-medium">
          <p><strong>Dicas de Atalho:</strong></p>
          <ul className="list-disc ml-4 mt-1 space-y-1">
            <li><strong>Enter:</strong> Adiciona nova linha se a atual for válida.</li>
            <li><strong>Tab:</strong> Navega entre campos de forma fluida.</li>
            <li><strong>Esc:</strong> Limpa o conteúdo da linha atual.</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
