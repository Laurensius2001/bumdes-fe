import type { Metadata } from "next";
import { Inter } from "next/font/google";
import ThemeProvider from "@/lib/providers/ThemeProvider";
import { AuthProvider } from "@/context/AuthContext";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "BTS SODONG NET - BUMDes Tirta Sejahtera",
  description: "Dashboard System - BUMDes Tirta Sejahtera",
};

import { ToastContainer } from "@/components/Toast";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className={`${inter.className} antialiased bg-slate-100/70 dark:bg-slate-950 text-slate-800 dark:text-slate-100`}>
        <AuthProvider>
          <ThemeProvider>
            {children}
            <ToastContainer />
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}


