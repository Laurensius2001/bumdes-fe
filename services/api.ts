const BASE_URL = 'http://localhost:3000/api';

interface FetchOptions extends Omit<RequestInit, 'body'> {
  body?: any;
  withAuth?: boolean;
}

export const apiFetch = async (endpoint: string, options: FetchOptions = {}) => {
  const { method = 'GET', body, headers, withAuth = false, ...restOptions } = options;

  const defaultHeaders: HeadersInit = {
    'Content-Type': 'application/json',
    ...headers,
  };

  if (withAuth) {
    const token = typeof window !== 'undefined' ? localStorage.getItem('bumdes_token') : null;
    if (token) {
      (defaultHeaders as Record<string, string>)['Authorization'] = `Bearer ${token}`;
    }
  }

  const config: RequestInit = {
    method,
    headers: defaultHeaders,
    ...restOptions,
  };

  if (body) {
    config.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, config);
    const data = await response.json();
    
    return {
      ok: response.ok,
      status: response.status,
      data
    };
  } catch (error) {
    throw error;
  }
};
