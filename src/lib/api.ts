const API_URL = '/api';

export function getAuthToken(): string | null {
  return localStorage.getItem('sendratasik_auth_token');
}

export function setAuthToken(token: string) {
  localStorage.setItem('sendratasik_auth_token', token);
}

export function removeAuthToken() {
  localStorage.removeItem('sendratasik_auth_token');
}

export async function apiRequest<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {})
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers
  });

  const contentType = response.headers.get('content-type');
  let data: any = null;

  if (contentType && contentType.includes('application/json')) {
    data = await response.json();
  } else {
    data = await response.text();
  }

  if (!response.ok) {
    const errorMsg = data?.error || data?.message || `HTTP Error ${response.status}`;
    throw new Error(errorMsg);
  }

  return data;
}
