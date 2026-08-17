'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import DataTable, { Column } from '@/components/DataTable';
import IconifyIcon from '@/components/common/IconifyIcon';
import { toast } from '@/components/Toast';
import { Tooltip } from '@mui/material';
import { keluhanService } from '@/services/keluhanService';
import { getApiAssetUrl } from '@/services/api';
import dayjs from 'dayjs';
import DetailKeluhan from './detail';

interface Keluhan {
  id: number;
  kode_keluhan: string;
  pelanggan_id: number;
  kategori: string;
  judul: string;
  deskripsi: string;
  status: string;
  catatan_admin: string | null;
  created_at: string;
  updated_at: string;
  pelanggan: {
    id: number;
    kode_pelanggan: string;
    nama: string;
    no_hp: string;
    alamat: string;
    user?: {
      foto_profil?: string | null;
      username?: string;
    };
    foto_profil?: string | null;
    paket: {
      id: number;
      nama_paket: string;
      mbps: number;
      harga: string;
      jenis_paket: string;
      kode_voucher?: string;
      jumlah_perangkat?: number;
    };
  };
}

export default function AdminKeluhanPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedId = searchParams.get('id');

  const [data, setData] = useState<Keluhan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedKeluhan, setSelectedKeluhan] = useState<Keluhan | null>(null);

  const fetchKeluhan = async () => {
    setIsLoading(true);
    try {
      const response = await keluhanService.getAll();
      if (response.ok && response.data?.success) {
        setData(response.data.data);
      } else {
        toast.error('Gagal mengambil data keluhan');
      }
    } catch (error) {
      console.error('Error fetching keluhan:', error);
      toast.error('Terjadi kesalahan pada server');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch data on mount
  useEffect(() => {
    fetchKeluhan();
  }, []);

  // When data is loaded & URL has ?id=, find and show that keluhan
  useEffect(() => {
    if (selectedId && data.length > 0) {
      const found = data.find((k) => String(k.id) === selectedId);
      if (found) {
        setSelectedKeluhan(found);
      }
    } else if (!selectedId) {
      setSelectedKeluhan(null);
    }
  }, [selectedId, data]);

  const openDetail = (keluhan: Keluhan) => {
    router.push(`/admin/keluhan?id=${keluhan.id}`);
  };

  const goBack = () => {
    router.push('/admin/keluhan');
  };

  const getStatusBadge = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'SELESAI':
        return (
          <span className="px-2.5 py-1 text-[11px] font-semibold rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 inline-flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> SELESAI
          </span>
        );
      case 'PROSES':
      case 'DIPROSES':
        return (
          <span className="px-2.5 py-1 text-[11px] font-semibold rounded-full bg-sky-50 text-sky-600 border border-sky-200 inline-flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-pulse"></span> DIPROSES
          </span>
        );
      case 'DITOLAK':
        return (
          <span className="px-2.5 py-1 text-[11px] font-semibold rounded-full bg-rose-50 text-rose-600 border border-rose-200 inline-flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span> DITOLAK
          </span>
        );
      case 'MENUNGGU':
      case 'BARU':
      default:
        return (
          <span className="px-2.5 py-1 text-[11px] font-semibold rounded-full bg-amber-50 text-amber-600 border border-amber-200 inline-flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span> MENUNGGU
          </span>
        );
    }
  };

  const columns: Column<Keluhan>[] = [
    {
      key: 'kode_keluhan',
      label: 'Kode Keluhan',
      render: (row) => (
        <button
          onClick={() => openDetail(row)}
          className="font-bold text-emerald-600 hover:text-emerald-700 hover:underline transition-all text-xs sm:text-sm text-left cursor-pointer"
        >
          {row.kode_keluhan}
        </button>
      )
    },
    {
      key: 'pelanggan' as any,
      label: 'Nama Pelanggan',
      render: (row) => {
        const avatarUrl = getApiAssetUrl(row.pelanggan?.user?.foto_profil || (row.pelanggan as any)?.foto_profil);
        return (
          <div className="flex items-center gap-2.5">
            <div className="relative w-8 h-8 shrink-0 rounded-full overflow-hidden border border-slate-200 bg-slate-100 flex items-center justify-center shadow-2xs">
              <img
                src={avatarUrl}
                alt={row.pelanggan?.nama || 'Pelanggan'}
                onError={(e: any) => {
                  e.currentTarget.src = '/assets/profile.jpg';
                }}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex flex-col min-w-0">
              <div className="font-semibold text-slate-900 text-xs sm:text-sm truncate">{row.pelanggan?.nama || '-'}</div>
              <div className="text-[11px] text-slate-400 font-medium mt-0.5">{row.pelanggan?.no_hp || '-'}</div>
            </div>
          </div>
        );
      }
    },
    {
      key: 'paket' as any,
      label: 'Paket',
      render: (row) => {
        const p = row.pelanggan?.paket;
        if (!p) return <span className="text-slate-500 font-medium">-</span>;
        return <span className="text-slate-500 font-medium">{p.nama_paket} ({p.mbps} Mbps)</span>;
      }
    },
    {
      key: 'kategori',
      label: 'Kategori Gangguan',
      render: (row) => (
        <span className="text-slate-700 font-medium">{row.kategori}</span>
      )
    },
    {
      key: 'judul',
      label: 'Judul / Detail Ringkas',
      render: (row) => (
        <span className="text-slate-600 max-w-xs truncate block" title={row.judul}>
          {row.judul}
        </span>
      )
    },
    {
      key: 'created_at',
      label: 'Tanggal Lapor',
      render: (row) => (
        <span className="text-slate-500 text-xs">{dayjs(row.created_at).format('DD MMM YYYY')}</span>
      )
    },
    {
      key: 'status',
      label: 'Status',
      render: (row) => getStatusBadge(row.status)
    },
    {
      key: 'id' as any,
      label: 'Aksi',
      render: (row) => (
        <div className="flex items-center justify-center">
          <Tooltip title="Lihat Detail" placement="top">
            <button
              onClick={() => openDetail(row)}
              className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200/80 hover:bg-emerald-600 hover:text-white hover:border-emerald-600 transition-all duration-200 shadow-xs flex items-center justify-center group"
            >
              <IconifyIcon icon="lucide:eye" className="text-sm transition-transform group-hover:scale-110" />
            </button>
          </Tooltip>
        </div>
      )
    }
  ];

  if (selectedKeluhan) {
    return (
      <DetailKeluhan
        keluhan={selectedKeluhan}
        onBack={goBack}
        onUpdateSuccess={() => {
          fetchKeluhan();
        }}
      />
    );
  }

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-300">
      <DataTable
        title="Daftar Keluhan Pelanggan"
        subtitle="Kelola dan selesaikan laporan gangguan jaringan pelanggan BTS Sodong Net."
        icon="lucide:message-square-text"
        columns={columns}
        data={data}
        searchKey="judul"
        searchKeys={['judul', 'kode_keluhan', 'kategori']}
        searchPlaceholder="Cari nama, ID, atau judul keluhan..."
        statusOptions={['MENUNGGU', 'DIPROSES', 'SELESAI', 'DITOLAK']}
        isLoading={isLoading}
        addButtonText="Buat Laporan Baru"
      />
    </div>
  );
}
