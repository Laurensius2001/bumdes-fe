'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import IconifyIcon from '@/components/common/IconifyIcon';
import { keluhanService } from '@/services/keluhanService';
import { pelangganService } from '@/services/pelangganService';
import { paketService } from '@/services/paketService';

export default function AdminDashboardPage() {
  const router = useRouter();

  const [pelangganList, setPelangganList] = useState<any[]>([]);
  const [paketList, setPaketList] = useState<any[]>([]);
  const [keluhanList, setKeluhanList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // ─── Fetch All Real Data ──────────────────────────────────────
  const loadDashboardData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [resPelanggan, resPaket, resKeluhan] = await Promise.all([
        pelangganService.getAll(),
        paketService.getAll(),
        keluhanService.getAll(),
      ]);

      if (resPelanggan.ok && resPelanggan.data?.data) {
        setPelangganList(resPelanggan.data.data);
      }

      if (resPaket.ok && resPaket.data?.data) {
        setPaketList(resPaket.data.data);
      }

      if (resKeluhan.ok && resKeluhan.data?.data) {
        setKeluhanList(resKeluhan.data.data);
      }
    } catch (err) {
      console.error('Error loading dashboard data:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  // ─── Computations from Real Data ──────────────────────────────
  // 1. Pelanggan Metrics
  const totalPelanggan = pelangganList.length;
  const pelangganAktif = useMemo(() => {
    return pelangganList.filter((p) => String(p.status || '').toLowerCase() === 'aktif').length;
  }, [pelangganList]);
  const pelangganNonaktif = totalPelanggan - pelangganAktif;

  // 2. Paket Internet Metrics
  const totalPaket = paketList.length;
  const paketPPPOE = useMemo(() => paketList.filter((p) => p.jenis_paket === 'PPPOE').length, [paketList]);
  const paketVoucher = useMemo(() => paketList.filter((p) => p.jenis_paket === 'VOUCHER').length, [paketList]);

  // 3. Estimasi Pendapatan Bulanan (Dari pelanggan aktif * harga paket)
  const estimasiPendapatan = useMemo(() => {
    const paketMap = new Map<number, number>();
    paketList.forEach((pkt) => {
      paketMap.set(pkt.id, Number(pkt.harga) || 0);
    });

    return pelangganList.reduce((acc, p) => {
      if (String(p.status || '').toLowerCase() === 'aktif') {
        const harga = paketMap.get(p.paket_id) || 0;
        return acc + harga;
      }
      return acc;
    }, 0);
  }, [pelangganList, paketList]);

  // 4. Keluhan Metrics
  const totalKeluhan = keluhanList.length;
  const keluhanMenunggu = useMemo(() => {
    return keluhanList.filter((k) => {
      const s = String(k.status || '').toUpperCase();
      return s === 'MENUNGGU' || s === 'BARU';
    }).length;
  }, [keluhanList]);

  const keluhanDiproses = useMemo(() => {
    return keluhanList.filter((k) => {
      const s = String(k.status || '').toUpperCase();
      return s === 'DIPROSES' || s === 'PROSES';
    }).length;
  }, [keluhanList]);

  const keluhanSelesai = useMemo(() => {
    return keluhanList.filter((k) => String(k.status || '').toUpperCase() === 'SELESAI').length;
  }, [keluhanList]);

  const keluhanDitolak = useMemo(() => {
    return keluhanList.filter((k) => String(k.status || '').toUpperCase() === 'DITOLAK').length;
  }, [keluhanList]);

  const persentaseSelesai = totalKeluhan > 0 ? Math.round((keluhanSelesai / totalKeluhan) * 100) : 100;

  // 5. Distribusi Paket Internet (Real Count per Paket)
  const distribusiPaket = useMemo(() => {
    return paketList.map((pkt) => {
      const userCount = pelangganList.filter((p) => p.paket_id === pkt.id).length;
      const persentase = totalPelanggan > 0 ? Math.round((userCount / totalPelanggan) * 100) : 0;
      return {
        ...pkt,
        userCount,
        persentase,
      };
    }).sort((a, b) => b.userCount - a.userCount);
  }, [paketList, pelangganList, totalPelanggan]);

  // 6. Recent Keluhan (5 data terbaru)
  const recentKeluhan = useMemo(() => {
    return [...keluhanList]
      .sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime())
      .slice(0, 5);
  }, [keluhanList]);

  return (
    <div className="flex flex-col gap-6 w-full animate-in fade-in duration-300">
      
      {/* ─── WELCOME BANNER ────────────────────────────────────────── */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950 p-6 sm:p-8 rounded-2xl border border-slate-800 text-white shadow-sm">
        <div className="absolute -right-6 -bottom-8 opacity-10 text-emerald-400 pointer-events-none">
          <IconifyIcon icon="lucide:wifi" className="text-[180px]" />
        </div>
        <div className="relative z-10 max-w-2xl">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 text-[11px] font-semibold tracking-wider uppercase rounded-md bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              BUMDes Tirta Sejahtera
            </span>
            <span className="px-2.5 py-1 text-[11px] font-semibold tracking-wider uppercase rounded-md bg-blue-500/20 text-blue-400 border border-blue-500/30">
              BTS SODONG NET
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mt-3 leading-snug">
            Selamat Datang di Portal Admin BTS SODONG NET
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
            Kelola data pelanggan, pantau keluhan jaringan internet desa, kelola paket layanan, dan cetak struk pembayaran resmi secara terpadu.
          </p>
          
          {/* Quick Shortcuts */}
          <div className="flex flex-wrap items-center gap-3 mt-5">
            <Link
              href="/admin/keluhan"
              className="px-4 py-2 text-xs sm:text-sm font-semibold bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white rounded-xl transition-all shadow-sm flex items-center space-x-2"
            >
              <span>Keluhan Menunggu ({keluhanMenunggu})</span>
              <IconifyIcon icon="lucide:arrow-right" className="text-xs" />
            </Link>
            <Link
              href="/admin/struk"
              className="px-4 py-2 text-xs sm:text-sm font-semibold bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white rounded-xl transition-all shadow-sm flex items-center space-x-2"
            >
              <IconifyIcon icon="lucide:printer" className="text-sm" />
              <span>Cetak Struk Pembayaran</span>
            </Link>
            <Link
              href="/admin/pelanggan"
              className="px-4 py-2 text-xs sm:text-sm font-semibold bg-slate-800 hover:bg-slate-700 active:bg-slate-900 text-slate-200 border border-slate-700 rounded-xl transition-all flex items-center space-x-2"
            >
              <IconifyIcon icon="lucide:users" className="text-sm" />
              <span>Data Pelanggan</span>
            </Link>
          </div>
        </div>
      </div>

      {/* ─── REAL METRIC CARDS (4 CLICKABLE STATS) ─────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

        {/* Card 1: Total Pelanggan Aktif -> Links to Pelanggan */}
        <Link
          href="/admin/pelanggan"
          className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between hover:border-emerald-500 hover:shadow-md hover:-translate-y-0.5 transition-all group cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
              <IconifyIcon icon="lucide:users" className="text-lg" />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="px-2 py-0.5 text-[11px] font-semibold text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-lg">
                {pelangganAktif} Aktif
              </span>
              <IconifyIcon icon="lucide:arrow-up-right" className="text-sm text-slate-400 group-hover:text-emerald-600 transition-colors" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">
              {isLoading ? '...' : totalPelanggan}
            </h3>
            <p className="text-xs text-slate-500 font-medium mt-0.5 flex items-center justify-between">
              <span>Total Pelanggan Terdaftar</span>
              <span className="text-emerald-600 font-semibold group-hover:underline text-[11px]">Lihat &rarr;</span>
            </p>
          </div>
        </Link>

        {/* Card 2: Estimasi Potensi Pendapatan Bulanan -> Links to Struk */}
        <Link
          href="/admin/struk"
          className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between hover:border-teal-500 hover:shadow-md hover:-translate-y-0.5 transition-all group cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center border border-teal-100 group-hover:bg-teal-600 group-hover:text-white transition-colors">
              <IconifyIcon icon="lucide:wallet" className="text-lg" />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="px-2 py-0.5 text-[11px] font-semibold text-teal-600 bg-teal-50 border border-teal-200 rounded-lg">
                Iuran Bulanan
              </span>
              <IconifyIcon icon="lucide:arrow-up-right" className="text-sm text-slate-400 group-hover:text-teal-600 transition-colors" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-bold text-slate-900 group-hover:text-teal-600 transition-colors">
              {isLoading ? '...' : `Rp ${estimasiPendapatan.toLocaleString('id-ID')}`}
            </h3>
            <p className="text-xs text-slate-500 font-medium mt-0.5 flex items-center justify-between">
              <span>Estimasi Pendapatan Paket</span>
              <span className="text-teal-600 font-semibold group-hover:underline text-[11px]">Cetak Struk &rarr;</span>
            </p>
          </div>
        </Link>

        {/* Card 3: Keluhan Pelanggan -> Links to Keluhan */}
        <Link
          href="/admin/keluhan"
          className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between hover:border-amber-500 hover:shadow-md hover:-translate-y-0.5 transition-all group cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100 group-hover:bg-amber-600 group-hover:text-white transition-colors">
              <IconifyIcon icon="lucide:message-square-warning" className="text-lg" />
            </div>
            <div className="flex items-center gap-1.5">
              <span className={`px-2 py-0.5 text-[11px] font-semibold rounded-lg border ${
                keluhanMenunggu > 0
                  ? 'text-amber-600 bg-amber-50 border-amber-200'
                  : 'text-emerald-600 bg-emerald-50 border-emerald-200'
              }`}>
                {keluhanMenunggu > 0 ? `${keluhanMenunggu} Perlu Ditangani` : 'Semua Beres'}
              </span>
              <IconifyIcon icon="lucide:arrow-up-right" className="text-sm text-slate-400 group-hover:text-amber-600 transition-colors" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-bold text-slate-900 group-hover:text-amber-600 transition-colors">
              {isLoading ? '...' : totalKeluhan}
            </h3>
            <p className="text-xs text-slate-500 font-medium mt-0.5 flex items-center justify-between">
              <span>Total Laporan Keluhan</span>
              <span className="text-amber-600 font-semibold group-hover:underline text-[11px]">Proses &rarr;</span>
            </p>
          </div>
        </Link>

        {/* Card 4: Paket Layanan Internet -> Links to Paket */}
        <Link
          href="/admin/paket"
          className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between hover:border-blue-500 hover:shadow-md hover:-translate-y-0.5 transition-all group cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <IconifyIcon icon="lucide:wifi" className="text-lg" />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="px-2 py-0.5 text-[11px] font-semibold text-blue-600 bg-blue-50 border border-blue-200 rounded-lg">
                {paketPPPOE} PPPoE / {paketVoucher} Voucher
              </span>
              <IconifyIcon icon="lucide:arrow-up-right" className="text-sm text-slate-400 group-hover:text-blue-600 transition-colors" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
              {isLoading ? '...' : totalPaket}
            </h3>
            <p className="text-xs text-slate-500 font-medium mt-0.5 flex items-center justify-between">
              <span>Pilihan Paket Internet</span>
              <span className="text-blue-600 font-semibold group-hover:underline text-[11px]">Kelola &rarr;</span>
            </p>
          </div>
        </Link>

      </div>

      {/* ─── CHARTS & PACKAGE DISTRIBUTION (REAL DATA) ─────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* RINGKASAN STATUS KELUHAN & LAYANAN (LEFT - 2 COLS) */}
        <div className="lg:col-span-2 bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">Ringkasan Status Keluhan Pelanggan</h3>
              <p className="text-xs text-slate-500">Pemantauan progres penyelesaian laporan gangguan & kendala teknis.</p>
            </div>
            <Link
              href="/admin/keluhan"
              className="text-xs font-semibold px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg border border-emerald-200 transition-colors flex items-center gap-1"
            >
              <span>{persentaseSelesai}% Terselesaikan</span>
              <IconifyIcon icon="lucide:arrow-right" className="text-xs" />
            </Link>
          </div>

          {/* Keluhan Status Progress Cards -> All clickable to Keluhan */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {/* Menunggu */}
            <Link
              href="/admin/keluhan"
              className="p-3.5 rounded-xl bg-amber-50/60 border border-amber-200/80 hover:bg-amber-100/80 hover:border-amber-300 transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between text-amber-700 mb-1">
                <span className="text-[11px] font-bold uppercase tracking-wider">Menunggu</span>
                <IconifyIcon icon="lucide:clock" className="text-sm" />
              </div>
              <div className="text-xl font-bold text-amber-900">{keluhanMenunggu}</div>
              <div className="text-[10.5px] text-amber-600 font-medium mt-0.5 group-hover:underline">Belum diproses &rarr;</div>
            </Link>

            {/* Diproses */}
            <Link
              href="/admin/keluhan"
              className="p-3.5 rounded-xl bg-sky-50/60 border border-sky-200/80 hover:bg-sky-100/80 hover:border-sky-300 transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between text-sky-700 mb-1">
                <span className="text-[11px] font-bold uppercase tracking-wider">Diproses</span>
                <IconifyIcon icon="lucide:loader-2" className="text-sm animate-spin" />
              </div>
              <div className="text-xl font-bold text-sky-900">{keluhanDiproses}</div>
              <div className="text-[10.5px] text-sky-600 font-medium mt-0.5 group-hover:underline">Ditangani teknisi &rarr;</div>
            </Link>

            {/* Selesai */}
            <Link
              href="/admin/keluhan"
              className="p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-200/80 hover:bg-emerald-100/80 hover:border-emerald-300 transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between text-emerald-700 mb-1">
                <span className="text-[11px] font-bold uppercase tracking-wider">Selesai</span>
                <IconifyIcon icon="lucide:check-circle-2" className="text-sm" />
              </div>
              <div className="text-xl font-bold text-emerald-900">{keluhanSelesai}</div>
              <div className="text-[10.5px] text-emerald-600 font-medium mt-0.5 group-hover:underline">Kendala tuntas &rarr;</div>
            </Link>

            {/* Ditolak */}
            <Link
              href="/admin/keluhan"
              className="p-3.5 rounded-xl bg-rose-50/60 border border-rose-200/80 hover:bg-rose-100/80 hover:border-rose-300 transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between text-rose-700 mb-1">
                <span className="text-[11px] font-bold uppercase tracking-wider">Ditolak</span>
                <IconifyIcon icon="lucide:x-circle" className="text-sm" />
              </div>
              <div className="text-xl font-bold text-rose-900">{keluhanDitolak}</div>
              <div className="text-[10.5px] text-rose-600 font-medium mt-0.5 group-hover:underline">Luar cakupan &rarr;</div>
            </Link>
          </div>

          {/* Quick Action Navigation Buttons */}
          <div className="pt-2 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Link
              href="/admin/pelanggan"
              className="p-3 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-emerald-50 hover:border-emerald-200 transition-all flex items-center gap-3 group"
            >
              <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <IconifyIcon icon="lucide:user-plus" className="text-base" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-800 group-hover:text-emerald-700">Tambah Pelanggan</div>
                <div className="text-[10.5px] text-slate-500">Registrasi akun baru</div>
              </div>
            </Link>

            <Link
              href="/admin/paket"
              className="p-3 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-blue-50 hover:border-blue-200 transition-all flex items-center gap-3 group"
            >
              <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
                <IconifyIcon icon="lucide:plus-circle" className="text-base" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-800 group-hover:text-blue-700">Atur Paket Internet</div>
                <div className="text-[10.5px] text-slate-500">Tambah / edit tarif</div>
              </div>
            </Link>

            <Link
              href="/admin/struk"
              className="p-3 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-indigo-50 hover:border-indigo-200 transition-all flex items-center gap-3 group"
            >
              <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center">
                <IconifyIcon icon="lucide:printer" className="text-base" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-800 group-hover:text-indigo-700">Cetak Kwitansi</div>
                <div className="text-[10.5px] text-slate-500">Struk BTS SODONG NET</div>
              </div>
            </Link>
          </div>
        </div>

        {/* DISTRIBUSI REAL PAKET INTERNET (RIGHT - 1 COL) */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">Distribusi Paket Internet</h3>
              <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                {paketList.length} Paket
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">Proporsi pelanggan berdasarkan paket langganan.</p>
          </div>

          <div className="space-y-3.5 my-2 max-h-72 overflow-y-auto pr-1">
            {distribusiPaket.length > 0 ? (
              distribusiPaket.map((pkt) => (
                <div key={pkt.id} className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-700 flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full ${pkt.jenis_paket === 'PPPOE' ? 'bg-indigo-500' : 'bg-teal-500'}`}></span>
                      <span>{pkt.nama_paket}</span>
                      <span className="text-[10px] text-slate-400 font-normal">({pkt.mbps} Mbps)</span>
                    </span>
                    <span className="text-slate-900 font-bold">
                      {pkt.userCount} User <span className="text-slate-400 font-normal text-[11px]">({pkt.persentase}%)</span>
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        pkt.jenis_paket === 'PPPOE' ? 'bg-indigo-500' : 'bg-teal-500'
                      }`}
                      style={{ width: `${Math.max(pkt.persentase, 4)}%` }}
                    ></div>
                  </div>
                  <div className="text-[10.5px] text-slate-400 flex items-center justify-between">
                    <span>{pkt.jenis_paket}</span>
                    <span className="font-mono text-emerald-600 font-semibold">Rp {Number(pkt.harga || 0).toLocaleString('id-ID')}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-6 text-xs text-slate-400 italic">
                Belum ada data paket internet.
              </div>
            )}
          </div>

          <Link
            href="/admin/paket"
            className="w-full py-2.5 text-[12px] font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 transition-colors text-center block"
          >
            Kelola Paket Internet &rarr;
          </Link>
        </div>

      </div>

      {/* ─── RECENT COMPLAINTS (REAL DATA) ─────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">Laporan Keluhan Pelanggan Terbaru</h3>
            <p className="text-xs text-slate-500">Keluhan yang masuk dari pelanggan melalui sistem.</p>
          </div>
          <Link href="/admin/keluhan" className="text-xs font-semibold text-emerald-600 hover:underline flex items-center gap-1">
            <span>Lihat Semua Keluhan</span>
            <IconifyIcon icon="lucide:arrow-right" className="text-xs" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-2.5 px-3">Kode</th>
                <th className="py-2.5 px-3">Pelanggan</th>
                <th className="py-2.5 px-3">Kategori & Masalah</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
              {recentKeluhan.length > 0 ? (
                recentKeluhan.map((item) => {
                  const s = String(item.status || '').toUpperCase();
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
                      <td className="py-3 px-3 font-semibold font-mono text-emerald-600">{item.kode_keluhan}</td>
                      <td className="py-3 px-3 font-semibold text-slate-900">{item.pelanggan?.nama || 'Pelanggan'}</td>
                      <td className="py-3 px-3 text-slate-600 max-w-xs">
                        <div className="font-semibold text-slate-800 truncate">{item.judul}</div>
                        <div className="text-[11px] text-slate-400">{item.kategori}</div>
                      </td>
                      <td className="py-3 px-3">{badge}</td>
                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={() => router.push(`/admin/keluhan`)}
                          className="px-2.5 py-1 text-[11px] bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-lg font-semibold transition-colors"
                        >
                          Tindak Lanjuti
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400 text-xs italic">
                    Belum ada laporan keluhan dari pelanggan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
