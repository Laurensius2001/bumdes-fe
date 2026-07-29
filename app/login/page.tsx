'use client';

import { Suspense, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from '@/components/Toast';
import { authService } from '@/services/authService';
import IconifyIcon from '@/components/common/IconifyIcon';

const LoginPage = () => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleClickShowPassword = () => setShowPassword(!showPassword);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast.warning('Silakan masukkan username dan password terlebih dahulu.', 'Form Kosong');
      return;
    }

    try {
      const response = await authService.login({ username: email, password });
      const { ok, data } = response;

      if (ok && data?.success) {
        localStorage.setItem('bumdes_logged_in', 'true');
        localStorage.setItem('bumdes_token', data.data.token);
        localStorage.setItem('bumdes_user', JSON.stringify(data.data.user));
        document.cookie = 'bumdes_logged_in=true; path=/; max-age=86400';

        toast.success('Login berhasil! Mengarahkan ke dashboard...', 'Selamat Datang');

        const role = data.data.user?.role;
        startTransition(() => {
          if (role === 'pelanggan') {
            router.push('/pelanggan/dashboard');
          } else {
            router.push('/admin/dashboard');
          }
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
    <div className="flex min-h-screen w-full flex-col md:flex-row bg-[#0e111a] font-sans text-white">
      {/* Left Section */}
      <div className="relative flex w-full flex-col justify-between p-8 md:w-1/2 lg:p-16 overflow-hidden bg-[#16122d]">
        {/* Background Grid Pattern */}
        <div 
          className="absolute inset-0 opacity-20 pointer-events-none"
          style={{
            backgroundImage: `linear-gradient(#2d2948 1px, transparent 1px), linear-gradient(90deg, #2d2948 1px, transparent 1px)`,
            backgroundSize: '30px 30px'
          }}
        ></div>
        {/* Background Gradients */}
        <div className="absolute -top-40 -left-40 h-[500px] w-[500px] rounded-full bg-[#46237a] opacity-30 blur-[100px] pointer-events-none"></div>
        <div className="absolute -bottom-40 -right-40 h-[500px] w-[500px] rounded-full bg-[#008f8f] opacity-20 blur-[100px] pointer-events-none"></div>

        <div className="relative z-10 flex flex-col items-start">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-[#6b42ff] to-[#8a42ff] shadow-[0_0_20px_rgba(107,66,255,0.4)]">
              <IconifyIcon icon="lucide:wifi" className="text-white text-xl" />
            </div>
            <div className="flex flex-col justify-center">
              <span className="text-[16px] font-bold leading-tight tracking-wide text-white">BTS SODONG NET</span>
              <span className="mt-[2px] rounded bg-[#0c5149] px-1.5 py-[1px] text-[9px] font-bold text-[#66dec8] w-fit tracking-wider">
                BUMDES TIRTA SEJAHTERA
              </span>
            </div>
          </div>

          {/* Main Content */}
          <div className="mt-20">
            <div className="mb-6 flex items-center gap-2 rounded-full border border-[#232e3a] bg-[#1a2332]/50 px-3 py-1.5 w-fit">
              <div className="h-2 w-2 rounded-full bg-[#00e5b0]"></div>
              <span className="text-xs font-medium text-[#a1a1aa]">Sistem Akses Terpadu Digital Desa v2.0</span>
            </div>

            <h1 className="text-4xl md:text-5xl font-extrabold leading-tight tracking-tight text-white lg:text-[52px]">
              Kelola Konektivitas<br />
              <span className="text-[#66dec8]">Desa Sodong Lebih</span><br />
              <span className="text-[#66dec8]">Cerdas.</span>
            </h1>

            <p className="mt-6 max-w-[420px] text-sm md:text-base text-gray-300 leading-relaxed">
              Portal manajemen resmi unit usaha internet <span className="font-semibold text-[#66dec8]">BUMDes Tirta Sejahtera.</span> Memudahkan monitoring tagihan pelanggan, manajemen alokasi paket wifi, hingga pencetakan struk transaksi secara otomatis.
            </p>

            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <div className="flex flex-col rounded-xl border border-[#2d3748]/60 bg-[#1a202c]/40 p-4 backdrop-blur-sm sm:w-[220px]">
                <div className="flex items-center gap-2 font-semibold text-[#00e5b0] mb-1.5">
                  <IconifyIcon icon="lucide:zap" className="text-[18px]" />
                  <span className="text-[15px]">1 Gbps Feed</span>
                </div>
                <span className="text-xs text-gray-400">Monitoring OLT real-time 24/7</span>
              </div>
              <div className="flex flex-col rounded-xl border border-[#2d3748]/60 bg-[#1a202c]/40 p-4 backdrop-blur-sm sm:w-[220px]">
                <div className="flex items-center gap-2 font-semibold text-[#9fa8da] mb-1.5">
                  <IconifyIcon icon="lucide:printer" className="text-[18px]" />
                  <span className="text-[15px]">POS Thermal</span>
                </div>
                <span className="text-xs text-gray-400">Cetak Struk Pembayaran Instan</span>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10 mt-12 text-[11px] text-gray-500">
          &copy; 2026 BUMDes Tirta Sejahtera &bull; Desa Sodong. All rights reserved.
        </div>
      </div>

      {/* Right Section */}
      <div className="flex w-full items-center justify-center p-8 md:w-1/2 bg-[#0e111a]">
        <div className="w-full max-w-[400px] rounded-2xl border border-[#232838] bg-[#171b29] p-8 shadow-2xl">
          <div className="mb-6 w-fit rounded-full bg-[#222842] px-3 py-1.5 text-xs font-semibold text-[#a5b4fc]">
            Portal Login Administrator
          </div>
          
          <h2 className="mb-2 text-2xl font-bold text-white tracking-tight">Selamat Datang Kembali</h2>
          <p className="mb-8 text-[13px] text-gray-400 leading-relaxed">
            Masukkan kredensial akun Anda untuk mengelola dashboard BTS Sodong Net.
          </p>

          <form onSubmit={handleLogin} className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <label htmlFor="email" className="text-[13px] font-medium text-gray-300">
                Username atau Email Operator
              </label>
              <div className="flex items-center rounded-[10px] border border-[#2d3348] bg-[#0e111a] px-3 py-2.5 transition-colors focus-within:border-[#6b42ff] hover:border-[#3d4560]">
                <IconifyIcon icon="lucide:user" className="text-gray-500 mr-2.5 text-[18px]" />
                <input
                  id="email"
                  type="text"
                  placeholder="admin@sodong.desa.id"
                  className="w-full bg-transparent text-[14px] text-white placeholder-gray-600 outline-none"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (error) setError('');
                  }}
                  disabled={isPending}
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="text-[13px] font-medium text-gray-300">
                  Kata Sandi / Password
                </label>
                <Link href="/forgot-password" className="text-[13px] font-medium text-[#00e5b0] hover:underline">
                  Lupa Password?
                </Link>
              </div>
              <div className="flex items-center rounded-[10px] border border-[#2d3348] bg-[#0e111a] px-3 py-2.5 transition-colors focus-within:border-[#6b42ff] hover:border-[#3d4560]">
                <IconifyIcon icon="lucide:lock" className="text-gray-500 mr-2.5 text-[18px]" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;"
                  className="w-full bg-transparent text-[14px] tracking-widest text-white placeholder-gray-600 outline-none"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error) setError('');
                  }}
                  disabled={isPending}
                />
                <button
                  type="button"
                  onClick={handleClickShowPassword}
                  className="ml-2 flex items-center justify-center text-gray-500 hover:text-gray-300 transition-colors"
                  disabled={isPending}
                >
                  <IconifyIcon icon={showPassword ? "lucide:eye-off" : "lucide:eye"} className="text-[18px]" />
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-[10px] bg-gradient-to-r from-[#6340ff] to-[#8b5cf6] py-3 text-[14px] font-semibold text-white transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-70 shadow-[0_4px_14px_rgba(99,64,255,0.4)]"
            >
              {isPending ? (
                <>
                  <IconifyIcon icon="lucide:loader-2" className="animate-spin text-[18px]" />
                  <span>Memproses...</span>
                </>
              ) : (
                <>
                  <span>Masuk Ke Panel System</span>
                  <IconifyIcon icon="lucide:arrow-right" className="text-[18px]" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

