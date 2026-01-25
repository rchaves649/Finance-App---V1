
import React from 'react';
import { useToast } from './ToastContext';
import { X, CheckCircle2, AlertCircle, Info } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useToast();

  const icons = {
    success: <CheckCircle2 size={18} className="text-emerald-500" />,
    error: <AlertCircle size={18} className="text-red-500" />,
    info: <Info size={18} className="text-indigo-500" />
  };

  const bgColors = {
    success: 'bg-emerald-50 border-emerald-100',
    error: 'bg-red-50 border-red-100',
    info: 'bg-indigo-50 border-indigo-100'
  };

  return (
    <div 
      className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 pointer-events-none"
      aria-live="polite"
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto flex items-center gap-3 p-4 rounded-2xl border shadow-lg animate-in slide-in-from-right-full duration-300 min-w-[300px] max-w-[400px] ${bgColors[toast.type]}`}
        >
          <div className="flex-shrink-0">
            {icons[toast.type]}
          </div>
          <p className="text-sm font-medium text-gray-800 flex-1">
            {toast.message}
          </p>
          <button
            onClick={() => removeToast(toast.id)}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1"
            aria-label="Fechar notificação"
          >
            <X size={16} />
          </button>
        </div>
      ))}
    </div>
  );
};
