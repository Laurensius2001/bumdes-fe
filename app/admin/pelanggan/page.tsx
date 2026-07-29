'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import DataTable, { Column } from '@/components/DataTable';
import FormModal from '@/components/FormModal';
import ConfirmModal from '@/components/ConfirmModal';
import IconifyIcon from '@/components/common/IconifyIcon';
import { toast } from '@/components/Toast';
import { pelangganService } from '@/services/pelangganService';
import { paketService } from '@/services/paketService';

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
    isActive: boolean;
    isPasswordChanged: boolean;
  };
};

// ─── Type for DataTable ────────────────────────────────────
type Pelanggan = {
  db_id: number;
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
  const [data, setData] = useState<Pelanggan[]>([]);
  const [paketList, setPaketList] = useState<{ id: number; nama_paket: string }[]>([]);
  const [paketOptions, setPaketOptions] = useState<{ label: string; value: number }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteData, setDeleteData] = useState<{ id: number; nama: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Edit State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editData, setEditData] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  
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
        
        const options = currentPaketList.map((p: any) => {
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
        { label: 'Aktif', value: 'Aktif' },
        { label: 'Non Aktif', value: 'Non Aktif' },
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
      status: (row.status === 'nonaktif' || (row.status as string) === 'Non Aktif') ? 'Non Aktif' : 'Aktif',
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

  // ─── Delete Handler ──────────────────────────────────────
  const openDeleteConfirm = (db_id: number, nama: string) => {
    setDeleteData({ id: db_id, nama });
  };

  const executeDelete = async () => {
    if (!deleteData) return;
    setIsDeleting(true);
    try {
      const res = await pelangganService.delete(deleteData.id);
      if (res.ok) {
        toast.success(`Data pelanggan ${deleteData.nama} berhasil dihapus.`, 'Dihapus');
        await fetchData(); // Refresh data
        setDeleteData(null); // Close modal
      } else {
        toast.error(res.data?.message || 'Gagal menghapus pelanggan', 'Gagal');
      }
    } catch (err) {
      console.error('Error saat menghapus pelanggan:', err);
      toast.error('Terjadi kesalahan saat menghapus data.', 'Error');
    } finally {
      setIsDeleting(false);
    }
  };

  // ─── Table Columns ───────────────────────────────────────
  const columns: Column<Pelanggan>[] = [
    {
      key: 'name',
      label: 'ID / Nama Pelanggan',
      render: (row) => (
        <div>
          <div className="font-bold text-gray-800 text-[14px]">{row.name}</div>
          <div className="text-[11px] font-medium text-gray-400 mt-0.5">{row.id}</div>
        </div>
      ),
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
        switch (row.status) {
          case 'aktif':
            return <span className="rounded-full bg-green-100 px-3 py-1 text-[11px] font-bold text-green-600">Aktif</span>;
          case 'isolir':
            return <span className="rounded-full bg-yellow-100 px-3 py-1 text-[11px] font-bold text-yellow-600">Isolir</span>;
          case 'nonaktif':
            return <span className="rounded-full bg-red-100 px-3 py-1 text-[11px] font-bold text-red-500">Non-Aktif</span>;
          default:
            return <span className="rounded-full bg-gray-100 px-3 py-1 text-[11px] font-bold text-gray-500">{row.status}</span>;
        }
      },
    },
    {
      key: 'id',
      label: 'Action',
      render: (row) => (
        <div className="flex items-center justify-end gap-2">
          <button 
            onClick={() => openEditModal(row)}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-50 text-orange-500 transition-colors hover:bg-orange-100"
          >
            <IconifyIcon icon="lucide:edit" className="text-sm" />
          </button>
          <button 
            onClick={() => openDeleteConfirm(row.db_id, row.name)}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-50 text-red-500 transition-colors hover:bg-red-100"
          >
            <IconifyIcon icon="lucide:trash-2" className="text-sm" />
          </button>
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
        className="inline-flex items-center justify-between gap-3 rounded-lg border border-gray-200 bg-white px-4 h-[38px] min-w-[150px] text-[13px] font-medium text-gray-700 outline-none hover:bg-gray-50 focus:border-[#6b42ff] transition-colors"
      >
        <span className="leading-none mt-[2px]">{paketFilter}</span>
        <IconifyIcon icon="lucide:chevron-down" className={`text-gray-400 text-sm transition-transform ${paketDropdownOpen ? 'rotate-180' : ''}`} />
      </button>
      
      {paketDropdownOpen && (
        <div className="absolute left-0 top-full mt-2 w-full rounded-xl border border-gray-100 bg-white p-1 shadow-lg z-20">
          {['Semua Paket', 'PPPOE', 'VOUCHER'].map(opt => (
            <button
              key={opt}
              onClick={() => { setPaketFilter(opt); setPaketDropdownOpen(false); }}
              className={`w-full text-left px-3 py-2 text-[13px] font-medium rounded-lg transition-colors ${paketFilter === opt ? 'bg-[#6b42ff]/10 text-[#6b42ff]' : 'text-gray-700 hover:bg-gray-50'}`}
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
        searchPlaceholder="Search nama / ID pelanggan..."
        statusOptions={['aktif', 'isolir', 'nonaktif']}
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

      <ConfirmModal
        isOpen={!!deleteData}
        onClose={() => !isDeleting && setDeleteData(null)}
        onConfirm={executeDelete}
        title="Hapus Pelanggan"
        message={
          <>
            Apakah Anda yakin ingin menghapus pelanggan <span className="font-bold text-gray-900">{deleteData?.nama}</span>?<br/>
            Tindakan ini tidak dapat dibatalkan dan akan menghapus akun user yang terkait.
          </>
        }
        confirmText="Ya, Hapus Data"
        cancelText="Batal"
        type="danger"
        isLoading={isDeleting}
      />
    </div>
  );
}
