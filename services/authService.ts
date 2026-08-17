import { apiFetch } from './api';

export const authService = {
  login: async (credentials: any) => {
    return await apiFetch('/auth/login', {
      method: 'POST',
      body: credentials,
    });
  },

  getProfile: async () => {
    return await apiFetch('/auth/profile', {
      method: 'GET',
      withAuth: true,
    });
  },

  changePassword: async (payload: {
    old_password: string;
    new_password: string;
    confirm_password: string;
  }) => {
    return await apiFetch('/auth/change-password', {
      method: 'PUT',
      body: payload,
      withAuth: true,
    });
  },

  uploadPhoto: async (formData: FormData) => {
    return await apiFetch('/auth/profile/photo', {
      method: 'POST',
      body: formData,
      withAuth: true,
    });
  },
};
