'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import DataTable, { Column } from '@/components/DataTable';
import FormModal from '@/components/FormModal';
import IconifyIcon from '@/components/common/IconifyIcon';
import { toast } from '@/components/Toast';
import { Tooltip } from '@mui/material';
import { pelangganService } from '@/services/pelangganService';
import { paketService } from '@/services/paketService';
import { getApiAssetUrl } from '@/services/api';

// ─── Type from API ─────────────────────────────────────────
type PelangganAPI = {
  id: number;
  user_id: number;
  kode_pelanggan: string;
  nama: string;
  no_hp: string;
  alamat: string;
  paket_id: number;
  status: string;
  created_at: string;
  updated_at: string;
  user: {
    username: string;
    role: string;
    foto_profil?: string | null;
    isActive: boolean;
    isPasswordChanged: boolean;
  };
};

// ─── Type for DataTable ────────────────────────────────────
type Pelanggan = {
  db_id: number;
  foto_profil?: string | null;
  id: string; // kode_pelanggan
  name: string;
  paket: string;
  alamat: string;
  telepon: string;
  status: 'aktif' | 'isolir' | 'nonaktif';
  paketDetail: any; // Store raw paket details
  api_data: PelangganAPI;
};

// ─── Map API data → DataTable row ─────────────────────────
const mapApiToRow = (p: PelangganAPI, paketList: { id: number; nama_paket: string }[]): Pelanggan => {
  const paketInfo = paketList.find(pkt => pkt.id === p.paket_id);

  return {
    db_id: p.id,
    foto_profil: p.user?.foto_profil,
    id: p.kode_pelanggan,
    name: p.nama,
    paket: paketInfo ? paketInfo.nama_paket : `Paket ${p.paket_id}`,
    alamat: p.alamat,
    telepon: p.no_hp,
    status: p.status as Pelanggan['status'],
    paketDetail: paketInfo,
    api_data: p,
  };
};

export default function AdminPelangganPage() {
  const router = useRouter();
  const [data, setData] = useState<Pelanggan[]>([]);
  const [paketList, setPaketList] = useState<{ id: number; nama_paket: string }[]>([]);
  const [paketOptions, setPaketOptions] = useState<{ label: string; value: number }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Edit State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editData, setEditData] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);

  // Avatar Preview Modal State
  const [previewAvatar, setPreviewAvatar] = useState<{ url: string; name: string } | null>(null);

  // Custom filter state
  const [paketFilter, setPaketFilter] = useState('Semua Paket');
  const [paketDropdownOpen, setPaketDropdownOpen] = useState(false);

  // ─── Fetch Data ──────────────────────────────────────────
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [resPelanggan, resPaket] = await Promise.all([
        pelangganService.getAll(),
        paketService.getAll()
      ]);

      let currentPaketList: { id: number; nama_paket: string }[] = [];

      if (resPaket.ok && resPaket.data?.data) {
        currentPaketList = resPaket.data.data;
        setPaketList(currentPaketList);

        // Filter paket yang berstatus 'Aktif' saja
        const activePaketList = currentPaketList.filter((p: any) => {
          const statusUpper = String(p.status || '').toUpperCase();
          return statusUpper === 'AKTIF';
        });

        const options = activePaketList.map((p: any) => {
          let labelText = `${p.nama_paket} (${p.jenis_paket})`;
          if (p.jenis_paket === 'VOUCHER' && p.jumlah_perangkat) {
            labelText += ` - ${p.jumlah_perangkat} Perangkat`;
          }
          labelText += ` - Rp ${Number(p.harga).toLocaleString('id-ID')}`;

          return {
            label: labelText,
            value: p.id
          };
        });
        setPaketOptions(options);
      }

      if (resPelanggan.ok && resPelanggan.data?.data) {
        setData((resPelanggan.data.data as PelangganAPI[]).map(p => mapApiToRow(p, currentPaketList)));
      }
    } catch (err) {
      console.error('Gagal mengambil data:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ─── Form Fields ─────────────────────────────────────────
  const formFields = [
    {
      name: 'username',
      label: 'Username',
      type: 'text' as const,
      placeholder: 'Contoh: ahmad.subagja',
      required: true,
      validate: (val: string) => /\s/.test(val) ? 'Username tidak boleh mengandung spasi' : null,
    },
    {
      name: 'nama',
      label: 'Nama Lengkap',
      type: 'text' as const,
      placeholder: 'Contoh: Ahmad Subagja',
      required: true,
    },
    {
      name: 'no_hp',
      label: 'No WhatsApp',
      type: 'text' as const,
      placeholder: '081234567890',
      required: true,
    },
    {
      name: 'alamat',
      label: 'Alamat / RT RW',
      type: 'text' as const,
      placeholder: 'Contoh: RT 02 / RW 01 Desa Sodong',
      required: true,
    },
    {
      name: 'paket_id',
      label: 'Paket Internet',
      type: 'select' as const,
      placeholder: 'Pilih Paket',
      options: paketOptions,
      required: true,
    },
  ];

  // ─── Submit Handler ──────────────────────────────────────
  const handleAddPelanggan = async (formData: Record<string, any>) => {
    setIsSubmitting(true);
    try {
      const payload = {
        username: formData.username,
        nama: formData.nama,
        no_hp: formData.no_hp,
        alamat: formData.alamat,
        paket_id: Number(formData.paket_id),
        status: 'aktif',
      };

      const res = await pelangganService.create(payload);

      if (res.ok) {
        toast.success('Pelanggan baru berhasil ditambahkan!', 'Berhasil');
        setIsModalOpen(false);
        await fetchData(); // Refresh table data
      } else {
        toast.error(res.data?.message || 'Gagal menambahkan pelanggan', 'Oops!');
      }
    } catch (err) {
      console.error('Error saat menambah pelanggan:', err);
      toast.error('Terjadi kesalahan pada server. Silakan coba lagi.', 'Error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ─── Edit Handler ───────────────────────────────────────
  const editFormFields = [
    ...formFields,
    {
      name: 'status',
      label: 'Status',
      type: 'select' as const,
      placeholder: 'Pilih Status',
      options: [
        { label: 'Aktif', value: 'aktif' },
        { label: 'Nonaktif', value: 'nonaktif' },
      ],
      required: true,
    }
  ];

  const openEditModal = (row: Pelanggan) => {
    setEditData({
      id: row.db_id,
      username: row.api_data?.user?.username || '',
      nama: row.name,
      no_hp: row.telepon,
      alamat: row.alamat,
      paket_id: row.api_data?.paket_id?.toString() || '',
      status: String(row.status || '').toLowerCase() === 'nonaktif' ? 'nonaktif' : 'aktif',
    });
    setIsEditModalOpen(true);
  };

  const handleEditPelanggan = async (formData: Record<string, any>) => {
    if (!editData) return;
    setIsEditing(true);
    try {
      const payload = {
        username: formData.username,
        nama: formData.nama,
        no_hp: formData.no_hp,
        alamat: formData.alamat,
        paket_id: Number(formData.paket_id),
        status: formData.status,
      };

      const res = await pelangganService.update(editData.id, payload);

      if (res.ok) {
        toast.success('Data pelanggan berhasil diupdate!', 'Berhasil');
        setIsEditModalOpen(false);
        await fetchData(); // Refresh table data
      } else {
        toast.error(res.data?.message || 'Gagal mengupdate pelanggan', 'Oops!');
      }
    } catch (err) {
      console.error('Error saat mengupdate pelanggan:', err);
      toast.error('Terjadi kesalahan pada server. Silakan coba lagi.', 'Error');
    } finally {
      setIsEditing(false);
    }
  };

  // ─── Table Columns ───────────────────────────────────────
  const columns: Column<Pelanggan>[] = [
    {
      key: 'name',
      label: 'ID / Nama Pelanggan',
      render: (row) => {
        const avatarUrl = getApiAssetUrl(row.foto_profil);
        return (
          <div className="flex items-center gap-3">
            <Tooltip title="Klik untuk lihat foto" placement="top" arrow>
              <button
                type="button"
                onClick={() => setPreviewAvatar({ url: avatarUrl, name: row.name })}
                className="relative w-9 h-9 shrink-0 rounded-full overflow-hidden border border-slate-200 hover:border-emerald-500 hover:scale-110 shadow-2xs bg-slate-100 flex items-center justify-center cursor-pointer transition-all group"
              >
                <img
                  src={avatarUrl}
                  alt={row.name}
                  onError={(e: any) => {
                    e.currentTarget.src = '/assets/profile.jpg';
                  }}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                  <IconifyIcon icon="lucide:zoom-in" className="text-white text-[10px]" />
                </div>
              </button>
            </Tooltip>
            <div className="flex flex-col min-w-0">
              <div className="font-bold text-gray-800 text-[12.5px] leading-tight truncate">{row.name}</div>
              <div className="text-[10.5px] font-mono font-medium text-gray-400 mt-0.5">{row.id}</div>
            </div>
          </div>
        );
      },
    },
    {
      key: 'paket',
      label: 'Paket Internet',
      render: (row) => {
        const isPPPOE = row.paketDetail?.jenis_paket === 'PPPOE';
        return (
          <span className={`rounded-full px-3 py-1 text-[11px] font-bold ${isPPPOE ? 'bg-indigo-100 text-indigo-600' : 'bg-teal-100 text-teal-600'}`}>
            {row.paket}
          </span>
        );
      },
    },
    {
      key: 'alamat',
      label: 'Alamat / Wilayah',
      render: (row) => <span className="text-gray-600">{row.alamat}</span>,
    },
    {
      key: 'telepon',
      label: 'No Telepon',
      render: (row) => <span className="text-gray-600">{row.telepon}</span>,
    },
    {
      key: 'status',
      label: 'Status',
      render: (row) => {
        switch (row.status?.toLowerCase()) {
          case 'aktif':
            return (
              <span className="px-2.5 py-1 text-[11px] font-semibold rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 inline-flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Aktif
              </span>
            );
          case 'isolir':
            return (
              <span className="px-2.5 py-1 text-[11px] font-semibold rounded-full bg-amber-50 text-amber-600 border border-amber-200 inline-flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span> Isolir
              </span>
            );
          case 'nonaktif':
            return (
              <span className="px-2.5 py-1 text-[11px] font-semibold rounded-full bg-rose-50 text-rose-600 border border-rose-200 inline-flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span> Nonaktif
              </span>
            );
          default:
            return (
              <span className="px-2.5 py-1 text-[11px] font-semibold rounded-full bg-slate-100 text-slate-600 border border-slate-200 inline-flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span> {row.status}
              </span>
            );
        }
      },
    },
    {
      key: 'id',
      label: 'Aksi',
      render: (row) => (
        <div className="flex items-center justify-center gap-1.5">
          <Tooltip title="Cetak Struk" placement="top">
            <button
              onClick={() => router.push(`/admin/struk?pelangganId=${row.db_id}`)}
              className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 border border-blue-200/80 hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all duration-200 shadow-xs flex items-center justify-center group"
            >
              <IconifyIcon icon="lucide:printer" className="text-sm transition-transform group-hover:scale-110" />
            </button>
          </Tooltip>
          <Tooltip title="Edit Pelanggan" placement="top">
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

  const renderExpandedRow = (row: Pelanggan) => {
    if (!row.paketDetail) {
      return (
        <div className="p-4 text-sm text-gray-500 text-center italic">
          Detail paket tidak tersedia
        </div>
      );
    }
    const pkt = row.paketDetail;
    return (
      <div className="p-6 bg-indigo-50/30 border-b border-gray-100">
        <div className="flex items-center gap-2 mb-4">
          <IconifyIcon icon="lucide:router" className="text-indigo-500" />
          <h4 className="text-[13px] font-bold text-gray-800 uppercase tracking-wide">Detail Layanan Internet</h4>
        </div>

        <div className="flex flex-wrap gap-3">
          <div className="flex-1 min-w-[140px] bg-white p-3 rounded-xl border border-gray-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] transition-all hover:border-indigo-200 hover:shadow-md">
            <div className="text-[11px] text-gray-400 font-medium mb-1 uppercase tracking-wider">Jenis Paket</div>
            <div className="text-[13px] font-bold text-gray-800 flex items-center gap-1.5">
              <IconifyIcon icon={pkt.jenis_paket === 'PPPOE' ? 'lucide:globe-2' : 'lucide:ticket'} className={pkt.jenis_paket === 'PPPOE' ? 'text-indigo-500' : 'text-teal-500'} />
              {pkt.jenis_paket}
            </div>
          </div>

          <div className="flex-1 min-w-[140px] bg-white p-3 rounded-xl border border-gray-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] transition-all hover:border-indigo-200 hover:shadow-md">
            <div className="text-[11px] text-gray-400 font-medium mb-1 uppercase tracking-wider">Kecepatan</div>
            <div className="text-[13px] font-bold text-indigo-600 flex items-center gap-1.5">
              <IconifyIcon icon="lucide:gauge" className="text-indigo-400" />
              {pkt.mbps} Mbps
            </div>
          </div>

          <div className="flex-1 min-w-[140px] bg-white p-3 rounded-xl border border-gray-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] transition-all hover:border-indigo-200 hover:shadow-md">
            <div className="text-[11px] text-gray-400 font-medium mb-1 uppercase tracking-wider">Harga Bulanan</div>
            <div className="text-[13px] font-bold text-emerald-600 flex items-center gap-1.5">
              <IconifyIcon icon="lucide:wallet" className="text-emerald-500" />
              Rp {Number(pkt.harga).toLocaleString('id-ID')}
            </div>
          </div>

          <div className="flex-1 min-w-[140px] bg-white p-3 rounded-xl border border-gray-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] transition-all hover:border-indigo-200 hover:shadow-md">
            <div className="text-[11px] text-gray-400 font-medium mb-1 uppercase tracking-wider">Status Paket</div>
            <div className="text-[13px] font-bold flex items-center gap-1.5">
              {pkt.status === 'Aktif' ? (
                <><IconifyIcon icon="lucide:check-circle-2" className="text-green-500" /><span className="text-green-600">Aktif</span></>
              ) : (
                <><IconifyIcon icon="lucide:x-circle" className="text-red-400" /><span className="text-red-500">Nonaktif</span></>
              )}
            </div>
          </div>

          {pkt.jenis_paket === 'VOUCHER' && (
            <>
              <div className="flex-1 min-w-[140px] bg-white p-3 rounded-xl border border-gray-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] transition-all hover:border-indigo-200 hover:shadow-md">
                <div className="text-[11px] text-gray-400 font-medium mb-1 uppercase tracking-wider">Kode Voucher</div>
                <div className="text-[13px] font-bold text-gray-800 flex items-center gap-1.5">
                  <IconifyIcon icon="lucide:hash" className="text-gray-400" />
                  <span className="bg-gray-100 px-2 py-0.5 rounded text-[#6b42ff]">{pkt.kode_voucher}</span>
                </div>
              </div>

              <div className="flex-1 min-w-[140px] bg-white p-3 rounded-xl border border-gray-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] transition-all hover:border-indigo-200 hover:shadow-md">
                <div className="text-[11px] text-gray-400 font-medium mb-1 uppercase tracking-wider">Max Perangkat</div>
                <div className="text-[13px] font-bold text-gray-800 flex items-center gap-1.5">
                  <IconifyIcon icon="lucide:monitor-smartphone" className="text-gray-400" />
                  {pkt.jumlah_perangkat} Perangkat
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    );
  };

  // Filter data before passing to DataTable based on Paket
  const filteredData = useMemo(() => {
    if (paketFilter === 'Semua Paket') return data;
    return data.filter((row) => row.paketDetail?.jenis_paket === paketFilter);
  }, [data, paketFilter]);

  const paketFilterNode = (
    <div
      className="relative"
      tabIndex={0}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) {
          setPaketDropdownOpen(false);
        }
      }}
    >
      <button
        onClick={() => setPaketDropdownOpen(!paketDropdownOpen)}
        className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100 transition-colors shadow-xs flex items-center justify-between space-x-2.5 min-w-[145px]"
      >
        <span className="flex items-center gap-1.5">
          <IconifyIcon icon="lucide:box" className="text-xs text-slate-500" />
          <span>{paketFilter === 'VOUCHER' ? 'VOUCHER RUMAHAN' : paketFilter}</span>
        </span>
        <IconifyIcon icon="lucide:chevron-down" className={`text-slate-400 text-xs transition-transform ${paketDropdownOpen ? 'rotate-180' : ''}`} />
      </button>

      {paketDropdownOpen && (
        <div className="absolute left-0 top-full mt-1.5 w-full rounded-xl border border-slate-200 bg-white p-1.5 shadow-lg z-20 space-y-1">
          {['Semua Paket', 'PPPOE', 'VOUCHER'].map(opt => (
            <button
              key={opt}
              onClick={() => { setPaketFilter(opt); setPaketDropdownOpen(false); }}
              className={`w-full text-left px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${paketFilter === opt ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : 'text-slate-700 hover:bg-slate-50'}`}
            >
              {opt === 'VOUCHER' ? 'VOUCHER RUMAHAN' : opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="w-full">
      <DataTable
        title="Data Pelanggan"
        subtitle="Kelola data pelanggan BUMDes"
        icon="lucide:users"
        columns={columns}
        data={filteredData}
        isLoading={isLoading}
        searchKey="name"
        searchKeys={['name', 'id']}
        searchPlaceholder="Cari nama / ID pelanggan . . ."
        statusOptions={['Aktif', 'Nonaktif']}
        onAdd={() => setIsModalOpen(true)}
        onExport={() => console.log('Export clicked')}
        renderExpandedRow={renderExpandedRow}
        customToolbarNode={paketFilterNode}
      />

      <FormModal
        isOpen={isModalOpen}
        onClose={() => !isSubmitting && setIsModalOpen(false)}
        title="Tambah Pelanggan Baru"
        icon="lucide:user-plus"
        fields={formFields}
        onSubmit={handleAddPelanggan}
        columns={1}
        submitText={isSubmitting ? 'Menyimpan...' : 'Simpan Data'}
      />

      <FormModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditData(null);
        }}
        title="Edit Data Pelanggan"
        fields={editFormFields}
        onSubmit={handleEditPelanggan}
        initialData={editData}
        submitText={isEditing ? 'Menyimpan...' : 'Simpan'}
      />

      {/* ─── AVATAR PREVIEW MODAL ───────────────────────────────────── */}
      {previewAvatar && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[9999] overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            {/* Backdrop */}
            <div 
              className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity"
              onClick={() => setPreviewAvatar(null)}
            />

            {/* Modal Box */}
            <div className="relative w-full max-w-sm transform rounded-3xl bg-white shadow-2xl transition-all flex flex-col border border-slate-200/80 animate-in zoom-in-95 duration-200">
              
              {/* Header */}
              <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-slate-200/80">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600">
                    <IconifyIcon icon="lucide:user" className="text-xl text-emerald-600" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-slate-900">{previewAvatar.name}</h2>
                    <p className="text-[11px] text-slate-500">Foto Profil Pelanggan</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setPreviewAvatar(null)}
                  className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition-colors cursor-pointer"
                >
                  <IconifyIcon icon="lucide:x" className="text-base" />
                </button>
              </div>

              {/* Body: High-Res Rounded Photo Display */}
              <div className="px-6 py-6 text-center space-y-4">
                <div className="relative mx-auto w-52 h-52 rounded-2xl overflow-hidden border-4 border-emerald-500 shadow-xl bg-slate-900 flex items-center justify-center">
                  <img
                    src={previewAvatar.url}
                    alt={previewAvatar.name}
                    onError={(e: any) => {
                      e.currentTarget.src = '/assets/profile.jpg';
                    }}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-end gap-2.5 px-6 pt-3 pb-5 border-t border-slate-200/80">
                <button
                  type="button"
                  onClick={() => setPreviewAvatar(null)}
                  className="w-full rounded-xl bg-slate-900 hover:bg-slate-800 active:bg-slate-950 text-white font-semibold text-xs py-2.5 transition-all cursor-pointer shadow-xs"
                >
                  Tutup Pratinjau
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
