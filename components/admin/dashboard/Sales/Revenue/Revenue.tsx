'use client';
import { ReactElement } from 'react';
import { Box, Stack, Typography, useTheme } from '@mui/material';

const Revenue = (): ReactElement => {
  const theme = useTheme();
  return (
    <Stack
      bgcolor="common.white"
      borderRadius={5}
      minHeight={460}
      height={1}
      mx="auto"
      boxShadow={theme.shadows[4]}
      alignItems="center"
      justifyContent="center"
    >
      <Box sx={{ textAlign: 'center', p: 4 }}>
        <Typography variant="h5" color="text.primary" gutterBottom>
          Revenue
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Data grafik tidak tersedia
        </Typography>
      </Box>
    </Stack>
  );
};

export default Revenue;
