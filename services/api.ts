export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';
export const API_HOST_URL = API_BASE_URL.replace(/\/api\/?$/, '');

/**
 * Helper to construct full URL for static assets/images from backend
 * Falls back to /assets/profile.jpg if empty or null
 */
export const getApiAssetUrl = (path?: string | null): string => {
  if (!path || path.trim() === '') {
    return '/assets/profile.jpg';
  }
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_HOST_URL}${cleanPath}`;
};

interface FetchOptions extends Omit<RequestInit, 'body'> {
  body?: any;
  withAuth?: boolean;
}

export const apiFetch = async (endpoint: string, options: FetchOptions = {}) => {
  const { method = 'GET', body, headers, withAuth = false, ...restOptions } = options;

  const isFormData = typeof FormData !== 'undefined' && body instanceof FormData;
  const defaultHeaders: Record<string, string> = {
    ...(headers as Record<string, string>),
  };

  if (!isFormData) {
    defaultHeaders['Content-Type'] = 'application/json';
  }

  if (withAuth) {
    const token = typeof window !== 'undefined' ? (localStorage.getItem('bumdes_token') || localStorage.getItem('token')) : null;
    if (token) {
      defaultHeaders['Authorization'] = `Bearer ${token}`;
    }
  }

  const config: RequestInit = {
    method,
    headers: defaultHeaders,
    ...restOptions,
  };

  if (body !== undefined && body !== null) {
    config.body = isFormData ? body : JSON.stringify(body);
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    const data = await response.json().catch(() => ({}));
    
    return {
      ok: response.ok,
      status: response.status,
      data
    };
  } catch (error) {
    throw error;
  }
};
