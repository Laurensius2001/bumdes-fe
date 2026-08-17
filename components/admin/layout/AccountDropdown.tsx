import {
  Avatar,
  Divider,
  Menu,
  MenuItem,
  Typography,
} from '@mui/material';
import IconifyIcon from '@/components/common/IconifyIcon';
import { MouseEvent, ReactElement, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { getApiAssetUrl } from '@/services/api';

const AccountDropdown = (): ReactElement => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const { user, logout } = useAuth();
  const router = useRouter();

  const userName = user?.username || 'User';
  const userRole = user?.role === 'admin' ? 'Administrator' : 'Pelanggan BUMDes';
  const avatarUrl = getApiAssetUrl(user?.foto_profil);

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleNavigateProfile = () => {
    handleClose();
    if (user?.role === 'admin') {
      router.push('/admin/profile');
    } else {
      router.push('/pelanggan/profile');
    }
  };

  const handleLogout = () => {
    handleClose();
    logout();
  };

  return (
    <>
      <button
        id="account-dropdown-button"
        aria-controls={open ? 'account-dropdown-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
        onClick={handleClick}
        className="flex items-center space-x-2.5 cursor-pointer p-1 rounded-xl hover:bg-slate-100 transition-colors focus:outline-none"
      >
        <div className="relative">
          <Avatar
            alt={userName}
            src={avatarUrl}
            imgProps={{
              onError: (e: any) => {
                e.currentTarget.src = '/assets/profile.jpg';
              },
            }}
            sx={{ width: 34, height: 34, border: '2px solid #e2e8f0' }}
          />
        </div>
        <div className="hidden md:block text-left pr-1">
          <p className="text-xs font-semibold text-slate-700 leading-tight">{userName}</p>
          <p className="text-[10px] text-slate-400 leading-tight">BTS Sodong Net</p>
        </div>
        <IconifyIcon
          icon={open ? 'lucide:chevron-up' : 'lucide:chevron-down'}
          className="text-[10px] text-slate-400 hidden md:block"
        />
      </button>

      <Menu
        id="account-dropdown-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        disableScrollLock={true}
        MenuListProps={{
          'aria-labelledby': 'account-dropdown-button',
          sx: { py: 1, width: 220 },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        slotProps={{
          paper: {
            elevation: 0,
            sx: {
              mt: 1.5,
              border: '1px solid #e2e8f0',
              boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
              borderRadius: '12px',
            },
          },
        }}
      >
        <div className="px-4 py-2 pb-3">
          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1f2937', fontSize: '14px' }}>
            {userName}
          </Typography>
          <Typography variant="body2" sx={{ color: '#6b7280', fontSize: '12px' }}>
            {userRole}
          </Typography>
        </div>
        <Divider sx={{ mb: 1, borderColor: '#f1f5f9' }} />
        
        <MenuItem
          onClick={handleNavigateProfile}
          sx={{ minHeight: 0, px: 2, py: 1, gap: 1.5, '&:hover': { bgcolor: '#f8fafc' } }}
        >
          <IconifyIcon icon="lucide:user" className="text-emerald-600 text-lg" />
          <span className="text-[13px] font-medium text-gray-700">Profil & Akun</span>
        </MenuItem>

        <Divider sx={{ my: 1, borderColor: '#f1f5f9' }} />
        
        <MenuItem
          onClick={handleLogout}
          sx={{ minHeight: 0, px: 2, py: 1, gap: 1.5, '&:hover': { bgcolor: '#fef2f2' } }}
        >
          <IconifyIcon icon="lucide:log-out" className="text-red-500 text-lg" />
          <span className="text-[13px] font-medium text-red-600">Keluar / Logout</span>
        </MenuItem>
      </Menu>
    </>
  );
};

export default AccountDropdown;
