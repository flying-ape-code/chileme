import React, { useEffect, useState } from 'react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastProps {
  message: string;
  type?: ToastType;
  duration?: number;
  onClose: () => void;
}

const Toast = ({ message, type = 'info', duration = 3000, onClose }: ToastProps) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300); // 等待动画结束
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const typeStyles = {
    success: 'bg-green-500/90 border-green-400 text-white',
    error: 'bg-red-500/90 border-red-400 text-white',
    warning: 'bg-yellow-500/90 border-yellow-400 text-white',
    info: 'bg-cyan-500/90 border-cyan-400 text-white'
  };

  const typeIcons = {
    success: '✅',
    error: '❌',
    warning: '⚠️',
    info: 'ℹ️'
  };

  if (!isVisible) return null;

  return (
    <div className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-[100] animate-in slide-in-from-top fade-in duration-300`}>
      <div className={`${typeStyles[type]} border rounded-lg px-6 py-3 shadow-2xl backdrop-blur-sm flex items-center gap-3 min-w-[280px] max-w-[90vw]`}>
        <span className="text-xl">{typeIcons[type]}</span>
        <span className="font-medium text-sm flex-1">{message}</span>
        <button
          onClick={() => {
            setIsVisible(false);
            setTimeout(onClose, 300);
          }}
          className="text-white/80 hover:text-white transition-colors text-lg"
        >
          ✕
        </button>
      </div>
    </div>
  );
};

export default Toast;
