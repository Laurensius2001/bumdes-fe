'use client';

import { PropsWithChildren, ReactElement, useEffect, useState } from 'react';
import { Box, Drawer, Stack, Toolbar } from '@mui/material';
import { usePathname } from 'next/navigation';

import Sidebar from './Sidebar';
import Topbar from './Topbar';
import Footer from './Footer';

export const drawerWidth = 288;

const MainLayout = ({ children }: PropsWithChildren): ReactElement | null => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    setMobileOpen(false);
  }, []);

  const pathname = usePathname();
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const handleDrawerClose = () => {
    setIsClosing(true);
    setMobileOpen(false);
  };

  const handleDrawerTransitionEnd = () => {
    setIsClosing(false);
  };

  const handleDrawerToggle = () => {
    if (!isClosing) {
      setMobileOpen(!mobileOpen);
    }
  };

  if (!isMounted) return null;

  const currentSidebarWidth = isCollapsed ? 75 : 288;

  return (
    <>
      <Stack direction="row" minHeight="100vh" bgcolor="#f8fafc">
        <Topbar handleDrawerToggle={handleDrawerToggle} isCollapsed={isCollapsed} />
        <Box
          component="nav"
          sx={{
            width: { lg: currentSidebarWidth },
            flexShrink: { lg: 0 },
            transition: 'width 0.3s ease',
          }}
          aria-label="mailbox folders"
        >
          <Drawer
            variant="temporary"
            open={mobileOpen}
            onTransitionEnd={handleDrawerTransitionEnd}
            onClose={handleDrawerClose}
            ModalProps={{
              keepMounted: true,
            }}
            sx={{
              display: { xs: 'block', lg: 'none' },
              '& .MuiDrawer-paper': {
                boxSizing: 'border-box',
                border: 0,
                backgroundColor: '#020617',
              },
            }}
          >
            <Sidebar isCollapsed={false} setIsCollapsed={() => {}} />
          </Drawer>
          <Drawer
            variant="permanent"
            sx={{
              display: { xs: 'none', lg: 'block' },
              '& .MuiDrawer-paper': {
                boxSizing: 'border-box',
                width: currentSidebarWidth,
                border: 0,
                backgroundColor: '#020617',
                transition: 'width 0.3s ease',
                overflow: 'visible',
              },
            }}
            open
          >
            <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
          </Drawer>
        </Box>
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            minHeight: '100vh',
            bgcolor: '#f1f5f9',
            width: { lg: `calc(100% - ${currentSidebarWidth}px)` },
            transition: 'all 0.3s ease',
            position: 'relative',
          }}
        >
          <Toolbar sx={{ height: 64 }} />
          <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: 'calc(100vh - 64px)' }}>
            <Box sx={{ flex: 1, px: { xs: 2, sm: 3, lg: 4 }, pt: 3, pb: 4 }}>{children}</Box>
            <Footer />
          </Box>
        </Box>
      </Stack>
    </>
  );
};

export default MainLayout;

