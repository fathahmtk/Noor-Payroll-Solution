import React, { createContext, useState, useContext, useCallback } from 'react';
import type { ToastMessage } from '../types';

interface ToastContextType {
  addToast: (message: string, type: ToastMessage['type']) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToasts = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToasts must be used within a ToastProvider');
  }
  return context;
};

const Toast: React.FC<{ message: ToastMessage; onDismiss: () => void }> = ({ message, onDismiss }) => {
  React.useEffect(() => {
    const timer = setTimeout(onDismiss, 5000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  const baseClasses = "flex items-center w-full max-w-sm p-4 text-foreground bg-card rounded-lg shadow-xl border border-l-4";
  const typeClasses = {
    success: 'border-green-500',
    error: 'border-destructive',
    info: 'border-blue-500',
  };
  const iconContainerClasses = {
      success: 'bg-green-500/10 text-green-500',
      error: 'bg-destructive/10 text-destructive',
      info: 'bg-blue-500/10 text-blue-500',
  };
  
  const Icon = () => {
      switch(message.type) {
          case 'success': return <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path></svg>;
          case 'error': return <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"></path></svg>;
          case 'info': return <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"></path></svg>;
          default: return null;
      }
  };
  
  return (
    <div className={`${baseClasses} ${typeClasses[message.type]} animate-fade-in`} role="alert">
        <div className={`inline-flex items-center justify-center flex-shrink-0 w-8 h-8 rounded-lg ${iconContainerClasses[message.type]}`}>
            <Icon />
            <span className="sr-only">{message.type} icon</span>
        </div>
        <div className="ml-3 text-sm font-normal">{message.message}</div>
        <button type="button" className="ml-auto -mx-1.5 -my-1.5 bg-card text-muted-foreground hover:text-foreground rounded-lg focus:ring-2 focus:ring-ring p-1.5 hover:bg-secondary inline-flex h-8 w-8" onClick={onDismiss} aria-label="Close">
            <span className="sr-only">Close</span>
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"></path></svg>
        </button>
    </div>
  );
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = useCallback((message: string, type: ToastMessage['type']) => {
    setToasts((prevToasts) => [...prevToasts, { id: Date.now(), message, type }]);
  }, []);

  const removeToast = useCallback((id: number) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div className="fixed top-5 right-5 z-[100] space-y-2">
        {toasts.map((toast) => (
          <Toast key={toast.id} message={toast} onDismiss={() => removeToast(toast.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
};