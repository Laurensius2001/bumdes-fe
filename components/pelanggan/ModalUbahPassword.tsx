'use client';

import { ReactElement, useState } from 'react';
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  Stack,
  Typography,
} from '@mui/material';
import IconifyIcon from '@/components/common/IconifyIcon';
import { authService } from '@/services/authService';
import { Notify } from 'notiflix/build/notiflix-notify-aio';

interface ModalUbahPasswordProps {
  open: boolean;
  onSuccess: () => void;
}

const ModalUbahPassword = ({ open, onSuccess }: ModalUbahPasswordProps): ReactElement => {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!oldPassword || !newPassword || !confirmPassword) {
      Notify.failure('Semua field wajib diisi.', { position: 'center-top' });
      return;
    }

    if (newPassword !== confirmPassword) {
      Notify.failure('Password baru dan konfirmasi password tidak cocok.', {
        position: 'center-top',
      });
      return;
    }

    if (newPassword.length < 6) {
      Notify.failure('Password baru minimal 6 karakter.', { position: 'center-top' });
      return;
    }

    setIsLoading(true);
    try {
      const response = await authService.changePassword({
        old_password: oldPassword,
        new_password: newPassword,
        confirm_password: confirmPassword,
      });

      if (response.ok && response.data?.success) {
        // Update is_password_changed di localStorage
        const storedUser = localStorage.getItem('bumdes_user');
        if (storedUser) {
          const user = JSON.parse(storedUser);
          user.is_password_changed = true;
          localStorage.setItem('bumdes_user', JSON.stringify(user));
        }

        Notify.success('Password berhasil diubah. Selamat datang!', { position: 'center-top' });
        onSuccess();
      } else {
        Notify.failure(response.data?.message || 'Gagal mengubah password.', {
          position: 'center-top',
        });
      }
    } catch (error) {
      console.error('Change password error:', error);
      Notify.failure('Terjadi kesalahan pada server. Silakan coba lagi.', {
        position: 'center-top',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      disableEscapeKeyDown
      onClose={(_, reason) => {
        // Tidak bisa ditutup dengan klik backdrop
        if (reason === 'backdropClick') return;
      }}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          overflow: 'hidden',
        },
      }}
    >
      {/* Header dengan accent color */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #695cfe 0%, #4f46e5 100%)',
          px: 3,
          py: 2.5,
        }}
      >
        <Stack direction="row" alignItems="center" gap={1.5}>
          <Box
            sx={{
              width: 40,
              height: 40,
              backgroundColor: 'rgba(255,255,255,0.2)',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <IconifyIcon icon="solar:lock-password-bold" width={22} color="#fff" />
          </Box>
          <Box>
            <Typography variant="h6" fontWeight={700} color="#fff">
              Ubah Password
            </Typography>
            <Typography variant="caption" color="rgba(255,255,255,0.8)">
              Wajib dilakukan sebelum menggunakan sistem
            </Typography>
          </Box>
        </Stack>
      </Box>

      <DialogContent sx={{ px: 3, py: 3 }}>
        {/* Info banner */}
        <Box
          sx={{
            bgcolor: '#fff8e1',
            border: '1px solid #ffe082',
            borderRadius: 2,
            px: 2,
            py: 1.5,
            mb: 3,
            display: 'flex',
            alignItems: 'flex-start',
            gap: 1,
          }}
        >
          <IconifyIcon icon="solar:info-circle-bold" width={20} color="#f59e0b" sx={{ mt: 0.2 }} />
          <Typography variant="body2" color="#92400e">
            Ini adalah login pertama Anda. Demi keamanan akun, Anda diwajibkan mengganti password
            sebelum dapat menggunakan sistem.
          </Typography>
        </Box>

        <form onSubmit={handleSubmit}>
          <Stack gap={2.5}>
            {/* Password Lama */}
            <div className="flex w-full flex-col gap-1.5">
              <label className="text-[13px] font-semibold text-gray-700" htmlFor="old-password">
                Password Lama
              </label>
              <div className="relative w-full">
                <input
                  id="old-password"
                  type={showOld ? 'text' : 'password'}
                  placeholder="Masukkan password lama"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  disabled={isLoading}
                  className="w-full rounded-lg border border-gray-200 bg-gray-50/50 px-4 py-2.5 text-[13px] text-gray-900 outline-none transition-colors placeholder:text-gray-400 hover:border-gray-300 focus:border-[#6b42ff] focus:bg-white disabled:opacity-50"
                />
                <button
                  type="button"
                  onClick={() => setShowOld(!showOld)}
                  disabled={isLoading}
                  className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center justify-center text-gray-400 transition-colors hover:text-gray-600 disabled:opacity-50"
                >
                  <IconifyIcon icon={showOld ? 'ic:baseline-key-off' : 'ic:baseline-key'} className="text-[18px]" />
                </button>
              </div>
            </div>

            <Divider />

            {/* Password Baru */}
            <div className="flex w-full flex-col gap-1.5">
              <label className="text-[13px] font-semibold text-gray-700" htmlFor="new-password">
                Password Baru
              </label>
              <div className="relative w-full">
                <input
                  id="new-password"
                  type={showNew ? 'text' : 'password'}
                  placeholder="Masukkan password baru (min. 6 karakter)"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  disabled={isLoading}
                  className="w-full rounded-lg border border-gray-200 bg-gray-50/50 px-4 py-2.5 text-[13px] text-gray-900 outline-none transition-colors placeholder:text-gray-400 hover:border-gray-300 focus:border-[#6b42ff] focus:bg-white disabled:opacity-50"
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  disabled={isLoading}
                  className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center justify-center text-gray-400 transition-colors hover:text-gray-600 disabled:opacity-50"
                >
                  <IconifyIcon icon={showNew ? 'ic:baseline-key-off' : 'ic:baseline-key'} className="text-[18px]" />
                </button>
              </div>
            </div>

            {/* Konfirmasi Password Baru */}
            <div className="flex w-full flex-col gap-1.5">
              <label className="text-[13px] font-semibold text-gray-700" htmlFor="confirm-password">
                Konfirmasi Password Baru
              </label>
              <div className="relative w-full">
                <input
                  id="confirm-password"
                  type={showConfirm ? 'text' : 'password'}
                  placeholder="Ulangi password baru"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={isLoading}
                  className="w-full rounded-lg border border-gray-200 bg-gray-50/50 px-4 py-2.5 text-[13px] text-gray-900 outline-none transition-colors placeholder:text-gray-400 hover:border-gray-300 focus:border-[#6b42ff] focus:bg-white disabled:opacity-50"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  disabled={isLoading}
                  className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center justify-center text-gray-400 transition-colors hover:text-gray-600 disabled:opacity-50"
                >
                  <IconifyIcon icon={showConfirm ? 'ic:baseline-key-off' : 'ic:baseline-key'} className="text-[18px]" />
                </button>
              </div>
            </div>

            <Button
              variant="contained"
              fullWidth
              type="submit"
              disabled={isLoading}
              sx={{
                mt: 1,
                py: 1.5,
                background: 'linear-gradient(135deg, #695cfe 0%, #4f46e5 100%)',
                borderRadius: 2,
                fontWeight: 700,
                fontSize: '15px',
                '&:hover': {
                  background: 'linear-gradient(135deg, #5a4fe0 0%, #3d35c8 100%)',
                },
              }}
            >
              {isLoading ? (
                <Stack direction="row" alignItems="center" gap={1}>
                  <CircularProgress size={18} color="inherit" />
                  <span>Menyimpan...</span>
                </Stack>
              ) : (
                'Simpan Password Baru'
              )}
            </Button>
          </Stack>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ModalUbahPassword;
