import { apiFetch } from './api';

export const pelangganService = {
  getAll: async () => {
    return await apiFetch('/pelanggan', { withAuth: true });
  },
  getMe: async () => {
    return await apiFetch('/pelanggan/me', { withAuth: true });
  },
  getById: async (id: number | string) => {
    return await apiFetch(`/pelanggan/${id}`, { withAuth: true });
  },
  create: async (payload: {
    username: string;
    nama: string;
    no_hp: string;
    alamat: string;
    paket_id: number;
    status: string;
  }) => {
    return await apiFetch('/pelanggan', {
      method: 'POST',
      body: payload,
      withAuth: true,
    });
  },
  delete: async (id: number | string) => {
    return await apiFetch(`/pelanggan/${id}`, {
      method: 'DELETE',
      withAuth: true,
    });
  },
  update: async (id: number | string, payload: Record<string, any>) => {
    return await apiFetch(`/pelanggan/${id}`, {
      method: 'PUT',
      body: payload,
      withAuth: true,
    });
  },
};
