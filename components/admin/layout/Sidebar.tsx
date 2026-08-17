import { ReactElement } from 'react';
import { Box, IconButton, Tooltip } from '@mui/material';
import IconifyIcon from '@/components/common/IconifyIcon';
import navItems from '@/lib/data/nav-items';
import NavButton from './NavButton';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

interface SidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
}

const Sidebar = ({ isCollapsed, setIsCollapsed }: SidebarProps): ReactElement => {
  const { user, logout } = useAuth();
  const userName = user?.username || 'Administrator';

  return (
    <Box
      sx={{
        position: 'relative',
        height: '100vh',
        width: isCollapsed ? 75 : 288,
        backgroundColor: '#020617',
        transition: 'all 0.3s ease',
        display: 'flex',
        flexDirection: 'column',
        p: isCollapsed ? 1.5 : 2,
        zIndex: 1200,
        borderRight: '1px solid rgba(30, 41, 59, 0.8)',
        overflow: 'visible',
      }}
    >
      {/* BACKGROUND WIFI / NETWORK GRAPHIC FOR SIDEBAR */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -right-12 -bottom-10 opacity-15 text-emerald-400">
          <svg className="w-80 h-80" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="100" cy="100" r="90" stroke="currentColor" strokeWidth="1.5" strokeDasharray="6 6" />
            <circle cx="100" cy="100" r="70" stroke="currentColor" strokeWidth="2" />
            <circle cx="100" cy="100" r="50" stroke="currentColor" strokeWidth="1.5" strokeDasharray="4 4" />
            <circle cx="100" cy="100" r="30" stroke="currentColor" strokeWidth="2" />
            <circle cx="100" cy="100" r="10" fill="currentColor" />
            <path d="M 30 100 A 70 70 0 0 1 170 100" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
            <path d="M 10 100 A 90 90 0 0 1 190 100" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
          </svg>
        </div>
        <div className="absolute top-1/3 -left-12 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl"></div>
      </div>

      {/* Collapse Toggle */}
      <IconButton
        onClick={() => setIsCollapsed(!isCollapsed)}
        sx={{
          position: 'absolute',
          top: 24,
          right: -12,
          width: 24,
          height: 24,
          backgroundColor: '#059669',
          color: '#fff',
          zIndex: 1000,
          border: '2px solid #020617',
          '&:hover': {
            backgroundColor: '#047857',
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

      {/* Main Content Wrapper (Above Background) */}
      <div className="relative z-10 flex flex-col h-full justify-between overflow-hidden">
        
        {/* Header / Branding */}
        <div className="mb-6 mt-2 flex items-center justify-center shrink-0 px-1">
          {isCollapsed ? (
            <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-xl p-1.5 bg-gradient-to-b from-slate-800/90 to-emerald-950/90 border border-emerald-500/30 shadow-md shadow-emerald-950/40">
              <img
                src="/assets/logo/shield-bts.png"
                alt="BTS SODONG NET"
                className="h-full w-full object-contain"
              />
            </div>
          ) : (
            <div className="relative flex flex-col items-center justify-center w-full py-4 px-3 rounded-2xl bg-gradient-to-b from-slate-900/90 via-slate-800/70 to-emerald-950/80 border border-emerald-500/30 shadow-lg shadow-emerald-950/50">
              <div className="relative h-28 w-28 mb-2.5 flex items-center justify-center">
                <img
                  src="/assets/logo/shield-bts.png"
                  alt="BTS SODONG NET"
                  className="h-full w-full object-contain"
                />
              </div>
              <span className="text-base font-extrabold tracking-wider text-emerald-400 leading-tight">
                BTS SODONG NET
              </span>
            </div>
          )}
        </div>

        {/* Navigation Section */}
        <div className="flex-grow overflow-y-auto overflow-x-hidden">
          {/* Subheader */}
          {!isCollapsed && (
            <div className="mb-2 px-3 text-[11px] font-semibold tracking-wider text-slate-500 uppercase">
              MENU UTAMA
            </div>
          )}

          {/* Nav Items */}
          <div className="flex flex-col space-y-1">
            {navItems.map((navItem, index) => (
              <NavButton key={index} navItem={navItem} Link={Link as any} isCollapsed={isCollapsed} />
            ))}
          </div>
        </div>

        {/* Bottom Profile Section */}
        <div className={`mt-auto pt-3 border-t border-slate-800/80 bg-slate-900/40 shrink-0 ${isCollapsed ? 'pb-1' : ''}`}>
          <Tooltip title={isCollapsed ? `${userName} - Logout` : ''} placement="right" arrow disableHoverListener={!isCollapsed}>
            <div className="flex flex-col gap-2 rounded-xl bg-slate-900/80 p-2">
              <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-700 font-bold text-white shadow">
                    {userName.substring(0, 1).toUpperCase()}
                  </div>
                  {!isCollapsed && (
                    <div className="flex flex-col overflow-hidden">
                      <span className="truncate text-sm font-semibold text-white leading-tight">{userName}</span>
                      <span className="truncate text-[11px] text-slate-400">BTS Sodong Net</span>
                    </div>
                  )}
                </div>
                {!isCollapsed && (
                  <button
                    onClick={logout}
                    className="shrink-0 rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-red-400 transition-colors"
                    title="Keluar"
                  >
                    <IconifyIcon icon="solar:logout-linear" className="text-sm" />
                  </button>
                )}
              </div>
              
              {isCollapsed && (
                <button
                  onClick={logout}
                  className="mt-1 flex w-full items-center justify-center rounded bg-red-500/10 p-1.5 text-red-400 hover:bg-red-500/20 transition-colors"
                  title="Keluar"
                >
                  <IconifyIcon icon="solar:logout-linear" className="text-sm" />
                </button>
              )}
            </div>
          </Tooltip>
        </div>

      </div>
    </Box>
  );
};

export default Sidebar;
