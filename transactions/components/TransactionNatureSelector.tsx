import React from 'react';
import { TransactionNature, TransactionNatures } from '../../types/finance';

interface TransactionNatureSelectorProps {
  value: TransactionNature;
  disabled?: boolean;
  onChange: (value: TransactionNature) => void;
  compact?: boolean;
}

const NATURE_OPTIONS: { value: TransactionNature; label: string; short: string; color: string }[] = [
  { value: TransactionNatures.EXPENSE, label: 'Despesa', short: 'Despesa', color: 'bg-red-400' },
  { value: TransactionNatures.CREDIT, label: 'Crédito', short: 'Crédito', color: 'bg-emerald-400' },
  { value: TransactionNatures.REFUND, label: 'Estorno', short: 'Estorno', color: 'bg-amber-400' },
  { value: TransactionNatures.PAYMENT, label: 'Fatura', short: 'Fatura', color: 'bg-blue-400' },
  { value: TransactionNatures.INSTALLMENT_EXPENSE, label: 'Parcelado', short: 'Parcelado', color: 'bg-purple-500' },
  { value: TransactionNatures.TRANSFER, label: 'Transferência entre contas', short: 'Transferência', color: 'bg-slate-400' },
];

export const TransactionNatureSelector: React.FC<TransactionNatureSelectorProps> = ({ value, disabled, onChange, compact }) => {
  const currentOption = NATURE_OPTIONS.find(o => o.value === value) || NATURE_OPTIONS[0];

  return (
    <div className={`flex flex-col gap-1 w-full ${compact ? 'max-w-[100px]' : 'min-w-[140px] max-w-[170px]'}`}>
      <div className="relative">
        <select
          disabled={disabled}
          value={value}
          onChange={(e) => onChange(e.target.value as TransactionNature)}
          className={`appearance-none ${compact ? 'pl-2 pr-6 py-1.5' : 'pl-8 pr-8 py-2'} border border-gray-200 rounded-lg text-[9px] font-bold bg-white focus:ring-2 focus:ring-indigo-500 outline-none w-full transition-all ${
            disabled ? 'opacity-60 bg-gray-50 cursor-not-allowed' : 'hover:border-indigo-300'
          }`}
        >
          {NATURE_OPTIONS.map(opt => (
            <option key={opt.value} value={opt.value} className="py-2 text-xs">
              {opt.label}
            </option>
          ))}
        </select>
        <div className={`absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none`}>
          <svg className="h-3 w-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
    </div>
  );
};