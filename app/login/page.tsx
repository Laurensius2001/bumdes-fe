'use client';

import { Suspense, useState, useTransition, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from '@/components/Toast';
import { authService } from '@/services/authService';
import IconifyIcon from '@/components/common/IconifyIcon';
import { useAuth } from '@/context/AuthContext';

const LoginPage = () => {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, login } = useAuth();
  const [isPending, startTransition] = useTransition();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);

  useEffect(() => {
    if (!isLoading && isAuthenticated && user) {
      if (user.role === 'pelanggan') {
        router.push('/pelanggan/dashboard');
      } else if (user.role === 'admin') {
        router.push('/admin/dashboard');
      }
    }
  }, [isLoading, isAuthenticated, user, router]);

  const handleClickShowPassword = () => setShowPassword(!showPassword);

  const handleAutoFillDemo = () => {
    setEmail('admin@sodong.desa.id');
    setPassword('adminbts2026');
    toast.info('Akun demo terisi!', 'Auto Fill');
  };

  const handleForgotPassword = () => {
    toast.info('Silakan hubungi Kepala BUMDes untuk reset password', 'Lupa Password');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast.warning('Silakan masukkan username dan password terlebih dahulu.', 'Form Kosong');
      return;
    }

    try {
      const response = await authService.login({ username: email, password });
      const { ok, data } = response;

      if (ok && data?.success && data?.data?.token && data?.data?.user) {
        toast.success('Login berhasil! Mengarahkan ke dashboard...', 'Selamat Datang');

        startTransition(() => {
          login({
            token: data.data.token,
            user: data.data.user,
          });
        });
      } else {
        toast.error(data?.message || 'Username atau password salah.', 'Login Gagal');
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Terjadi kesalahan pada server. Silakan coba lagi nanti.', 'Error');
    }
  };

  return (
    <div className="h-full min-h-screen bg-slate-950 text-slate-100 antialiased flex flex-col justify-between relative overflow-x-hidden selection:bg-emerald-500 selection:text-white font-sans">

      {/* Background Grid Pattern & Glow Effects */}
      <div
        className="fixed inset-0 pointer-events-none z-0 opacity-40"
        style={{
          backgroundImage: 'radial-gradient(rgba(16, 185, 129, 0.15) 1px, transparent 1px)',
          backgroundSize: '28px 28px'
        }}
      />
      <div className="fixed top-0 -left-20 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none z-0"></div>
      <div className="fixed bottom-0 right-0 w-96 h-96 bg-teal-600/10 rounded-full blur-3xl pointer-events-none z-0"></div>

      {/* MAIN CONTAINER */}
      <div className="relative z-10 flex-1 flex flex-col lg:flex-row min-h-screen">

        {/* LEFT BRANDING & HERO SECTION WITH WIFI GRAPHICS */}
        <div className="lg:w-7/12 p-8 lg:p-16 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-slate-800/80 bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950/80 backdrop-blur-md relative overflow-hidden">

          {/* BACKGROUND WIFI GRAPHIC / NETWORK VECTOR ILLUSTRATION */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 opacity-20">
            {/* Glowing Wi-Fi Waves Overlay */}
            <svg className="absolute -right-16 top-1/2 -translate-y-1/2 w-[550px] h-[550px] text-emerald-500/40" viewBox="0 0 500 500" fill="none">
              <circle cx="250" cy="250" r="230" stroke="currentColor" strokeWidth="2" strokeDasharray="8 8" className="animate-spin-slow" />
              <circle cx="250" cy="250" r="180" stroke="currentColor" strokeWidth="1.5" />
              <circle cx="250" cy="250" r="130" stroke="currentColor" strokeWidth="2" strokeDasharray="4 4" />
              <circle cx="250" cy="250" r="80" stroke="currentColor" strokeWidth="2" />
              <circle cx="250" cy="250" r="30" fill="currentColor" />
              <path d="M 110 250 A 140 140 0 0 1 390 250" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
              <path d="M 60 250 A 190 190 0 0 1 440 250" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
              <path d="M 10 250 A 240 240 0 0 1 490 250" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />
            </svg>
            {/* Network Mesh Nodes */}
            <svg className="absolute left-10 bottom-10 w-80 h-80 text-teal-400/30" viewBox="0 0 200 200" fill="none">
              <path d="M20 180 L80 120 L150 150 L180 60 L100 40 L20 180 Z" stroke="currentColor" strokeWidth="1.5" />
              <circle cx="20" cy="180" r="5" fill="currentColor" />
              <circle cx="80" cy="120" r="6" fill="currentColor" />
              <circle cx="150" cy="150" r="5" fill="currentColor" />
              <circle cx="180" cy="60" r="7" fill="currentColor" />
              <circle cx="100" cy="40" r="5" fill="currentColor" />
            </svg>
          </div>

          {/* Logo Header */}
          <div className="flex items-center space-x-3.5 relative z-10">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white font-bold shadow-lg shadow-emerald-900/40 border border-emerald-400/20">
              <IconifyIcon icon="lucide:wifi" className="text-lg" />
            </div>
            <div>
              <h1 className="text-base font-bold text-white tracking-wide leading-tight">BTS SODONG NET</h1>
              <span className="text-[10px] text-emerald-400 font-semibold tracking-wider uppercase bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/30">
                BUMDES TIRTA SEJAHTERA
              </span>
            </div>
          </div>

          {/* Hero Text & Value Proposition */}
          <div className="my-12 lg:my-0 max-w-2xl space-y-6 relative z-10">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold tracking-wide backdrop-blur-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>Sistem Akses Terpadu Digital Desa v2.0</span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-[1.15]">
              Kelola Konektivitas <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-200">
                Desa Sodong
              </span>{' '}
              Lebih Cerdas.
            </h2>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-xl">
              Portal manajemen resmi unit usaha internet <strong className="text-white font-semibold">BUMDes Tirta Sejahtera</strong>. Memudahkan monitoring tagihan pelanggan, manajemen alokasi paket wifi, hingga pencetakan struk transaksi secara otomatis.
            </p>

            {/* Feature Badges */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
              <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800/80 flex items-start space-x-3.5 shadow-sm hover:border-emerald-500/30 transition-colors backdrop-blur-sm">
                <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
                  <IconifyIcon icon="lucide:zap" className="text-base" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">1 Gbps Feed</h4>
                  <p className="text-xs text-slate-400 mt-0.5">Monitoring OLT real-time 24/7</p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800/80 flex items-start space-x-3.5 shadow-sm hover:border-emerald-500/30 transition-colors backdrop-blur-sm">
                <div className="p-2.5 rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/20 shrink-0">
                  <IconifyIcon icon="lucide:printer" className="text-base" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">POS Thermal</h4>
                  <p className="text-xs text-slate-400 mt-0.5">Cetak Struk Pembayaran Instan</p>
                </div>
              </div>
            </div>
          </div>

          {/* Left Footer Note */}
          <div className="text-xs text-slate-400 flex items-center justify-between pt-6 border-t border-slate-800/80 relative z-10">
            <p>&copy; 2026 BUMDes Tirta Sejahtera &bull; Desa Sodong.</p>
            <div className="flex items-center space-x-2 text-emerald-400 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Server Stable</span>
            </div>
          </div>

        </div>

        {/* RIGHT LOGIN FORM CARD SECTION */}
        <div className="lg:w-5/12 p-6 sm:p-12 lg:p-16 flex items-center justify-center bg-slate-950/80 backdrop-blur-xl">
          <div className="w-full max-w-md space-y-6">

            {/* Card Container */}
            <div className="bg-slate-900/90 p-7 sm:p-8 rounded-3xl border border-slate-800/90 shadow-2xl space-y-6 relative overflow-hidden">

              {/* Header Form */}
              <div>
                <span className="px-2.5 py-1 text-[11px] font-semibold tracking-wider uppercase rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Portal Login Administrator
                </span>
                <h3 className="text-2xl font-bold text-white tracking-tight mt-3">Selamat Datang Kembali</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Masukkan kredensial akun Anda untuk mengelola dashboard BTS Sodong Net.
                </p>
              </div>

              {/* Form Inputs */}
              <form onSubmit={handleLogin} className="space-y-4">

                {/* Username / Email Field */}
                <div>
                  <label htmlFor="email" className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Username atau Email Operator
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                      <IconifyIcon icon="lucide:user" className="text-sm" />
                    </span>
                    <input
                      id="email"
                      type="text"
                      required
                      placeholder="Masukkan username atau email Anda"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={isPending}
                      className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-slate-950/80 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label htmlFor="password" className="block text-xs font-semibold text-slate-300">
                      Kata Sandi / Password
                    </label>
                    <button
                      type="button"
                      onClick={handleForgotPassword}
                      className="text-xs text-emerald-400 hover:text-emerald-300 font-medium transition-colors"
                    >
                      Lupa Password?
                    </button>
                  </div>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                      <IconifyIcon icon="lucide:lock" className="text-sm" />
                    </span>
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="Masukkan kata sandi Anda"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={isPending}
                      className="w-full pl-10 pr-10 py-2.5 text-xs sm:text-sm bg-slate-950/80 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                    />
                    <button
                      type="button"
                      onClick={handleClickShowPassword}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-300 transition-colors"
                      disabled={isPending}
                    >
                      <IconifyIcon icon={showPassword ? "lucide:eye-off" : "lucide:eye"} className="text-sm" />
                    </button>
                  </div>
                </div>



                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isPending}
                  className="w-full py-3 px-4 text-xs sm:text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 rounded-xl transition-all shadow-lg shadow-emerald-600/20 flex items-center justify-center space-x-2 disabled:opacity-70"
                >
                  {isPending ? (
                    <>
                      <span>Memverifikasi Kredensial...</span>
                      <IconifyIcon icon="lucide:loader-2" className="animate-spin text-xs" />
                    </>
                  ) : (
                    <>
                      <span>Masuk Ke Panel System</span>
                      <IconifyIcon icon="lucide:arrow-right" className="text-xs" />
                    </>
                  )}
                </button>

              </form>

            </div>

            {/* Footer Quick Info */}
            <div className="text-center text-xs text-slate-500">
              <p>BTS SODONG NET &bull; Membangun Internet Desa Berdaya</p>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
};

export default LoginPage;
