'use client';

import React, { useState, useEffect } from 'react';
import IconifyIcon from '@/components/common/IconifyIcon';
import { toast } from '@/components/Toast';
import { keluhanService } from '@/services/keluhanService';
import { paketService } from '@/services/paketService';
import dayjs from 'dayjs';

interface DetailProps {
  keluhan: any;
  onBack: () => void;
  onUpdateSuccess: () => void;
}

export default function DetailKeluhan({ keluhan, onBack, onUpdateSuccess }: DetailProps) {
  const [currentKeluhan, setCurrentKeluhan] = useState<any>(keluhan);
  const [selectedPaket, setSelectedPaket] = useState<any | null>(null);
  const [isLoadingPaket, setIsLoadingPaket] = useState(true);

  const [formStatus, setFormStatus] = useState(keluhan?.status || 'MENUNGGU');
  const [formCatatan, setFormCatatan] = useState(keluhan?.catatan_admin || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(false);

  // State WhatsApp
  const [waStatus, setWaStatus] = useState<string | null>(null);
  const [waQr, setWaQr] = useState<string | null>(null);

  const statusOptions = [
    { label: 'Menunggu (Laporan Diterima)', value: 'MENUNGGU' },
    { label: 'Diproses (Teknisi Pengecekan)', value: 'DIPROSES' },
    { label: 'Selesai (Kendala Teratasi)', value: 'SELESAI' },
    { label: 'Ditolak (Dibatalkan)', value: 'DITOLAK' },
  ];

  useEffect(() => {
    setCurrentKeluhan(keluhan);
    setFormStatus(keluhan?.status || 'MENUNGGU');
    setFormCatatan(keluhan?.catatan_admin || '');

    if (keluhan?.id && typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('read_keluhan_ids');
        const readIds: number[] = stored ? JSON.parse(stored) : [];
        if (!readIds.includes(keluhan.id)) {
          const updated = [...readIds, keluhan.id];
          localStorage.setItem('read_keluhan_ids', JSON.stringify(updated));
          window.dispatchEvent(new Event('storage'));
        }
      } catch (e) {
        console.error('Failed to update read_keluhan_ids in detail view:', e);
      }
    }
  }, [keluhan]);

  useEffect(() => {
    if (currentKeluhan?.pelanggan?.paket?.id) {
      const fetchPaket = async () => {
        setIsLoadingPaket(true);
        try {
          const res = await paketService.getById(currentKeluhan.pelanggan.paket.id);
          if (res.ok && res.data?.success) {
            setSelectedPaket(res.data.data);
          }
        } catch (err) {
          console.error('Failed to fetch paket info', err);
        } finally {
          setIsLoadingPaket(false);
        }
      };
      fetchPaket();
    } else {
      setIsLoadingPaket(false);
    }
  }, [currentKeluhan]);

  const handleUpdate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!currentKeluhan) return;
    setIsSubmitting(true);
    try {
      const response = await keluhanService.update(currentKeluhan.id, {
        status: formStatus,
        catatan_admin: formCatatan,
      });

      if (response.ok && response.data?.success) {
        toast.success('Status keluhan berhasil diperbarui!');

        const updatedObj = response.data.data
          ? {
              ...currentKeluhan,
              ...response.data.data,
              status: formStatus,
              catatan_admin: formCatatan,
            }
          : {
              ...currentKeluhan,
              status: formStatus,
              catatan_admin: formCatatan,
            };
        setCurrentKeluhan(updatedObj);

        if (onUpdateSuccess) {
          onUpdateSuccess();
        }

        const waRes = await fetch('http://localhost:3000/api/whatsapp/status');
        const waData = await waRes.json();

        if (waData.success && waData.data) {
          setWaStatus(waData.data.status);
          setWaQr(waData.data.qr);

          if (waData.data.status === 'QR_READY') {
            toast.info('📱 Scan QR Code WhatsApp di bawah untuk mengaktifkan notifikasi.');
          }
        }
      } else {
        toast.error(response.data?.message || 'Gagal memperbarui keluhan');
      }
    } catch (error) {
      console.error('Update error:', error);
      toast.error('Terjadi kesalahan pada server');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!currentKeluhan) return null;

  const getHeaderStatusBadge = (status: string) => {
    const s = status?.toUpperCase();
    if (s === 'SELESAI') {
      return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40';
    } else if (s === 'DIPROSES' || s === 'PROSES') {
      return 'bg-sky-500/20 text-sky-400 border-sky-500/40';
    } else if (s === 'DITOLAK') {
      return 'bg-red-500/20 text-red-400 border-red-500/40';
    } else {
      return 'bg-amber-500/20 text-amber-400 border-amber-500/40';
    }
  };

  const getStepStatus = (stepIndex: number) => {
    const s = currentKeluhan.status?.toUpperCase();
    const statuses = ['MENUNGGU', 'DIPROSES', 'SELESAI'];
    
    let currentIndex = statuses.indexOf(s);
    if (s === 'BARU') currentIndex = 0;
    if (s === 'PROSES') currentIndex = 1;

    if (s === 'DITOLAK') {
      return stepIndex === 0 ? 'active' : 'inactive';
    }

    if (stepIndex < currentIndex) return 'completed';
    if (stepIndex === currentIndex) return 'active';
    return 'inactive';
  };

  const renderStep = (index: number, title: string, subtitle: string, icon: string) => {
    const status = getStepStatus(index);
    let iconClass = "w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all ";
    let titleClass = "text-xs mt-2 ";

    if (status === 'active' || status === 'completed') {
      iconClass += "bg-emerald-600 text-white shadow-sm shadow-emerald-600/30 ring-4 ring-emerald-100";
      titleClass += "font-bold text-slate-900";
    } else {
      iconClass += "bg-slate-100 text-slate-400 border border-slate-200";
      titleClass += "font-medium text-slate-400";
    }

    return (
      <div className="flex flex-col items-center text-center z-10">
        <div className={iconClass}>
          <IconifyIcon icon={icon} />
        </div>
        <span className={titleClass}>{title}</span>
        <span className="text-[10.5px] text-slate-400 mt-0.5">{subtitle}</span>
      </div>
    );
  };

  const renderTimelineLatest = () => {
    const s = currentKeluhan.status?.toUpperCase();
    if (s === 'DIPROSES' || s === 'PROSES') {
      return (
        <div className="relative pl-4">
          <div className="w-2.5 h-2.5 rounded-full bg-sky-500 absolute -left-[17px] top-1 ring-4 ring-white"></div>
          <p className="font-bold text-slate-800 text-[11px]">Teknisi Sedang Menangani</p>
          <p className="text-[10px] text-slate-400">Dalam Proses Pengecekan Lapangan</p>
        </div>
      );
    } else if (s === 'SELESAI') {
      return (
        <div className="relative pl-4">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 absolute -left-[17px] top-1 ring-4 ring-white"></div>
          <p className="font-bold text-slate-800 text-[11px]">Laporan Selesai Ditangani</p>
          <p className="text-[10px] text-slate-400">Kendala Berhasil Teratasi</p>
        </div>
      );
    } else if (s === 'DITOLAK') {
      return (
        <div className="relative pl-4">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500 absolute -left-[17px] top-1 ring-4 ring-white"></div>
          <p className="font-bold text-slate-800 text-[11px]">Laporan Ditolak</p>
          <p className="text-[10px] text-slate-400">Penanganan Dibatalkan</p>
        </div>
      );
    } else {
      return (
        <div className="relative pl-4">
          <div className="w-2.5 h-2.5 rounded-full bg-slate-300 absolute -left-[17px] top-1 ring-4 ring-white"></div>
          <p className="font-semibold text-slate-500 text-[11px]">Menunggu Tindakan Admin</p>
          <p className="text-[10px] text-slate-400">Status Saat Ini</p>
        </div>
      );
    }
  };

  const formatWhatsAppMessage = () => {
    const name = currentKeluhan.pelanggan?.nama || 'Pelanggan';
    const noHp = currentKeluhan.pelanggan?.no_hp;
    if (!noHp) return '#';
    let phone = noHp;
    if (phone.startsWith('0')) {
      phone = '62' + phone.substring(1);
    }
    const text = encodeURIComponent(`Halo Bpk/Ibu ${name}, mengenai laporan keluhan internet Anda dengan ID ${currentKeluhan.kode_keluhan}...`);
    return `https://wa.me/${phone}?text=${text}`;
  };

  const isVoucher = selectedPaket?.jenis_paket?.toUpperCase() === 'VOUCHER' || currentKeluhan.pelanggan?.paket?.jenis_paket?.toUpperCase() === 'VOUCHER';

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-300 w-full">

      {/* ─── TOP DETAIL HEADER BANNER ───────────────────────────────── */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950 p-5 sm:p-6 rounded-2xl border border-slate-800 text-white shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="w-9 h-9 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center justify-center transition-all shrink-0"
            title="Kembali"
          >
            <IconifyIcon icon="lucide:arrow-left" className="text-sm" />
          </button>
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h2 className="text-lg md:text-xl font-bold text-white tracking-tight">
                Detail Keluhan #{currentKeluhan.kode_keluhan}
              </h2>
              <span className={`px-2.5 py-0.5 text-xs font-bold rounded-full border uppercase tracking-wider ${getHeaderStatusBadge(currentKeluhan.status)}`}>
                {currentKeluhan.status}
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1 flex items-center gap-1.5">
              <IconifyIcon icon="lucide:clock" className="text-xs text-emerald-400" />
              <span>Tanggal Masuk Laporan:</span>
              <strong className="text-white font-medium">
                {dayjs(currentKeluhan.created_at).format('DD MMMM YYYY, HH:mm')} WIB
              </strong>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {currentKeluhan.pelanggan?.no_hp && (
            <a
              href={formatWhatsAppMessage()}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2.5 text-xs sm:text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 rounded-xl transition-all shadow-sm shadow-emerald-600/20 flex items-center space-x-2"
            >
              <IconifyIcon icon="lucide:message-circle" className="text-sm" />
              <span>Hubungi Pelanggan</span>
            </a>
          )}
          <div className="w-10 h-10 rounded-xl bg-slate-800/80 border border-slate-700 hidden sm:flex items-center justify-center text-emerald-400">
            <IconifyIcon icon="lucide:wifi" className="text-lg" />
          </div>
        </div>
      </div>

      {/* ─── LIVE PROGRESS STATUS STEPPER ───────────────────────────── */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs relative overflow-hidden space-y-4">
        {currentKeluhan.status === 'DITOLAK' && (
          <div className="absolute inset-0 bg-red-50/80 flex flex-col items-center justify-center z-20 backdrop-blur-xs">
            <p className="text-red-600 font-bold text-sm">Keluhan Ditolak</p>
            <p className="text-xs text-red-500 mt-1">{currentKeluhan.catatan_admin || 'Tidak ada catatan'}</p>
          </div>
        )}
        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">STATUS PENANGANAN LAPORAN</p>
        
        <div className="grid grid-cols-3 gap-2 relative pt-2">
          {/* Connector Line */}
          <div className="absolute top-7 left-[16%] right-[16%] h-[2px] bg-slate-200 z-0 hidden md:block"></div>
          
          {renderStep(0, '1. Menunggu', 'Laporan Diterima System', 'lucide:check-circle-2')}
          {renderStep(1, '2. Diproses', 'Teknisi Pengecekan Lapangan', 'lucide:wrench')}
          {renderStep(2, '3. Selesai', 'Kendala Teratasi', 'lucide:check-circle')}
        </div>
      </div>

      {/* ─── MAIN GRID LAYOUT (2 COLUMNS) ─────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">

        {/* CARD 1: INFORMASI PELANGGAN & PAKET LAYANAN */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 sm:p-6 flex flex-col justify-between space-y-5">
          <div>
            <div className="flex items-center justify-between border-b border-slate-200 pb-3.5">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
                  <IconifyIcon icon="lucide:user-check" className="text-base" />
                </div>
                <h3 className="text-base font-bold text-slate-900">Pelanggan & Layanan</h3>
              </div>
              <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200">
                Pelanggan Aktif
              </span>
            </div>

            <div className="space-y-3.5 pt-4">
              {/* Customer Avatar & Name Header Box */}
              <div className="flex items-center space-x-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200/60">
                <div className="w-11 h-11 rounded-xl bg-emerald-600 text-white font-extrabold flex items-center justify-center text-sm shrink-0 shadow-xs uppercase">
                  {currentKeluhan.pelanggan?.nama?.substring(0, 2) || 'PL'}
                </div>
                <div className="overflow-hidden flex-1">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">NAMA PELANGGAN</p>
                  <p className="font-bold text-slate-900 text-sm truncate">{currentKeluhan.pelanggan?.nama || '-'}</p>
                  <span className="text-xs text-emerald-600 font-semibold">
                    ID: {currentKeluhan.pelanggan?.kode_pelanggan || '-'}
                  </span>
                </div>
              </div>

              {/* 2 Box Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/60">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1">NO. WHATSAPP</p>
                  <p className="font-bold text-slate-900 text-sm">
                    {currentKeluhan.pelanggan?.no_hp || '-'}
                  </p>
                </div>
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/60">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
                    {isVoucher ? 'KODE VOUCHER / ID' : 'IP / PERANGKAT'}
                  </p>
                  <p className="font-bold text-slate-900 text-sm">
                    {isVoucher 
                      ? (selectedPaket?.kode_voucher || currentKeluhan.pelanggan?.paket?.kode_voucher || 'VCH-HARI-001')
                      : '10.20.1.42 (4 Dev)'}
                  </p>
                </div>
              </div>

              {/* Address Box */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/60 text-xs">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1">ALAMAT PEMASANGAN</p>
                <p className="text-slate-700 font-medium flex items-start gap-1.5 leading-relaxed">
                  <IconifyIcon icon="lucide:map-pin" className="text-red-500 text-xs mt-0.5 shrink-0" />
                  <span>{currentKeluhan.pelanggan?.alamat || '-'}</span>
                </p>
              </div>
            </div>
          </div>

          {/* Green Light Box at bottom of card */}
          <div className="p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-200/60 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-emerald-700 uppercase">
                {selectedPaket?.nama_paket || (isLoadingPaket ? 'Memuat...' : (isVoucher ? 'VOUCHER RUMAHAN' : 'HOME FAMILY'))}
              </p>
              <p className="text-[11px] text-slate-600 mt-0.5 font-medium">
                Kecepatan {selectedPaket?.mbps || 20} Mbps • {selectedPaket?.jumlah_perangkat ?? 4} Perangkat
              </p>
            </div>
            <div className="text-right">
              <span className="font-bold text-emerald-600 text-sm">
                Rp {selectedPaket ? Number(selectedPaket.harga).toLocaleString('id-ID') : '120.000'}
                <span className="text-[10px] text-slate-400 font-normal">/bln</span>
              </span>
            </div>
          </div>
        </div>

        {/* CARD 2: DETAIL LAPORAN KENDALA */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 sm:p-6 flex flex-col justify-between space-y-5">
          <div>
            <div className="flex items-center justify-between border-b border-slate-200 pb-3.5">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100">
                  <IconifyIcon icon="lucide:message-square" className="text-base" />
                </div>
                <h3 className="text-base font-bold text-slate-900">Detail Laporan Kendala</h3>
              </div>
            </div>

            <div className="space-y-4 pt-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1">KATEGORI MASALAH</p>
                <span className="inline-block px-2.5 py-1 text-xs font-semibold rounded-md bg-slate-100 text-slate-700 border border-slate-200 uppercase">
                  {currentKeluhan.kategori}
                </span>
              </div>

              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1">JUDUL MASALAH</p>
                <h4 className="font-bold text-slate-900 text-sm sm:text-base leading-snug">
                  {currentKeluhan.judul}
                </h4>
              </div>

              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
                  DESKRIPSI KENDALA DARI PELANGGAN
                </p>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/60 text-xs text-slate-700 leading-relaxed italic relative">
                  <span className="text-slate-300 text-3xl font-serif absolute top-1 right-3 opacity-40">“</span>
                  "{currentKeluhan.deskripsi}"
                </div>
              </div>
            </div>
          </div>

          {/* Info Alert Box */}
          <div className="p-3 rounded-xl bg-slate-100/80 border border-slate-200/80 text-xs text-slate-600 flex items-center gap-2">
            <IconifyIcon icon="lucide:info" className="text-emerald-500 text-sm shrink-0" />
            <span>Pastikan menindaklanjuti keluhan dan mengupdate status pengerjaan untuk pelanggan.</span>
          </div>
        </div>

      </div>

      {/* ─── BOTTOM CARD: PANEL PENANGANAN ADMIN ─────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 sm:p-6 space-y-5 relative overflow-hidden">
        {/* Accent Bar */}
        <div className="absolute top-0 inset-x-0 h-1 bg-emerald-600"></div>

        <div className="flex items-center justify-between border-b border-slate-200 pb-3.5">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
              <IconifyIcon icon="lucide:edit-3" className="text-base" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Panel Penanganan Admin</h3>
              <p className="text-xs text-slate-500">Update status & beri instruksi teknikal</p>
            </div>
          </div>
          <span className="px-2.5 py-0.5 text-xs font-semibold rounded-md bg-slate-100 text-slate-700 border border-slate-200">
            Petugas: Admin BUMDes
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

          {/* Form Inputs (7 Cols) */}
          <form onSubmit={handleUpdate} className="lg:col-span-7 space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1.5">Status Penanganan Laporan</label>
              <div
                className="relative"
                tabIndex={0}
                onBlur={(e) => {
                  if (!e.currentTarget.contains(e.relatedTarget)) {
                    setOpenDropdown(false);
                  }
                }}
              >
                <button
                  type="button"
                  onClick={() => setOpenDropdown(!openDropdown)}
                  className={`w-full flex items-center justify-between rounded-xl border bg-white px-4 py-2.5 outline-none transition-all text-left text-xs font-semibold text-slate-800 ${
                    openDropdown
                      ? 'border-emerald-500 ring-2 ring-emerald-100'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <span>
                    {statusOptions.find(o => o.value === formStatus)?.label || 'Pilih Status'}
                  </span>
                  <IconifyIcon
                    icon="lucide:chevron-down"
                    className={`text-slate-400 text-xs flex-shrink-0 transition-transform duration-200 ${openDropdown ? 'rotate-180' : ''}`}
                  />
                </button>

                {openDropdown && (
                  <div className="absolute left-0 top-full z-30 mt-1 w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg p-1 space-y-0.5">
                    {statusOptions.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onMouseDown={() => {
                          setFormStatus(opt.value);
                          setOpenDropdown(false);
                        }}
                        className={`w-full rounded-lg px-3 py-2 text-left text-xs font-semibold transition-colors ${
                          formStatus === opt.value
                            ? 'bg-emerald-600 text-white'
                            : 'text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1.5">Catatan Admin / Solusi Kendala</label>
              <textarea
                value={formCatatan}
                onChange={(e) => setFormCatatan(e.target.value)}
                rows={3}
                placeholder="Tuliskan tindakan teknis yang dilakukan atau instruksi untuk pelanggan..."
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none transition-all text-xs text-slate-800 font-medium leading-relaxed resize-none"
              ></textarea>
            </div>

            <div className="pt-2 flex justify-start">
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white rounded-xl font-semibold text-xs shadow-xs transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <IconifyIcon icon="lucide:loader-2" className="animate-spin text-xs" />
                    <span>Menyimpan...</span>
                  </>
                ) : (
                  <>
                    <IconifyIcon icon="lucide:check" className="text-xs" />
                    <span>Simpan Perubahan Status</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Activity Timeline Preview (5 Cols) */}
          <div className="lg:col-span-5 bg-slate-50 p-4 rounded-2xl border border-slate-200/60 space-y-3">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">RIWAYAT AKTIVITAS LAPORAN</p>

            <div className="space-y-3 text-xs relative pl-3 border-l-2 border-slate-200">
              {/* Timeline Item 1 */}
              <div className="relative pl-4">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 absolute -left-[17px] top-1 ring-4 ring-white"></div>
                <p className="font-bold text-slate-800 text-[11px]">Laporan Dikirim Pelanggan</p>
                <p className="text-[10px] text-slate-400">{dayjs(currentKeluhan.created_at).format('DD MMMM YYYY, HH:mm')} WIB • Aplikasi Mobile</p>
              </div>

              {/* Timeline Item 2 */}
              <div className="relative pl-4">
                <div className="w-2.5 h-2.5 rounded-full bg-amber-400 absolute -left-[17px] top-1 ring-4 ring-white"></div>
                <p className="font-bold text-slate-800 text-[11px]">Tiket Otomatis Dibuat (#{currentKeluhan.kode_keluhan})</p>
                <p className="text-[10px] text-slate-400">{dayjs(currentKeluhan.created_at).add(1, 'minute').format('DD MMMM YYYY, HH:mm')} WIB • System Auto</p>
              </div>

              {/* Timeline Item 3 (Dynamic Status Visual) */}
              {renderTimelineLatest()}
            </div>
          </div>

        </div>
      </div>

      {/* WHATSAPP QR SCANNER */}
      {waStatus === 'QR_READY' && waQr && (
        <div className="bg-white rounded-2xl border border-emerald-200 shadow-xs p-6 mt-2 space-y-4 relative overflow-hidden flex flex-col items-center justify-center text-center">
          <div className="absolute top-0 inset-x-0 h-1 bg-emerald-600"></div>
          <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
            <IconifyIcon icon="lucide:message-circle" className="text-2xl" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-sm">WhatsApp Perlu Ditautkan</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-md">Scan QR code di bawah ini menggunakan aplikasi WhatsApp di HP Anda untuk mengaktifkan notifikasi otomatis ke pelanggan.</p>
          </div>
          <div className="p-4 bg-white border-2 border-dashed border-slate-200 rounded-xl">
            <img
              src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(waQr)}`}
              alt="WhatsApp QR Code"
              className="w-48 h-48 object-contain"
            />
          </div>
          <button
            onClick={async () => {
              try {
                const res = await fetch('http://localhost:3000/api/whatsapp/status');
                const data = await res.json();
                if (data.success && data.data) {
                  setWaStatus(data.data.status);
                  setWaQr(data.data.qr);
                  if (data.data.status === 'AUTHENTICATED') {
                    toast.success('✅ WhatsApp berhasil terhubung! Notifikasi akan terkirim otomatis.');
                    setWaQr(null);
                  } else {
                    toast.error('WhatsApp belum terhubung. Coba scan ulang QR code di atas.');
                  }
                }
              } catch {
                toast.error('Gagal memeriksa status WhatsApp.');
              }
            }}
            className="text-xs font-semibold text-emerald-600 hover:underline px-4 py-2 bg-emerald-50 rounded-xl border border-emerald-100 transition-colors"
          >
            Sudah scan? Klik di sini untuk cek status
          </button>
        </div>
      )}

    </div>
  );
}
