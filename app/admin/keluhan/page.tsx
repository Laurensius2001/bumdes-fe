'use client';

import { Box, Typography } from '@mui/material';

export default function AdminKeluhanPage() {
  return (
    <Box>
      <Typography variant="h4" fontWeight={700}>
        Keluhan Pelanggan
      </Typography>
      <Typography variant="body1" color="text.secondary" mt={1}>
        Halaman kelola keluhan pelanggan.
      </Typography>
    </Box>
  );
}
