import { apiFetch } from './api';

export const keluhanService = {
  getAll: async () => {
    return await apiFetch('/keluhan', { withAuth: true });
  },
  create: async (data: { pelanggan_id: number; kategori: string; judul: string; deskripsi: string; }) => {
    return await apiFetch('/keluhan', {
      method: 'POST',
      body: data,
      withAuth: true,
    });
  },
  update: async (id: number, data: { status: string; catatan_admin: string }) => {
    return await apiFetch(`/keluhan/${id}`, {
      method: 'PUT',
      body: data,
      withAuth: true,
    });
  },
};
