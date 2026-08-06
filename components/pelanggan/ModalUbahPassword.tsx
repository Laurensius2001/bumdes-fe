'use client';

import { ReactElement, useState } from 'react';
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogContent,
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
          user.isPasswordChanged = true;
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
      {/* Header dengan tema Emerald Green */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
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
            <Typography variant="caption" color="rgba(255,255,255,0.85)">
              Wajib dilakukan sebelum menggunakan sistem
            </Typography>
          </Box>
        </Stack>
      </Box>

      <DialogContent sx={{ px: 3, py: 3 }}>
        {/* Info banner */}
        <Box
          sx={{
            bgcolor: '#ecfdf5',
            border: '1px solid #a7f3d0',
            borderRadius: 2,
            px: 2,
            py: 1.5,
            mb: 3,
            display: 'flex',
            alignItems: 'flex-start',
            gap: 1.25,
          }}
        >
          <IconifyIcon icon="solar:info-circle-bold" width={20} color="#059669" sx={{ mt: 0.2 }} />
          <Typography variant="body2" color="#047857" fontWeight={500}>
            Ini adalah login pertama Anda. Demi keamanan akun, Anda diwajibkan mengganti password
            sebelum dapat menggunakan sistem.
          </Typography>
        </Box>

        <form onSubmit={handleSubmit}>
          <Stack gap={2.5}>
            {/* Password Lama */}
            <div className="flex w-full flex-col gap-1.5">
              <label className="text-[13px] font-semibold text-slate-700" htmlFor="old-password">
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
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-[13px] text-slate-900 outline-none transition-all placeholder:text-slate-400 hover:border-slate-300 focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 disabled:opacity-50"
                />
                <button
                  type="button"
                  onClick={() => setShowOld(!showOld)}
                  disabled={isLoading}
                  className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center justify-center text-slate-400 transition-colors hover:text-slate-600 disabled:opacity-50"
                >
                  <IconifyIcon icon={showOld ? 'ic:baseline-key-off' : 'ic:baseline-key'} className="text-[18px]" />
                </button>
              </div>
            </div>

            <Divider />

            {/* Password Baru */}
            <div className="flex w-full flex-col gap-1.5">
              <label className="text-[13px] font-semibold text-slate-700" htmlFor="new-password">
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
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-[13px] text-slate-900 outline-none transition-all placeholder:text-slate-400 hover:border-slate-300 focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 disabled:opacity-50"
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  disabled={isLoading}
                  className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center justify-center text-slate-400 transition-colors hover:text-slate-600 disabled:opacity-50"
                >
                  <IconifyIcon icon={showNew ? 'ic:baseline-key-off' : 'ic:baseline-key'} className="text-[18px]" />
                </button>
              </div>
            </div>

            {/* Konfirmasi Password Baru */}
            <div className="flex w-full flex-col gap-1.5">
              <label className="text-[13px] font-semibold text-slate-700" htmlFor="confirm-password">
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
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-[13px] text-slate-900 outline-none transition-all placeholder:text-slate-400 hover:border-slate-300 focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 disabled:opacity-50"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  disabled={isLoading}
                  className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center justify-center text-slate-400 transition-colors hover:text-slate-600 disabled:opacity-50"
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
                background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                borderRadius: 2.5,
                fontWeight: 700,
                fontSize: '14px',
                textTransform: 'none',
                boxShadow: '0 4px 14px rgba(5, 150, 105, 0.25)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #047857 0%, #065f46 100%)',
                  boxShadow: '0 6px 18px rgba(5, 150, 105, 0.35)',
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
