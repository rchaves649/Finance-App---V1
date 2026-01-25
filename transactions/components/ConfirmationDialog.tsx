
import React from 'react';
import { Tag, Repeat } from 'lucide-react';

interface ConfirmationDialogProps {
  isVisible: boolean;
  learnCategory: boolean;
  isRecurring: boolean;
  onToggleLearnCategory: (val: boolean) => void;
  onToggleRecurring: (val: boolean) => void;
  onConfirm: () => void;
  onCancel: () => void;
  categoryName?: string;
  description?: string;
}

export const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  isVisible,
  learnCategory,
  isRecurring,
  onToggleLearnCategory,
  onToggleRecurring,
  onConfirm,
  onCancel,
  categoryName,
  description
}) => {
  if (!isVisible) return null;

  return (
    <div 
      className="fixed inset-0 z-[200] flex items-center justify-center bg-gray-900/40 backdrop-blur-[2px] p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-title"
    >
      <div 
        className="bg-white p-6 rounded-3xl shadow-2xl border border-gray-100 max-w-sm w-full animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 id="confirm-title" className="text-lg font-bold text-gray-900 mb-6">Confirmar lançamento?</h3>
        
        <div className="space-y-4 mb-8">
          <label className="flex items-start gap-3 cursor-pointer group">
            <div className="relative flex items-center pt-0.5">
              <input 
                type="checkbox" 
                checked={learnCategory}
                onChange={(e) => onToggleLearnCategory(e.target.checked)}
                className="w-5 h-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 transition-all cursor-pointer"
              />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold text-gray-700 group-hover:text-indigo-600 transition-colors flex items-center gap-1.5">
                <Tag size={14} /> Memorizar categoria
              </span>
              <span className="text-[11px] text-gray-500 leading-tight mt-0.5">
                Sugerir automaticamente {categoryName ? `[${categoryName}]` : 'esta categoria'} para compras em [{description || 'este estabelecimento'}] no futuro.
              </span>
            </div>
          </label>

          <label className="flex items-start gap-3 cursor-pointer group">
            <div className="relative flex items-center pt-0.5">
              <input 
                type="checkbox" 
                checked={isRecurring}
                onChange={(e) => onToggleRecurring(e.target.checked)}
                className="w-5 h-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 transition-all cursor-pointer"
              />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold text-gray-700 group-hover:text-indigo-600 transition-colors flex items-center gap-1.5">
                <Repeat size={14} /> Salvar como recorrente
              </span>
              <span className="text-[11px] text-gray-500 leading-tight mt-0.5">
                Sempre aplicar a mesma divisão de pagamento entre as pessoas para esta despesa.
              </span>
            </div>
          </label>
        </div>

        <div className="flex gap-3">
          <button 
            onClick={onConfirm}
            className="flex-1 px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-sm font-bold transition-all shadow-md active:scale-95"
          >
            Confirmar
          </button>
          <button 
            onClick={onCancel}
            className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-2xl text-sm font-bold transition-all active:scale-95"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};
