'use client';

import { Box, Stack } from '@mui/material';
import IconifyIcon from '@/components/common/IconifyIcon';

import TopSellingProduct from '@/components/admin/dashboard/Sales/TopSellingProduct/TopSellingProduct';
import WebsiteVisitors from '@/components/admin/dashboard/Sales/WebsiteVisitors/WebsiteVisitors';
import BuyersProfile from '@/components/admin/dashboard/Sales/BuyersProfile/BuyersProfile';
import NewCustomers from '@/components/admin/dashboard/Sales/NewCustomers/NewCustomers';
import Revenue from '@/components/admin/dashboard/Sales/Revenue/Revenue';

const statCards = [
  {
    title: 'Total Pelanggan',
    value: '248',
    icon: 'lucide:users',
    bgColor: 'bg-purple-100',
    iconColor: 'text-purple-600',
    trend: '+12%',
    trendText: 'dari bulan lalu',
    trendColor: 'text-green-500',
  },
  {
    title: 'Omset Bulan Ini',
    value: 'Rp 12.5M',
    icon: 'lucide:wallet',
    bgColor: 'bg-blue-100',
    iconColor: 'text-blue-600',
    trend: '+5.4%',
    trendText: 'dari bulan lalu',
    trendColor: 'text-green-500',
  },
  {
    title: 'Belum Bayar',
    value: '42',
    icon: 'lucide:file-warning',
    bgColor: 'bg-orange-100',
    iconColor: 'text-orange-600',
    trend: '-2%',
    trendText: 'dari bulan lalu',
    trendColor: 'text-green-500',
  },
  {
    title: 'Status OLT Utama',
    value: 'Normal',
    icon: 'lucide:server',
    bgColor: 'bg-green-100',
    iconColor: 'text-green-600',
    trend: 'Uptime 99.9%',
    trendText: 'Bulan ini',
    trendColor: 'text-green-500',
  },
];

export default function AdminDashboardPage() {
  return (
    <div className="flex flex-col gap-6">
      {/* Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#5936f1] to-[#7f56f9] p-8 text-white shadow-lg">
        {/* Background glow effects */}
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl"></div>
        <div className="absolute right-40 bottom-10 h-32 w-32 rounded-full bg-[#38bdf8]/20 blur-2xl"></div>
        
        <div className="relative z-10 flex flex-col gap-2 md:w-2/3">
          <span className="w-fit rounded-full bg-white/20 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider backdrop-blur-sm">
            Sistem Management Terpadu v2.0
          </span>
          <h1 className="mt-2 text-3xl font-bold md:text-4xl">Selamat Datang di Portal BTS SODONG NET</h1>
          <p className="mt-2 text-[14px] text-white/80 max-w-xl">
            Kelola data pelanggan, tagihan, serta monitoring status jaringan OLT dengan mudah dan real-time.
          </p>
          <button className="mt-4 w-fit rounded-full bg-white px-5 py-2.5 text-[13px] font-bold text-[#5936f1] shadow-md hover:bg-gray-50 transition-colors">
            Lihat Laporan Terkini
          </button>
        </div>

        {/* Optional illustration icon on the right side */}
        <div className="hidden absolute right-12 top-1/2 -translate-y-1/2 md:flex items-center justify-center">
           <IconifyIcon icon="lucide:monitor-dot" className="text-white/30 text-[140px]" />
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card, index) => (
          <div key={index} className="flex flex-col gap-3 rounded-2xl bg-white p-5 shadow-sm border border-gray-100 transition-all hover:shadow-md">
            <div className="flex items-center justify-between">
              <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${card.bgColor}`}>
                <IconifyIcon icon={card.icon} className={`text-2xl ${card.iconColor}`} />
              </div>
              <div className="flex items-center gap-1 rounded-full bg-gray-50 px-2 py-1 text-[11px] font-medium border border-gray-100">
                <span className={card.trendColor}>{card.trend}</span>
              </div>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-[#11101d]">{card.value}</h3>
              <p className="text-[13px] font-medium text-gray-500">{card.title}</p>
            </div>
            <p className="text-[11px] text-gray-400 border-t border-gray-50 pt-2">{card.trendText}</p>
          </div>
        ))}
      </div>

      {/* Existing Charts */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(12, 1fr)',
          gap: 3.75,
        }}
      >
        <Box sx={{ gridColumn: { xs: 'span 12', md: 'span 8' } }}>
          <Revenue />
        </Box>
        <Box sx={{ gridColumn: { xs: 'span 12', md: 'span 4' } }}>
          <WebsiteVisitors />
        </Box>
        <Box sx={{ gridColumn: { xs: 'span 12', lg: 'span 8' } }}>
          <TopSellingProduct />
        </Box>
        <Box sx={{ gridColumn: { xs: 'span 12', lg: 'span 4' } }}>
          <Stack
            direction={{ xs: 'column', sm: 'row', lg: 'column' }}
            gap={3.75}
            height={1}
            width={1}
          >
            <NewCustomers />
            <BuyersProfile />
          </Stack>
        </Box>
      </Box>
    </div>
  );
}
