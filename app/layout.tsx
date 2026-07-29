import type { Metadata } from "next";
import { Nunito } from "next/font/google";
import ThemeProvider from "@/lib/providers/ThemeProvider";
import "./globals.css";

const nunito = Nunito({
  subsets: ["latin"],
  variable: "--font-nunito",
  display: "swap",
});

export const metadata: Metadata = {
  title: "BUMDes Dashboard",
  description: "Dashboard Management System for BUMDes",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className={nunito.className}>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
