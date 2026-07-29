'use client';

import { Box, Typography } from '@mui/material';

export default function AdminTagihanPage() {
  return (
    <Box>
      <Typography variant="h4" fontWeight={700}>
        Tagihan
      </Typography>
      <Typography variant="body1" color="text.secondary" mt={1}>
        Halaman kelola tagihan pelanggan.
      </Typography>
    </Box>
  );
}
