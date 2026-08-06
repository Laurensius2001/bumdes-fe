'use client';

import MainLayout from '@/components/admin/layout/MainLayout';
import { ToastContainer } from '@/components/Toast';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <MainLayout>
        {children}
        <ToastContainer />
      </MainLayout>
    </ProtectedRoute>
  );
}

