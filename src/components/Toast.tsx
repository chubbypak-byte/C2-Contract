import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X, Zap } from 'lucide-react';

export interface ToastMessage {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'alert';
}

interface ToastProps {
  toast: ToastMessage | null;
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ toast, onClose }) => {
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      onClose();
    }, 4500);
    return () => clearTimeout(timer);
  }, [toast, onClose]);

  if (!toast) return null;

  const getStyle = (type: ToastMessage['type']) => {
    switch (type) {
      case 'success':
        return {
          bg: 'bg-white border-emerald-300 text-emerald-800 shadow-emerald-100',
          icon: <CheckCircle2 className="w-5 h-5 text-emerald-600" />,
        };
      case 'warning':
        return {
          bg: 'bg-white border-amber-300 text-amber-800 shadow-amber-100',
          icon: <AlertCircle className="w-5 h-5 text-amber-600" />,
        };
      case 'alert':
        return {
          bg: 'bg-white border-rose-300 text-rose-800 shadow-rose-100',
          icon: <AlertCircle className="w-5 h-5 text-rose-600" />,
        };
      case 'info':
      default:
        return {
          bg: 'bg-white border-sky-300 text-sky-800 shadow-sky-100',
          icon: <Zap className="w-5 h-5 text-sky-500" />,
        };
    }
  };

  const style = getStyle(toast.type);

  return (
    <div className="fixed top-20 right-4 z-50 max-w-sm w-full animate-in slide-in-from-top-4 duration-300">
      <div
        className={`p-4 rounded-2xl border shadow-lg flex items-start gap-3 ${style.bg}`}
      >
        <div className="shrink-0 mt-0.5">{style.icon}</div>
        <div className="flex-1 min-w-0">
          <h4 className="text-xs font-bold text-slate-900">{toast.title}</h4>
          <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
            {toast.message}
          </p>
        </div>
        <button
          onClick={onClose}
          className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
