'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import IconifyIcon from '@/components/common/IconifyIcon';
import { keluhanService } from '@/services/keluhanService';
import { pelangganService } from '@/services/pelangganService';

interface PaketData {
  id: number;
  nama_paket: string;
  jenis_paket: string;
  kode_voucher?: string | null;
  jumlah_perangkat?: number | null;
  mbps: number;
  harga: string | number;
  status: string;
}

interface PelangganData {
  id: number;
  kode_pelanggan: string;
  nama: string;
  no_hp: string;
  alamat: string;
  status: string;
  created_at: string;
  updated_at: string;
  paket?: PaketData | null;
}

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
  
  const [pelanggan, setPelanggan] = useState<PelangganData | null>(null);
  const [keluhanList, setKeluhanList] = useState<Keluhan[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // ─── Fetch Pelanggan Me & Keluhan ─────────────────────────────
  const fetchDashboardData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [resMe, resKeluhan] = await Promise.all([
        pelangganService.getMe(),
        keluhanService.getAll(),
      ]);

      if (resMe.ok && resMe.data?.data) {
        setPelanggan(resMe.data.data);
      }

      if (resKeluhan.ok && resKeluhan.data?.data && Array.isArray(resKeluhan.data.data)) {
        setKeluhanList(resKeluhan.data.data);
      }
    } catch (err) {
      console.error('Error loading pelanggan dashboard data:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // ─── Computed Statistics ──────────────────────────────────────
  const activeKeluhanCount = useMemo(() => {
    return keluhanList.filter((k) => {
      const s = String(k.status || '').toUpperCase();
      return s !== 'SELESAI' && s !== 'DITOLAK';
    }).length;
  }, [keluhanList]);

  const keluhanSelesaiCount = useMemo(() => {
    return keluhanList.filter((k) => String(k.status || '').toUpperCase() === 'SELESAI').length;
  }, [keluhanList]);

  const displayName = pelanggan?.nama || 'Pelanggan';
  const isStatusAktif = String(pelanggan?.status || '').toLowerCase() === 'aktif';
  const pkt = pelanggan?.paket;

  return (
    <div className="flex flex-col gap-6 w-full animate-in fade-in duration-300">

      {/* ─── WELCOME BANNER ────────────────────────────────────────── */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950 p-6 sm:p-8 rounded-2xl border border-slate-800 text-white shadow-sm">
        <div className="absolute -right-6 -bottom-8 opacity-10 text-emerald-400 pointer-events-none">
          <IconifyIcon icon="lucide:wifi" className="text-[180px]" />
        </div>
        
        {/* Content */}
        <div className="relative z-10 max-w-2xl">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 text-[11px] font-semibold tracking-wider uppercase rounded-md bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              PORTAL PELANGGAN BTS SODONG NET
            </span>
            {pelanggan?.kode_pelanggan && (
              <span className="px-2.5 py-1 text-[11px] font-mono font-bold rounded-md bg-blue-500/20 text-blue-300 border border-blue-500/30">
                {pelanggan.kode_pelanggan}
              </span>
            )}
          </div>

          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mt-3 leading-snug">
            Selamat Datang, {displayName}!
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
            Pantau status layanan internet desa Anda, cek detail paket berlangganan, dan laporkan keluhan gangguan teknis secara cepat melalui portal ini.
          </p>
          
          <div className="flex flex-wrap items-center gap-3 mt-5">
            <Link
              href="/pelanggan/keluhan"
              className="px-4 py-2.5 text-xs sm:text-sm font-semibold bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white rounded-xl transition-all shadow-sm flex items-center space-x-2"
            >
              <IconifyIcon icon="lucide:message-square-plus" className="text-sm text-white" />
              <span>Laporkan Gangguan ({activeKeluhanCount} Aktif)</span>
            </Link>
            <a
              href="https://wa.me/6282319058505?text=Halo%20Admin%20BTS%20SODONG%20NET,%20saya%20ingin%20mengajukan%20pengaduan%20layanan%20internet"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2.5 text-xs sm:text-sm font-semibold bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-slate-700 rounded-xl transition-all flex items-center space-x-2"
            >
              <IconifyIcon icon="lucide:message-circle" className="text-sm text-emerald-400" />
              <span>Pengaduan WA (0823-1905-8505)</span>
            </a>
          </div>
        </div>
      </div>

      {/* ─── 4 REAL METRIC CARDS ───────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

        {/* Card 1: Status Langganan */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between hover:border-emerald-500/40 transition-all">
          <div className="flex items-center justify-between">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${
              isStatusAktif ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'
            }`}>
              <IconifyIcon icon={isStatusAktif ? 'lucide:check-circle-2' : 'lucide:alert-circle'} className="text-lg" />
            </div>
            <span className={`px-2 py-0.5 text-[11px] font-semibold rounded-lg border ${
              isStatusAktif ? 'text-emerald-600 bg-emerald-50 border-emerald-200' : 'text-rose-600 bg-rose-50 border-rose-200'
            }`}>
              {isStatusAktif ? 'Aktif' : 'Nonaktif'}
            </span>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-bold text-slate-900">
              {isLoading ? '...' : (isStatusAktif ? 'Layanan Aktif' : 'Nonaktif')}
            </h3>
            <p className="text-xs text-slate-500 font-medium mt-0.5">Status Langganan Internet</p>
            <span className="text-[11px] text-slate-400 block mt-2 font-mono">
              ID: {pelanggan?.kode_pelanggan || '-'}
            </span>
          </div>
        </div>

        {/* Card 2: Kecepatan & Jenis Paket */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between hover:border-blue-500/40 transition-all">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
              <IconifyIcon icon="lucide:gauge" className="text-lg" />
            </div>
            <span className="px-2 py-0.5 text-[11px] font-semibold text-blue-600 bg-blue-50 border border-blue-200 rounded-lg">
              {pkt?.jenis_paket || 'INTERNET'}
            </span>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-bold text-slate-900">
              {isLoading ? '...' : (pkt ? `${pkt.mbps} Mbps` : '-')}
            </h3>
            <p className="text-xs text-slate-500 font-medium mt-0.5 truncate">
              {pkt?.nama_paket || 'Paket Belum Diatur'}
            </p>
            <span className="text-[11px] text-blue-600 block mt-2 font-medium flex items-center gap-1">
              <IconifyIcon icon="lucide:wifi" className="text-[11px]" />
              {pkt?.jenis_paket === 'VOUCHER' && pkt?.jumlah_perangkat
                ? `Maksimal ${pkt.jumlah_perangkat} Perangkat`
                : 'Koneksi Unlimited'}
            </span>
          </div>
        </div>

        {/* Card 3: Biaya Tarif Paket */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between hover:border-teal-500/40 transition-all">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center border border-teal-100">
              <IconifyIcon icon="lucide:wallet" className="text-lg" />
            </div>
            <span className="px-2 py-0.5 text-[11px] font-semibold text-teal-600 bg-teal-50 border border-teal-200 rounded-lg">
              Iuran Bulanan
            </span>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-bold text-slate-900">
              {isLoading ? '...' : (pkt ? `Rp ${Number(pkt.harga).toLocaleString('id-ID')}` : 'Rp 0')}
            </h3>
            <p className="text-xs text-slate-500 font-medium mt-0.5">Biaya Paket per Bulan</p>
            <span className="text-[11px] text-slate-400 block mt-2">
              Layanan Resmi BUMDes
            </span>
          </div>
        </div>

        {/* Card 4: Laporan Keluhan Saya */}
        <Link
          href="/pelanggan/keluhan"
          className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between hover:border-amber-500 hover:shadow-md hover:-translate-y-0.5 transition-all group cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100 group-hover:bg-amber-600 group-hover:text-white transition-colors">
              <IconifyIcon icon="lucide:message-square" className="text-lg" />
            </div>
            <div className="flex items-center gap-1">
              <span className={`px-2 py-0.5 text-[11px] font-semibold rounded-lg border ${
                activeKeluhanCount > 0
                  ? 'text-amber-600 bg-amber-50 border-amber-200'
                  : 'text-emerald-600 bg-emerald-50 border-emerald-200'
              }`}>
                {activeKeluhanCount > 0 ? `${activeKeluhanCount} Aktif` : 'Beres'}
              </span>
              <IconifyIcon icon="lucide:arrow-up-right" className="text-sm text-slate-400 group-hover:text-amber-600 transition-colors" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-bold text-slate-900 group-hover:text-amber-600 transition-colors">
              {isLoading ? '...' : `${keluhanList.length} Laporan`}
            </h3>
            <p className="text-xs text-slate-500 font-medium mt-0.5 flex items-center justify-between">
              <span>Riwayat Keluhan Anda</span>
              <span className="text-amber-600 font-semibold group-hover:underline text-[11px]">Buka &rarr;</span>
            </p>
          </div>
        </Link>

      </div>

      {/* ─── 2-COLUMN SECTION: DETAIL AKUN & RIWAYAT KELUHAN ───────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

        {/* LEFT COLUMN: INFORMASI DETAIL AKUN & PAKET (5 Cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <IconifyIcon icon="lucide:user" className="text-emerald-600 text-base" />
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide">
                Informasi Berlangganan
              </h3>
            </div>
            <span className={`px-2.5 py-0.5 text-[11px] font-bold rounded-full border ${
              isStatusAktif
                ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
                : 'bg-rose-50 text-rose-600 border-rose-200'
            }`}>
              {isStatusAktif ? 'Pelanggan Aktif' : 'Nonaktif'}
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between py-1.5 border-b border-slate-50">
              <span className="text-slate-400 font-medium">Nama Lengkap</span>
              <span className="font-bold text-slate-800">{pelanggan?.nama || '-'}</span>
            </div>

            <div className="flex justify-between py-1.5 border-b border-slate-50">
              <span className="text-slate-400 font-medium">Kode Pelanggan</span>
              <span className="font-mono font-bold text-emerald-600">{pelanggan?.kode_pelanggan || '-'}</span>
            </div>

            <div className="flex justify-between py-1.5 border-b border-slate-50">
              <span className="text-slate-400 font-medium">No. WhatsApp</span>
              <span className="font-semibold text-slate-700">{pelanggan?.no_hp || '-'}</span>
            </div>

            <div className="flex justify-between py-1.5 border-b border-slate-50">
              <span className="text-slate-400 font-medium">Alamat Pemasangan</span>
              <span className="font-medium text-slate-700 text-right max-w-[200px]">{pelanggan?.alamat || '-'}</span>
            </div>

            <div className="flex justify-between py-1.5 border-b border-slate-50">
              <span className="text-slate-400 font-medium">Paket Layanan</span>
              <span className="font-bold text-slate-800">{pkt?.nama_paket || '-'}</span>
            </div>

            <div className="flex justify-between py-1.5 border-b border-slate-50">
              <span className="text-slate-400 font-medium">Kecepatan Internet</span>
              <span className="font-bold text-blue-600">{pkt ? `${pkt.mbps} Mbps` : '-'}</span>
            </div>

            <div className="flex justify-between py-1.5 border-b border-slate-50">
              <span className="text-slate-400 font-medium">Biaya Bulanan</span>
              <span className="font-mono font-bold text-emerald-600">
                {pkt ? `Rp ${Number(pkt.harga).toLocaleString('id-ID')}` : '-'}
              </span>
            </div>

            {pkt?.jenis_paket === 'VOUCHER' && pkt.kode_voucher && (
              <div className="flex justify-between py-1.5 border-b border-slate-50">
                <span className="text-slate-400 font-medium">Kode Voucher</span>
                <span className="font-mono font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                  {pkt.kode_voucher}
                </span>
              </div>
            )}
          </div>

          <div className="pt-2">
            <Link
              href="/pelanggan/keluhan"
              className="w-full py-2.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-xl border border-emerald-200 transition-colors text-center block"
            >
              Laporkan Gangguan Jaringan &rarr;
            </Link>
          </div>
        </div>

        {/* RIGHT COLUMN: RIWAYAT KELUHAN TERBARU (7 Cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">Riwayat Keluhan Anda</h3>
              <p className="text-xs text-slate-500">Status penanganan gangguan teknis oleh admin BUMDes.</p>
            </div>
            <Link href="/pelanggan/keluhan" className="text-xs font-semibold text-emerald-600 hover:underline flex items-center gap-1">
              <span>+ Buat Laporan</span>
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="py-2.5 px-3">Kode</th>
                  <th className="py-2.5 px-3">Keluhan</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
                {isLoading ? (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-slate-400 text-xs">
                      <IconifyIcon icon="lucide:loader-2" className="animate-spin inline mr-2 text-emerald-600 text-base" />
                      Memuat data keluhan...
                    </td>
                  </tr>
                ) : keluhanList.length > 0 ? (
                  keluhanList.slice(0, 5).map((item) => {
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
                        <td className="py-3 px-3 text-slate-700 max-w-xs">
                          <div className="font-semibold text-slate-800 truncate">{item.judul}</div>
                          <div className="text-[11px] text-slate-400">{item.kategori}</div>
                        </td>
                        <td className="py-3 px-3">{badge}</td>
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
                    <td colSpan={4} className="py-8 text-center text-slate-400 text-xs italic">
                      Belum ada riwayat keluhan. Layanan internet berjalan lancar.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* ─── CONTACT & SUPPORT FOOTER CALLOUT ───────────────────────── */}
      <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-emerald-950/60 via-slate-900 to-slate-900 border border-emerald-500/30 text-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30 shrink-0">
            <IconifyIcon icon="lucide:headset" className="text-xl" />
          </div>
          <div>
            <h4 className="text-sm sm:text-base font-bold text-white">
              Butuh Bantuan Cepat atau Informasi Layanan?
            </h4>
            <p className="text-xs text-slate-300 mt-0.5">
              Hubungi layanan teknis BTS SODONG NET atau kunjungi kantor BUMDes Pasar Blok C Desa Sodonghilir.
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2.5 w-full sm:w-auto shrink-0">
          <a
            href="https://wa.me/6282319058505"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto px-4 py-2.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl transition-all flex items-center justify-center space-x-2 shadow-xs"
          >
            <IconifyIcon icon="lucide:phone" className="text-xs" />
            <span>Pengaduan: 0823-1905-8505</span>
          </a>
          <a
            href="https://wa.me/6282319059592"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto px-4 py-2.5 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-slate-700 rounded-xl transition-all flex items-center justify-center space-x-2"
          >
            <IconifyIcon icon="lucide:message-circle" className="text-xs" />
            <span>Admin: 0823-1905-9592</span>
          </a>
        </div>
      </div>

    </div>
  );
}
