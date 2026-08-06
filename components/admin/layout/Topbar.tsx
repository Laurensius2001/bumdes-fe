'use client';

import { MouseEventHandler, ReactElement, useState, useEffect, MouseEvent } from 'react';
import { AppBar, Badge, IconButton, Toolbar, Menu, Divider } from '@mui/material';
import IconifyIcon from '@/components/common/IconifyIcon';
import AccountDropdown from './AccountDropdown';
import { useRouter } from 'next/navigation';
import { keluhanService } from '@/services/keluhanService';
import dayjs from 'dayjs';

import { useAuth } from '@/context/AuthContext';

interface Pelanggan {
  id: number;
  kode_pelanggan: string;
  nama: string;
  no_hp: string;
  alamat: string;
}

interface KeluhanItem {
  id: number;
  kode_keluhan: string;
  pelanggan_id: number;
  kategori: string;
  judul: string;
  deskripsi: string;
  status: string;
  created_at: string;
  pelanggan?: Pelanggan;
}

interface TopbarProps {
  handleDrawerToggle: MouseEventHandler;
  isCollapsed: boolean;
}

const STORAGE_KEY = 'read_keluhan_ids';

const Topbar = ({ handleDrawerToggle, isCollapsed }: TopbarProps): ReactElement => {
  const router = useRouter();
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const currentSidebarWidth = isCollapsed ? 75 : 288;

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const openMenu = Boolean(anchorEl);

  const [keluhanList, setKeluhanList] = useState<KeluhanItem[]>([]);
  const [readIds, setReadIds] = useState<number[]>([]);

  // Load read status from localStorage
  const loadReadIds = () => {
    if (typeof window === 'undefined') return;
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setReadIds(JSON.parse(stored));
      } else {
        setReadIds([]);
      }
    } catch (e) {
      console.error('Failed to parse read_keluhan_ids:', e);
    }
  };

  // Fetch keluhan data
  const fetchKeluhan = async () => {
    try {
      const res = await keluhanService.getAll();
      if (res.ok && res.data?.success && Array.isArray(res.data.data)) {
        setKeluhanList(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching keluhan for notification:', err);
    }
  };

  useEffect(() => {
    loadReadIds();
    fetchKeluhan();

    // Listen for storage events (e.g. when detail page updates read status)
    const handleStorageChange = () => {
      loadReadIds();
    };

    window.addEventListener('storage', handleStorageChange);
    // Interval polling every 10 seconds to get fresh complaints
    const interval = setInterval(fetchKeluhan, 10000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  const handleOpenNotifications = (event: MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
    loadReadIds();
    fetchKeluhan();
  };

  const handleCloseNotifications = () => {
    setAnchorEl(null);
  };

  const handleSelectKeluhan = (id: number) => {
    // Mark as read
    try {
      const currentRead = readIds;
      if (!currentRead.includes(id)) {
        const updated = [...currentRead, id];
        setReadIds(updated);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        window.dispatchEvent(new Event('storage'));
      }
    } catch (e) {
      console.error(e);
    }

    handleCloseNotifications();
    router.push(`/admin/keluhan?id=${id}`);
  };

  const handleMarkAllRead = () => {
    try {
      const allIds = keluhanList.map((k) => k.id);
      setReadIds(allIds);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(allIds));
      window.dispatchEvent(new Event('storage'));
    } catch (e) {
      console.error(e);
    }
  };

  // Unread complaints calculation
  const unreadList = keluhanList.filter((k) => !readIds.includes(k.id));
  const unreadCount = unreadList.length;

  return (
    <AppBar
      sx={{
        width: { lg: `calc(100% - ${currentSidebarWidth}px)` },
        ml: { lg: `${currentSidebarWidth}px` },
        backgroundColor: '#ffffff',
        color: '#0f172a',
        transition: 'width 0.3s, margin-left 0.3s',
        boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        borderBottom: '1px solid rgba(226, 232, 240, 0.8)',
      }}
    >
      <Toolbar
        sx={{
          py: 1,
          px: { xs: 2, md: 3, lg: 4 },
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          minHeight: '64px !important',
          height: '64px',
        }}
      >
        <div className="flex items-center gap-3 flex-1">
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

          {/* Global Search Input matching mockup */}
          <div className="relative w-52 sm:w-80 md:w-96">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
              <IconifyIcon icon="lucide:search" className="text-xs text-slate-400" />
            </span>
            <input
              type="text"
              id="globalSearch"
              placeholder="Cari pelanggan, ID keluhan, No HP..."
              className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 text-slate-800 placeholder-slate-400 transition-all outline-none"
            />
          </div>
        </div>

        {/* Right Actions matching mockup */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          <div className="hidden sm:flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-medium">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span>WiFi Desa Sodong (Online)</span>
          </div>

          <div className="h-6 w-[1px] bg-gray-200 hidden lg:block mx-1"></div>

          {/* Notification Button & Dropdown Menu (Admin Only) */}
          {isAdmin && (
            <>
              <IconButton
                id="notification-button"
                aria-controls={openMenu ? 'notification-menu' : undefined}
                aria-haspopup="true"
                aria-expanded={openMenu ? 'true' : undefined}
                onClick={handleOpenNotifications}
                color="inherit"
                sx={{ bgcolor: 'transparent', p: 1 }}
              >
                <Badge
                  badgeContent={unreadCount}
                  color="error"
                  anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                  sx={{
                    '& .MuiBadge-badge': {
                      top: 4,
                      right: 4,
                      transform: 'translate(50%, -50%)',
                      backgroundColor: '#ef4444',
                      color: '#ffffff',
                      fontWeight: 700,
                      fontSize: '10px',
                      minWidth: '18px',
                      height: '18px',
                      padding: '0 4px',
                      boxShadow: unreadCount > 0 ? '0 0 0 2px #ffffff, 0 0 0 4px rgba(239, 68, 68, 0.3)' : 'none',
                      animation: unreadCount > 0 ? 'pulseBlink 1.2s infinite ease-in-out' : 'none',
                      '@keyframes pulseBlink': {
                        '0%': { opacity: 1, transform: 'translate(50%, -50%) scale(1)' },
                        '50%': { opacity: 0.5, transform: 'translate(50%, -50%) scale(1.2)' },
                        '100%': { opacity: 1, transform: 'translate(50%, -50%) scale(1)' },
                      },
                    },
                  }}
                >
                  <IconifyIcon
                    icon="lucide:bell"
                    width={22}
                    height={22}
                    className={unreadCount > 0 ? 'text-gray-700' : 'text-gray-400 hover:text-gray-600 transition-colors'}
                  />
                </Badge>
              </IconButton>

              {/* Notification Dropdown Menu */}
              <Menu
                id="notification-menu"
                anchorEl={anchorEl}
                open={openMenu}
                onClose={handleCloseNotifications}
                disableScrollLock={true}
                MenuListProps={{
                  'aria-labelledby': 'notification-button',
                  sx: { p: 0, width: { xs: 320, sm: 380 } },
                }}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                slotProps={{
                  paper: {
                    elevation: 0,
                    sx: {
                      mt: 1.5,
                      border: '1px solid #e2e8f0',
                      boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.05)',
                      borderRadius: '16px',
                      overflow: 'hidden',
                    },
                  },
                }}
              >
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-indigo-50/80 to-white border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-[#6b42ff]/10 text-[#6b42ff] flex items-center justify-center">
                      <IconifyIcon icon="lucide:bell" className="text-base" />
                    </div>
                    <div>
                      <h4 className="text-xs font-extrabold text-gray-900 leading-snug">Keluhan Pelanggan</h4>
                      <p className="text-[10px] text-gray-500 font-medium">
                        {unreadCount > 0 ? `${unreadCount} keluhan belum dibaca` : 'Semua keluhan telah dibaca'}
                      </p>
                    </div>
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllRead}
                      className="text-[11px] font-bold text-[#6b42ff] hover:text-indigo-800 transition-colors bg-white px-2.5 py-1 rounded-lg border border-indigo-100 shadow-2xs"
                    >
                      Tandai Dibaca
                    </button>
                  )}
                </div>

                {/* Notification Items List */}
                <div className="max-h-[340px] overflow-y-auto divide-y divide-gray-100">
                  {keluhanList.length === 0 ? (
                    <div className="p-6 text-center">
                      <IconifyIcon icon="lucide:message-square-off" className="text-gray-300 text-3xl mx-auto mb-2" />
                      <p className="text-xs font-semibold text-gray-500">Belum ada keluhan</p>
                      <p className="text-[10px] text-gray-400 mt-0.5">Semua laporan dari pelanggan akan muncul di sini</p>
                    </div>
                  ) : (
                    keluhanList.map((item) => {
                      const isRead = readIds.includes(item.id);

                      return (
                        <div
                          key={item.id}
                          onClick={() => handleSelectKeluhan(item.id)}
                          className={`p-3.5 flex items-start gap-3 cursor-pointer transition-all ${
                            isRead ? 'bg-white hover:bg-gray-50/80' : 'bg-red-50/40 hover:bg-red-50/80'
                          }`}
                        >
                          <div className="relative mt-0.5">
                            <div
                              className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                                isRead ? 'bg-gray-100 text-gray-600' : 'bg-red-100 text-red-600 ring-2 ring-red-200'
                              }`}
                            >
                              {item.pelanggan?.nama?.substring(0, 2).toUpperCase() || 'PL'}
                            </div>
                            {!isRead && (
                              <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-red-500 rounded-full ring-2 ring-white animate-pulse" />
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2 mb-0.5">
                              <span className={`text-xs truncate ${isRead ? 'font-semibold text-gray-800' : 'font-extrabold text-gray-900'}`}>
                                {item.pelanggan?.nama || 'Pelanggan'}
                              </span>
                              <span className="text-[10px] text-gray-400 shrink-0">
                                {dayjs(item.created_at).format('DD MMM, HH:mm')}
                              </span>
                            </div>

                            <p className={`text-xs truncate mb-1.5 ${isRead ? 'text-gray-600 font-normal' : 'text-gray-900 font-semibold'}`}>
                              {item.judul}
                            </p>

                            <div className="flex items-center justify-between">
                              <span className="text-[10px] bg-gray-100 text-gray-600 font-medium px-2 py-0.5 rounded">
                                {item.kategori}
                              </span>
                              {isRead ? (
                                <span className="text-[10px] font-bold text-gray-400 flex items-center gap-1">
                                  <IconifyIcon icon="lucide:check-check" className="text-xs text-gray-400" />
                                  Sudah dibaca
                                </span>
                              ) : (
                                <span className="text-[10px] font-bold text-red-600 bg-red-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
                                  Belum dibaca
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Footer */}
                <Divider sx={{ borderColor: '#f1f5f9' }} />
                <div className="p-2 bg-gray-50/50 text-center">
                  <button
                    onClick={() => {
                      handleCloseNotifications();
                      router.push('/admin/keluhan');
                    }}
                    className="w-full py-1.5 text-xs font-bold text-[#6b42ff] hover:text-indigo-800 hover:bg-white rounded-lg transition-all"
                  >
                    Lihat Semua Keluhan
                  </button>
                </div>
              </Menu>
            </>
          )}

          <AccountDropdown />
        </div>
      </Toolbar>
    </AppBar>
  );
};

export default Topbar;
