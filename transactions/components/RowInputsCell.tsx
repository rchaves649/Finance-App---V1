
import React, { memo } from 'react';
import { Transaction } from '../../types/finance';
import { CurrencyInput } from './CurrencyInput';
import { toCents, fromCents } from '../../shared/formatUtils';

interface RowInputsCellProps {
  tx: Transaction;
  isMigrated: boolean;
  isShareValid: boolean;
  userId?: string;
  onUpdate: (id: string, updates: Partial<Transaction>) => void;
}

export const RowInputsCell: React.FC<RowInputsCellProps> = memo(({ tx, isMigrated, isShareValid, userId, onUpdate }) => {
  if (isMigrated) {
    return (
      <td colSpan={2} className="px-2 py-3 text-center opacity-40">
        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter italic">Assumido por {userId}</span>
      </td>
    );
  }

  const handleUpdateA = (valA: number) => {
    const totalCents = toCents(tx.amount);
    const centsA = toCents(valA);
    const centsB = Math.max(0, totalCents - centsA);
    onUpdate(tx.id, { payerShare: { A: valA, B: fromCents(centsB) } });
  };

  const handleUpdateB = (valB: number) => {
    const totalCents = toCents(tx.amount);
    const centsB = toCents(valB);
    const centsA = Math.max(0, totalCents - centsB);
    onUpdate(tx.id, { payerShare: { A: fromCents(centsA), B: valB } });
  };

  return (
    <>
      <td className="px-2 py-3 min-w-[85px]">
        <div className="max-w-[70px] mx-auto">
          <CurrencyInput 
            value={tx.payerShare?.A || 0}
            disabled={tx.isConfirmed}
            isValid={isShareValid}
            onChange={handleUpdateA}
          />
        </div>
      </td>
      <td className="px-2 py-3 min-w-[85px]">
        <div className="max-w-[70px] mx-auto">
          <CurrencyInput 
            value={tx.payerShare?.B || 0}
            disabled={tx.isConfirmed}
            isValid={isShareValid}
            onChange={handleUpdateB}
          />
        </div>
      </td>
    </>
  );
});
