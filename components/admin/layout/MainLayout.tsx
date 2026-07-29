'use client';

import { PropsWithChildren, ReactElement, useEffect, useState } from 'react';
import { Box, Drawer, Stack, Toolbar } from '@mui/material';
import { usePathname } from 'next/navigation';

import Sidebar from './Sidebar';
import Topbar from './Topbar';
import Footer from './Footer';

export const drawerWidth = 278;

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

  const currentSidebarWidth = isCollapsed ? 78 : 300;

  return (
    <>
      <Stack direction="row" minHeight="100vh" bgcolor="#f5f7fa">
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
                backgroundColor: '#11101d',
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
                backgroundColor: '#11101d',
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
            bgcolor: '#f8f9fa',
            width: { lg: `calc(100% - ${currentSidebarWidth}px)` },
            transition: 'all 0.3s ease',
            position: 'relative',
          }}
        >
          <Toolbar sx={{ height: 80 }} />
          <Box sx={{ px: 4, pb: 4, pt: 2 }}>
            {children}
            <Footer />
          </Box>
        </Box>
      </Stack>
    </>
  );
};

export default MainLayout;
