'use client';
import { ReactElement } from 'react';
import { Box, Stack, Typography, useTheme } from '@mui/material';

const BuyersProfile = (): ReactElement => {
  const theme = useTheme();
  return (
    <Stack
      sx={{
        bgcolor: 'common.white',
        borderRadius: 5,
        height: 1,
        flex: '1 1 auto',
        width: { xs: 'auto', sm: 0.5, lg: 'auto' },
        boxShadow: theme.shadows[4],
        alignItems: 'center',
        justifyContent: 'center',
        p: 3,
      }}
    >
      <Typography variant="subtitle1" color="text.primary" gutterBottom>
        Buyers Profile
      </Typography>
      <Typography variant="body2" color="text.secondary">
        Data grafik tidak tersedia
      </Typography>
    </Stack>
  );
};

export default BuyersProfile;
