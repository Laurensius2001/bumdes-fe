'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CircularProgress, Stack } from '@mui/material';

export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    const isLoggedIn = localStorage.getItem('bumdes_logged_in') === 'true';

    if (!isLoggedIn) {
      router.push('/login');
      return;
    }

    const storedUser = localStorage.getItem('bumdes_user');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      if (user.role === 'pelanggan') {
        router.push('/pelanggan/dashboard');
      } else {
        router.push('/admin/dashboard');
      }
    } else {
      router.push('/admin/dashboard');
    }
  }, [router]);

  return (
    <Stack height="100vh" alignItems="center" justifyContent="center">
      <CircularProgress />
    </Stack>
  );
}
