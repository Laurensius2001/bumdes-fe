'use client';

import { useEffect, useState } from 'react';
import MainLayout from '@/components/pelanggan/layout/MainLayout';
import ModalUbahPassword from '@/components/pelanggan/ModalUbahPassword';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { useAuth } from '@/context/AuthContext';

export default function PelangganLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [showChangePassword, setShowChangePassword] = useState(false);

  useEffect(() => {
    if (user) {
      const isPasswordChanged = user.isPasswordChanged ?? user.is_password_changed;
      if (isPasswordChanged === false) {
        setShowChangePassword(true);
      }
    }
  }, [user]);

  const handlePasswordChanged = () => {
    setShowChangePassword(false);
  };

  return (
    <ProtectedRoute allowedRoles={['pelanggan']}>
      <MainLayout>
        {children}
        <ModalUbahPassword open={showChangePassword} onSuccess={handlePasswordChanged} />
      </MainLayout>
    </ProtectedRoute>
  );
}

