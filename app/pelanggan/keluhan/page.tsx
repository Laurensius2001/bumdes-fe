'use client';

import { Box, Button, Card, CardContent, Chip, Stack, Typography } from '@mui/material';
import IconifyIcon from '@/components/common/IconifyIcon';

export default function PelangganKeluhanPage() {
  return (
    <Box>
      {/* Header */}
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={4}>
        <Box>
          <Typography variant="h4" fontWeight={700} color="text.primary">
            Keluhan Saya
          </Typography>
          <Typography variant="body1" color="text.secondary" mt={0.5}>
            Ajukan dan pantau keluhan layanan internet Anda.
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<IconifyIcon icon="solar:add-circle-bold" width={20} />}
          sx={{
            background: 'linear-gradient(135deg, #695cfe 0%, #4f46e5 100%)',
            borderRadius: 2,
            fontWeight: 600,
            px: 3,
            py: 1.2,
            '&:hover': {
              background: 'linear-gradient(135deg, #5a4fe0 0%, #3d35c8 100%)',
            },
          }}
        >
          Ajukan Keluhan
        </Button>
      </Stack>

      {/* Empty state */}
      <Card
        elevation={0}
        sx={{
          borderRadius: 3,
          border: '1px solid',
          borderColor: 'divider',
          py: 8,
        }}
      >
        <CardContent>
          <Stack alignItems="center" gap={2}>
            <Box
              sx={{
                width: 80,
                height: 80,
                backgroundColor: '#f3f4f6',
                borderRadius: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <IconifyIcon
                icon="material-symbols:chat-error-outline"
                width={40}
                color="#9ca3af"
              />
            </Box>
            <Box textAlign="center">
              <Typography variant="h6" fontWeight={600} color="text.primary" mb={0.5}>
                Belum Ada Keluhan
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Anda belum mengajukan keluhan apapun. Jika mengalami kendala,
                <br />
                klik tombol <strong>Ajukan Keluhan</strong> di atas.
              </Typography>
            </Box>
            <Chip
              icon={<IconifyIcon icon="solar:verified-check-bold" width={16} />}
              label="Layanan berjalan normal"
              sx={{
                bgcolor: '#d1fae5',
                color: '#065f46',
                fontWeight: 600,
                mt: 1,
              }}
            />
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}
