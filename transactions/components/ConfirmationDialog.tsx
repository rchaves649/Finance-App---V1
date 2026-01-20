
import React from 'react';

interface ConfirmationDialogProps {
  isVisible: boolean;
  isRecurring: boolean;
  onToggleRecurring: (val: boolean) => void;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  isVisible,
  isRecurring,
  onToggleRecurring,
  onConfirm,
  onCancel
}) => {
  if (!isVisible) return null;

  return (
    <div className="absolute right-0 bottom-full mb-2 bg-white p-3 rounded-xl shadow-xl border border-gray-100 z-50 flex flex-col gap-3 min-w-[200px]">
      <p className="text-xs font-bold text-gray-700">Confirmar lançamento?</p>
      <label className="flex items-center gap-2 cursor-pointer">
        <input 
          type="checkbox" 
          checked={isRecurring}
          onChange={(e) => onToggleRecurring(e.target.checked)}
          className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
        />
        <span className="text-xs text-gray-600">Salvar como recorrente</span>
      </label>
      <div className="flex gap-2">
        <button 
          onClick={onConfirm}
          className="flex-1 px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-bold"
        >
          Sim
        </button>
        <button 
          onClick={onCancel}
          className="flex-1 px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg text-xs font-bold"
        >
          Não
        </button>
      </div>
    </div>
  );
};
