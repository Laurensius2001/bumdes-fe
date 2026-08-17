'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import DataTable, { Column } from '@/components/DataTable';
import FormModal, { FormField } from '@/components/FormModal';
import IconifyIcon from '@/components/common/IconifyIcon';
import { toast } from '@/components/Toast';
import { Tooltip } from '@mui/material';
import { paketService } from '@/services/paketService';

// ─── Type from API ─────────────────────────────────────────
type PaketAPI = {
  id: number;
  jenis_paket: 'PPPOE' | 'VOUCHER';
  nama_paket: string;
  kode_voucher: string | null;
  jumlah_perangkat: number | null;
  harga: number;
  mbps: number;
  status: string;
  created_at: string;
  updated_at: string;
};

// ─── Type for DataTable ────────────────────────────────────
type PaketRow = {
  db_id: number;
  id: string; // generated code
  name: string;
  jenis: 'PPPOE' | 'VOUCHER';
  kode_voucher: string;
  perangkat: string;
  harga: string;
  mbps: string;
  status: string;
  api_data: PaketAPI;
};

// ─── Format Rupiah ─────────────────────────────────────────
const formatRupiah = (num: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num);

// ─── Map API → DataTable row ──────────────────────────────
const mapApiToRow = (p: PaketAPI): PaketRow => ({
  db_id: p.id,
  id: p.kode_voucher || `PKT-${String(p.id).padStart(3, '0')}`,
  name: p.nama_paket,
  jenis: p.jenis_paket,
  kode_voucher: p.kode_voucher || '-',
  perangkat: p.jumlah_perangkat ? `${p.jumlah_perangkat} Perangkat` : '-',
  harga: formatRupiah(Number(p.harga)),
  mbps: `${p.mbps} Mbps`,
  status: p.status,
  api_data: p,
});

export default function AdminPaketPage() {
  const [data, setData] = useState<PaketRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedJenis, setSelectedJenis] = useState<'PPPOE' | 'VOUCHER'>('PPPOE');

  // Edit State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editData, setEditData] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);

  // ─── Fetch Data ──────────────────────────────────────────
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await paketService.getAll();
      if (res.ok && res.data?.data) {
        setData((res.data.data as PaketAPI[]).map(mapApiToRow));
      }
    } catch (err) {
      console.error('Gagal mengambil data paket:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ─── Dynamic Form Fields ────────────────────────────────
  const formFields: FormField[] = useMemo(() => {
    const baseFields: FormField[] = [
      {
        name: 'jenis_paket',
        label: 'Jenis Paket',
        type: 'select' as const,
        placeholder: 'Pilih Jenis Paket',
        options: [
          { label: 'PPPOE', value: 'PPPOE' },
          { label: 'VOUCHER RUMAHAN', value: 'VOUCHER' },
        ],
        required: true,
      },
      {
        name: 'nama_paket',
        label: 'Nama Paket',
        type: 'text' as const,
        placeholder: selectedJenis === 'VOUCHER' ? 'Contoh: Voucher 1 Hari' : 'Contoh: Paket Rumahan 10 Mbps',
        required: true,
      },
    ];

    if (selectedJenis === 'VOUCHER') {
      baseFields.push(
        {
          name: 'kode_voucher',
          label: 'Kode Voucher',
          type: 'text' as const,
          placeholder: 'Contoh: VCH-HARI-001',
          required: true,
          validate: (val: string) => /\s/.test(val) ? 'Kode voucher tidak boleh mengandung spasi' : null,
        },
        {
          name: 'jumlah_perangkat',
          label: 'Jumlah Perangkat',
          type: 'number' as const,
          placeholder: 'Contoh: 2',
          required: true,
        },
      );
    }

    baseFields.push(
      {
        name: 'harga',
        label: 'Harga',
        type: 'money' as const,
        placeholder: selectedJenis === 'VOUCHER' ? '10.000' : '150.000',
        required: true,
      },
      {
        name: 'mbps',
        label: 'Kecepatan (Mbps)',
        type: 'number' as const,
        placeholder: 'Contoh: 10',
        required: true,
      }
    );

    return baseFields;
  }, [selectedJenis]);

  // ─── Submit Handler ──────────────────────────────────────
  const handleAddPaket = async (formData: Record<string, any>) => {
    setIsSubmitting(true);
    try {
      const payload: Record<string, any> = {
        jenis_paket: formData.jenis_paket,
        nama_paket: formData.nama_paket,
        harga: Number(formData.harga),
        mbps: Number(formData.mbps),
        status: 'Aktif',
      };

      if (formData.jenis_paket === 'VOUCHER') {
        payload.kode_voucher = formData.kode_voucher;
        payload.jumlah_perangkat = Number(formData.jumlah_perangkat);
      }

      const res = await paketService.create(payload);

      if (res.ok) {
        toast.success('Paket internet baru berhasil ditambahkan!', 'Berhasil');
        setIsModalOpen(false);
        setSelectedJenis('PPPOE'); // Reset jenis
        await fetchData();
      } else {
        toast.error(res.data?.message || 'Gagal menambahkan paket', 'Oops!');
      }
    } catch (err) {
      console.error('Error saat menambah paket:', err);
      toast.error('Terjadi kesalahan pada server. Silakan coba lagi.', 'Error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ─── Edit Handler ───────────────────────────────────────
  const editFormFields: FormField[] = useMemo(() => [
    ...formFields,
    {
      name: 'status',
      label: 'Status',
      type: 'select' as const,
      placeholder: 'Pilih Status',
      options: [
        { label: 'Aktif', value: 'Aktif' },
        { label: 'Nonaktif', value: 'Nonaktif' },
      ],
      required: true,
    }
  ], [formFields]);

  const openEditModal = (row: PaketRow) => {
    setSelectedJenis(row.jenis); // Update selectedJenis so formFields regenerates appropriately
    setEditData({
      id: row.db_id,
      jenis_paket: row.jenis,
      nama_paket: row.name,
      kode_voucher: row.kode_voucher !== '-' ? row.kode_voucher : '',
      jumlah_perangkat: row.api_data.jumlah_perangkat || '',
      harga: row.api_data.harga.toString(),
      mbps: row.api_data.mbps.toString(),
      status: (row.status.toLowerCase() === 'nonaktif' || row.status.toLowerCase() === 'non aktif') ? 'Nonaktif' : 'Aktif',
    });
    setIsEditModalOpen(true);
  };

  const handleEditPaket = async (formData: Record<string, any>) => {
    if (!editData) return;
    setIsEditing(true);
    try {
      const payload: Record<string, any> = {
        jenis_paket: formData.jenis_paket,
        nama_paket: formData.nama_paket,
        harga: Number(formData.harga),
        mbps: Number(formData.mbps),
        status: formData.status,
      };

      if (formData.jenis_paket === 'VOUCHER') {
        payload.kode_voucher = formData.kode_voucher;
        payload.jumlah_perangkat = Number(formData.jumlah_perangkat);
      }

      const res = await paketService.update(editData.id, payload);

      if (res.ok) {
        toast.success('Data paket berhasil diupdate!', 'Berhasil');
        setIsEditModalOpen(false);
        await fetchData();
      } else {
        toast.error(res.data?.message || 'Gagal mengupdate paket', 'Oops!');
      }
    } catch (err) {
      console.error('Error saat mengupdate paket:', err);
      toast.error('Terjadi kesalahan pada server. Silakan coba lagi.', 'Error');
    } finally {
      setIsEditing(false);
    }
  };

  // ─── Table Columns ───────────────────────────────────────
  const columns: Column<PaketRow>[] = [
    {
      key: 'name',
      label: 'Nama Paket',
      render: (row) => (
        <div>
          <div className="font-semibold text-slate-900 text-xs sm:text-sm">{row.name}</div>
          <div className="text-[11px] font-medium text-slate-400 mt-0.5">{row.id}</div>
        </div>
      ),
    },
    {
      key: 'jenis',
      label: 'Jenis',
      render: (row) =>
        row.jenis === 'PPPOE' ? (
          <span className="rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-200/80 px-2.5 py-0.5 text-[11px] font-semibold">PPPOE</span>
        ) : (
          <span className="rounded-lg bg-teal-50 text-teal-600 border border-teal-200/80 px-2.5 py-0.5 text-[11px] font-semibold">VOUCHER</span>
        ),
    },
    {
      key: 'perangkat',
      label: 'Perangkat',
      render: (row) => <span className="text-slate-500 font-medium text-xs sm:text-sm">{row.perangkat}</span>,
    },
    {
      key: 'harga',
      label: 'Harga',
      render: (row) => <span className="font-semibold text-emerald-600 text-xs sm:text-sm">{row.harga}</span>,
    },
    {
      key: 'mbps',
      label: 'Kecepatan',
      render: (row) => (
        <div className="flex items-center gap-1.5 text-slate-700 font-medium text-xs sm:text-sm">
          <IconifyIcon icon="lucide:gauge" className="text-slate-400 text-xs" />
          <span>{row.mbps}</span>
        </div>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (row) => {
        const s = row.status?.toLowerCase();
        if (s === 'aktif') {
          return (
            <span className="px-2.5 py-1 text-[11px] font-semibold rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 inline-flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Aktif
            </span>
          );
        }
        return (
          <span className="px-2.5 py-1 text-[11px] font-semibold rounded-full bg-rose-50 text-rose-600 border border-rose-200 inline-flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span> Nonaktif
          </span>
        );
      },
    },
    {
      key: 'id',
      label: 'Aksi',
      render: (row) => (
        <div className="flex items-center justify-center">
          <Tooltip title="Edit Paket" placement="top">
            <button
              onClick={() => openEditModal(row)}
              className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200/80 hover:bg-emerald-600 hover:text-white hover:border-emerald-600 transition-all duration-200 shadow-xs flex items-center justify-center group"
            >
              <IconifyIcon icon="lucide:square-pen" className="text-sm transition-transform group-hover:scale-110" />
            </button>
          </Tooltip>
        </div>
      ),
    },
  ];

  return (
    <div className="w-full">
      <DataTable
        title="Data Paket Internet"
        subtitle="Kelola paket internet PPPOE dan Voucher BTS Sodong Net"
        icon="lucide:wifi"
        columns={columns}
        data={data}
        isLoading={isLoading}
        searchKey="name"
        searchKeys={['name', 'id']}
        searchPlaceholder="Cari nama / kode paket . . ."
        statusOptions={['Aktif', 'Nonaktif']}
        onAdd={() => setIsModalOpen(true)}
        onExport={() => console.log('Export clicked')}
      />

      <FormModal
        isOpen={isModalOpen}
        onClose={() => !isSubmitting && setIsModalOpen(false)}
        title="Tambah Paket Baru"
        icon="lucide:package-plus"
        fields={formFields}
        onSubmit={handleAddPaket}
        columns={1}
        submitText={isSubmitting ? 'Menyimpan...' : 'Simpan Data'}
        onFieldChange={(name, value) => {
          if (name === 'jenis_paket') {
            setSelectedJenis(value as 'PPPOE' | 'VOUCHER');
          }
        }}
      />

      <FormModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditData(null);
        }}
        title="Edit Data Paket"
        fields={editFormFields}
        onSubmit={handleEditPaket}
        initialData={editData}
        submitText={isEditing ? 'Menyimpan...' : 'Simpan'}
        onFieldChange={(name, value) => {
          if (name === 'jenis_paket') {
            setSelectedJenis(value as 'PPPOE' | 'VOUCHER');
          }
        }}
      />
    </div>
  );
}
