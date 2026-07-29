'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import IconifyIcon from '@/components/common/IconifyIcon';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastMessage {
  id: string;
  type: ToastType;
  message: string;
  title?: string;
}

// Simple event emitter for toasts
const listeners = new Set<(toast: ToastMessage) => void>();

export const toast = {
  show: (type: ToastType, message: string, title?: string) => {
    const newToast = { id: Math.random().toString(36).substring(2, 9), type, message, title };
    listeners.forEach((listener) => listener(newToast));
  },
  success: (message: string, title?: string) => toast.show('success', message, title),
  error: (message: string, title?: string) => toast.show('error', message, title),
  warning: (message: string, title?: string) => toast.show('warning', message, title),
  info: (message: string, title?: string) => toast.show('info', message, title),
};

type ToastStyle = {
  bar: string;       // left accent bar color
  iconColor: string; // icon text color
  iconBg: string;    // icon background
  icon: string;      // iconify icon name
  title: string;     // title text color
  msg: string;       // message text color
  closeHover: string;
};

const getStyle = (type: ToastType): ToastStyle => {
  switch (type) {
    case 'success':
      return {
        bar: 'bg-[#00e5b0]',
        iconColor: 'text-[#00e5b0]',
        iconBg: 'bg-[#00e5b0]/10',
        icon: 'lucide:check-circle-2',
        title: 'text-white',
        msg: 'text-gray-400',
        closeHover: 'hover:bg-white/10 hover:text-white',
      };
    case 'error':
      return {
        bar: 'bg-red-500',
        iconColor: 'text-red-400',
        iconBg: 'bg-red-500/10',
        icon: 'lucide:x-circle',
        title: 'text-white',
        msg: 'text-gray-400',
        closeHover: 'hover:bg-white/10 hover:text-white',
      };
    case 'warning':
      return {
        bar: 'bg-amber-400',
        iconColor: 'text-amber-400',
        iconBg: 'bg-amber-400/10',
        icon: 'lucide:alert-triangle',
        title: 'text-white',
        msg: 'text-gray-400',
        closeHover: 'hover:bg-white/10 hover:text-white',
      };
    default:
      return {
        bar: 'bg-[#6b42ff]',
        iconColor: 'text-[#a5b4fc]',
        iconBg: 'bg-[#6b42ff]/15',
        icon: 'lucide:info',
        title: 'text-white',
        msg: 'text-gray-400',
        closeHover: 'hover:bg-white/10 hover:text-white',
      };
  }
};

export function ToastContainer() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const listener = (toastMsg: ToastMessage) => {
      setToasts((prev) => [...prev, toastMsg]);

      // Auto dismiss after 4 seconds
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== toastMsg.id));
      }, 4000);
    };
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);

  if (!mounted) return null;

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const toastUI = (
    <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[9999] flex flex-col gap-3 pointer-events-none w-full max-w-sm px-4">
      {toasts.map((t) => {
        const style = getStyle(t.type);
        return (
          <div
            key={t.id}
            className="pointer-events-auto flex w-full items-start gap-3.5 rounded-2xl border border-white/[0.07] bg-[#171b29] p-4 shadow-2xl shadow-black/40 relative overflow-hidden"
          >
            {/* Left accent bar */}
            <div className={`absolute top-0 left-0 w-1 h-full ${style.bar} rounded-l-2xl`} />

            {/* Icon */}
            <div className={`flex-shrink-0 flex items-center justify-center w-9 h-9 rounded-xl text-[20px] ${style.iconBg} ${style.iconColor} ml-1`}>
              <IconifyIcon icon={style.icon} />
            </div>

            {/* Text */}
            <div className="flex-1 py-0.5 min-w-0">
              {t.title && (
                <h4 className={`text-[13px] font-bold mb-0.5 ${style.title}`}>{t.title}</h4>
              )}
              <p className={`text-[12px] leading-snug ${style.msg}`}>{t.message}</p>
            </div>

            {/* Close button */}
            <button
              onClick={() => removeToast(t.id)}
              className={`flex-shrink-0 rounded-lg p-1.5 text-gray-500 transition-colors -mr-1 -mt-1 ${style.closeHover}`}
            >
              <IconifyIcon icon="lucide:x" className="text-[14px]" />
            </button>
          </div>
        );
      })}
    </div>
  );

  return createPortal(toastUI, document.body);
}
