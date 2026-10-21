const API_BASE = import.meta.env.VITE_API_URL || '';
export function getToken(): string | null { return localStorage.getItem('sep_token'); }
export function setToken(token: string | null) { if (token) localStorage.setItem('sep_token', token); else localStorage.removeItem('sep_token'); }
export async function api<T = any>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers || {});
  const token = getToken();
  if (token) headers.set('Authorization', `Bearer ${token}`);
  if (options.body && !(options.body instanceof FormData) && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json');
  const response = await fetch(`${API_BASE}${path}`, { ...options, headers });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || data.message || `Request failed (${response.status})`);
  return data as T;
}
