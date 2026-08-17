'use client';

import React, { useState, useEffect, useCallback, useRef, Suspense, MouseEvent as ReactMouseEvent, TouchEvent as ReactTouchEvent } from 'react';
import { createPortal } from 'react-dom';
import { useSearchParams, useRouter } from 'next/navigation';
import IconifyIcon from '@/components/common/IconifyIcon';
import KwitansiReceipt, { KwitansiData } from '@/components/admin/struk/KwitansiReceipt';
import { pelangganService } from '@/services/pelangganService';
import { paketService } from '@/services/paketService';
import { getApiAssetUrl } from '@/services/api';
import { terbilang } from '@/lib/utils/terbilang';
import { toast } from '@/components/Toast';

// Indonesian month names for default description
const MONTH_NAMES = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

function AdminStrukContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const paramPelangganId = searchParams.get('pelangganId') || searchParams.get('id');

  // Customer & Package lists
  const [pelangganList, setPelangganList] = useState<any[]>([]);
  const [selectedPelangganId, setSelectedPelangganId] = useState<string>(paramPelangganId || '');
  const [isLoadingList, setIsLoadingList] = useState<boolean>(true);
  const [isLoadingDetail, setIsLoadingDetail] = useState<boolean>(false);
  const [pelangganDropdownOpen, setPelangganDropdownOpen] = useState<boolean>(false);
  const [searchPelanggan, setSearchPelanggan] = useState<string>('');

  // Active loaded data
  const [currentPelanggan, setCurrentPelanggan] = useState<any>(null);
  const [currentPaket, setCurrentPaket] = useState<any>(null);

  // Form State
  const todayStr = new Date().toISOString().split('T')[0];
  const [tanggal, setTanggal] = useState<string>(todayStr);
  const [noKwitansi, setNoKwitansi] = useState<string>('');
  const [namaPelanggan, setNamaPelanggan] = useState<string>('');
  const [kodePelanggan, setKodePelanggan] = useState<string>('');
  const [nominal, setNominal] = useState<number>(0);
  const [terbilangText, setTerbilangText] = useState<string>('');
  const [isCustomTerbilang, setIsCustomTerbilang] = useState<boolean>(false);
  const [untukPembayaran, setUntukPembayaran] = useState<string>('');

  // ─── Digital Signature State ────────────────────────────────
  const [tandaTangan, setTandaTangan] = useState<string | null>(null);
  const [tandaTanganScale, setTandaTanganScale] = useState<number>(100);
  const [isSignModalOpen, setIsSignModalOpen] = useState(false);
  const signatureCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);
  const signatureFileInputRef = useRef<HTMLInputElement | null>(null);

  // Load saved signature & scale from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedSig = localStorage.getItem('bumdes_kwitansi_signature');
      if (savedSig) {
        setTandaTangan(savedSig);
      }
      const savedScale = localStorage.getItem('bumdes_kwitansi_signature_scale');
      if (savedScale) {
        const num = Number(savedScale);
        if (!isNaN(num) && num >= 50 && num <= 150) {
          setTandaTanganScale(num);
        }
      }
    }
  }, []);

  // ─── 1. Fetch All Pelanggan List ────────────────────────────
  useEffect(() => {
    const fetchPelangganList = async () => {
      setIsLoadingList(true);
      try {
        const res = await pelangganService.getAll();
        if (res.ok && res.data?.data) {
          setPelangganList(res.data.data);
        }
      } catch (err) {
        console.error('Error fetching pelanggan list:', err);
        toast.error('Gagal memuat daftar pelanggan', 'Error');
      } finally {
        setIsLoadingList(false);
      }
    };

    fetchPelangganList();
  }, []);

  // ─── 2. Generate No Kwitansi Helper ────────────────────────
  const generateNoKwitansi = (kodePlg?: string, tglStr?: string) => {
    const dateObj = tglStr ? new Date(tglStr) : new Date();
    const y = dateObj.getFullYear();
    const m = String(dateObj.getMonth() + 1).padStart(2, '0');
    const d = String(dateObj.getDate()).padStart(2, '0');
    const plgSuffix = kodePlg ? kodePlg.replace(/[^a-zA-Z0-9]/g, '') : '001';
    return `${y}${m}${d}-${plgSuffix}`;
  };

  // ─── 3. Load Customer & Package Detail when ID changes ─────
  const loadPelangganData = useCallback(async (id: string | number) => {
    if (!id) return;
    setIsLoadingDetail(true);
    try {
      // 1. Fetch Pelanggan by ID
      const resPlg = await pelangganService.getById(id);
      if (!resPlg.ok || !resPlg.data?.data) {
        toast.error('Data pelanggan tidak ditemukan', 'Peringatan');
        setIsLoadingDetail(false);
        return;
      }

      const plg = resPlg.data.data;
      setCurrentPelanggan(plg);
      setNamaPelanggan(plg.nama || '');
      setKodePelanggan(plg.kode_pelanggan || '');

      // 2. Fetch Paket by paket_id
      let pktData: any = null;
      if (plg.paket_id) {
        const resPkt = await paketService.getById(plg.paket_id);
        if (resPkt.ok && resPkt.data?.data) {
          pktData = resPkt.data.data;
          setCurrentPaket(pktData);
        }
      }

      // 3. Compute price, terbilang, & descriptions
      const hargaNum = pktData?.harga ? Number(pktData.harga) : 0;
      setNominal(hargaNum);
      setTerbilangText(terbilang(hargaNum));
      setIsCustomTerbilang(false);

      // Default description with Month & Year
      const currentDate = new Date(tanggal || Date.now());
      const monthName = MONTH_NAMES[currentDate.getMonth()] || '';
      const yearName = currentDate.getFullYear();
      const paketTitle = pktData?.nama_paket ? pktData.nama_paket : 'Internet Bulanan';
      setUntukPembayaran(`Pembayaran Internet ${paketTitle} - Periode ${monthName} ${yearName}`);
      setNoKwitansi(generateNoKwitansi(plg.kode_pelanggan, tanggal));

    } catch (err) {
      console.error('Gagal memuat detail pelanggan/paket:', err);
      toast.error('Gagal mengambil data pelanggan dari server', 'Error');
    } finally {
      setIsLoadingDetail(false);
    }
  }, [tanggal]);

  // Trigger loading when selectedPelangganId changes or on init
  useEffect(() => {
    if (selectedPelangganId) {
      loadPelangganData(selectedPelangganId);
    }
  }, [selectedPelangganId, loadPelangganData]);

  // Handle customer custom dropdown change
  const handleSelectPelangganById = (val: string) => {
    setSelectedPelangganId(val);
    if (val) {
      router.push(`/admin/struk?pelangganId=${val}`, { scroll: false });
    } else {
      setCurrentPelanggan(null);
      setCurrentPaket(null);
      setNamaPelanggan('');
      setKodePelanggan('');
      setNominal(0);
      setTerbilangText('');
      setUntukPembayaran('');
      setNoKwitansi('');
      router.push(`/admin/struk`, { scroll: false });
    }
  };

  const selectedPelangganObj = pelangganList.find(p => String(p.id) === String(selectedPelangganId));
  const filteredPelangganList = pelangganList.filter(p => 
    p.nama?.toLowerCase().includes(searchPelanggan.toLowerCase()) ||
    p.kode_pelanggan?.toLowerCase().includes(searchPelanggan.toLowerCase()) ||
    p.no_hp?.includes(searchPelanggan)
  );

  // Handle nominal change and auto update terbilang
  const handleNominalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value) || 0;
    setNominal(val);
    if (!isCustomTerbilang) {
      setTerbilangText(terbilang(val));
    }
  };

  // Handle date change and update payment description month if not customized
  const handleTanggalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = e.target.value;
    setTanggal(newDate);
    if (kodePelanggan) {
      setNoKwitansi(generateNoKwitansi(kodePelanggan, newDate));
    }
  };

  // Handle Print Action
  const handlePrint = () => {
    window.print();
  };

  // ─── AUTO-TRIM HELPER FOR CANVAS SIGNATURE ─────────────────
  const trimSignatureCanvas = (canvas: HTMLCanvasElement): string => {
    const ctx = canvas.getContext('2d');
    if (!ctx) return canvas.toDataURL('image/png');

    const w = canvas.width;
    const h = canvas.height;
    const imgData = ctx.getImageData(0, 0, w, h);
    const data = imgData.data;

    let minX = w, maxX = 0, minY = h, maxY = 0;
    let hasPixels = false;

    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const alpha = data[(y * w + x) * 4 + 3];
        if (alpha > 10) {
          hasPixels = true;
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
        }
      }
    }

    if (!hasPixels) return canvas.toDataURL('image/png');

    // Add minimal border padding
    const padding = 6;
    const cropX = Math.max(0, minX - padding);
    const cropY = Math.max(0, minY - padding);
    const cropW = Math.min(w - cropX, (maxX - minX) + padding * 2);
    const cropH = Math.min(h - cropY, (maxY - minY) + padding * 2);

    const croppedCanvas = document.createElement('canvas');
    croppedCanvas.width = cropW;
    croppedCanvas.height = cropH;
    const croppedCtx = croppedCanvas.getContext('2d');
    if (!croppedCtx) return canvas.toDataURL('image/png');

    croppedCtx.drawImage(canvas, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH);
    return croppedCanvas.toDataURL('image/png');
  };

  // ─── SIGNATURE DRAWING PAD HANDLERS ─────────────────────────
  const startDrawing = (e: ReactMouseEvent<HTMLCanvasElement>) => {
    const canvas = signatureCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
    setHasDrawn(true);
  };

  const draw = (e: ReactMouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = signatureCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    ctx.lineWidth = 3.0;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#00255a'; // Official deep dark blue ink
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  // Touch drawing for mobile / tablet / stylus
  const startTouchDrawing = (e: ReactTouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const canvas = signatureCanvasRef.current;
    if (!canvas || e.touches.length !== 1) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const touch = e.touches[0];
    const x = (touch.clientX - rect.left) * scaleX;
    const y = (touch.clientY - rect.top) * scaleY;

    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
    setHasDrawn(true);
  };

  const touchDraw = (e: ReactTouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    if (!isDrawing) return;
    const canvas = signatureCanvasRef.current;
    if (!canvas || e.touches.length !== 1) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const touch = e.touches[0];
    const x = (touch.clientX - rect.left) * scaleX;
    const y = (touch.clientY - rect.top) * scaleY;

    ctx.lineWidth = 3.0;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#00255a';
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const clearSignatureCanvas = () => {
    const canvas = signatureCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
  };

  const handleSaveDrawnSignature = () => {
    const canvas = signatureCanvasRef.current;
    if (!canvas || !hasDrawn) {
      toast.warning('Silakan buat coretan tanda tangan terlebih dahulu.');
      return;
    }
    const trimmedDataUrl = trimSignatureCanvas(canvas);
    setTandaTangan(trimmedDataUrl);
    if (typeof window !== 'undefined') {
      localStorage.setItem('bumdes_kwitansi_signature', trimmedDataUrl);
    }
    setIsSignModalOpen(false);
    toast.success('Tanda tangan digital berhasil diterapkan secara presisi!');
  };

  // Upload Signature Handler
  const handleUploadSignatureFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
    if (!validTypes.includes(file.type.toLowerCase())) {
      toast.error('Gunakan format gambar PNG, JPG, atau WebP.');
      e.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setTandaTangan(dataUrl);
      if (typeof window !== 'undefined') {
        localStorage.setItem('bumdes_kwitansi_signature', dataUrl);
      }
      toast.success('Gambar tanda tangan berhasil diterapkan!');
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Remove Signature
  const handleRemoveSignature = () => {
    setTandaTangan(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('bumdes_kwitansi_signature');
    }
    toast.info('Tanda tangan dihapus. Kwitansi siap ditandatangani manual (basah).');
  };

  // Receipt data payload for component
  const receiptData: KwitansiData = {
    noKwitansi,
    namaPelanggan,
    kodePelanggan,
    nominal,
    terbilangText,
    untukPembayaran,
    tanggal,
    namaPaket: currentPaket?.nama_paket,
    jenisPaket: currentPaket?.jenis_paket,
    tandaTangan,
    tandaTanganScale,
  };

  return (
    <div className="w-full space-y-6">

      {/* Hidden file input for signature upload */}
      <input
        type="file"
        ref={signatureFileInputRef}
        onChange={handleUploadSignatureFile}
        accept="image/png,image/jpeg,image/webp,image/jpg"
        className="hidden"
      />
      
      {/* ─── Top Header & Breadcrumb ────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#0047AB] border border-blue-200 flex items-center justify-center shrink-0 shadow-xs">
            <IconifyIcon icon="solar:printer-bold-duotone" className="text-2xl" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
              <span>Cetak Kwitansi / Struk Pembayaran</span>
              <span className="px-2.5 py-0.5 text-[11px] font-bold rounded-full bg-blue-100 text-[#0047AB] border border-blue-200">
                BTS SODONG NET
              </span>
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Kelola dan cetak bukti transaksi pembayaran resmi internet desa untuk pelanggan
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => router.push('/admin/pelanggan')}
            className="px-3.5 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <IconifyIcon icon="lucide:arrow-left" className="text-sm" />
            <span>Data Pelanggan</span>
          </button>

          <button
            onClick={handlePrint}
            disabled={!namaPelanggan}
            className={`px-4 py-2 text-xs font-bold text-white rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer ${
              namaPelanggan
                ? 'bg-gradient-to-r from-[#003882] to-[#0055b3] hover:from-[#002f6c] hover:to-[#0047AB] hover:shadow-lg active:scale-95'
                : 'bg-slate-300 cursor-not-allowed opacity-70'
            }`}
          >
            <IconifyIcon icon="lucide:printer" className="text-base" />
            <span>Cetak Struk (Print)</span>
          </button>
        </div>
      </div>

      {/* ─── 2-Column Responsive Layout ─────────────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">

        {/* Left Column: Form Controls (5 Cols on XL) */}
        <div className="xl:col-span-5 bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <IconifyIcon icon="lucide:sliders" className="text-[#0047AB] text-base" />
              <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wide">
                Formulir Kwitansi
              </h2>
            </div>
            {isLoadingDetail && (
              <span className="text-[11px] text-blue-600 font-medium flex items-center gap-1">
                <IconifyIcon icon="lucide:loader-2" className="animate-spin" />
                Memuat data...
              </span>
            )}
          </div>

          {/* 1. Custom Pilih Pelanggan Dropdown */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700">
              Pilih Pelanggan <span className="text-rose-500">*</span>
            </label>
            <div
              className="relative"
              tabIndex={0}
              onBlur={(e) => {
                if (!e.currentTarget.contains(e.relatedTarget)) {
                  setPelangganDropdownOpen(false);
                }
              }}
            >
              {/* Trigger Button */}
              <button
                type="button"
                onClick={() => setPelangganDropdownOpen(!pelangganDropdownOpen)}
                disabled={isLoadingList}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 text-xs font-semibold rounded-xl border bg-white outline-none transition-all cursor-pointer ${
                  pelangganDropdownOpen
                    ? 'border-emerald-500 ring-2 ring-emerald-500/20 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                {selectedPelangganObj ? (
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="relative w-6 h-6 shrink-0 rounded-full overflow-hidden border border-slate-200 bg-slate-100 flex items-center justify-center">
                      <img
                        src={getApiAssetUrl(selectedPelangganObj.user?.foto_profil || selectedPelangganObj.foto_profil)}
                        alt={selectedPelangganObj.nama}
                        onError={(e: any) => {
                          e.currentTarget.src = '/assets/profile.jpg';
                        }}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <span className="truncate text-slate-800 font-bold">
                      {selectedPelangganObj.nama} <span className="font-mono text-emerald-600 font-semibold">({selectedPelangganObj.kode_pelanggan})</span> - {selectedPelangganObj.no_hp}
                    </span>
                  </div>
                ) : (
                  <span className="text-slate-400 font-normal">-- Pilih Nama / ID Pelanggan --</span>
                )}
                
                <IconifyIcon
                  icon="lucide:chevron-down"
                  className={`text-slate-400 text-sm shrink-0 transition-transform duration-200 ml-2 ${
                    pelangganDropdownOpen ? 'rotate-180 text-emerald-600' : ''
                  }`}
                />
              </button>

              {/* Floating Custom Dropdown Menu */}
              {pelangganDropdownOpen && (
                <div className="absolute left-0 top-full z-40 mt-1.5 w-full rounded-2xl border border-slate-200/90 bg-white shadow-xl p-2 space-y-1.5 animate-in fade-in zoom-in-95 duration-150">
                  {/* Search inside dropdown */}
                  <div className="relative px-1 pt-1 pb-1">
                    <IconifyIcon icon="lucide:search" className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
                    <input
                      type="text"
                      value={searchPelanggan}
                      onChange={(e) => setSearchPelanggan(e.target.value)}
                      placeholder="Cari nama, ID, atau no HP..."
                      className="w-full pl-8 pr-3 py-1.5 text-[11.5px] rounded-lg border border-slate-200 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 bg-slate-50 text-slate-800 placeholder:text-slate-400"
                      autoFocus
                    />
                  </div>

                  {/* Options List */}
                  <div className="max-h-56 overflow-y-auto space-y-0.5 pr-0.5">
                    <button
                      type="button"
                      onMouseDown={() => {
                        handleSelectPelangganById('');
                        setPelangganDropdownOpen(false);
                      }}
                      className={`w-full rounded-xl px-3 py-2 text-left text-xs font-semibold transition-colors flex items-center justify-between cursor-pointer ${
                        !selectedPelangganId
                          ? 'bg-emerald-50 text-emerald-700 font-bold'
                          : 'text-slate-500 hover:bg-slate-50'
                      }`}
                    >
                      <span>-- Pilih Nama / ID Pelanggan --</span>
                      {!selectedPelangganId && (
                        <IconifyIcon icon="lucide:check" className="text-emerald-600 text-sm" />
                      )}
                    </button>

                    {filteredPelangganList.map((p) => {
                      const isSelected = String(p.id) === String(selectedPelangganId);
                      const avatarUrl = getApiAssetUrl(p.user?.foto_profil || p.foto_profil);

                      return (
                        <button
                          key={p.id}
                          type="button"
                          onMouseDown={() => {
                            handleSelectPelangganById(String(p.id));
                            setPelangganDropdownOpen(false);
                          }}
                          className={`w-full rounded-xl px-3 py-2 text-left text-xs transition-all flex items-center justify-between gap-3 cursor-pointer ${
                            isSelected
                              ? 'bg-emerald-50 text-emerald-800 font-bold border border-emerald-200/60'
                              : 'text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="relative w-7 h-7 shrink-0 rounded-full overflow-hidden border border-slate-200 bg-slate-100 flex items-center justify-center">
                              <img
                                src={avatarUrl}
                                alt={p.nama}
                                onError={(e: any) => {
                                  e.currentTarget.src = '/assets/profile.jpg';
                                }}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="flex flex-col min-w-0">
                              <div className="font-bold text-slate-800 text-[12px] truncate">
                                {p.nama}{' '}
                                <span className="font-mono text-emerald-600 font-semibold text-[11px]">
                                  ({p.kode_pelanggan})
                                </span>
                              </div>
                              <div className="text-[10.5px] text-slate-400 font-medium">
                                📞 {p.no_hp}
                              </div>
                            </div>
                          </div>

                          {isSelected && (
                            <IconifyIcon icon="lucide:check" className="text-emerald-600 text-base shrink-0" />
                          )}
                        </button>
                      );
                    })}

                    {filteredPelangganList.length === 0 && (
                      <div className="py-4 text-center text-slate-400 text-xs">
                        Pelanggan tidak ditemukan
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Quick Details Card if customer selected */}
          {currentPelanggan && (
            <div className="p-3.5 rounded-xl bg-blue-50/60 border border-blue-100 flex items-start justify-between gap-3 text-xs">
              <div className="space-y-1">
                <div className="font-bold text-slate-800">{currentPelanggan.nama}</div>
                <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
                  <IconifyIcon icon="lucide:map-pin" className="text-blue-500" />
                  <span>{currentPelanggan.alamat || 'Alamat tidak diisi'}</span>
                </div>
                <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
                  <IconifyIcon icon="lucide:phone" className="text-blue-500" />
                  <span>{currentPelanggan.no_hp}</span>
                </div>
              </div>
              {currentPaket && (
                <div className="text-right shrink-0">
                  <span className="px-2 py-0.5 rounded-md text-[10.5px] font-bold bg-blue-200/80 text-[#003882]">
                    {currentPaket.nama_paket}
                  </span>
                  <div className="text-xs font-black text-emerald-600 mt-1">
                    Rp {Number(currentPaket.harga || 0).toLocaleString('id-ID')}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 2. No Kwitansi & Tanggal Pembayaran (Grid 2 cols) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* No Kwitansi */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">
                No. Kwitansi <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={noKwitansi}
                onChange={(e) => setNoKwitansi(e.target.value)}
                placeholder="20260817-PLG001"
                className="w-full px-3 py-2 text-xs font-mono font-bold text-slate-800 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all uppercase"
              />
            </div>

            {/* Tanggal Pembayaran */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">
                Tanggal Pembayaran <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                value={tanggal}
                onChange={handleTanggalChange}
                className="w-full px-3 py-2 text-xs font-semibold text-slate-800 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer"
              />
            </div>
          </div>

          {/* 3. Nominal Pembayaran (Rp) */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 flex items-center justify-between">
              <span>Nominal Uang Sejumlah (Rp) <span className="text-rose-500">*</span></span>
              {currentPaket?.harga && (
                <button
                  type="button"
                  onClick={() => {
                    const h = Number(currentPaket.harga);
                    setNominal(h);
                    setTerbilangText(terbilang(h));
                    setIsCustomTerbilang(false);
                  }}
                  className="text-[10px] text-blue-600 font-semibold hover:underline cursor-pointer"
                >
                  Gunakan Harga Paket (Rp {Number(currentPaket.harga).toLocaleString('id-ID')})
                </button>
              )}
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-3 font-bold text-xs text-slate-500">Rp</span>
              <input
                type="number"
                value={nominal || ''}
                onChange={handleNominalChange}
                placeholder="0"
                className="w-full pl-9 pr-3 py-2.5 text-sm font-bold text-slate-800 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-mono"
              />
            </div>
          </div>

          {/* 4. Terbilang (Auto / Editable) */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-slate-700">
                Terbilang
              </label>
              <button
                type="button"
                onClick={() => {
                  if (isCustomTerbilang) {
                    setTerbilangText(terbilang(nominal));
                    setIsCustomTerbilang(false);
                  } else {
                    setIsCustomTerbilang(true);
                  }
                }}
                className="text-[10.5px] font-semibold text-blue-600 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <IconifyIcon icon={isCustomTerbilang ? 'lucide:rotate-ccw' : 'lucide:edit-3'} className="text-xs" />
                <span>{isCustomTerbilang ? 'Otomatiskan' : 'Edit Manual'}</span>
              </button>
            </div>
            <textarea
              rows={2}
              value={terbilangText}
              onChange={(e) => {
                setTerbilangText(e.target.value);
                setIsCustomTerbilang(true);
              }}
              placeholder="Terbilang dalam rupiah..."
              className={`w-full px-3 py-2 text-xs font-semibold italic rounded-xl border focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all ${
                isCustomTerbilang
                  ? 'bg-amber-50/50 border-amber-300 text-amber-900 focus:border-amber-500'
                  : 'bg-slate-50 border-slate-200 text-slate-700 focus:border-blue-500'
              }`}
            />
          </div>

          {/* 5. Untuk Pembayaran */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700">
              Untuk Pembayaran <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={2}
              value={untukPembayaran}
              onChange={(e) => setUntukPembayaran(e.target.value)}
              placeholder="Contoh: Pembayaran Tagihan Internet Paket VOUCHER RUMAHAN..."
              className="w-full px-3 py-2 text-xs font-semibold text-slate-800 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>

          {/* 6. Fitur Tanda Tangan Digital & Upload (NEW) */}
          <div className="space-y-2.5 pt-1 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <IconifyIcon icon="lucide:pen-tool" className="text-blue-600 text-sm" />
                <span>Tanda Tangan Petugas / Kwitansi</span>
              </label>
              {tandaTangan && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                  <IconifyIcon icon="lucide:check-circle-2" className="text-xs" />
                  <span>Tanda Tangan Aktif</span>
                </span>
              )}
            </div>

            {tandaTangan ? (
              <div className="space-y-2.5">
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between gap-3">
                  <div className="h-12 w-32 bg-white rounded-xl border border-slate-200 p-1 flex items-center justify-center overflow-hidden shadow-2xs">
                    <img
                      src={tandaTangan}
                      alt="Tanda Tangan Preview"
                      style={{ transform: `scale(${tandaTanganScale / 100})` }}
                      className="max-h-full max-w-full object-contain mix-blend-multiply transition-transform"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setIsSignModalOpen(true);
                        setTimeout(clearSignatureCanvas, 100);
                      }}
                      className="px-2.5 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-xl border border-blue-200 transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <IconifyIcon icon="lucide:pen" className="text-xs" />
                      <span>Coret Ulang</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => signatureFileInputRef.current?.click()}
                      className="px-2.5 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 rounded-xl border border-slate-200 transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <IconifyIcon icon="lucide:upload" className="text-xs" />
                      <span>Upload</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleRemoveSignature}
                      className="p-1.5 text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
                      title="Hapus tanda tangan"
                    >
                      <IconifyIcon icon="lucide:trash-2" className="text-sm" />
                    </button>
                  </div>
                </div>

                {/* Ukuran / Skala Tanda Tangan Slider & Presets */}
                <div className="px-3 py-2 bg-blue-50/50 rounded-xl border border-blue-100 space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] font-semibold text-slate-700">
                    <span className="flex items-center gap-1">
                      <IconifyIcon icon="lucide:maximize-2" className="text-blue-600 text-xs" />
                      Sesuaikan Ukuran di Kwitansi:
                    </span>
                    <span className="font-mono font-bold text-blue-700">{tandaTanganScale}%</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min={50}
                      max={140}
                      step={5}
                      value={tandaTanganScale}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setTandaTanganScale(val);
                        if (typeof window !== 'undefined') {
                          localStorage.setItem('bumdes_kwitansi_signature_scale', String(val));
                        }
                      }}
                      className="w-full accent-blue-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                    />
                    <div className="flex items-center gap-1 shrink-0">
                      {[
                        { label: 'Kecil', val: 75 },
                        { label: 'Pas', val: 100 },
                        { label: 'Besar', val: 120 }
                      ].map((preset) => (
                        <button
                          key={preset.val}
                          type="button"
                          onClick={() => {
                            setTandaTanganScale(preset.val);
                            if (typeof window !== 'undefined') {
                              localStorage.setItem('bumdes_kwitansi_signature_scale', String(preset.val));
                            }
                          }}
                          className={`px-2 py-0.5 text-[10px] font-bold rounded-md transition-colors cursor-pointer ${
                            tandaTanganScale === preset.val
                              ? 'bg-blue-600 text-white'
                              : 'bg-white text-slate-600 hover:bg-blue-100 border border-slate-200'
                          }`}
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    setIsSignModalOpen(true);
                    setTimeout(clearSignatureCanvas, 100);
                  }}
                  className="py-2.5 px-3 rounded-xl bg-blue-50/80 hover:bg-blue-100/80 text-[#003882] border border-blue-200/80 font-semibold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
                >
                  <IconifyIcon icon="lucide:pen-tool" className="text-sm" />
                  <span>Coret Tanda Tangan</span>
                </button>

                <button
                  type="button"
                  onClick={() => signatureFileInputRef.current?.click()}
                  className="py-2.5 px-3 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 font-semibold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
                >
                  <IconifyIcon icon="lucide:upload" className="text-sm" />
                  <span>Upload Gambar</span>
                </button>
              </div>
            )}
            <p className="text-[10.5px] text-slate-400">
              💡 Kosongkan jika kwitansi ingin ditandatangani secara basah (manual) setelah dicetak.
            </p>
          </div>

          {/* Action Trigger Buttons */}
          <div className="pt-2 flex flex-col gap-2">
            <button
              onClick={handlePrint}
              disabled={!namaPelanggan}
              className={`w-full py-3 text-xs font-bold text-white rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer ${
                namaPelanggan
                  ? 'bg-gradient-to-r from-[#003882] to-[#0055b3] hover:from-[#002f6c] hover:to-[#0047AB] hover:shadow-lg active:scale-98'
                  : 'bg-slate-300 cursor-not-allowed opacity-70'
              }`}
            >
              <IconifyIcon icon="lucide:printer" className="text-base" />
              <span>Cetak Kwitansi Sekarang</span>
            </button>
            
            <p className="text-[11px] text-center text-slate-400">
              💡 Pastikan ukuran kertas pada dialog print diatur ke <strong>A4 / Custom (Landscape/Auto)</strong>
            </p>
          </div>

        </div>

        {/* Right Column: Live Struk Preview (7 Cols on XL) */}
        <div className="xl:col-span-7 space-y-4">
          
          {/* Header Preview Bar */}
          <div className="flex items-center justify-between bg-white px-4 py-3 rounded-2xl border border-slate-200/80 shadow-xs">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Live Preview Struk
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">
                Desain Resmi BTS SODONG NET
              </span>
            </div>
          </div>

          {/* Struk Card Container */}
          <div
            id="kwitansi-print-wrapper"
            className="w-full bg-slate-100/80 rounded-2xl border border-slate-200 p-4 md:p-6 flex items-center justify-center overflow-x-auto"
          >
            <KwitansiReceipt data={receiptData} />
          </div>

        </div>

      </div>

      {/* ─── DIGITAL SIGNATURE DRAWING PAD MODAL ────────────────── */}
      {isSignModalOpen && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[9999] overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            {/* Backdrop */}
            <div 
              className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity"
              onClick={() => setIsSignModalOpen(false)}
            />

            {/* Modal Box */}
            <div className="relative w-full max-w-md transform rounded-3xl bg-white shadow-2xl transition-all flex flex-col border border-slate-200/80 animate-in zoom-in-95 duration-200">
              
              {/* Header */}
              <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-slate-200/80">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-blue-50 border border-blue-100 text-[#0047AB]">
                    <IconifyIcon icon="lucide:pen-tool" className="text-xl" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-slate-900">Buat Tanda Tangan Digital</h2>
                    <p className="text-[11px] text-slate-500">Coret tanda tangan Anda pada kotak di bawah.</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsSignModalOpen(false)}
                  className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition-colors cursor-pointer"
                >
                  <IconifyIcon icon="lucide:x" className="text-base" />
                </button>
              </div>

              {/* Body: Signature Canvas */}
              <div className="px-6 py-5 space-y-3">
                {/* Visual Label Above Box */}
                <div className="text-center text-xs font-bold text-[#00255a] uppercase tracking-wide">
                  Hormat Kami,<br />
                  <span className="text-[11px] text-[#003882]">BTS SODONG NET</span>
                </div>

                {/* Box Matching Kwitansi Template Proportions (Slim Box) */}
                <div className="relative mx-auto w-full max-w-sm h-28 rounded-xl border-2 border-blue-500 bg-white shadow-inner overflow-hidden touch-none flex items-center justify-center cursor-crosshair">
                  
                  {/* Canvas */}
                  <canvas
                    ref={signatureCanvasRef}
                    width={420}
                    height={112}
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    onTouchStart={startTouchDrawing}
                    onTouchMove={touchDraw}
                    onTouchEnd={stopDrawing}
                    className="w-full h-full block"
                  />

                  {/* Subtle Center Guide Line */}
                  <div className="absolute bottom-4 left-6 right-6 border-b border-dashed border-blue-200 pointer-events-none"></div>

                  {!hasDrawn && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-slate-400 text-xs px-4 text-center">
                      <span className="flex items-center gap-1.5 font-medium text-slate-400">
                        <IconifyIcon icon="lucide:pen" className="text-blue-500 text-sm shrink-0" />
                        Coret tanda tangan di dalam kotak ini
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                  <span className="text-[11px]">Tinta: <b className="text-blue-900 font-semibold">Biru Resmi Kwitansi</b></span>
                  <button
                    type="button"
                    onClick={clearSignatureCanvas}
                    className="text-red-500 hover:text-red-700 font-semibold flex items-center gap-1 text-[11px] cursor-pointer"
                  >
                    <IconifyIcon icon="lucide:rotate-ccw" className="text-xs" />
                    <span>Hapus Coretan</span>
                  </button>
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-end gap-2.5 px-6 pt-3 pb-5 border-t border-slate-200/80">
                <button
                  type="button"
                  onClick={() => setIsSignModalOpen(false)}
                  className="rounded-xl bg-slate-100 hover:bg-slate-200 px-4 py-2.5 text-xs font-semibold text-slate-600 transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleSaveDrawnSignature}
                  disabled={!hasDrawn}
                  className="rounded-xl bg-[#0047AB] hover:bg-[#003882] active:bg-[#002f6c] px-5 py-2.5 text-xs font-semibold text-white shadow-sm shadow-blue-500/20 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <IconifyIcon icon="lucide:check" className="text-sm" />
                  <span>Gunakan Tanda Tangan Ini</span>
                </button>
              </div>

            </div>
          </div>
        </div>,
        document.body
      )}

      {/* ─── Global Dedicated Print CSS ────────────────────────── */}
      <style jsx global>{`
        @media print {
          @page {
            size: A4 landscape;
            margin: 0;
          }
          *, *::before, *::after {
            box-shadow: none !important;
            text-shadow: none !important;
          }
          html, body {
            width: 100vw !important;
            height: 100vh !important;
            max-height: 100vh !important;
            margin: 0 !important;
            padding: 0 !important;
            background: #ffffff !important;
            overflow: hidden !important;
            page-break-after: avoid !important;
            page-break-before: avoid !important;
          }
          /* Hide sidebar, topbar, buttons, toasts, and UI form elements */
          header, aside, nav, footer, button, .Toastify, [role="alert"], input, select, textarea {
            display: none !important;
          }
          
          /* Hide form column and header bar */
          .xl\\:col-span-5,
          .flex.items-center.justify-between.bg-white,
          .flex.flex-col.md\\:flex-row {
            display: none !important;
          }

          /* Print wrapper occupies exactly the 1 landscape page */
          #kwitansi-print-wrapper {
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            position: fixed !important;
            inset: 0 !important;
            width: 100vw !important;
            height: 100vh !important;
            margin: 0 !important;
            padding: 0 !important;
            background: #ffffff !important;
            border: none !important;
            border-radius: 0 !important;
            z-index: 999999 !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
            page-break-after: avoid !important;
            page-break-before: avoid !important;
          }

          #kwitansi-print-area {
            position: relative !important;
            width: 731px !important;
            max-width: 92vw !important;
            margin: auto !important;
            box-shadow: none !important;
            border: none !important;
            border-radius: 0 !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
            page-break-after: avoid !important;
            page-break-before: avoid !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            color-adjust: exact !important;
          }
        }
      `}</style>

    </div>
  );
}

export default function AdminStrukPage() {
  return (
    <Suspense fallback={
      <div className="w-full p-12 text-center text-slate-500 flex flex-col items-center justify-center gap-2">
        <IconifyIcon icon="lucide:loader-2" className="text-2xl animate-spin text-blue-600" />
        <span className="text-xs font-semibold">Memuat Halaman Kwitansi...</span>
      </div>
    }>
      <AdminStrukContent />
    </Suspense>
  );
}
