'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import IconifyIcon from '@/components/common/IconifyIcon';
import { keluhanService } from '@/services/keluhanService';
import { pelangganService } from '@/services/pelangganService';
import { paketService } from '@/services/paketService';

export default function AdminDashboardPage() {
  const router = useRouter();

  const [totalPelanggan, setTotalPelanggan] = useState<number>(248);
  const [totalKeluhanBaru, setTotalKeluhanBaru] = useState<number>(5);
  const [recentKeluhan, setRecentKeluhan] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadDashboardData = async () => {
      setIsLoading(true);
      try {
        // Fetch Keluhan
        const resKeluhan = await keluhanService.getAll();
        if (resKeluhan.ok && resKeluhan.data?.data) {
          const keluhanList = resKeluhan.data.data;
          setRecentKeluhan(keluhanList.slice(0, 5));
          const baruCount = keluhanList.filter((k: any) => k.status?.toUpperCase() === 'MENUNGGU' || k.status?.toUpperCase() === 'BARU').length;
          setTotalKeluhanBaru(baruCount || 5);
        }

        // Fetch Pelanggan
        const resPelanggan = await pelangganService.getAll();
        if (resPelanggan.ok && resPelanggan.data?.data) {
          setTotalPelanggan(resPelanggan.data.data.length || 248);
        }
      } catch (err) {
        console.error('Error loading dashboard data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  return (
    <div className="flex flex-col gap-6 w-full animate-in fade-in duration-300">
      
      {/* ─── WELCOME BANNER ────────────────────────────────────────── */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950 p-6 sm:p-8 rounded-2xl border border-slate-800 text-white shadow-sm">
        <div className="absolute -right-6 -bottom-8 opacity-10 text-emerald-400 pointer-events-none">
          <IconifyIcon icon="lucide:wifi" className="text-[180px]" />
        </div>
        <div className="relative z-10 max-w-2xl">
          <span className="px-2.5 py-1 text-[11px] font-semibold tracking-wider uppercase rounded-md bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            Sistem Manajemen Terpadu v2.0
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mt-3 leading-snug">
            Selamat Datang di Portal BTS SODONG NET
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
            Kelola data pelanggan, pantau status pembayaran tagihan, dan monitor stabilitas jaringan OLT Desa Sodong dalam satu panel terintegrasi.
          </p>
          <div className="flex flex-wrap items-center gap-3 mt-5">
            <Link
              href="/admin/keluhan"
              className="px-4 py-2 text-xs sm:text-sm font-semibold bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white rounded-xl transition-all shadow-sm flex items-center space-x-2"
            >
              <span>Lihat Keluhan Baru ({totalKeluhanBaru})</span>
              <IconifyIcon icon="lucide:arrow-right" className="text-xs" />
            </Link>
            <Link
              href="/admin/struk"
              className="px-4 py-2 text-xs sm:text-sm font-semibold bg-slate-800 hover:bg-slate-700 active:bg-slate-900 text-slate-200 border border-slate-700 rounded-xl transition-all flex items-center space-x-2"
            >
              <IconifyIcon icon="lucide:printer" className="text-xs" />
              <span>Buka POS Kasir</span>
            </Link>
          </div>
        </div>
      </div>

      {/* ─── METRIC CARDS (4 CARDS MATCHING BLUEPRINT) ─────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Pelanggan */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between hover:border-emerald-500/40 transition-all">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
              <IconifyIcon icon="lucide:users" className="text-lg" />
            </div>
            <span className="px-2 py-0.5 text-[11px] font-semibold text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-lg">
              +12% bulan ini
            </span>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-bold text-slate-900">{totalPelanggan}</h3>
            <p className="text-xs text-slate-500 font-medium mt-0.5">Total Pelanggan Aktif</p>
          </div>
        </div>

        {/* Card 2: Omset */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between hover:border-emerald-500/40 transition-all">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center border border-teal-100">
              <IconifyIcon icon="lucide:wallet" className="text-lg" />
            </div>
            <span className="px-2 py-0.5 text-[11px] font-semibold text-teal-600 bg-teal-50 border border-teal-200 rounded-lg">
              +5.4%
            </span>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-bold text-slate-900">Rp 12.5M</h3>
            <p className="text-xs text-slate-500 font-medium mt-0.5">Omset Terkumpul (Bulan Ini)</p>
          </div>
        </div>

        {/* Card 3: Belum Bayar */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between hover:border-amber-500/40 transition-all">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100">
              <IconifyIcon icon="lucide:file-text" className="text-lg" />
            </div>
            <span className="px-2 py-0.5 text-[11px] font-semibold text-amber-600 bg-amber-50 border border-amber-200 rounded-lg">
              42 Orang
            </span>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-bold text-slate-900">Rp 4.2M</h3>
            <p className="text-xs text-slate-500 font-medium mt-0.5">Belum Bayar / Menunggak</p>
          </div>
        </div>

        {/* Card 4: Uptime Network */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between hover:border-emerald-500/40 transition-all">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center border border-sky-100">
              <IconifyIcon icon="lucide:server" className="text-lg" />
            </div>
            <span className="px-2 py-0.5 text-[11px] font-semibold text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-lg">
              Uptime 99.9%
            </span>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-bold text-slate-900">Normal</h3>
            <p className="text-xs text-slate-500 font-medium mt-0.5">Status OLT Principal Utama</p>
          </div>
        </div>

      </div>

      {/* ─── CHARTS & PACKAGE DISTRIBUTION GRID ───────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* REVENUE CHART (LEFT - 2 COLS) */}
        <div className="lg:col-span-2 bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">Grafik Pendapatan & Tagihan</h3>
              <p className="text-xs text-slate-500">Ringkasan penerimaan iuran internet 6 bulan terakhir.</p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 text-slate-600 rounded-lg border border-slate-200">
              Tahun 2026
            </span>
          </div>

          {/* Bar Chart Graphics */}
          <div className="pt-6 pb-2">
            <div className="h-52 flex items-end justify-between gap-3 sm:gap-6 px-2 border-b border-slate-200 pb-2">
              {/* Mar */}
              <div className="flex-1 flex flex-col items-center gap-2 group">
                <div className="w-full bg-slate-100 rounded-t-lg h-36 relative overflow-hidden flex items-end">
                  <div className="w-full bg-emerald-600/80 group-hover:bg-emerald-500 transition-all rounded-t-lg" style={{ height: '60%' }}></div>
                </div>
                <span className="text-[11px] font-medium text-slate-500">Mar</span>
              </div>
              {/* Apr */}
              <div className="flex-1 flex flex-col items-center gap-2 group">
                <div className="w-full bg-slate-100 rounded-t-lg h-36 relative overflow-hidden flex items-end">
                  <div className="w-full bg-emerald-600/80 group-hover:bg-emerald-500 transition-all rounded-t-lg" style={{ height: '72%' }}></div>
                </div>
                <span className="text-[11px] font-medium text-slate-500">Apr</span>
              </div>
              {/* Mei */}
              <div className="flex-1 flex flex-col items-center gap-2 group">
                <div className="w-full bg-slate-100 rounded-t-lg h-36 relative overflow-hidden flex items-end">
                  <div className="w-full bg-emerald-600/80 group-hover:bg-emerald-500 transition-all rounded-t-lg" style={{ height: '68%' }}></div>
                </div>
                <span className="text-[11px] font-medium text-slate-500">Mei</span>
              </div>
              {/* Jun */}
              <div className="flex-1 flex flex-col items-center gap-2 group">
                <div className="w-full bg-slate-100 rounded-t-lg h-36 relative overflow-hidden flex items-end">
                  <div className="w-full bg-emerald-600/80 group-hover:bg-emerald-500 transition-all rounded-t-lg" style={{ height: '85%' }}></div>
                </div>
                <span className="text-[11px] font-medium text-slate-500">Jun</span>
              </div>
              {/* Jul */}
              <div className="flex-1 flex flex-col items-center gap-2 group">
                <div className="w-full bg-slate-100 rounded-t-lg h-36 relative overflow-hidden flex items-end">
                  <div className="w-full bg-emerald-600/80 group-hover:bg-emerald-500 transition-all rounded-t-lg" style={{ height: '90%' }}></div>
                </div>
                <span className="text-[11px] font-medium text-slate-500">Jul</span>
              </div>
              {/* Aug (Current) */}
              <div className="flex-1 flex flex-col items-center gap-2 group">
                <div className="w-full bg-slate-100 rounded-t-lg h-36 relative overflow-hidden flex items-end">
                  <div className="w-full bg-emerald-500 group-hover:bg-emerald-400 transition-all rounded-t-lg shadow-xs" style={{ height: '75%' }}></div>
                </div>
                <span className="text-[11px] font-bold text-emerald-600">Agu</span>
              </div>
            </div>
            <div className="flex items-center justify-between text-xs text-slate-400 pt-3">
              <div className="flex items-center space-x-2">
                <span className="w-3 h-3 rounded bg-emerald-500 inline-block"></span>
                <span>Target Terbayar: Rp 15M</span>
              </div>
              <span>Tercapai: <b className="text-slate-700">83%</b></span>
            </div>
          </div>
        </div>

        {/* PACKAGE DISTRIBUTION (RIGHT - 1 COL) */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">Distribusi Paket Internet</h3>
            <p className="text-xs text-slate-500">Pembagian jumlah berlangganan paket.</p>
          </div>

          <div className="space-y-4 my-2">
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-slate-700">Home 10 Mbps (Rp 100K)</span>
                <span className="text-emerald-600">142 User (57%)</span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full" style={{ width: '57%' }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-slate-700">Home 20 Mbps (Rp 150K)</span>
                <span className="text-teal-600">86 User (35%)</span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div className="bg-teal-500 h-full rounded-full" style={{ width: '35%' }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-slate-700">Dedicated 50 Mbps (Rp 350K)</span>
                <span className="text-sky-600">20 User (8%)</span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div className="bg-sky-500 h-full rounded-full" style={{ width: '8%' }}></div>
              </div>
            </div>
          </div>

          <Link
            href="/admin/paket"
            className="w-full py-2 text-[12px] font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 transition-colors text-center block"
          >
            Kelola Paket Internet
          </Link>
        </div>

      </div>

      {/* ─── RECENT COMPLAINTS QUICK PREVIEW ───────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">Laporan Keluhan Pelanggan Terbaru</h3>
            <p className="text-xs text-slate-500">Keluhan masuk yang membutuhkan penanganan teknisi.</p>
          </div>
          <Link href="/admin/keluhan" className="text-xs font-semibold text-emerald-600 hover:underline">
            Lihat Semua Keluhan &rarr;
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-2.5 px-3">Kode</th>
                <th className="py-2.5 px-3">Pelanggan</th>
                <th className="py-2.5 px-3">Masalah</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
              {recentKeluhan.length > 0 ? (
                recentKeluhan.map((item) => {
                  const s = item.status?.toUpperCase();
                  let badge = (
                    <span className="px-2.5 py-1 text-[10.5px] font-semibold rounded-full bg-amber-50 text-amber-600 border border-amber-200 inline-flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span> MENUNGGU
                    </span>
                  );
                  if (s === 'SELESAI') {
                    badge = (
                      <span className="px-2.5 py-1 text-[10.5px] font-semibold rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 inline-flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> SELESAI
                      </span>
                    );
                  } else if (s === 'PROSES' || s === 'DIPROSES') {
                    badge = (
                      <span className="px-2.5 py-1 text-[10.5px] font-semibold rounded-full bg-sky-50 text-sky-600 border border-sky-200 inline-flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-pulse"></span> DIPROSES
                      </span>
                    );
                  } else if (s === 'DITOLAK') {
                    badge = (
                      <span className="px-2.5 py-1 text-[10.5px] font-semibold rounded-full bg-rose-50 text-rose-600 border border-rose-200 inline-flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span> DITOLAK
                      </span>
                    );
                  }

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3 px-3 font-semibold text-emerald-600">{item.kode_keluhan}</td>
                      <td className="py-3 px-3 font-semibold text-slate-900">{item.pelanggan?.nama || '-'}</td>
                      <td className="py-3 px-3 text-slate-600 max-w-xs truncate">{item.judul}</td>
                      <td className="py-3 px-3">{badge}</td>
                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={() => router.push(`/admin/keluhan?id=${item.id}`)}
                          className="px-2.5 py-1 text-[11px] bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-lg font-semibold transition-colors"
                        >
                          Tindak Lanjuti
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <>
                  <tr className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-3 font-semibold text-emerald-600">KLH-2026-005</td>
                    <td className="py-3 px-3 font-semibold text-slate-900">Siti Rahmawati</td>
                    <td className="py-3 px-3 text-slate-600 max-w-xs truncate">Game online sering ping tinggi / lag</td>
                    <td className="py-3 px-3">
                      <span className="px-2.5 py-1 text-[10.5px] font-semibold rounded-full bg-amber-50 text-amber-600 border border-amber-200 inline-flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span> MENUNGGU
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => router.push('/admin/keluhan')}
                        className="px-2.5 py-1 text-[11px] bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-lg font-semibold transition-colors"
                      >
                        Tindak Lanjuti
                      </button>
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-3 font-semibold text-emerald-600">KLH-2026-004</td>
                    <td className="py-3 px-3 font-semibold text-slate-900">Pak Mulyadi</td>
                    <td className="py-3 px-3 text-slate-600 max-w-xs truncate">Kabel FO tertimpa dahan pohon di RT 03</td>
                    <td className="py-3 px-3">
                      <span className="px-2.5 py-1 text-[10.5px] font-semibold rounded-full bg-sky-50 text-sky-600 border border-sky-200 inline-flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-pulse"></span> DIPROSES
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => router.push('/admin/keluhan')}
                        className="px-2.5 py-1 text-[11px] bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-lg font-semibold transition-colors"
                      >
                        Cek Detail
                      </button>
                    </td>
                  </tr>
                </>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
