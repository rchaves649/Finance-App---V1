
import React, { memo } from 'react';
import { User, Repeat } from 'lucide-react';
import { Transaction } from '../../types/finance';
import { formatCurrency } from '../../shared/formatUtils';

interface RowInfoCellProps {
  tx: Transaction;
  isMigrated: boolean;
  isExcluded: boolean;
  userId?: string;
}

/**
 * Formata data ISO para exibição local brasileira sem usar o fuso horário do objeto Date.
 */
function formatLocalDate(isoDate: string): string {
  if (!isoDate) return '';
  const parts = isoDate.split('T')[0].split('-');
  return `${parts[2]}/${parts[1]}/${parts[0]}`;
}

export const RowInfoCell: React.FC<RowInfoCellProps> = memo(({ tx, isMigrated, isExcluded, userId }) => (
  <>
    <td className={`px-4 py-3 text-[13px] font-medium whitespace-nowrap min-w-[85px] ${isMigrated || (isExcluded && tx.isConfirmed) ? 'opacity-40 grayscale' : ''}`}>
      {formatLocalDate(tx.date)}
    </td>
    <td className={`px-4 py-3 min-w-[150px] ${isMigrated || (isExcluded && tx.isConfirmed) ? 'opacity-40 grayscale' : ''}`}>
      <div className="flex flex-col">
        <span className={`text-[13px] truncate max-w-[150px] ${isExcluded && tx.isConfirmed ? 'line-through decoration-gray-400 opacity-60' : ''}`}>
          {tx.description}
        </span>
        {isMigrated && (
          <span className="text-[8px] text-gray-400 font-medium flex items-center gap-1 mt-0.5 whitespace-nowrap uppercase tracking-tighter">
            <User size={8} /> {userId}
          </span>
        )}
        {tx.isRecurring && (
          <span className="text-[8px] text-indigo-400 font-bold flex items-center gap-1 mt-0.5 uppercase tracking-tighter">
            <Repeat size={8} /> Recorrente
          </span>
        )}
      </div>
    </td>
    <td className={`px-4 py-3 text-[13px] font-bold whitespace-nowrap min-w-[95px] ${isMigrated || (isExcluded && tx.isConfirmed) ? 'opacity-40 grayscale line-through' : ''}`}>
      {formatCurrency(tx.amount)}
    </td>
  </>
));
