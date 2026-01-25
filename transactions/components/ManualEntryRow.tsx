
import React, { useMemo, memo } from 'react';
import { Trash2, CheckCircle2, Info } from 'lucide-react';
import { Category, Subcategory, ScopeType, TransactionNature, TransactionNatures } from '../../types/finance';
import { CategorySelector } from './CategorySelector';
import { SubcategorySelector } from './SubcategorySelector';
import { CurrencyInput } from './CurrencyInput';
import { TransactionNatureSelector } from './TransactionNatureSelector';
import { toCents, fromCents } from '../../shared/formatUtils';

export interface DraftTransaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  transactionNature: TransactionNature;
  categoryId?: string;
  subcategoryId?: string;
  payerShare?: { A: number; B: number };
}

interface ManualEntryRowProps {
  draft: DraftTransaction;
  categories: Category[];
  subcategories: Subcategory[];
  scopeType: ScopeType;
  defaultSplit?: { A: number, B: number };
  onUpdate: (id: string, updates: Partial<DraftTransaction>) => void;
  onSave: () => void;
  onDelete: (id: string) => void;
  isFirst: boolean;
  showValidation: boolean;
}

export const ManualEntryRow: React.FC<ManualEntryRowProps> = memo(({
  draft,
  categories,
  subcategories,
  scopeType,
  defaultSplit,
  onUpdate,
  onSave,
  onDelete,
  isFirst,
  showValidation
}, ) => {
  const isShared = scopeType === 'shared';

  const errors = useMemo(() => {
    const errs: Record<string, string> = {};
    if (!draft.date) errs.date = "Obrigatório";
    if (!draft.description.trim()) errs.description = "Obrigatório";
    else if (draft.description.trim().length < 2) errs.description = "Muito curta";
    
    if (draft.amount <= 0) errs.amount = "Inválido";

    const isExcluded = draft.transactionNature === TransactionNatures.REFUND || 
                      draft.transactionNature === TransactionNatures.PAYMENT;

    if (!isExcluded) {
      if (!draft.categoryId) errs.category = "Obrigatório";
      if (!draft.subcategoryId) errs.subcategory = "Obrigatório";
    }

    if (isShared && draft.payerShare) {
      const totalCents = toCents(draft.amount);
      const shareACents = toCents(draft.payerShare.A);
      const shareBCents = toCents(draft.payerShare.B);
      if (Math.abs(totalCents - (shareACents + shareBCents)) > 1) {
        errs.split = "Soma incorreta";
      }
    }
    return errs;
  }, [draft.date, draft.description, draft.amount, draft.transactionNature, draft.categoryId, draft.subcategoryId, draft.payerShare, isShared]);

  const isValid = Object.keys(errors).length === 0;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && isValid) {
      onSave();
    }
  };

  const handleUpdateAmount = (val: number) => {
    const updates: Partial<DraftTransaction> = { amount: val };
    if (isShared && draft.payerShare) {
      const newTotalCents = toCents(val);
      const oldTotalCents = toCents(draft.amount);
      
      if (oldTotalCents > 0) {
        // Regra de três baseada em inteiros (centavos) para evitar imprecisão de float
        const oldCentsA = toCents(draft.payerShare.A);
        const newCentsA = Math.round((oldCentsA * newTotalCents) / oldTotalCents);
        updates.payerShare = { 
          A: fromCents(newCentsA), 
          B: fromCents(Math.max(0, newTotalCents - newCentsA)) 
        };
      } else {
        const splitA = defaultSplit?.A ?? 50;
        const newCentsA = Math.round((newTotalCents * splitA) / 100);
        updates.payerShare = { 
          A: fromCents(newCentsA), 
          B: fromCents(Math.max(0, newTotalCents - newCentsA)) 
        };
      }
    }
    onUpdate(draft.id, updates);
  };

  const inputClass = (field: string) => `
    w-full p-2 border rounded-lg text-sm bg-white outline-none shadow-sm transition-all
    ${showValidation && errors[field] 
      ? 'border-red-300 bg-red-50 focus:ring-red-200' 
      : 'border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500'}
  `;

  return (
    <tr 
      className={`group transition-colors ${isValid && draft.description ? 'hover:bg-emerald-50/30' : 'hover:bg-gray-50/50'}`} 
      onKeyDown={handleKeyDown}
    >
      <td className="px-3 py-2 align-top">
        <input 
          type="date" 
          value={draft.date}
          onChange={(e) => onUpdate(draft.id, { date: e.target.value })}
          className={inputClass('date')}
        />
        {showValidation && errors.date && <span className="text-[10px] text-red-500 font-bold mt-1 block">{errors.date}</span>}
      </td>

      <td className="px-3 py-2 align-top">
        <input 
          type="text" 
          placeholder="Descrição..."
          value={draft.description}
          onChange={(e) => onUpdate(draft.id, { description: e.target.value })}
          className={inputClass('description')}
        />
        {showValidation && errors.description && <span className="text-[10px] text-red-500 font-bold mt-1 block">{errors.description}</span>}
      </td>

      <td className="px-3 py-2 align-top">
        <CurrencyInput 
          value={draft.amount}
          disabled={false}
          isValid={!(showValidation && errors.amount)}
          onChange={handleUpdateAmount}
        />
        {showValidation && errors.amount && <span className="text-[10px] text-red-500 font-bold mt-1 block">{errors.amount}</span>}
      </td>

      {isShared && (
        <>
          <td className="px-3 py-2 align-top">
            <CurrencyInput 
              value={draft.payerShare?.A || 0}
              disabled={false}
              isValid={!(showValidation && errors.split)}
              onChange={(v) => onUpdate(draft.id, { payerShare: { A: v, B: fromCents(toCents(draft.amount) - toCents(v)) } })}
            />
          </td>
          <td className="px-3 py-2 align-top">
            <CurrencyInput 
              value={draft.payerShare?.B || 0}
              disabled={false}
              isValid={!(showValidation && errors.split)}
              onChange={(v) => onUpdate(draft.id, { payerShare: { B: v, A: fromCents(toCents(draft.amount) - toCents(v)) } })}
            />
            {showValidation && errors.split && <span className="text-[10px] text-red-500 font-bold mt-1 block">{errors.split}</span>}
          </td>
        </>
      )}

      <td className="px-3 py-2 align-top">
        <TransactionNatureSelector 
          value={draft.transactionNature}
          onChange={(val) => onUpdate(draft.id, { transactionNature: val })}
          compact
        />
      </td>

      <td className="px-3 py-2 align-top">
        <CategorySelector 
          categories={categories}
          value={draft.categoryId}
          hasError={showValidation && !!errors.category}
          onChange={(val) => onUpdate(draft.id, { categoryId: val, subcategoryId: undefined })}
        />
        {showValidation && errors.category && <span className="text-[10px] text-red-500 font-bold mt-1 block">{errors.category}</span>}
      </td>

      <td className="px-3 py-2 align-top">
        <SubcategorySelector 
          subcategories={subcategories}
          categoryId={draft.categoryId}
          value={draft.subcategoryId}
          hasError={showValidation && !!errors.subcategory}
          onChange={(val) => onUpdate(draft.id, { subcategoryId: val })}
        />
        {showValidation && errors.subcategory && <span className="text-[10px] text-red-500 font-bold mt-1 block">{errors.subcategory}</span>}
      </td>

      <td className="px-3 py-2 text-center align-top">
        <div className="flex items-center justify-center gap-2 pt-1">
          {isValid && draft.description.length >= 2 ? (
            <CheckCircle2 size={18} className="text-emerald-500 animate-in zoom-in duration-300" />
          ) : (
            <button 
              onClick={() => onDelete(draft.id)}
              disabled={isFirst && draft.description === '' && draft.amount === 0}
              className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-30"
            >
              <Trash2 size={18} />
            </button>
          )}
        </div>
      </td>
    </tr>
  );
}, (prev, next) => {
  // Otimização de renderização: Evita re-render se o rascunho for o mesmo e dependências estáveis
  return prev.draft === next.draft && 
         prev.showValidation === next.showValidation &&
         prev.categories === next.categories &&
         prev.subcategories === next.subcategories;
});
