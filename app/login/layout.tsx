'use client';

import { ReactNode } from 'react';
import { ToastContainer } from '@/components/Toast';

export default function LoginLayout({ children }: { children: ReactNode }) {
  return (
    <main className="min-h-screen w-full bg-[#0b0e14] text-white font-sans">
      {children}
      <ToastContainer />
    </main>
  );
}
