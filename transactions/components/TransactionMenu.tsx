
import React from 'react';
import { MoreVertical, User, RotateCcw, Trash2 } from 'lucide-react';

interface TransactionMenuProps {
  isOpen: boolean;
  isShared: boolean;
  isInIndividualScope: boolean;
  onToggle: () => void;
  onMoveToIndividual: (userId: 'A' | 'B') => void;
  onRevertToShared: () => void;
  onDelete: () => void;
}

export const TransactionMenu: React.FC<TransactionMenuProps> = ({
  isOpen,
  isShared,
  isInIndividualScope,
  onToggle,
  onMoveToIndividual,
  onRevertToShared,
  onDelete
}) => {
  return (
    <div className="relative">
      <button
        onClick={onToggle}
        className="p-2 rounded-lg text-gray-400 hover:bg-gray-100 transition-colors"
      >
        <MoreVertical size={18} />
      </button>
      
      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 z-[60] overflow-hidden py-1">
          {isShared && (
            <>
              {!isInIndividualScope ? (
                <>
                  <button 
                    onClick={() => onMoveToIndividual('A')}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                  >
                    <User size={16} /> Move to Person A
                  </button>
                  <button 
                    onClick={() => onMoveToIndividual('B')}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                  >
                    <User size={16} /> Move to Person B
                  </button>
                </>
              ) : (
                <button 
                  onClick={onRevertToShared}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-indigo-600 hover:bg-indigo-50 transition-all font-semibold"
                >
                  <RotateCcw size={16} /> Revert to Shared Scope
                </button>
              )}
              <div className="border-t border-gray-50 my-1"></div>
            </>
          )}
          <button
            onClick={onDelete}
            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
          >
            <Trash2 size={16} /> Excluir
          </button>
        </div>
      )}
    </div>
  );
};
