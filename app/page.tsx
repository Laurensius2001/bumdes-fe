'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CircularProgress, Stack } from '@mui/material';
import { useAuth } from '@/context/AuthContext';

export default function RootPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated || !user) {
        router.push('/login');
      } else if (user.role === 'pelanggan') {
        router.push('/pelanggan/dashboard');
      } else if (user.role === 'admin') {
        router.push('/admin/dashboard');
      } else {
        router.push('/login');
      }
    }
  }, [isLoading, isAuthenticated, user, router]);

  return (
    <Stack height="100vh" alignItems="center" justifyContent="center">
      <CircularProgress />
    </Stack>
  );
}

