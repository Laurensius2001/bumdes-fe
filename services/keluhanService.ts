import { apiFetch } from './api';

export const keluhanService = {
  getAll: async () => {
    return await apiFetch('/keluhan', { withAuth: true });
  },
};
