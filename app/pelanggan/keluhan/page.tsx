'use client';

import React, { useState, useEffect } from 'react';
import IconifyIcon from '@/components/common/IconifyIcon';
import { toast } from '@/components/Toast';
import { pelangganService } from '@/services/pelangganService';
import { keluhanService } from '@/services/keluhanService';
import FormModal, { FormField } from '@/components/FormModal';
import dayjs from 'dayjs';

interface PaketData {
  id: number;
  nama_paket: string;
  jenis_paket: string;
  kode_voucher?: string;
  jumlah_perangkat?: number;
  mbps: number;
  harga: number;
  status: string;
}

interface PelangganData {
  id: number;
  kode_pelanggan: string;
  nama: string;
  no_hp: string;
  alamat: string;
  status: string;
  paket: PaketData | null;
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

const keluhanFields: FormField[] = [
  {
    name: 'kategori',
    label: 'Kategori Keluhan',
    type: 'select',
    required: true,
    options: [
      { label: 'Gangguan Jaringan', value: 'Gangguan Jaringan' },
      { label: 'Tagihan & Pembayaran', value: 'Tagihan & Pembayaran' },
      { label: 'Perubahan Layanan', value: 'Perubahan Layanan' },
      { label: 'Masalah Voucher', value: 'Masalah Voucher' },
      { label: 'Lainnya', value: 'Lainnya' },
    ],
  },
  {
    name: 'judul',
    label: 'Judul Keluhan',
    type: 'text',
    placeholder: 'Contoh: Internet mati dari semalam',
    required: true,
  },
  {
    name: 'deskripsi',
    label: 'Deskripsi Detail',
    type: 'textarea',
    placeholder: 'Jelaskan secara detail kendala yang Anda alami...',
    required: true,
  }
];

export default function PelangganKeluhanLandingPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [pelangganData, setPelangganData] = useState<PelangganData | null>(null);
  const [keluhanData, setKeluhanData] = useState<Keluhan[]>([]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'MENUNGGU' | 'DIPROSES' | 'SELESAI'>('ALL');

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [pelangganRes, keluhanRes] = await Promise.all([
        pelangganService.getMe(),
        keluhanService.getAll()
      ]);

      if (pelangganRes.ok && pelangganRes.data?.success) {
        setPelangganData(pelangganRes.data.data);
      } else {
        toast.error('Gagal mengambil data pelanggan');
      }

      if (keluhanRes.ok && keluhanRes.data?.success) {
        setKeluhanData(keluhanRes.data.data);
      } else {
        toast.error('Gagal mengambil data keluhan');
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Terjadi kesalahan pada server');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleFormSubmit = async (formData: Record<string, any>) => {
    setIsSubmitting(true);
    try {
      const storedUser = localStorage.getItem('bumdes_user');
      let pelanggan_id = 0;
      if (storedUser) {
        const user = JSON.parse(storedUser);
        pelanggan_id = user.pelanggan?.id || user.id;
      }

      const payload = {
        pelanggan_id,
        kategori: formData.kategori,
        judul: formData.judul,
        deskripsi: formData.deskripsi,
      };

      const response = await keluhanService.create(payload);

      if (response.ok && response.data?.success) {
        toast.success('Berhasil membuat keluhan');
        setIsModalOpen(false);
        fetchData();
      } else {
        toast.error(response.data?.message || 'Gagal membuat keluhan');
      }
    } catch (error) {
      console.error('Submit error:', error);
      toast.error('Terjadi kesalahan pada server');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredKeluhan = keluhanData.filter((k) => {
    if (activeFilter === 'ALL') return true;
    const statusUpper = k.status?.toUpperCase();
    if (activeFilter === 'MENUNGGU') return statusUpper === 'MENUNGGU' || statusUpper === 'BARU';
    if (activeFilter === 'DIPROSES') return statusUpper === 'DIPROSES' || statusUpper === 'PROSES';
    return statusUpper === activeFilter;
  });

  const paket = pelangganData?.paket;

  return (
    <div className="flex flex-col gap-6 w-full animate-in fade-in duration-300">

      {/* ─── TOP HEADER BANNER ──────────────────────────────────────── */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950 p-5 sm:p-6 rounded-2xl border border-slate-800 text-white shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-start space-x-4">
          <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-2xl border border-emerald-500/20 backdrop-blur-sm shrink-0">
            <IconifyIcon icon="lucide:message-square" className="text-2xl" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Pusat Bantuan & Keluhan
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1">
              Informasi paket aktif Anda, panduan cepat perbaikan, dan riwayat laporan kendala teknis.
            </p>
          </div>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 text-xs sm:text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 rounded-xl transition-all shadow-sm shadow-emerald-600/20 flex items-center space-x-2 shrink-0"
        >
          <IconifyIcon icon="lucide:plus" className="text-xs" />
          <span>Buat Laporan Keluhan Baru</span>
        </button>
      </div>

      {/* ─── FULL WIDTH TOP GRID: PAKET SAYA & PANDUAN CS ───────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* LEFT CARD (2 COLS): RINCIAN PAKET INTERNET SAYA */}
        <div className="lg:col-span-2 bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
                  <IconifyIcon icon="lucide:wifi" className="text-base" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Paket Internet Saya</h3>
                  <p className="text-xs text-slate-500">Rincian langganan aktif WiFi Desa Sodong</p>
                </div>
              </div>
              <span className="px-3 py-1 text-xs font-bold rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 inline-flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                AKTIF
              </span>
            </div>

            {/* Grid Details */}
            {(() => {
              const isVoucher = paket?.jenis_paket?.toUpperCase() === 'VOUCHER';

              return (
                <div className={`grid grid-cols-2 ${isVoucher ? 'sm:grid-cols-3 lg:grid-cols-5' : 'sm:grid-cols-4'} gap-3 sm:gap-4 pt-4`}>
                  <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/60">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Nama Paket</p>
                    <p className="text-xs sm:text-sm font-bold text-slate-800 mt-1">
                      {paket?.nama_paket || (isVoucher ? 'VOUCHER RUMAHAN' : 'Home Family')}
                    </p>
                  </div>
                  <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/60">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Kecepatan</p>
                    <p className="text-xs sm:text-sm font-bold text-emerald-600 mt-1">
                      {paket?.mbps ? `${paket.mbps} Mbps (Unlimited)` : '10 Mbps (Unlimited)'}
                    </p>
                  </div>
                  <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/60">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Harga Iuran</p>
                    <p className="text-xs sm:text-sm font-bold text-slate-800 mt-1">
                      Rp {Number(paket?.harga || 150000).toLocaleString('id-ID')} <span className="text-[10px] font-normal text-slate-400">/bln</span>
                    </p>
                  </div>

                  {isVoucher ? (
                    <>
                      <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/60">
                        <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Kode Voucher</p>
                        <p className="text-xs sm:text-sm font-bold text-emerald-600 mt-1">
                          {paket?.kode_voucher || 'VCH-HARI-001'}
                        </p>
                      </div>
                      <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/60">
                        <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Jumlah Perangkat</p>
                        <p className="text-xs sm:text-sm font-bold text-slate-800 mt-1">
                          {paket?.jumlah_perangkat ? `${paket.jumlah_perangkat} Perangkat` : '4 Perangkat'}
                        </p>
                      </div>
                    </>
                  ) : (
                    <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/60">
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">IP / Perangkat</p>
                      <p className="text-xs sm:text-sm font-bold text-slate-800 mt-1">
                        10.20.1.42 <span className="text-[10px] text-slate-400 font-normal">(4 Dev)</span>
                      </p>
                    </div>
                  )}
                </div>
              );
            })()}
          </div>

          {/* Bottom Action */}
          <div className="p-3.5 rounded-xl bg-slate-100/80 border border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs text-slate-600 font-medium text-center sm:text-left">
              <IconifyIcon icon="lucide:info" className="text-emerald-500 inline mr-1.5 text-sm" />
              Mengalami masalah koneksi lambat atau terputus? Laporkan agar teknisi kami segera menangani.
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-3.5 py-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-all shadow-xs shrink-0"
            >
              Laporkan Keluhan
            </button>
          </div>
        </div>

        {/* RIGHT CARD (1 COL): PANDUAN CEPAT & CS WA */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
              <IconifyIcon icon="lucide:lightbulb" className="text-amber-400 text-sm" />
              <span>Penanganan Mandiri</span>
            </h3>
            <p className="text-xs text-slate-500 mt-1">Langkah awal jika koneksi WiFi rumah Anda bermasalah:</p>

            <ul className="mt-3.5 space-y-2.5 text-xs text-slate-600">
              <li className="flex items-start space-x-2">
                <span className="w-4 h-4 rounded-full bg-emerald-50 text-emerald-600 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5 border border-emerald-200">1</span>
                <span>Cabut adaptor modem router 10 detik, lalu colokkan kembali.</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="w-4 h-4 rounded-full bg-emerald-50 text-emerald-600 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5 border border-emerald-200">2</span>
                <span>Cek lampu indikator <b>LOS</b>. Jika berkedip merah, kabel optik terputus.</span>
              </li>
            </ul>
          </div>

          <a
            href="https://wa.me/6281234567890"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-2.5 px-4 text-xs font-semibold text-emerald-600 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl transition-all flex items-center justify-center space-x-2"
          >
            <IconifyIcon icon="lucide:message-circle" className="text-sm text-emerald-500" />
            <span>Hubungi CS Technical Support</span>
          </a>
        </div>

      </div>

      {/* ─── FULL WIDTH DAFTAR & RIWAYAT KELUHAN SAYA ───────────────── */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 sm:p-6 space-y-5">

        {/* Header & Filter Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">Daftar & Riwayat Keluhan Saya</h3>
            <p className="text-xs text-slate-500">Pantau status pengerjaan laporan kendala Anda secara real-time.</p>
          </div>

          {/* Filter Tab Buttons */}
          <div className="flex items-center space-x-1 sm:space-x-2 overflow-x-auto">
            <button
              onClick={() => setActiveFilter('ALL')}
              className={`px-3 py-1.5 text-xs rounded-xl transition-all shrink-0 ${activeFilter === 'ALL'
                ? 'bg-emerald-600 text-white font-semibold shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 font-medium'
                }`}
            >
              Semua ({keluhanData.length})
            </button>
            <button
              onClick={() => setActiveFilter('MENUNGGU')}
              className={`px-3 py-1.5 text-xs rounded-xl transition-all shrink-0 ${activeFilter === 'MENUNGGU'
                ? 'bg-emerald-600 text-white font-semibold shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 font-medium'
                }`}
            >
              Menunggu ({keluhanData.filter((k) => k.status?.toUpperCase() === 'MENUNGGU' || k.status?.toUpperCase() === 'BARU').length})
            </button>
            <button
              onClick={() => setActiveFilter('DIPROSES')}
              className={`px-3 py-1.5 text-xs rounded-xl transition-all shrink-0 ${activeFilter === 'DIPROSES'
                ? 'bg-emerald-600 text-white font-semibold shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 font-medium'
                }`}
            >
              Diproses ({keluhanData.filter((k) => k.status?.toUpperCase() === 'DIPROSES' || k.status?.toUpperCase() === 'PROSES').length})
            </button>
            <button
              onClick={() => setActiveFilter('SELESAI')}
              className={`px-3 py-1.5 text-xs rounded-xl transition-all shrink-0 ${activeFilter === 'SELESAI'
                ? 'bg-emerald-600 text-white font-semibold shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 font-medium'
                }`}
            >
              Selesai ({keluhanData.filter((k) => k.status?.toUpperCase() === 'SELESAI').length})
            </button>
          </div>
        </div>

        {/* Complaints List Grid */}
        <div className="space-y-4">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-10 gap-3 text-slate-400">
              <IconifyIcon icon="lucide:loader-2" className="animate-spin text-3xl text-emerald-600" />
              <p className="text-xs font-medium">Memuat data keluhan...</p>
            </div>
          ) : filteredKeluhan.length > 0 ? (
            filteredKeluhan.map((keluhan) => {
              const sUpper = keluhan.status?.toUpperCase();
              let isMenunggu = sUpper === 'MENUNGGU' || sUpper === 'BARU';
              let isDiproses = sUpper === 'DIPROSES' || sUpper === 'PROSES';
              let isSelesai = sUpper === 'SELESAI';

              let borderClass = 'border-slate-200/80';
              let badgeJsx = (
                <span className="px-2.5 py-1 text-[11px] font-bold bg-amber-50 text-amber-600 rounded-full border border-amber-200 inline-flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                  MENUNGGU RESPON
                </span>
              );

              if (isDiproses) {
                borderClass = 'border-sky-200/80';
                badgeJsx = (
                  <span className="px-2.5 py-1 text-[11px] font-bold bg-sky-50 text-sky-600 rounded-full border border-sky-200 inline-flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-pulse"></span>
                    DIPROSES
                  </span>
                );
              } else if (isSelesai) {
                borderClass = 'border-slate-200/80';
                badgeJsx = (
                  <span className="px-2.5 py-1 text-[11px] font-bold bg-emerald-50 text-emerald-600 rounded-full border border-emerald-200 inline-flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    SELESAI
                  </span>
                );
              } else if (isMenunggu) {
                borderClass = 'border-amber-200/80';
              }

              return (
                <div
                  key={keluhan.id}
                  className={`p-4 sm:p-5 rounded-2xl bg-slate-50 border ${borderClass} space-y-3 transition-all`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center space-x-2.5">
                      <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                        # {keluhan.kode_keluhan}
                      </span>
                      <span className="text-[11px] font-semibold text-slate-600 bg-slate-200/60 px-2.5 py-0.5 rounded-md">
                        {keluhan.kategori}
                      </span>
                    </div>
                    {badgeJsx}
                  </div>

                  <div>
                    <h4 className="text-sm font-bold text-slate-900">{keluhan.judul}</h4>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">{keluhan.deskripsi}</p>
                  </div>

                  {keluhan.catatan_admin && keluhan.catatan_admin.trim() !== '' && (
                    <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-700 flex items-start space-x-2">
                      <IconifyIcon icon="lucide:check-circle" className="text-emerald-500 mt-0.5 text-sm shrink-0" />
                      <div>
                        <p className="font-semibold">Catatan Teknisi:</p>
                        <p className="mt-0.5">{keluhan.catatan_admin}</p>
                      </div>
                    </div>
                  )}

                  <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-xs text-slate-400">
                    <span>
                      <IconifyIcon icon="lucide:clock" className="inline mr-1 text-[11px]" />
                      {dayjs(keluhan.created_at).format('DD MMM YYYY, HH:mm')}
                    </span>
                    <span className={`font-medium ${isSelesai ? 'text-emerald-500' : isDiproses ? 'text-sky-500' : 'text-amber-500'}`}>
                      {isSelesai ? 'Telah Diperbaiki' : isDiproses ? 'Dalam Pengerjaan' : 'Menunggu alokasi teknisi'}
                    </span>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-10 text-center text-slate-400 space-y-2 bg-slate-50 rounded-2xl border border-slate-200/60">
              <IconifyIcon icon="lucide:inbox" className="text-4xl mx-auto text-slate-300" />
              <p className="text-xs font-semibold text-slate-600">Tidak ada keluhan ditemukan</p>
              <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
                Belum ada laporan keluhan yang Anda ajukan atau sesuai filter yang dipilih.
              </p>
            </div>
          )}
        </div>

      </div>

      <FormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Buat Keluhan Baru"
        icon="lucide:message-square-plus"
        fields={keluhanFields}
        onSubmit={handleFormSubmit}
        submitText={isSubmitting ? 'Menyimpan...' : 'Kirim Keluhan'}
        initialData={{ kategori: 'Gangguan Jaringan' }}
      />

    </div>
  );
}
