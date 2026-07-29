import { apiFetch } from './api';

export const userService = {
  getAll: async () => {
    return await apiFetch('/users', { withAuth: true });
  },
};
