'use client';

import React, { useState, useEffect } from 'react';
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
  fields: FormField[];
  onSubmit: (data: Record<string, any>) => void;
  columns?: 1 | 2 | 3;
  submitText?: string;
  cancelText?: string;
  initialData?: Record<string, any>;
  onFieldChange?: (name: string, value: any) => void;
};

const DEFAULT_INITIAL_DATA = {};

export default function FormModal({
  isOpen,
  onClose,
  title,
  icon,
  fields,
  onSubmit,
  columns = 1,
  submitText = 'Simpan Data',
  cancelText = 'Batal',
  initialData = DEFAULT_INITIAL_DATA,
  onFieldChange,
}: FormModalProps) {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [openDropdowns, setOpenDropdowns] = useState<Record<string, boolean>>({});
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

  const toggleDropdown = (name: string) => {
    setOpenDropdowns((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  const closeDropdown = (name: string) => {
    setOpenDropdowns((prev) => ({ ...prev, [name]: false }));
  };

  const selectOption = (fieldName: string, value: string | number) => {
    handleChange(fieldName, value);
    setOpenDropdowns((prev) => ({ ...prev, [fieldName]: false }));
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
          className="fixed inset-0 bg-[#0f172a]/40 backdrop-blur-[2px] transition-opacity"
        />

        {/* Modal Box */}
        <div className="relative w-full max-w-[500px] transform rounded-[20px] bg-white shadow-2xl transition-all flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            {/* Icon — always shown, default fallback if none passed */}
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-indigo-50">
              <IconifyIcon icon={icon || 'lucide:file-text'} className="text-[20px] text-indigo-500" />
            </div>
            <h2 className="text-[16px] font-bold text-gray-900">{title}</h2>
          </div>
          {/* Close button — same shape & color as icon */}
          <button 
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-400 hover:bg-indigo-100 hover:text-indigo-600 transition-colors"
          >
            <IconifyIcon icon="lucide:x" className="text-[18px]" />
          </button>
        </div>

        {/* Form Body */}
        <div className="px-6 py-2">
          <form id="dynamic-form" onSubmit={handleSubmit} className={`grid gap-4 ${getGridColsClass()}`}>
            {fields.map((field) => (
              <div 
                key={field.name} 
                className={`flex flex-col gap-1.5 transition-all duration-200 ${field.colSpan ? `sm:col-span-${field.colSpan}` : ''}`}
              >
                <label className="text-[12px] font-semibold text-gray-700">
                  {field.label} {field.required && <span className="text-red-500">*</span>}
                </label>

                {field.type === 'select' ? (
                  <div
                    className="relative"
                    tabIndex={0}
                    onBlur={(e) => {
                      if (!e.currentTarget.contains(e.relatedTarget)) {
                        closeDropdown(field.name);
                      }
                    }}
                  >
                    {/* Trigger — looks exactly like an input box */}
                    <button
                      type="button"
                      onClick={() => toggleDropdown(field.name)}
                      className={`w-full flex items-center justify-between rounded-lg border bg-white px-3 py-2 pr-3 text-[13px] outline-none transition-colors text-left ${
                        errors[field.name]
                          ? 'border-red-500'
                          : openDropdowns[field.name]
                          ? 'border-[#6b42ff]'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <span className={formData[field.name] ? 'text-gray-800' : 'text-gray-400'}>
                        {formData[field.name]
                          ? field.options?.find(o => String(o.value) === String(formData[field.name]))?.label
                          : (field.placeholder || `Pilih ${field.label}`)}
                      </span>
                      <IconifyIcon
                        icon="lucide:chevron-down"
                        className={`text-gray-400 text-sm flex-shrink-0 transition-transform duration-200 ${openDropdowns[field.name] ? 'rotate-180' : ''}`}
                      />
                    </button>

                    {/* Custom styled list */}
                    {openDropdowns[field.name] && (
                      <div className="absolute left-0 top-full z-30 mt-1 w-full overflow-hidden rounded-xl border border-gray-100 bg-white shadow-xl">
                        <div className="max-h-[200px] overflow-y-auto p-1">
                          {field.options?.map((opt) => (
                            <button
                              key={opt.value}
                              type="button"
                              onMouseDown={() => selectOption(field.name, opt.value)}
                              className={`w-full rounded-lg px-3 py-2 text-left text-[13px] transition-colors ${
                                String(formData[field.name]) === String(opt.value)
                                  ? 'bg-[#6b42ff] font-semibold text-white'
                                  : 'font-medium text-gray-700 hover:bg-gray-50'
                              }`}
                            >
                              {opt.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : field.type === 'textarea' ? (
                  <textarea
                    value={formData[field.name] || ''}
                    onChange={(e) => handleChange(field.name, e.target.value)}
                    placeholder={field.placeholder}
                    rows={4}
                    className={`w-full resize-none rounded-lg border bg-white px-3 py-2 text-[13px] text-gray-900 outline-none transition-colors placeholder:text-gray-400 ${
                      errors[field.name] ? 'border-red-500 focus:border-red-500' : 'border-gray-200 focus:border-[#6b42ff] hover:border-gray-300'
                    }`}
                  />
                ) : field.type === 'money' ? (
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-[13px] font-medium">Rp</span>
                    <input
                      type="text"
                      value={formData[field.name] ? Number(formData[field.name]).toLocaleString('id-ID') : ''}
                      onChange={(e) => {
                        const val = e.target.value.replace(/[^0-9]/g, '');
                        handleChange(field.name, val ? Number(val) : '');
                      }}
                      placeholder={field.placeholder}
                      className={`w-full rounded-lg border bg-white pl-9 pr-3 py-2 text-[13px] text-gray-900 outline-none transition-colors placeholder:text-gray-400 ${
                        errors[field.name] ? 'border-red-500 focus:border-red-500' : 'border-gray-200 focus:border-[#6b42ff] hover:border-gray-300'
                      }`}
                    />
                  </div>
                ) : (
                  <input
                    type={field.type}
                    value={formData[field.name] || ''}
                    onChange={(e) => handleChange(field.name, e.target.value)}
                    placeholder={field.placeholder}
                    className={`w-full rounded-lg border bg-white px-3 py-2 text-[13px] text-gray-900 outline-none transition-colors placeholder:text-gray-400 ${
                      errors[field.name] ? 'border-red-500 focus:border-red-500' : 'border-gray-200 focus:border-[#6b42ff] hover:border-gray-300'
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
        <div className="flex items-center justify-end gap-3 px-6 pt-4 pb-6">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-[#f1f5f9] px-6 py-2 text-[13px] font-bold text-gray-600 transition-colors hover:bg-gray-200"
          >
            {cancelText}
          </button>
          <button
            type="submit"
            form="dynamic-form"
            className="rounded-lg bg-[#5936f1] px-6 py-2 text-[13px] font-bold text-white shadow-sm transition-colors hover:bg-[#4a2cd1]"
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
