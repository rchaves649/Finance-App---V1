import React, { memo } from 'react';
import { RotateCcw, EyeOff } from 'lucide-react';
import { Transaction, TransactionNatures } from '../../types/finance';
import { TransactionNatureSelector } from './TransactionNatureSelector';

interface RowNatureCellProps {
  tx: Transaction;
  isMigrated: boolean;
  isExcluded: boolean;
  onUpdate: (id: string, updates: Partial<Transaction>) => void;
}

const getNatureLabel = (nature: string) => {
  switch (nature) {
    case TransactionNatures.EXPENSE: return 'Despesa';
    case TransactionNatures.CREDIT: return 'Crédito';
    case TransactionNatures.REFUND: return 'Estorno';
    case TransactionNatures.PAYMENT: return 'Fatura';
    case TransactionNatures.INSTALLMENT_EXPENSE: return 'Parcelado';
    case TransactionNatures.TRANSFER: return 'Transferência';
    default: return 'Despesa';
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

export const RowNatureCell: React.FC<RowNatureCellProps> = memo(({ tx, isMigrated, isExcluded, onUpdate }) => {
  return (
    <td className="px-4 py-3 text-center min-w-[100px]">
      {tx.isConfirmed ? (
         <div className="flex flex-col items-center gap-1">
           <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md uppercase tracking-tight ${getNatureColor(tx.transactionNature)}`}>
             {getNatureLabel(tx.transactionNature)}
           </span>
           {isExcluded && (
             <span className="text-[8px] text-gray-400 font-bold flex items-center gap-1 uppercase">
               {tx.isNeutralized ? <RotateCcw size={8} /> : <EyeOff size={8} />} 
               {tx.isNeutralized ? 'Estornado' : 'Oculto'}
             </span>
           )}
         </div>
      ) : (
        <div className="flex justify-center">
          <TransactionNatureSelector
            value={tx.transactionNature}
            disabled={tx.isConfirmed || isMigrated}
            onChange={(val) => onUpdate(tx.id, { transactionNature: val })}
            compact
          />
        </div>
      )}
    </td>
  );
});