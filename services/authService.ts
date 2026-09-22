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

  updateProfile: async (payload: { no_hp?: string; [key: string]: any }) => {
    return await apiFetch('/auth/profile', {
      method: 'PUT',
      body: payload,
      withAuth: true,
    });
  },

  getAdminContact: async () => {
    return await apiFetch('/auth/contact', {
      method: 'GET',
    });
  },

  verifyPhoneForReset: async (no_hp: string) => {
    return await apiFetch('/auth/forgot-password/verify-phone', {
      method: 'POST',
      body: { no_hp },
    });
  },

  resetPasswordWithPhone: async (payload: {
    reset_token?: string;
    phone?: string;
    new_password: string;
    confirm_password: string;
  }) => {
    return await apiFetch('/auth/forgot-password/reset', {
      method: 'POST',
      body: payload,
    });
  },
};

