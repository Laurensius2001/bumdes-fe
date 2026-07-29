'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CircularProgress, Stack } from '@mui/material';
import MainLayout from '@/components/pelanggan/layout/MainLayout';
import ModalUbahPassword from '@/components/pelanggan/ModalUbahPassword';

export default function PelangganLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [showChangePassword, setShowChangePassword] = useState(false);

  useEffect(() => {
    const isLoggedIn = localStorage.getItem('bumdes_logged_in');

    if (!isLoggedIn) {
      document.cookie = 'bumdes_logged_in=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      router.push('/login');
      return;
    }

    // RBAC: hanya pelanggan yang boleh akses
    const storedUser = localStorage.getItem('bumdes_user');
    if (storedUser) {
      const user = JSON.parse(storedUser);

      if (user.role !== 'pelanggan') {
        router.push('/admin/dashboard');
        return;
      }

      // Cek apakah password sudah pernah diganti
      const isPasswordChanged = user.isPasswordChanged ?? user.is_password_changed;
      if (isPasswordChanged === false) {
        setShowChangePassword(true);
      }
    } else {
      router.push('/login');
      return;
    }

    setIsLoading(false);
  }, [router]);

  const handlePasswordChanged = () => {
    setShowChangePassword(false);
  };

  if (isLoading) {
    return (
      <Stack height="100vh" alignItems="center" justifyContent="center">
        <CircularProgress />
      </Stack>
    );
  }

  return (
    <MainLayout>
      {children}
      <ModalUbahPassword open={showChangePassword} onSuccess={handlePasswordChanged} />
    </MainLayout>
  );
}
