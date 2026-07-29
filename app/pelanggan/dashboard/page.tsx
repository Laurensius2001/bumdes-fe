'use client';

import { useEffect, useState } from 'react';
import IconifyIcon from '@/components/common/IconifyIcon';

export default function PelangganDashboardPage() {
  const [userName, setUserName] = useState('Pelanggan');

  useEffect(() => {
    const storedUser = localStorage.getItem('bumdes_user');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      setUserName(user.username || 'Pelanggan');
    }
  }, []);

  const infoCards = [
    {
      title: 'Status Langganan',
      value: 'Aktif',
      icon: 'lucide:check-circle',
      bgColor: 'bg-green-100',
      iconColor: 'text-green-600',
      trend: 'Normal',
      trendText: 'Koneksi stabil',
      trendColor: 'text-green-500',
    },
    {
      title: 'Tagihan Bulan Ini',
      value: 'Rp 150.000',
      icon: 'lucide:receipt',
      bgColor: 'bg-blue-100',
      iconColor: 'text-blue-600',
      trend: 'Belum Lunas',
      trendText: 'Jatuh tempo 20',
      trendColor: 'text-orange-500',
    },
    {
      title: 'Keluhan Aktif',
      value: '0',
      icon: 'lucide:message-square',
      bgColor: 'bg-orange-100',
      iconColor: 'text-orange-600',
      trend: 'Aman',
      trendText: 'Tidak ada',
      trendColor: 'text-green-500',
    },
    {
      title: 'Paket Internet',
      value: '10 Mbps',
      icon: 'lucide:wifi',
      bgColor: 'bg-purple-100',
      iconColor: 'text-purple-600',
      trend: 'Unlimited',
      trendText: 'Tanpa FUP',
      trendColor: 'text-purple-500',
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#5936f1] to-[#7f56f9] p-8 text-white shadow-lg">
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl"></div>
        <div className="absolute right-40 bottom-10 h-32 w-32 rounded-full bg-[#38bdf8]/20 blur-2xl"></div>
        
        <div className="relative z-10 flex flex-col gap-2 md:w-2/3">
          <span className="w-fit rounded-full bg-white/20 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider backdrop-blur-sm">
            Portal Pelanggan v2.0
          </span>
          <h1 className="mt-2 text-3xl font-bold md:text-4xl">Selamat Datang, {userName}!</h1>
          <p className="mt-2 text-[14px] text-white/80 max-w-xl">
            Kelola tagihan internet Anda, pantau status layanan, dan laporkan gangguan langsung melalui portal ini.
          </p>
          <button className="mt-4 w-fit rounded-full bg-white px-5 py-2.5 text-[13px] font-bold text-[#5936f1] shadow-md hover:bg-gray-50 transition-colors">
            Lihat Tagihan
          </button>
        </div>

        <div className="hidden absolute right-12 top-1/2 -translate-y-1/2 md:flex items-center justify-center">
           <IconifyIcon icon="lucide:home" className="text-white/30 text-[140px]" />
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {infoCards.map((card, index) => (
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

      {/* Info Banner Bottom */}
      <div className="mt-2 rounded-2xl border border-[#6b42ff]/20 bg-gradient-to-r from-[#6b42ff]/5 to-[#8a42ff]/5 p-5">
        <div className="flex items-start gap-4 md:items-center">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#6b42ff]">
            <IconifyIcon icon="lucide:info" className="text-white text-xl" />
          </div>
          <div>
            <h4 className="text-[15px] font-bold text-[#11101d]">Butuh bantuan?</h4>
            <p className="mt-1 text-[13px] text-gray-600">
              Jika ada kendala dengan layanan internet Anda, silakan ajukan keluhan melalui menu <strong className="text-[#6b42ff]">Keluhan</strong>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
