'use client';

import React, { useState, useRef, useEffect, ChangeEvent, FormEvent, MouseEvent, TouchEvent, WheelEvent } from 'react';
import { createPortal } from 'react-dom';
import IconifyIcon from '@/components/common/IconifyIcon';
import { useAuth } from '@/context/AuthContext';
import { authService } from '@/services/authService';
import { pelangganService } from '@/services/pelangganService';
import { getApiAssetUrl } from '@/services/api';
import { toast } from '@/components/Toast';
import dayjs from 'dayjs';

interface ProfilePageContentProps {
  role: 'admin' | 'pelanggan';
}

const VIEWPORT_SIZE = 220; // 220px circular preview viewport
const CROP_OUTPUT_SIZE = 512; // 512x512 high-res avatar output

export default function ProfilePageContent({ role }: ProfilePageContentProps) {
  const { user, updateUser, refreshUser } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  // States for Photo Selection & Cropper
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  // Cropper Controls State
  const [zoom, setZoom] = useState<number>(1);
  const [offset, setOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const dragStartRef = useRef<{ x: number; y: number; startOffsetX: number; startOffsetY: number }>({
    x: 0,
    y: 0,
    startOffsetX: 0,
    startOffsetY: 0,
  });

  // Pelanggan info if role is pelanggan
  const [pelangganData, setPelangganData] = useState<any>(null);
  const [isLoadingPelanggan, setIsLoadingPelanggan] = useState(role === 'pelanggan');

  // Change Password State
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showOldPass, setShowOldPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  // Fetch fresh user profile on mount
  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  // Fetch pelanggan detail if role is pelanggan
  useEffect(() => {
    if (role === 'pelanggan') {
      const fetchPelanggan = async () => {
        try {
          setIsLoadingPelanggan(true);
          const res = await pelangganService.getMe();
          if (res.ok && res.data?.data) {
            setPelangganData(res.data.data);
          }
        } catch (e) {
          console.error('Error fetching pelanggan info:', e);
        } finally {
          setIsLoadingPelanggan(false);
        }
      };
      fetchPelanggan();
    }
  }, [role]);

  // Handle file selection
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type.toLowerCase())) {
      toast.error('Hanya format JPG, JPEG, PNG, atau WebP yang diperbolehkan.', 'Format Tidak Didukung');
      e.target.value = '';
      return;
    }

    // Validate size (max 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error('Ukuran file maksimal 5 MB.', 'Ukuran Terlalu Besar');
      e.target.value = '';
      return;
    }

    setSelectedFile(file);
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    setZoom(1);
    setOffset({ x: 0, y: 0 });
    setShowPreviewModal(true);
  };

  // Cancel selection
  const handleCancelPreview = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setSelectedFile(null);
    setPreviewUrl(null);
    setZoom(1);
    setOffset({ x: 0, y: 0 });
    setShowPreviewModal(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Reset Cropper Position & Zoom
  const handleResetPosition = () => {
    setZoom(1);
    setOffset({ x: 0, y: 0 });
  };

  // ─── MOUSE DRAG / PAN HANDLERS ─────────────────────────────────
  const handleMouseDown = (e: MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      startOffsetX: offset.x,
      startOffsetY: offset.y,
    };
  };

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;
    setOffset({
      x: dragStartRef.current.startOffsetX + dx,
      y: dragStartRef.current.startOffsetY + dy,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // ─── TOUCH DRAG HANDLERS (MOBILE / TABLET) ─────────────────────
  const handleTouchStart = (e: TouchEvent<HTMLDivElement>) => {
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      setIsDragging(true);
      dragStartRef.current = {
        x: touch.clientX,
        y: touch.clientY,
        startOffsetX: offset.x,
        startOffsetY: offset.y,
      };
    }
  };

  const handleTouchMove = (e: TouchEvent<HTMLDivElement>) => {
    if (!isDragging || e.touches.length !== 1) return;
    const touch = e.touches[0];
    const dx = touch.clientX - dragStartRef.current.x;
    const dy = touch.clientY - dragStartRef.current.y;
    setOffset({
      x: dragStartRef.current.startOffsetX + dx,
      y: dragStartRef.current.startOffsetY + dy,
    });
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  // ─── MOUSE WHEEL ZOOM ──────────────────────────────────────────
  const handleWheelZoom = (e: WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    const delta = e.deltaY * -0.002;
    setZoom((prev) => Math.min(Math.max(prev + delta, 0.2), 3.0));
  };

  // ─── GENERATE CROPPED IMAGE BLOB & SUBMIT ──────────────────────
  const handleUploadPhoto = async () => {
    if (!previewUrl) return;

    setIsUploading(true);
    try {
      // 1. Create Cropped Canvas
      const croppedBlob = await new Promise<Blob | null>((resolve) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = CROP_OUTPUT_SIZE;
          canvas.height = CROP_OUTPUT_SIZE;
          const ctx = canvas.getContext('2d');

          if (!ctx) {
            resolve(null);
            return;
          }

          // Ratio between high-res output canvas (512px) and circular preview viewport (220px)
          const k = CROP_OUTPUT_SIZE / VIEWPORT_SIZE;

          // Compute base scale inside the viewport (object-contain)
          const fitScale = Math.min(VIEWPORT_SIZE / img.naturalWidth, VIEWPORT_SIZE / img.naturalHeight);

          // Clear background
          ctx.clearRect(0, 0, CROP_OUTPUT_SIZE, CROP_OUTPUT_SIZE);

          // Translate to center + user dragged offset
          ctx.translate(CROP_OUTPUT_SIZE / 2 + offset.x * k, CROP_OUTPUT_SIZE / 2 + offset.y * k);
          ctx.scale(zoom, zoom);

          // Draw image centered
          const renderWidth = img.naturalWidth * fitScale * k;
          const renderHeight = img.naturalHeight * fitScale * k;
          ctx.drawImage(img, -renderWidth / 2, -renderHeight / 2, renderWidth, renderHeight);

          canvas.toBlob(
            (blob) => {
              resolve(blob);
            },
            'image/jpeg',
            0.92
          );
        };
        img.onerror = () => resolve(null);
        img.src = previewUrl;
      });

      if (!croppedBlob) {
        throw new Error('Gagal memproses pemotongan gambar');
      }

      // 2. Prepare FormData with cropped file
      const file = new File([croppedBlob], 'profile-avatar.jpg', { type: 'image/jpeg' });
      const formData = new FormData();
      formData.append('foto_profil', file);

      // 3. Send to API
      const res = await authService.uploadPhoto(formData);

      if (res.ok && res.data?.success) {
        const updatedUserData = res.data.data;
        
        // Update local auth state immediately
        updateUser({ foto_profil: updatedUserData.foto_profil });
        await refreshUser();

        toast.success('Foto profil berhasil diperbarui');
        handleCancelPreview();
      } else {
        const errMsg = res.data?.message || 'Gagal mengunggah foto profil.';
        toast.error(errMsg, 'Upload Gagal');
      }
    } catch (err: any) {
      console.error('Error uploading photo:', err);
      toast.error(err?.message || 'Terjadi kesalahan saat mengunggah foto.', 'Gagal');
    } finally {
      setIsUploading(false);
    }
  };

  // Handle Change Password Submit
  const handleChangePasswordSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!oldPassword || !newPassword || !confirmPassword) {
      toast.error('Semua kolom password wajib diisi.', 'Form Belum Lengkap');
      return;
    }

    if (newPassword.length < 6) {
      toast.error('Password baru minimal 6 karakter.', 'Password Terlalu Pendek');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('Konfirmasi password baru tidak cocok.', 'Password Tidak Cocok');
      return;
    }

    setIsChangingPassword(true);
    try {
      const res = await authService.changePassword({
        old_password: oldPassword,
        new_password: newPassword,
        confirm_password: confirmPassword,
      });

      if (res.ok && res.data?.success) {
        toast.success('Password Anda berhasil diubah.');
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        toast.error(res.data?.message || 'Gagal mengubah password.', 'Gagal');
      }
    } catch (err: any) {
      toast.error(err?.message || 'Terjadi kesalahan koneksi server.', 'Gagal');
    } finally {
      setIsChangingPassword(false);
    }
  };

  const currentAvatarUrl = getApiAssetUrl(user?.foto_profil);
  const userName = user?.username || 'User';
  const userRoleLabel = role === 'admin' ? 'Administrator Sistem' : 'Pelanggan BUMDes';
  const isStatusAktif = user?.isActive !== false && user?.is_active !== false;

  return (
    <div className="flex flex-col gap-6 w-full animate-in fade-in duration-300 pb-12">

      {/* ─── HIDDEN FILE INPUT ─────────────────────────────────────── */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/jpeg,image/png,image/webp,image/jpg"
        className="hidden"
      />

      {/* ─── FULL-VIEW HERO PROFILE CARD ───────────────────────────── */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950 p-6 sm:p-8 rounded-2xl border border-slate-800 text-white shadow-sm">
        
        {/* Background Watermark Icon */}
        <div className="absolute -right-6 -bottom-8 opacity-10 text-emerald-400 pointer-events-none">
          <IconifyIcon icon="lucide:user-check" className="text-[180px]" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start justify-between gap-6">
          
          {/* Left: Avatar & Main Info */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
            
            {/* Avatar with Edit Overlay */}
            <div className="relative group shrink-0">
              <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl overflow-hidden border-3 border-emerald-500/50 shadow-xl bg-slate-800 flex items-center justify-center">
                <img
                  src={currentAvatarUrl}
                  alt={userName}
                  onError={(e: any) => {
                    e.currentTarget.src = '/assets/profile.jpg';
                  }}
                  className="w-full h-full object-cover"
                />
              </div>
              
              {/* Camera Hover Overlay */}
              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute inset-0 bg-slate-950/70 backdrop-blur-xs rounded-2xl opacity-0 group-hover:opacity-100 transition-all flex flex-col items-center justify-center text-white cursor-pointer"
                title="Klik untuk ganti foto profil"
              >
                <IconifyIcon icon="lucide:camera" className="text-2xl text-emerald-400 mb-1" />
                <span className="text-[11px] font-semibold text-white">Ganti Foto</span>
              </button>
            </div>

            {/* Profile Identity */}
            <div className="space-y-2">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <span className="px-2.5 py-0.5 text-[11px] font-bold rounded-md bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 uppercase tracking-wider">
                  {userRoleLabel}
                </span>
                {pelangganData?.kode_pelanggan && (
                  <span className="px-2.5 py-0.5 text-[11px] font-mono font-bold rounded-md bg-blue-500/20 text-blue-300 border border-blue-500/30">
                    {pelangganData.kode_pelanggan}
                  </span>
                )}
                <span className={`px-2.5 py-0.5 text-[11px] font-semibold rounded-md border ${
                  isStatusAktif
                    ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                    : 'bg-rose-500/10 text-rose-300 border-rose-500/30'
                }`}>
                  Status: {isStatusAktif ? 'Aktif' : 'Nonaktif'}
                </span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
                {pelangganData?.nama || userName}
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 flex flex-wrap items-center justify-center sm:justify-start gap-3">
                <span>Username: <b className="font-mono text-emerald-400">@{userName}</b></span>
                <span>•</span>
                <span>Role: <b className="capitalize text-slate-200">{role}</b></span>
              </p>

              <div className="pt-2 flex flex-wrap items-center justify-center sm:justify-start gap-3">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 text-xs sm:text-sm font-semibold bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer"
                >
                  <IconifyIcon icon="lucide:upload" className="text-base" />
                  <span>Ubah Foto Profil</span>
                </button>
              </div>
            </div>

          </div>

          {/* Right: Quick Badge Summary */}
          <div className="hidden lg:flex flex-col gap-2.5 shrink-0 bg-slate-800/60 p-4 rounded-2xl border border-slate-700/80 min-w-[240px]">
            <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-700/60">
              <span className="text-slate-400 font-medium">Sistem</span>
              <span className="font-semibold text-white">BTS SODONG NET</span>
            </div>
            <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-700/60">
              <span className="text-slate-400 font-medium">Pengelola</span>
              <span className="font-semibold text-emerald-400">BUMDes Tirta Sejahtera</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 font-medium">Keamanan</span>
              <span className="font-semibold text-sky-400 flex items-center gap-1">
                <IconifyIcon icon="lucide:shield-check" className="text-xs" />
                Terautentikasi JWT
              </span>
            </div>
          </div>

        </div>
      </div>

      {/* ─── 3 SUMMARY STATS METRIC CARDS ──────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        {/* Stat 1: Identitas Akun */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
              <IconifyIcon icon="lucide:user-check" className="text-lg" />
            </div>
            <span className="px-2 py-0.5 text-[11px] font-semibold text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-lg">
              {isStatusAktif ? 'Aktif' : 'Nonaktif'}
            </span>
          </div>
          <div className="mt-4">
            <h3 className="text-xl font-bold text-slate-900">@{userName}</h3>
            <p className="text-xs text-slate-500 font-medium mt-0.5">Identitas Akun Terdaftar</p>
          </div>
        </div>

        {/* Stat 2: Hak Akses */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
              <IconifyIcon icon="lucide:shield" className="text-lg" />
            </div>
            <span className="px-2 py-0.5 text-[11px] font-semibold text-blue-600 bg-blue-50 border border-blue-200 rounded-lg uppercase">
              {role}
            </span>
          </div>
          <div className="mt-4">
            <h3 className="text-xl font-bold text-slate-900">{userRoleLabel}</h3>
            <p className="text-xs text-slate-500 font-medium mt-0.5">Tingkat Hak Akses Sistem</p>
          </div>
        </div>

        {/* Stat 3: Layanan / Privilege */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center border border-teal-100">
              <IconifyIcon icon={role === 'pelanggan' ? 'lucide:wifi' : 'lucide:settings-2'} className="text-lg" />
            </div>
            <span className="px-2 py-0.5 text-[11px] font-semibold text-teal-600 bg-teal-50 border border-teal-200 rounded-lg">
              {role === 'pelanggan' ? (pelangganData?.paket?.jenis_paket || 'Internet') : 'Super Access'}
            </span>
          </div>
          <div className="mt-4">
            <h3 className="text-xl font-bold text-slate-900">
              {role === 'pelanggan' 
                ? (pelangganData?.paket ? `${pelangganData.paket.mbps} Mbps` : 'Langganan Aktif')
                : 'Penuh / Operator'}
            </h3>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              {role === 'pelanggan' ? (pelangganData?.paket?.nama_paket || 'Paket Internet') : 'Cakupan Kelola Server'}
            </p>
          </div>
        </div>

      </div>

      {/* ─── 2-COLUMN MAIN CONTENT (DETAILS & PASSWORD) ───────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

        {/* LEFT COLUMN: INFORMASI LENGKAP AKUN (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">

          {/* User Details Card */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex items-center space-x-3 border-b border-slate-100 pb-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
                <IconifyIcon icon="lucide:user" className="text-base" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Rincian Data Pengguna</h3>
                <p className="text-[11px] text-slate-500">Informasi identitas akun yang terdaftar pada database sistem.</p>
              </div>
            </div>

            <div className="divide-y divide-slate-100 text-xs sm:text-sm">
              <div className="py-2.5 flex justify-between items-center">
                <span className="text-slate-500 font-medium">Username</span>
                <span className="font-bold font-mono text-slate-800">@{userName}</span>
              </div>
              <div className="py-2.5 flex justify-between items-center">
                <span className="text-slate-500 font-medium">Hak Akses / Role</span>
                <span className="font-semibold text-emerald-600 capitalize">{role}</span>
              </div>
              <div className="py-2.5 flex justify-between items-center">
                <span className="text-slate-500 font-medium">Status Akun</span>
                <span className="px-2.5 py-0.5 text-[11px] font-bold rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {isStatusAktif ? 'Aktif' : 'Nonaktif'}
                </span>
              </div>
              {user?.created_at && (
                <div className="py-2.5 flex justify-between items-center">
                  <span className="text-slate-500 font-medium">Tanggal Registrasi</span>
                  <span className="font-semibold text-slate-700">
                    {dayjs(user.created_at).format('DD MMMM YYYY, HH:mm')}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Pelanggan Specific Details Card (if role is pelanggan) */}
          {role === 'pelanggan' && pelangganData && (
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs space-y-4">
              <div className="flex items-center space-x-3 border-b border-slate-100 pb-3">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
                  <IconifyIcon icon="lucide:home" className="text-base" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Data Langganan Pelanggan</h3>
                  <p className="text-[11px] text-slate-500">Rincian data pemasangan internet desa.</p>
                </div>
              </div>

              <div className="divide-y divide-slate-100 text-xs sm:text-sm">
                <div className="py-2.5 flex justify-between items-center">
                  <span className="text-slate-500 font-medium">Nama Lengkap</span>
                  <span className="font-bold text-slate-800">{pelangganData.nama}</span>
                </div>
                <div className="py-2.5 flex justify-between items-center">
                  <span className="text-slate-500 font-medium">Kode Pelanggan</span>
                  <span className="font-mono font-bold text-emerald-600">{pelangganData.kode_pelanggan}</span>
                </div>
                <div className="py-2.5 flex justify-between items-center">
                  <span className="text-slate-500 font-medium">Nomor WhatsApp</span>
                  <span className="font-semibold text-slate-800">{pelangganData.no_hp}</span>
                </div>
                <div className="py-2.5 flex justify-between items-start">
                  <span className="text-slate-500 font-medium shrink-0">Alamat Pemasangan</span>
                  <span className="font-medium text-slate-800 text-right max-w-xs">{pelangganData.alamat}</span>
                </div>
                {pelangganData.paket && (
                  <>
                    <div className="py-2.5 flex justify-between items-center">
                      <span className="text-slate-500 font-medium">Paket Langganan</span>
                      <span className="font-bold text-blue-600">
                        {pelangganData.paket.nama_paket} ({pelangganData.paket.mbps} Mbps)
                      </span>
                    </div>
                    <div className="py-2.5 flex justify-between items-center">
                      <span className="text-slate-500 font-medium">Biaya Iuran Bulanan</span>
                      <span className="font-bold text-emerald-600">
                        Rp {Number(pelangganData.paket.harga).toLocaleString('id-ID')} / bulan
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Privacy & Storage Info Callout */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs text-slate-600 flex items-start gap-3">
            <IconifyIcon icon="lucide:shield-check" className="text-emerald-600 text-xl shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-slate-800 mb-0.5">Penyimpanan & Keamanan Foto</p>
              <p className="leading-relaxed">
                Foto profil Anda disimpan secara aman pada server BUMDes dan digunakan sebagai tanda pengenal resmi pada portal BTS Sodong Net.
              </p>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: GANTI PASSWORD (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex items-center space-x-3 border-b border-slate-100 pb-3">
              <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100">
                <IconifyIcon icon="lucide:key-round" className="text-base" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Ubah Kata Sandi</h3>
                <p className="text-[11px] text-slate-500">Perbarui kata sandi untuk menjaga keamanan akun.</p>
              </div>
            </div>

            <form onSubmit={handleChangePasswordSubmit} className="space-y-4 text-xs sm:text-sm">
              {/* Password Lama */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Kata Sandi Saat Ini</label>
                <div className="relative">
                  <input
                    type={showOldPass ? 'text' : 'password'}
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    placeholder="Masukkan kata sandi lama"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-xs transition-all pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowOldPass(!showOldPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    <IconifyIcon icon={showOldPass ? 'lucide:eye-off' : 'lucide:eye'} className="text-sm" />
                  </button>
                </div>
              </div>

              {/* Password Baru */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Kata Sandi Baru</label>
                <div className="relative">
                  <input
                    type={showNewPass ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Minimal 6 karakter"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-xs transition-all pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPass(!showNewPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    <IconifyIcon icon={showNewPass ? 'lucide:eye-off' : 'lucide:eye'} className="text-sm" />
                  </button>
                </div>
              </div>

              {/* Konfirmasi Password Baru */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Ulangi Kata Sandi Baru</label>
                <div className="relative">
                  <input
                    type={showConfirmPass ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Ketik ulang kata sandi baru"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-xs transition-all pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPass(!showConfirmPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    <IconifyIcon icon={showConfirmPass ? 'lucide:eye-off' : 'lucide:eye'} className="text-sm" />
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isChangingPassword}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 active:bg-slate-950 text-white font-semibold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs disabled:opacity-50"
              >
                {isChangingPassword ? (
                  <>
                    <IconifyIcon icon="lucide:loader-2" className="animate-spin text-sm" />
                    <span>Menyimpan Password...</span>
                  </>
                ) : (
                  <>
                    <IconifyIcon icon="lucide:check" className="text-sm text-emerald-400" />
                    <span>Simpan Perubahan Password</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Password Security Tips Card */}
          <div className="bg-slate-50 rounded-2xl border border-slate-200/80 p-4 text-xs text-slate-600 space-y-2">
            <p className="font-bold text-slate-800 flex items-center gap-1.5">
              <IconifyIcon icon="lucide:info" className="text-amber-500 text-sm" />
              <span>Panduan Kata Sandi Kuat</span>
            </p>
            <ul className="space-y-1.5 text-slate-500 pl-4 list-disc text-[11.5px]">
              <li>Gunakan minimal 6 karakter kombinasi huruf dan angka.</li>
              <li>Jangan bagikan kata sandi Anda kepada orang lain.</li>
              <li>Ganti kata sandi secara berkala untuk menjaga keamanan.</li>
            </ul>
          </div>

        </div>

      </div>

      {/* ─── INTERACTIVE PHOTO CROPPER & PREVIEW MODAL ─────────────── */}
      {showPreviewModal && previewUrl && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[9999] overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            {/* Full Screen Backdrop */}
            <div 
              className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity"
              onClick={!isUploading ? handleCancelPreview : undefined}
            />

            {/* Modal Box */}
            <div className="relative w-full max-w-md transform rounded-3xl bg-white shadow-2xl transition-all flex flex-col border border-slate-200/80 animate-in zoom-in-95 duration-200">
              
              {/* Header */}
              <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-slate-200/80">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600">
                    <IconifyIcon icon="lucide:crop" className="text-xl text-emerald-600" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-900">Atur & Geser Foto Profil</h2>
                    <p className="text-[11px] text-slate-500">Sesuaikan posisi & zoom foto avatar Anda.</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleCancelPreview}
                  disabled={isUploading}
                  className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition-colors cursor-pointer"
                >
                  <IconifyIcon icon="lucide:x" className="text-base" />
                </button>
              </div>

              {/* Body: Circular Interactive Crop Area */}
              <div className="px-6 py-5 text-center space-y-4">
                
                {/* Viewport Box */}
                <div
                  className="relative mx-auto w-[220px] h-[220px] rounded-full overflow-hidden border-4 border-emerald-500 shadow-xl bg-slate-950 cursor-grab active:cursor-grabbing select-none"
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseUp}
                  onTouchStart={handleTouchStart}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={handleTouchEnd}
                  onWheel={handleWheelZoom}
                >
                  {/* Image to be repositioned */}
                  <img
                    ref={imageRef}
                    src={previewUrl}
                    alt="Atur Foto"
                    draggable={false}
                    style={{
                      transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})`,
                      transformOrigin: 'center center',
                      transition: isDragging ? 'none' : 'transform 0.08s ease-out',
                    }}
                    className="w-full h-full object-contain pointer-events-none select-none"
                  />

                  {/* Circular Overlay Ring Guide */}
                  <div className="absolute inset-0 rounded-full border border-white/30 pointer-events-none"></div>

                  {/* Drag indicator badge */}
                  <div className="absolute bottom-2 right-1/2 translate-x-1/2 px-2.5 py-0.5 bg-slate-900/80 text-[10px] text-emerald-400 rounded-full border border-emerald-500/30 pointer-events-none flex items-center gap-1 font-semibold">
                    <IconifyIcon icon="lucide:move" className="text-xs" />
                    <span>Geser Foto</span>
                  </div>
                </div>

                {/* Helper hint */}
                <p className="text-[11.5px] text-slate-500 max-w-xs mx-auto">
                  Klik dan <b>geser foto</b> di dalam lingkaran untuk menentukan area yang ingin ditampilkan.
                </p>

                {/* Zoom & Reset Controls */}
                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80 space-y-2 text-xs">
                  <div className="flex items-center justify-between text-slate-600 font-semibold px-1">
                    <span className="flex items-center gap-1">
                      <IconifyIcon icon="lucide:zoom-in" className="text-slate-500 text-sm" />
                      <span>Zoom ({Math.round(zoom * 100)}%)</span>
                    </span>
                    <button
                      type="button"
                      onClick={handleResetPosition}
                      className="text-emerald-600 hover:text-emerald-700 font-bold hover:underline flex items-center gap-1 text-[11px] cursor-pointer"
                    >
                      <IconifyIcon icon="lucide:rotate-ccw" className="text-xs" />
                      <span>Reset Posisi</span>
                    </button>
                  </div>

                  {/* Range Slider */}
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setZoom((prev) => Math.max(Number((prev - 0.1).toFixed(2)), 0.2))}
                      className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-100 font-bold text-sm shadow-2xs cursor-pointer"
                      title="Perkecil"
                    >
                      -
                    </button>
                    <input
                      type="range"
                      min={0.2}
                      max={3}
                      step={0.05}
                      value={zoom}
                      onChange={(e) => setZoom(parseFloat(e.target.value))}
                      className="flex-1 accent-emerald-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                    />
                    <button
                      type="button"
                      onClick={() => setZoom((prev) => Math.min(Number((prev + 0.1).toFixed(2)), 3))}
                      className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-100 font-bold text-sm shadow-2xs cursor-pointer"
                      title="Perbesar"
                    >
                      +
                    </button>
                  </div>
                </div>

              </div>

              {/* Footer */}
              <div className="flex items-center justify-end gap-2.5 px-6 pt-3 pb-5 border-t border-slate-200/80">
                <button
                  type="button"
                  onClick={handleCancelPreview}
                  disabled={isUploading}
                  className="rounded-xl bg-slate-100 hover:bg-slate-200 px-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-600 transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleUploadPhoto}
                  disabled={isUploading}
                  className="rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 px-5 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-sm shadow-emerald-600/20 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  {isUploading ? (
                    <>
                      <IconifyIcon icon="lucide:loader-2" className="animate-spin text-sm" />
                      <span>Memotong & Mengunggah...</span>
                    </>
                  ) : (
                    <>
                      <IconifyIcon icon="lucide:check" className="text-sm" />
                      <span>Simpan & Terapkan Foto</span>
                    </>
                  )}
                </button>
              </div>

            </div>
          </div>
        </div>,
        document.body
      )}

    </div>
  );
}
