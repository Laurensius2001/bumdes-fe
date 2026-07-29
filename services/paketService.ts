import { apiFetch } from './api';

export const paketService = {
  getAll: async () => {
    return await apiFetch('/paket-internet', { withAuth: true });
  },
  create: async (payload: Record<string, any>) => {
    return await apiFetch('/paket-internet', {
      method: 'POST',
      body: payload,
      withAuth: true,
    });
  },
  delete: async (id: number | string) => {
    return await apiFetch(`/paket-internet/${id}`, {
      method: 'DELETE',
      withAuth: true,
    });
  },
  update: async (id: number | string, payload: Record<string, any>) => {
    return await apiFetch(`/paket-internet/${id}`, {
      method: 'PUT',
      body: payload,
      withAuth: true,
    });
  },
};
