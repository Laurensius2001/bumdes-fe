'use client';

import { ThemeProvider as MuiThemeProvider, CssBaseline } from '@mui/material';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v14-appRouter';
import { theme } from '@/lib/theme/theme';
import BreakpointsProvider from './BreakpointsProvider';

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
    return (
        <AppRouterCacheProvider options={{ enableCssLayer: true }}>
            <MuiThemeProvider theme={theme}>
                <BreakpointsProvider>
                    <CssBaseline />
                    {children}
                </BreakpointsProvider>
            </MuiThemeProvider>
        </AppRouterCacheProvider>
    );
}
