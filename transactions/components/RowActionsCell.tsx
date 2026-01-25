
import React, { memo } from 'react';
import { Check, CheckCircle2 } from 'lucide-react';
import { Transaction } from '../../types/finance';
import { ConfirmationDialog } from './ConfirmationDialog';
import { TransactionMenu } from './TransactionMenu';

interface RowActionsCellProps {
  tx: Transaction;
  isMigrated: boolean;
  canConfirm: boolean;
  isConfirming: boolean;
  learnCategory: boolean;
  isRecurring: boolean;
  isMenuOpen: boolean;
  isShared: boolean;
  isInIndividualScope: boolean;
  setIsConfirming: (val: boolean) => void;
  setLearnCategory: (val: boolean) => void;
  setIsRecurring: (val: boolean) => void;
  onConfirm: (id: string, options: { learnCategory: boolean; isRecurring: boolean }) => void;
  onToggleMenu: () => void;
  handleEdit: () => void;
  onMoveToIndividual: (id: string, userId: 'A' | 'B') => void;
  onRevertToShared: (id: string) => void;
  onDelete: (id: string) => void;
  categoryName?: string;
}

export const RowActionsCell: React.FC<RowActionsCellProps> = memo(({ 
  tx, isMigrated, canConfirm, isConfirming, learnCategory, isRecurring, isMenuOpen, isShared, isInIndividualScope,
  setIsConfirming, setLearnCategory, setIsRecurring, onConfirm, onToggleMenu, handleEdit, onMoveToIndividual, onRevertToShared, onDelete, categoryName 
}) => (
  <td className="px-4 py-3 text-center min-w-[90px]">
    <div className="flex items-center justify-center gap-1">
      {!tx.isConfirmed && !isMigrated ? (
        <div className="relative">
          <ConfirmationDialog 
            isVisible={isConfirming} 
            learnCategory={learnCategory}
            isRecurring={isRecurring}
            onToggleLearnCategory={setLearnCategory}
            onToggleRecurring={setIsRecurring}
            onConfirm={() => { onConfirm(tx.id, { learnCategory, isRecurring }); setIsConfirming(false); }}
            onCancel={() => setIsConfirming(false)}
            categoryName={categoryName}
            description={tx.description}
          />
          <button
            onClick={() => { if(canConfirm) setIsConfirming(true); }}
            disabled={!canConfirm}
            className={`p-1 rounded-lg transition-all ${canConfirm ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100' : 'bg-gray-50 text-gray-300 cursor-not-allowed'}`}
          >
            <Check size={14} />
          </button>
        </div>
      ) : (
        <div className={`p-1 ${tx.isConfirmed ? 'text-emerald-500' : 'text-gray-300'}`}>
          <CheckCircle2 size={14} />
        </div>
      )}

      <TransactionMenu 
        isOpen={isMenuOpen}
        isShared={isShared}
        isInIndividualScope={isInIndividualScope}
        isConfirmed={tx.isConfirmed}
        onToggle={onToggleMenu}
        onEdit={handleEdit}
        onMoveToIndividual={(userId: 'A' | 'B') => onMoveToIndividual(tx.id, userId)}
        onRevertToShared={() => onRevertToShared(tx.id)}
        onDelete={() => onDelete(tx.id)}
      />
    </div>
  </td>
));
