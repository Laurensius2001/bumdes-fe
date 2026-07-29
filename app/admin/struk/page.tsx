'use client';

import { Box, Typography } from '@mui/material';

export default function AdminStrukPage() {
  return (
    <Box>
      <Typography variant="h4" fontWeight={700}>
        Struk Pembayaran
      </Typography>
      <Typography variant="body1" color="text.secondary" mt={1}>
        Halaman kelola struk pembayaran.
      </Typography>
    </Box>
  );
}
