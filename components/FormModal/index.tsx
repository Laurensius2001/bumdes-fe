'use client';

import React, { useState, useEffect, ReactNode, useRef } from 'react';
import { createPortal } from 'react-dom';
import IconifyIcon from '@/components/common/IconifyIcon';

export type FormField = {
  name: string;
  label: string;
  type: 'text' | 'number' | 'email' | 'select' | 'textarea' | 'money';
  placeholder?: string;
  options?: { label: string; value: string | number }[]; // For select type
  required?: boolean;
  colSpan?: 1 | 2 | 3; // Allow specific fields to span multiple columns
  validate?: (value: any) => string | null;
};

export type FormModalProps = {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  icon?: string;
  fields?: FormField[];
  onSubmit: (data: Record<string, any>) => void;
  columns?: 1 | 2 | 3;
  submitText?: string;
  cancelText?: string;
  initialData?: Record<string, any>;
  onFieldChange?: (name: string, value: any) => void;
  children?: ReactNode;
  maxWidth?: string;
};

const DEFAULT_INITIAL_DATA = {};

function CustomSelectField({
  field,
  value,
  error,
  onChange,
}: {
  field: FormField;
  value: any;
  error?: string;
  onChange: (val: any) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [coords, setCoords] = useState<{ top: number; left: number; width: number }>({ top: 0, left: 0, width: 0 });

  const updateCoords = () => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setCoords({
        top: rect.bottom + 6,
        left: rect.left,
        width: rect.width,
      });
    }
  };

  const handleToggle = () => {
    if (!isOpen) {
      updateCoords();
    }
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    if (!isOpen) return;

    const handleScrollOrResize = () => {
      updateCoords();
    };

    window.addEventListener('scroll', handleScrollOrResize, true);
    window.addEventListener('resize', handleScrollOrResize);

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        triggerRef.current &&
        !triggerRef.current.contains(target) &&
        !(target as Element).closest('.select-portal-dropdown')
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      window.removeEventListener('scroll', handleScrollOrResize, true);
      window.removeEventListener('resize', handleScrollOrResize);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const selectedOption = field.options?.find((o) => String(o.value) === String(value));

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={handleToggle}
        className={`w-full flex items-center justify-between rounded-xl border bg-white px-3.5 py-2.5 text-[13px] outline-none transition-all text-left ${
          error
            ? 'border-red-500 ring-2 ring-red-100'
            : isOpen
            ? 'border-emerald-500 ring-4 ring-emerald-100/80 shadow-sm'
            : 'border-slate-200 hover:border-emerald-300'
        }`}
      >
        <span className={selectedOption ? 'font-semibold text-slate-900' : 'text-slate-400 font-medium'}>
          {selectedOption ? selectedOption.label : field.placeholder || `Pilih ${field.label}`}
        </span>
        <IconifyIcon
          icon="lucide:chevron-down"
          className={`text-slate-400 text-sm flex-shrink-0 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-emerald-600' : ''
          }`}
        />
      </button>

      {isOpen &&
        typeof window !== 'undefined' &&
        createPortal(
          <div
            className="select-portal-dropdown fixed z-[10000] overflow-hidden rounded-2xl border border-emerald-100 bg-white p-1.5 shadow-[0_20px_50px_rgba(16,185,129,0.2),0_10px_20px_rgba(0,0,0,0.08)] backdrop-blur-md animate-in fade-in zoom-in-95 duration-100"
            style={{
              top: `${coords.top}px`,
              left: `${coords.left}px`,
              width: `${coords.width}px`,
            }}
          >
            <div className="max-h-[220px] overflow-y-auto space-y-1 p-0.5 custom-scrollbar">
              {field.options && field.options.length > 0 ? (
                field.options.map((opt) => {
                  const isSelected = String(value) === String(opt.value);
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => {
                        onChange(opt.value);
                        setIsOpen(false);
                      }}
                      className={`w-full rounded-xl px-3.5 py-2.5 text-left text-[12.5px] transition-all flex items-center justify-between gap-2 ${
                        isSelected
                          ? 'bg-emerald-600 font-bold text-white shadow-md shadow-emerald-600/20'
                          : 'font-medium text-slate-700 hover:bg-emerald-50/70 hover:text-emerald-600'
                      }`}
                    >
                      <span className="truncate">{opt.label}</span>
                      {isSelected && (
                        <IconifyIcon icon="lucide:check" className="text-sm shrink-0 text-white" />
                      )}
                    </button>
                  );
                })
              ) : (
                <div className="p-3 text-center text-xs text-slate-400 italic">
                  Tidak ada pilihan tersedia
                </div>
              )}
            </div>
          </div>,
          document.body
        )}
    </>
  );
}

export default function FormModal({
  isOpen,
  onClose,
  title,
  icon,
  fields = [],
  onSubmit,
  columns = 1,
  submitText = 'Simpan Data',
  cancelText = 'Batal',
  initialData = DEFAULT_INITIAL_DATA,
  onFieldChange,
  children,
  maxWidth = 'max-w-[500px]',
}: FormModalProps) {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [mounted, setMounted] = useState(false);

  // Handle SSR
  useEffect(() => {
    setMounted(true);
  }, []);

  // Reset form when opened with new initialData
  useEffect(() => {
    if (isOpen) {
      setFormData(initialData);
      setErrors({});
    }
  }, [isOpen, initialData]);

  if (!isOpen || !mounted) return null;

  const handleChange = (name: string, value: any) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // Notify parent about field changes
    onFieldChange?.(name, value);
    
    // Real-time validation
    const field = fields.find(f => f.name === name);
    if (field?.validate) {
      const errorMsg = field.validate(value);
      if (errorMsg) {
        setErrors((prev) => ({ ...prev, [name]: errorMsg }));
      } else {
        setErrors((prev) => ({ ...prev, [name]: '' }));
      }
    } else if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    const newErrors: Record<string, string> = {};
    let isValid = true;

    fields.forEach((field) => {
      const value = formData[field.name];

      if (field.required && (!value || String(value).trim() === '')) {
        newErrors[field.name] = `${field.label} wajib diisi`;
        isValid = false;
      } else if (field.validate) {
        const errorMsg = field.validate(value);
        if (errorMsg) {
          newErrors[field.name] = errorMsg;
          isValid = false;
        }
      }
    });

    if (!isValid) {
      setErrors(newErrors);
      return;
    }

    onSubmit(formData);
  };

  // Determine grid columns class
  const getGridColsClass = () => {
    switch (columns) {
      case 2: return 'sm:grid-cols-2';
      case 3: return 'sm:grid-cols-3';
      default: return 'grid-cols-1';
    }
  };

  const modalContent = (
    <div className="fixed inset-0 z-[9999] overflow-y-auto">
      <div className="flex min-h-full items-center justify-center p-4">
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity"
        />

        {/* Modal Box */}
        <div className={`relative w-full ${maxWidth} transform rounded-2xl bg-white shadow-2xl transition-all flex flex-col border border-slate-200/80`}>
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-slate-200/80">
          <div className="flex items-center gap-3">
            {/* Icon Box */}
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600">
              <IconifyIcon icon={icon || 'lucide:file-text'} className="text-xl text-emerald-600" />
            </div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900">{title}</h2>
          </div>
          {/* Close button */}
          <button 
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition-colors"
          >
            <IconifyIcon icon="lucide:x" className="text-base" />
          </button>
        </div>

        {/* Form Body */}
        <div className="px-6 py-4 overflow-y-auto max-h-[75vh]">
          {children}
          <form id="dynamic-form" onSubmit={handleSubmit} className={`grid gap-4 ${getGridColsClass()} ${children ? 'mt-4' : ''}`}>
            {fields.map((field) => (
              <div 
                key={field.name} 
                className={`flex flex-col gap-1.5 transition-all duration-200 ${field.colSpan ? `sm:col-span-${field.colSpan}` : ''}`}
              >
                <label className="text-[12px] font-semibold text-slate-700">
                  {field.label} {field.required && <span className="text-red-500">*</span>}
                </label>

                {field.type === 'select' ? (
                  <CustomSelectField
                    field={field}
                    value={formData[field.name]}
                    error={errors[field.name]}
                    onChange={(val) => handleChange(field.name, val)}
                  />
                ) : field.type === 'textarea' ? (
                  <textarea
                    value={formData[field.name] || ''}
                    onChange={(e) => handleChange(field.name, e.target.value)}
                    placeholder={field.placeholder}
                    rows={4}
                    className={`w-full resize-none rounded-xl border bg-white px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 outline-none transition-colors placeholder:text-slate-400 ${
                      errors[field.name] ? 'border-red-500 focus:border-red-500' : 'border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 hover:border-slate-300'
                    }`}
                  />
                ) : field.type === 'money' ? (
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 text-xs sm:text-sm font-medium">Rp</span>
                    <input
                      type="text"
                      value={formData[field.name] ? Number(formData[field.name]).toLocaleString('id-ID') : ''}
                      onChange={(e) => {
                        const val = e.target.value.replace(/[^0-9]/g, '');
                        handleChange(field.name, val ? Number(val) : '');
                      }}
                      placeholder={field.placeholder}
                      className={`w-full rounded-xl border bg-white pl-9 pr-3.5 py-2.5 text-xs sm:text-sm text-slate-900 outline-none transition-colors placeholder:text-slate-400 ${
                        errors[field.name] ? 'border-red-500 focus:border-red-500' : 'border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 hover:border-slate-300'
                      }`}
                    />
                  </div>
                ) : (
                  <input
                    type={field.type}
                    value={formData[field.name] || ''}
                    onChange={(e) => handleChange(field.name, e.target.value)}
                    placeholder={field.placeholder}
                    className={`w-full rounded-xl border bg-white px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 outline-none transition-colors placeholder:text-slate-400 ${
                      errors[field.name] ? 'border-red-500 focus:border-red-500' : 'border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 hover:border-slate-300'
                    }`}
                  />
                )}

                {/* Error Message */}
                {errors[field.name] && (
                  <span className="text-[11px] font-medium text-red-500">
                    {errors[field.name]}
                  </span>
                )}
              </div>
            ))}
          </form>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2.5 px-6 pt-4 pb-6 border-t border-slate-200/80">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-slate-100 hover:bg-slate-200 px-4 py-2 text-xs sm:text-sm font-semibold text-slate-600 transition-colors"
          >
            {cancelText}
          </button>
          <button
            type="submit"
            form="dynamic-form"
            className="rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 px-4 py-2 text-xs sm:text-sm font-semibold text-white shadow-sm shadow-emerald-600/20 transition-all"
          >
            {submitText}
          </button>
        </div>

        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}

