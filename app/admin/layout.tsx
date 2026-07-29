'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import MainLayout from '@/components/admin/layout/MainLayout';
import { CircularProgress, Stack } from '@mui/material';
import { ToastContainer } from '@/components/Toast';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const isLoggedIn = localStorage.getItem('bumdes_logged_in');
    if (!isLoggedIn) {
      document.cookie = 'bumdes_logged_in=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      router.push('/login');
      return;
    }

    // RBAC: pelanggan tidak boleh akses area admin
    const storedUser = localStorage.getItem('bumdes_user');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      if (user.role === 'pelanggan') {
        router.push('/pelanggan/dashboard');
        return;
      }
    }

    setIsLoading(false);
  }, [router]);

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
      <ToastContainer />
    </MainLayout>
  );
}
