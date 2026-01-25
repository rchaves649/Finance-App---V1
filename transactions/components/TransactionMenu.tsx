
import React from 'react';
import { MoreVertical, User, RotateCcw, Trash2, Edit2 } from 'lucide-react';

interface TransactionMenuProps {
  isOpen: boolean;
  isShared: boolean;
  isInIndividualScope: boolean;
  isConfirmed: boolean;
  onToggle: () => void;
  onEdit: () => void;
  onMoveToIndividual: (userId: 'A' | 'B') => void;
  onRevertToShared: () => void;
  onDelete: () => void;
  'aria-label'?: string;
}

export const TransactionMenu: React.FC<TransactionMenuProps> = ({
  isOpen,
  isShared,
  isInIndividualScope,
  isConfirmed,
  onToggle,
  onEdit,
  onMoveToIndividual,
  onRevertToShared,
  onDelete,
  'aria-label': ariaLabel
}) => {
  return (
    <div className="relative">
      <button
        onClick={onToggle}
        aria-label={ariaLabel || "Abrir menu de ações"}
        aria-expanded={isOpen}
        aria-haspopup="true"
        className="p-2 rounded-lg text-gray-400 hover:bg-gray-100 transition-colors"
      >
        <MoreVertical size={18} />
      </button>
      
      {isOpen && (
        <div 
          className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 z-[60] overflow-hidden py-1"
          role="menu"
        >
          {isConfirmed && (
             <button 
              onClick={onEdit}
              role="menuitem"
              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-indigo-600 hover:bg-indigo-50 transition-colors font-medium text-left"
            >
              <Edit2 size={16} /> Editar Lançamento
            </button>
          )}

          {isShared && (
            <>
              {!isInIndividualScope ? (
                <>
                  <button 
                    onClick={() => onMoveToIndividual('A')}
                    role="menuitem"
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors text-left"
                  >
                    <User size={16} /> Mover para Pessoa A
                  </button>
                  <button 
                    onClick={() => onMoveToIndividual('B')}
                    role="menuitem"
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors text-left"
                  >
                    <User size={16} /> Mover para Pessoa B
                  </button>
                </>
              ) : (
                <button 
                  onClick={onRevertToShared}
                  role="menuitem"
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-indigo-600 hover:bg-indigo-50 transition-all font-semibold text-left"
                >
                  <RotateCcw size={16} /> Reverter para Escopo Conjunto
                </button>
              )}
            </>
          )}
          <div className="border-t border-gray-50 my-1"></div>
          <button
            onClick={onDelete}
            role="menuitem"
            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors text-left"
          >
            <Trash2 size={16} /> Excluir
          </button>
        </div>
      )}
    </div>
  );
};
