import { apiFetch } from './api';

export interface WhatsAppStatusData {
  status: 'INITIALIZING' | 'QR_READY' | 'AUTHENTICATED' | 'DISCONNECTED';
  qr?: string | null;
  qr_image?: string | null;
  connected_phone?: string | null;
  pairing_code?: string | null;
  is_authenticated?: boolean;
  admin_phone?: string | null;
}

export const whatsappService = {
  /**
   * Mengambil status koneksi WhatsApp Gateway beserta data gambar QR Code
   */
  getStatus: async () => {
    return await apiFetch('/whatsapp/status', {
      method: 'GET',
    });
  },

  /**
   * Meminta kode pairing 8 karakter untuk login tanpa kamera
   */
  requestPairingCode: async (phone?: string) => {
    return await apiFetch('/whatsapp/pairing-code', {
      method: 'POST',
      body: phone ? { phone } : {},
      withAuth: true,
    });
  },

  /**
   * Memutuskan sesi WhatsApp aktif untuk ganti nomor
   */
  disconnect: async () => {
    return await apiFetch('/whatsapp/disconnect', {
      method: 'POST',
      withAuth: true,
    });
  },
};
