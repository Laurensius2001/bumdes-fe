import { apiFetch } from './api';

export const tagihanService = {
  getAll: async () => {
    return await apiFetch('/tagihan', { withAuth: true });
  },
};
