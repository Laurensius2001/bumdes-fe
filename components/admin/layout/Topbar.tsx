import { MouseEventHandler, ReactElement } from 'react';
import { AppBar, Badge, IconButton, Toolbar } from '@mui/material';
import IconifyIcon from '@/components/common/IconifyIcon';
import AccountDropdown from './AccountDropdown';

interface TopbarProps {
  handleDrawerToggle: MouseEventHandler;
  isCollapsed: boolean;
}

const Topbar = ({ handleDrawerToggle, isCollapsed }: TopbarProps): ReactElement => {
  const currentSidebarWidth = isCollapsed ? 78 : 300;

  return (
    <AppBar
      sx={{
        width: { lg: `calc(100% - ${currentSidebarWidth}px)` },
        ml: { lg: `${currentSidebarWidth}px` },
        backgroundColor: '#ffffff',
        color: '#11101d',
        transition: 'width 0.3s, margin-left 0.3s',
        boxShadow: 'none',
        borderBottom: '1px solid #f1f5f9',
      }}
    >
      <Toolbar
        sx={{
          py: 1,
          px: { xs: 2, md: 4 },
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          minHeight: '64px !important',
        }}
      >
        <div className="flex items-center gap-4 flex-1">
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{
              display: { lg: 'none' },
            }}
          >
            <IconifyIcon icon="mdi:menu" />
          </IconButton>

          {/* Search Bar */}
          <div className="hidden md:flex items-center gap-2 rounded-full bg-[#f8fafc] px-4 py-2 border border-[#f1f5f9] w-full max-w-[380px]">
            <IconifyIcon icon="lucide:search" className="text-gray-400 text-lg shrink-0" />
            <input
              type="text"
              placeholder="Cari pelanggan, ID, No HP..."
              className="w-full bg-transparent text-[13px] text-gray-700 outline-none placeholder:text-gray-400"
            />
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          <div className="hidden lg:flex items-center gap-3">
            <div className="flex items-center gap-2 rounded-full bg-white px-3 py-1.5 border border-[#e2e8f0]">
              <div className="h-2 w-2 rounded-full bg-[#10b981]"></div>
              <span className="text-[12px] font-bold text-[#6b42ff]">WiFi Desa Sodong</span>
            </div>
          </div>

          <div className="h-6 w-[1px] bg-gray-200 hidden lg:block mx-1"></div>

          <IconButton color="inherit" sx={{ bgcolor: 'transparent', p: 1 }}>
            <Badge badgeContent={1} color="error" sx={{ '& .MuiBadge-badge': { backgroundColor: '#ef4444' } }}>
              <IconifyIcon icon="lucide:bell" width={22} height={22} className="text-gray-400 hover:text-gray-600 transition-colors" />
            </Badge>
          </IconButton>

          <AccountDropdown />
        </div>
      </Toolbar>
    </AppBar>
  );
};

export default Topbar;
