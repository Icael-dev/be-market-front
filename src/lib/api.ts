const API_BASE_URL = import.meta.env.VITE_API_URL?.replace(/\/$/, '') ?? '';
const TOKEN_KEY = 'be_market_jwt_token';
const TOKEN_EXPIRY_KEY = 'be_market_token_expiry';

export function getAuthToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setAuthToken(token: string | null) {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(TOKEN_EXPIRY_KEY);
  }
}

export function setTokenExpiry(expiresAt: number | null) {
  if (expiresAt) {
    localStorage.setItem(TOKEN_EXPIRY_KEY, String(expiresAt));
  } else {
    localStorage.removeItem(TOKEN_EXPIRY_KEY);
  }
}

export function getTokenExpiry(): number | null {
  const expiry = localStorage.getItem(TOKEN_EXPIRY_KEY);
  return expiry ? Number(expiry) : null;
}

function buildHeaders(customHeaders?: HeadersInit, isFormData?: boolean): Headers {
  const headers = new Headers(customHeaders);
  if (!headers.has('Accept')) {
    headers.set('Accept', 'application/json');
  }
  if (!isFormData && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const token = getAuthToken();
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  return headers;
}

async function parseResponse<T>(response: Response): Promise<T> {
  const contentType = response.headers.get('content-type') ?? '';
  const isJson = contentType.includes('application/json');
  const body = isJson ? await response.json().catch(() => null) : null;

  if (!response.ok) {
    const error = body?.error || body?.errors || body?.message || response.statusText;
    throw { status: response.status, error, body };
  }

  return body as T;
}

let isRefreshing = false;
let refreshPromise: Promise<string | null> | null = null;

async function refreshToken(): Promise<string | null> {
  const token = getAuthToken();
  if (!token) return null;

  if (isRefreshing && refreshPromise) {
    return refreshPromise;
  }

  isRefreshing = true;
  refreshPromise = (async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
        method: 'POST',
        headers: buildHeaders({ 'Content-Type': 'application/json' }),
      });

      if (response.ok) {
        const data = await response.json();
        setAuthToken(data.token);
        setTokenExpiry(Date.now() + 3600000);
        return data.token;
      }
      return null;
    } catch {
      return null;
    } finally {
      isRefreshing = false;
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const url = path.startsWith('http') ? path : `${API_BASE_URL}${path}`;
  const bodyIsFormData = options.body instanceof FormData;
  const headers = buildHeaders(options.headers, bodyIsFormData);

  let response = await fetch(url, { ...options, headers });

  if (response.status === 401 && getAuthToken()) {
    const newToken = await refreshToken();
    if (newToken) {
      const retryHeaders = buildHeaders(options.headers, bodyIsFormData);
      response = await fetch(url, { ...options, headers: retryHeaders });
    } else {
      setAuthToken(null);
    }
  }

  return parseResponse<T>(response);
}

export const api = {
  get: <T>(path: string, options?: RequestInit) => request<T>(path, { method: 'GET', ...options }),
  post: <T>(path: string, body?: unknown, options?: RequestInit) =>
    request<T>(path, {
      method: 'POST',
      body: body !== undefined ? (body instanceof FormData ? body : JSON.stringify(body)) : undefined,
      ...options,
    }),
  put: <T>(path: string, body?: unknown, options?: RequestInit) =>
    request<T>(path, {
      method: 'PUT',
      body: body !== undefined ? (body instanceof FormData ? body : JSON.stringify(body)) : undefined,
      ...options,
    }),
  delete: <T>(path: string, options?: RequestInit) => request<T>(path, { method: 'DELETE', ...options }),
};
