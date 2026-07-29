import { ReactElement } from 'react';
import { Box, IconButton, Tooltip } from '@mui/material';
import IconifyIcon from '@/components/common/IconifyIcon';
import navItems from '@/lib/data/nav-items';
import NavButton from './NavButton';
import Link from 'next/link';

interface SidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
}

const Sidebar = ({ isCollapsed, setIsCollapsed }: SidebarProps): ReactElement => {
  return (
    <Box
      sx={{
        position: 'relative',
        height: '100vh',
        width: isCollapsed ? 78 : 300,
        backgroundColor: '#15162a',
        transition: 'all 0.3s ease',
        display: 'flex',
        flexDirection: 'column',
        p: isCollapsed ? 1 : 2.5,
        zIndex: 1200,
        overflow: 'visible',
      }}
    >
      {/* Collapse Toggle */}
      <IconButton
        onClick={() => setIsCollapsed(!isCollapsed)}
        sx={{
          position: 'absolute',
          top: 30,
          right: -12,
          width: 24,
          height: 24,
          backgroundColor: '#6b42ff',
          color: '#fff',
          zIndex: 1000,
          border: '2px solid #f8fafc',
          '&:hover': {
            backgroundColor: '#8a42ff',
          },
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <IconifyIcon
          icon={isCollapsed ? 'solar:alt-arrow-right-linear' : 'solar:alt-arrow-left-linear'}
          width={14}
          color="white"
        />
      </IconButton>

      {/* Header / Branding */}
      <div className={`mb-8 mt-2 flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'} min-h-[52px]`}>
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#6b42ff] to-[#8a42ff] shadow-lg shadow-[#6b42ff]/30">
          <IconifyIcon icon="lucide:wifi" className="text-white text-lg" />
        </div>
        {!isCollapsed && (
          <div className="flex flex-col justify-center overflow-hidden">
            <span className="truncate text-[15px] font-bold leading-tight tracking-wide text-white">BTS SODONG NET</span>
            <span className="mt-[2px] truncate rounded bg-[#0c5149] px-1.5 py-[1px] text-[8px] font-bold tracking-wider text-[#66dec8] w-fit">
              BUMDES TIRTA SEJAHTERA
            </span>
          </div>
        )}
      </div>

      <div className="flex-grow overflow-y-auto overflow-x-hidden">
        {/* Subheader */}
        {!isCollapsed && (
          <div className="mb-3 px-3 text-[10px] font-bold tracking-widest text-[#4d5374]">
            MENU UTAMA
          </div>
        )}

        {/* Nav Items */}
        <div className="flex flex-col">
          {navItems.map((navItem, index) => (
            <NavButton key={index} navItem={navItem} Link={Link as any} isCollapsed={isCollapsed} />
          ))}
        </div>
      </div>

      {/* Bottom Profile Section */}
      <div className={`mt-auto pt-4 ${isCollapsed ? 'pb-2' : ''}`}>
        <Tooltip title={isCollapsed ? 'Administrator - Logout' : ''} placement="right" arrow disableHoverListener={!isCollapsed}>
          <div className="flex flex-col gap-2 rounded-xl bg-[#1e2038] p-3">
            <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-[#384166] to-[#252b47]">
                  <IconifyIcon icon="lucide:user" className="text-[#8e93be] text-lg" />
                </div>
                {!isCollapsed && (
                  <div className="flex flex-col overflow-hidden">
                    <span className="truncate text-[13px] font-bold text-white">Administrator</span>
                    <span className="truncate text-[10px] text-gray-400">Operator BUMDes</span>
                  </div>
                )}
              </div>
              {!isCollapsed && (
                <button
                  onClick={() => {
                    localStorage.removeItem('bumdes_logged_in');
                    localStorage.removeItem('bumdes_token');
                    localStorage.removeItem('bumdes_user');
                    document.cookie = 'bumdes_logged_in=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
                    window.location.href = '/login';
                  }}
                  className="shrink-0 rounded p-1.5 text-gray-400 hover:bg-[#2a2e4a] hover:text-white transition-colors"
                  title="Logout"
                >
                  <IconifyIcon icon="solar:logout-linear" className="text-lg" />
                </button>
              )}
            </div>
            
            {/* If collapsed, logout button is the tooltip click or we just show an icon, wait, clicking the whole block should logout if collapsed. */}
            {isCollapsed && (
              <button
                onClick={() => {
                  localStorage.removeItem('bumdes_logged_in');
                  localStorage.removeItem('bumdes_token');
                  localStorage.removeItem('bumdes_user');
                  document.cookie = 'bumdes_logged_in=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
                  window.location.href = '/login';
                }}
                className="mt-2 flex w-full items-center justify-center rounded bg-[#ef4444]/10 p-2 text-[#ef4444] hover:bg-[#ef4444]/20 transition-colors"
                title="Logout"
              >
                <IconifyIcon icon="solar:logout-linear" className="text-lg" />
              </button>
            )}
          </div>
        </Tooltip>
      </div>
    </Box>
  );
};

export default Sidebar;
