'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import IconifyIcon from '@/components/common/IconifyIcon';
import { keluhanService } from '@/services/keluhanService';

interface Keluhan {
  id: number;
  kode_keluhan: string;
  kategori: string;
  judul: string;
  deskripsi: string;
  status: string;
  catatan_admin: string | null;
  created_at: string;
  updated_at: string;
}

export default function PelangganDashboardPage() {
  const router = useRouter();
  const [userName, setUserName] = useState('lorens');
  const [keluhanList, setKeluhanList] = useState<Keluhan[]>([]);
  const [isLoadingKeluhan, setIsLoadingKeluhan] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('bumdes_user');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        setUserName(user.username || user.nama || 'lorens');
      } catch (e) {
        console.error('Error parsing stored user:', e);
      }
    }

    const fetchKeluhan = async () => {
      try {
        setIsLoadingKeluhan(true);
        const res = await keluhanService.getAll();
        if (res.ok && res.data?.success && Array.isArray(res.data.data)) {
          setKeluhanList(res.data.data);
        }
      } catch (err) {
        console.error('Error fetching keluhan for dashboard:', err);
      } finally {
        setIsLoadingKeluhan(false);
      }
    };

    fetchKeluhan();
  }, []);

  const activeKeluhanCount = keluhanList.filter(
    (k) => k.status?.toUpperCase() !== 'SELESAI'
  ).length;

  return (
    <div className="flex flex-col gap-6 w-full animate-in fade-in duration-300">

      {/* ─── WELCOME BANNER WITH VECTOR ILLUSTRATION ────────────────── */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950 p-6 sm:p-8 rounded-2xl border border-slate-800 text-white shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">

        {/* Left Content */}
        <div className="relative z-10 max-w-xl">
          <span className="px-2.5 py-1 text-[11px] font-semibold tracking-wider uppercase rounded-md bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            PORTAL PELANGGAN V2.0
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mt-3 leading-snug">
            Selamat Datang, {userName}!
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
            Kelola tagihan internet Anda, pantau status layanan wifi, dan laporkan gangguan teknis secara cepat langsung melalui portal terpadu ini.
          </p>
          <div className="flex flex-wrap items-center gap-3 mt-5">
            <Link
              href="/pelanggan/tagihan"
              className="px-4 py-2.5 text-xs sm:text-sm font-semibold bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white rounded-xl transition-all shadow-sm shadow-emerald-600/30 flex items-center space-x-2"
            >
              <IconifyIcon icon="lucide:qr-code" className="text-xs" />
              <span>Bayar Tagihan (Rp 150.000)</span>
            </Link>
            <Link
              href="/pelanggan/keluhan"
              className="px-4 py-2.5 text-xs sm:text-sm font-semibold bg-slate-800/90 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl transition-all flex items-center space-x-2"
            >
              <IconifyIcon icon="lucide:message-square-plus" className="text-xs text-amber-400" />
              <span>Laporkan Gangguan</span>
            </Link>
          </div>
        </div>

        {/* Right Vector Illustration Graphic */}
        <div className="relative z-10 shrink-0 hidden md:block">
          <div className="relative w-56 h-44 flex items-center justify-center">
            {/* Glowing Background Backdrop */}
            <div className="absolute inset-0 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none"></div>

            {/* CUSTOMER SUPPORT & REPORTING COMPLAINT SVG VECTOR */}
            <svg className="w-full h-full text-emerald-400" viewBox="0 0 240 180" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* Signal Waves */}
              <path d="M 30 50 A 60 60 0 0 1 110 50" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="4 4" className="opacity-60" />
              <path d="M 45 62 A 40 40 0 0 1 95 62" stroke="#34d399" strokeWidth="3" strokeLinecap="round" />

              {/* Person / Customer with Headset Vector */}
              <circle cx="70" cy="85" r="18" fill="#1e293b" stroke="#10b981" strokeWidth="2" />
              <path d="M 40 135 C 40 110 55 105 70 105 C 85 105 100 110 100 135 Z" fill="#0f172a" stroke="#10b981" strokeWidth="2" />
              {/* Headset Arc */}
              <path d="M 52 82 A 18 18 0 0 1 88 82" stroke="#38bdf8" strokeWidth="3" strokeLinecap="round" />
              <rect x="49" y="80" width="6" height="10" rx="3" fill="#38bdf8" />
              <rect x="85" y="80" width="6" height="10" rx="3" fill="#38bdf8" />
              <path d="M 88 88 L 94 92" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round" />
              <circle cx="95" cy="93" r="3" fill="#38bdf8" />

              {/* Floating Report Chat Bubble Card */}
              <g transform="translate(110, 30)">
                <rect x="0" y="0" width="115" height="75" rx="12" fill="#0f172a" stroke="#334155" strokeWidth="1.5" />
                <rect x="12" y="14" width="65" height="7" rx="3.5" fill="#10b981" />
                <rect x="12" y="28" width="85" height="5" rx="2.5" fill="#475569" />
                <rect x="12" y="38" width="70" height="5" rx="2.5" fill="#334155" />
                <rect x="12" y="50" width="35" height="14" rx="7" fill="#059669" />
                <text x="29" y="60" fontSize="8" fill="#ffffff" fontWeight="bold" textAnchor="middle">Lapor</text>
                {/* Alert Exclamation Dot */}
                <circle cx="95" cy="20" r="8" fill="#f59e0b" />
                <text x="95" y="23" fontSize="10" fill="#ffffff" fontWeight="bold" textAnchor="middle">!</text>
              </g>

              {/* Success Check Badge */}
              <g transform="translate(150, 115)">
                <circle cx="20" cy="20" r="18" fill="#064e3b" stroke="#10b981" strokeWidth="2" />
                <path d="M 12 20 L 17 25 L 28 14" stroke="#34d399" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
              </g>
            </svg>
          </div>
        </div>

      </div>

      {/* ─── 4 METRIC CARDS FOR CUSTOMER ──────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

        {/* Card 1: Status Langganan */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between hover:border-emerald-500/40 transition-all">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
              <IconifyIcon icon="lucide:check-circle-2" className="text-lg" />
            </div>
            <span className="px-2 py-0.5 text-[11px] font-semibold text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-lg">
              Normal
            </span>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-bold text-slate-900">Aktif</h3>
            <p className="text-xs text-slate-500 font-medium mt-0.5">Status Langganan WiFi</p>
            <span className="text-[11px] text-emerald-600 block mt-2 font-medium flex items-center gap-1">
              <IconifyIcon icon="lucide:signal" className="text-[11px]" />
              Koneksi Stabil (IP: 10.20.1.42)
            </span>
          </div>
        </div>

        {/* Card 2: Tagihan Bulan Ini */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between hover:border-amber-500/40 transition-all">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100">
              <IconifyIcon icon="lucide:receipt" className="text-lg" />
            </div>
            <span className="px-2 py-0.5 text-[11px] font-semibold text-amber-600 bg-amber-50 border border-amber-200 rounded-lg">
              Belum Lunas
            </span>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-bold text-slate-900">Rp 150.000</h3>
            <p className="text-xs text-slate-500 font-medium mt-0.5">Tagihan Agustus 2026</p>
            <span className="text-[11px] text-amber-600 block mt-2 font-medium flex items-center gap-1">
              <IconifyIcon icon="lucide:calendar" className="text-[11px]" />
              Jatuh Tempo: 20 Aug 2026
            </span>
          </div>
        </div>

        {/* Card 3: Keluhan Aktif */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between hover:border-emerald-500/40 transition-all">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center border border-teal-100">
              <IconifyIcon icon="lucide:message-square" className="text-lg" />
            </div>
            <span className={`px-2 py-0.5 text-[11px] font-semibold rounded-lg ${activeKeluhanCount === 0 ? 'text-emerald-600 bg-emerald-50 border border-emerald-200' : 'text-amber-600 bg-amber-50 border border-amber-200'}`}>
              {activeKeluhanCount === 0 ? 'Aman' : 'Perlu Respon'}
            </span>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-bold text-slate-900">{activeKeluhanCount} Laporan</h3>
            <p className="text-xs text-slate-500 font-medium mt-0.5">Keluhan Aktif Saat Ini</p>
            <span className="text-[11px] text-slate-400 block mt-2">
              {activeKeluhanCount === 0 ? 'Tidak ada kendala terdeteksi' : 'Laporan sedang ditangani teknisi'}
            </span>
          </div>
        </div>

        {/* Card 4: Paket Internet */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between hover:border-sky-500/40 transition-all">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center border border-sky-100">
              <IconifyIcon icon="lucide:wifi" className="text-lg" />
            </div>
            <span className="px-2 py-0.5 text-[11px] font-semibold text-sky-600 bg-sky-50 border border-sky-200 rounded-lg">
              Unlimited
            </span>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-bold text-slate-900">10 Mbps</h3>
            <p className="text-xs text-slate-500 font-medium mt-0.5">Paket Home Family</p>
            <span className="text-[11px] text-sky-600 block mt-2 font-medium flex items-center gap-1">
              <IconifyIcon icon="lucide:infinity" className="text-[11px]" />
              Tanpa FUP / Kuota Terbatas
            </span>
          </div>
        </div>

      </div>

      {/* ─── QUICK HELP / CALLOUT CARD ─────────────────────────────── */}
      <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-emerald-950/60 via-slate-900 to-slate-900 border border-emerald-500/30 text-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30 shrink-0">
            <IconifyIcon icon="lucide:headphones" className="text-xl" />
          </div>
          <div>
            <h4 className="text-sm sm:text-base font-bold text-white">
              Butuh bantuan atau koneksi lambat?
            </h4>
            <p className="text-xs text-slate-300 mt-0.5">
              Tim teknisi BUMDes Tirta Sejahtera siap membantu menangani masalah jaringan rumah Anda.
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2.5 w-full sm:w-auto shrink-0">
          <Link
            href="/pelanggan/keluhan"
            className="w-full sm:w-auto px-4 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl transition-all flex items-center justify-center space-x-2 shadow-xs"
          >
            <IconifyIcon icon="lucide:plus" className="text-xs" />
            <span>Buat Laporan Baru</span>
          </Link>
          <a
            href="https://wa.me/628123456789"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto px-4 py-2 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-slate-700 rounded-xl transition-all flex items-center justify-center space-x-2"
          >
            <IconifyIcon icon="lucide:message-circle" className="text-sm" />
            <span>Chat CS WA</span>
          </a>
        </div>
      </div>

      {/* ─── RECENT BILLS & COMPLAINTS HISTORY GRID ────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* LEFT CARD: RIWAYAT TAGIHAN INTERNET */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">Riwayat Tagihan Internet</h3>
              <p className="text-xs text-slate-500">Daftar iuran bulanan pelanggan BUMDes.</p>
            </div>
            <Link href="/pelanggan/tagihan" className="text-xs font-semibold text-emerald-600 hover:underline">
              Bayar Sekarang &rarr;
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="py-2.5 px-3">Periode</th>
                  <th className="py-2.5 px-3">Nominal</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
                <tr className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3 px-3 font-semibold text-slate-900">Agustus 2026</td>
                  <td className="py-3 px-3 font-medium text-slate-700">Rp 150.000</td>
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 text-[10px] font-semibold bg-amber-50 text-amber-600 rounded-full border border-amber-200">
                      BELUM LUNAS
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right">
                    <Link
                      href="/pelanggan/tagihan"
                      className="px-2.5 py-1 text-[11px] bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-semibold shadow-xs transition-colors"
                    >
                      Bayar
                    </Link>
                  </td>
                </tr>
                <tr className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3 px-3 font-semibold text-slate-900">Juli 2026</td>
                  <td className="py-3 px-3 font-medium text-slate-700">Rp 150.000</td>
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 text-[10px] font-semibold bg-emerald-50 text-emerald-600 rounded-full border border-emerald-200">
                      LUNAS
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right">
                    <button
                      onClick={() => alert('Mengunduh bukti pembayaran Struk Juli 2026...')}
                      className="px-2.5 py-1 text-[11px] bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-lg font-semibold transition-colors flex items-center space-x-1 ml-auto"
                    >
                      <IconifyIcon icon="lucide:download" className="text-xs" />
                      <span>Struk</span>
                    </button>
                  </td>
                </tr>
                <tr className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3 px-3 font-semibold text-slate-900">Juni 2026</td>
                  <td className="py-3 px-3 font-medium text-slate-700">Rp 150.000</td>
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 text-[10px] font-semibold bg-emerald-50 text-emerald-600 rounded-full border border-emerald-200">
                      LUNAS
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right">
                    <button
                      onClick={() => alert('Mengunduh bukti pembayaran Struk Juni 2026...')}
                      className="px-2.5 py-1 text-[11px] bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-lg font-semibold transition-colors flex items-center space-x-1 ml-auto"
                    >
                      <IconifyIcon icon="lucide:download" className="text-xs" />
                      <span>Struk</span>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* RIGHT CARD: RIWAYAT KELUHAN SAYA */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">Riwayat Keluhan Saya</h3>
              <p className="text-xs text-slate-500">Status pengerjaan laporan gangguan teknis.</p>
            </div>
            <Link href="/pelanggan/keluhan" className="text-xs font-semibold text-emerald-600 hover:underline">
              + Buat Laporan
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="py-2.5 px-3">Kode</th>
                  <th className="py-2.5 px-3">Masalah</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
                {isLoadingKeluhan ? (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-slate-400 text-xs">
                      <IconifyIcon icon="lucide:loader-2" className="animate-spin inline mr-2 text-emerald-600" />
                      Memuat riwayat keluhan...
                    </td>
                  </tr>
                ) : keluhanList.length > 0 ? (
                  keluhanList.slice(0, 5).map((item) => {
                    const sUpper = item.status?.toUpperCase();
                    const isSelesai = sUpper === 'SELESAI';
                    const isDiproses = sUpper === 'DIPROSES' || sUpper === 'PROSES';

                    let badgeClass = 'bg-amber-50 text-amber-600 border-amber-200';
                    let dotClass = 'bg-amber-500 animate-pulse';
                    let statusText = 'MENUNGGU';

                    if (isSelesai) {
                      badgeClass = 'bg-emerald-50 text-emerald-600 border-emerald-200';
                      dotClass = 'bg-emerald-500';
                      statusText = 'SELESAI';
                    } else if (isDiproses) {
                      badgeClass = 'bg-sky-50 text-sky-600 border-sky-200';
                      dotClass = 'bg-sky-500 animate-pulse';
                      statusText = 'DIPROSES';
                    }

                    return (
                      <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3 px-3 font-semibold text-emerald-600">#{item.kode_keluhan}</td>
                        <td className="py-3 px-3 text-slate-700 max-w-xs truncate">{item.judul}</td>
                        <td className="py-3 px-3">
                          <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full border inline-flex items-center gap-1 ${badgeClass}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${dotClass}`}></span> {statusText}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right">
                          <Link
                            href="/pelanggan/keluhan"
                            className="px-2.5 py-1 text-[11px] bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-lg font-semibold transition-colors inline-block"
                          >
                            Detail
                          </Link>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-slate-400 text-xs">
                      Belum ada riwayat keluhan.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

    </div>
  );
}
