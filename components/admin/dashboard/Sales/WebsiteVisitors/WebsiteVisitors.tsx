'use client';
import { ReactElement } from 'react';
import { Box, Stack, Typography, useTheme } from '@mui/material';

const WebsiteVisitors = (): ReactElement => {
  const theme = useTheme();
  return (
    <Box
      sx={{
        bgcolor: 'common.white',
        borderRadius: 5,
        height: 'min-content',
        boxShadow: theme.shadows[4],
        p: 3,
        textAlign: 'center',
      }}
    >
      <Typography variant="subtitle1" color="text.primary" gutterBottom>
        Website Visitors
      </Typography>
      <Typography variant="body2" color="text.secondary">
        Data grafik tidak tersedia
      </Typography>
    </Box>
  );
};

export default WebsiteVisitors;
