'use client';

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import IconifyIcon from '@/components/common/IconifyIcon';

export interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
  isLoading?: boolean;
}

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Hapus',
  cancelText = 'Batal',
  type = 'danger',
  isLoading = false,
}: ConfirmModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isOpen || !mounted) return null;

  const colors = {
    danger: {
      iconBg: 'bg-red-50',
      iconText: 'text-red-500',
      btnBg: 'bg-red-600 hover:bg-red-700',
      btnFocus: 'focus:ring-red-500',
      icon: 'lucide:alert-triangle',
    },
    warning: {
      iconBg: 'bg-yellow-50',
      iconText: 'text-yellow-600',
      btnBg: 'bg-yellow-500 hover:bg-yellow-600',
      btnFocus: 'focus:ring-yellow-400',
      icon: 'lucide:alert-circle',
    },
    info: {
      iconBg: 'bg-indigo-50',
      iconText: 'text-indigo-500',
      btnBg: 'bg-indigo-600 hover:bg-indigo-700',
      btnFocus: 'focus:ring-indigo-500',
      icon: 'lucide:info',
    },
  };

  const style = colors[type];

  const modalContent = (
    <div className="fixed inset-0 z-[9999] overflow-y-auto">
      <div className="flex min-h-full items-center justify-center p-4">
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-[#0f172a]/40 backdrop-blur-[2px] transition-opacity"
          onClick={() => !isLoading && onClose()}
        />

        {/* Modal Box */}
        <div className="relative w-full max-w-[400px] transform rounded-[20px] bg-white p-6 shadow-2xl transition-all flex flex-col items-center text-center">
          
          {/* Icon */}
          <div className={`mx-auto flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full ${style.iconBg} mb-4`}>
            <IconifyIcon icon={style.icon} className={`text-[24px] ${style.iconText}`} />
          </div>

          {/* Title & Message */}
          <h3 className="text-[18px] font-bold text-gray-900 mb-2">
            {title}
          </h3>
          <div className="text-[13px] text-gray-500 mb-6 px-2">
            {message}
          </div>

          {/* Actions */}
          <div className="flex w-full gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 rounded-xl bg-gray-100 px-4 py-2.5 text-[13px] font-bold text-gray-700 transition-colors hover:bg-gray-200 disabled:opacity-50"
            >
              {cancelText}
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={isLoading}
              className={`flex-1 rounded-xl px-4 py-2.5 text-[13px] font-bold text-white shadow-sm transition-colors disabled:opacity-50 ${style.btnBg} flex items-center justify-center gap-2`}
            >
              {isLoading && <IconifyIcon icon="lucide:loader-2" className="animate-spin text-base" />}
              {isLoading ? 'Memproses...' : confirmText}
            </button>
          </div>

        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
