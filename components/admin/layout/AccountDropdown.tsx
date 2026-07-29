import {
  Avatar,
  Divider,
  Menu,
  MenuItem,
  Typography,
} from '@mui/material';
import IconifyIcon from '@/components/common/IconifyIcon';
import { MouseEvent, ReactElement, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import profile from 'assets/profile/profile.jpg';

const AccountDropdown = (): ReactElement => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [userName, setUserName] = useState('Administrator');
  const [userRole, setUserRole] = useState('Operator BUMDes');
  const open = Boolean(anchorEl);
  const router = useRouter();

  useEffect(() => {
    const storedUser = localStorage.getItem('bumdes_user');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        setUserName(user.username || 'Administrator');
        setUserRole(user.role || 'Operator BUMDes');
      } catch (e) {}
    }
  }, []);

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  const handleLogout = () => {
    localStorage.removeItem('bumdes_logged_in');
    localStorage.removeItem('bumdes_token');
    localStorage.removeItem('bumdes_user');
    document.cookie = 'bumdes_logged_in=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    handleClose();
    router.push('/login');
  };

  return (
    <>
      <div className="hidden">
        <IconifyIcon icon="lucide:chevron-up" />
        <IconifyIcon icon="lucide:user" />
        <IconifyIcon icon="lucide:settings" />
        <IconifyIcon icon="lucide:log-out" />
      </div>
      <button
        id="account-dropdown-button"
        aria-controls={open ? 'account-dropdown-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
        onClick={handleClick}
        className="flex items-center gap-2.5 rounded-full border border-gray-200 bg-white py-1.5 pl-1.5 pr-4 transition-all hover:bg-gray-50 focus:outline-none"
      >
        <div className="relative">
          <Avatar alt={userName} src={profile.src} sx={{ width: 34, height: 34 }} />
          <div className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white bg-green-500"></div>
        </div>
        <div className="hidden flex-col items-start sm:flex">
          <span className="text-[13px] font-bold text-gray-800 leading-tight">{userName}</span>
          <span className="text-[11px] text-gray-500 leading-tight">{userRole}</span>
        </div>
        <IconifyIcon
          icon={open ? 'lucide:chevron-up' : 'lucide:chevron-down'}
          className="ml-1 text-gray-400 text-sm hidden sm:block"
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
        
        <MenuItem onClick={handleClose} sx={{ minHeight: 0, px: 2, py: 1, gap: 1.5, '&:hover': { bgcolor: '#f8fafc' } }}>
          <IconifyIcon icon="lucide:user" className="text-gray-400 text-lg" />
          <span className="text-[13px] font-medium text-gray-700">Profil & Akun</span>
        </MenuItem>
        
        <MenuItem onClick={handleClose} sx={{ minHeight: 0, px: 2, py: 1, gap: 1.5, '&:hover': { bgcolor: '#f8fafc' } }}>
          <IconifyIcon icon="lucide:settings" className="text-gray-400 text-lg" />
          <span className="text-[13px] font-medium text-gray-700">Pengaturan Sistem</span>
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
