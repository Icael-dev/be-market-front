export const API_BASE_URL = import.meta.env.VITE_API_URL?.replace(/\/$/, "") ?? "";

async function fetchCsrfToken(): Promise<void> {
  await fetch(`${API_BASE_URL}/sanctum/csrf-cookie`, {
    method: "GET",
    credentials: "include",
  });
}

let csrfToken: string | null = null;

function getCsrfToken(): string | null {
  if (csrfToken) return csrfToken;
  const match = document.cookie.match(/(?:^|;\s*)XSRF-TOKEN=([^;]+)/);
  if (match) {
    csrfToken = decodeURIComponent(match[1]);
  }
  return csrfToken;
}

export async function initializeCsrf(): Promise<void> {
  await fetchCsrfToken();
  csrfToken = getCsrfToken();
}

function buildHeaders(customHeaders?: HeadersInit, isFormData?: boolean): Headers {
  const headers = new Headers(customHeaders);
  if (!headers.has("Accept")) {
    headers.set("Accept", "application/json");
  }
  if (!isFormData && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  const token = getCsrfToken();
  if (token && !headers.has("X-XSRF-TOKEN")) {
    headers.set("X-XSRF-TOKEN", token);
  }

  return headers;
}

async function parseResponse<T>(response: Response): Promise<T> {
  const contentType = response.headers.get("content-type") ?? "";
  const isJson = contentType.includes("application/json");
  const body = isJson ? await response.json().catch(() => null) : null;

  if (!response.ok) {
    const error = body?.error || body?.errors || body?.message || response.statusText;
    throw { status: response.status, error, body };
  }

  return body as T;
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const url = path.startsWith("http") ? path : `${API_BASE_URL}${path}`;
  const bodyIsFormData = options.body instanceof FormData;
  const headers = buildHeaders(options.headers, bodyIsFormData);

  const response = await fetch(url, {
    ...options,
    headers,
    credentials: "include",
  });

  return parseResponse<T>(response);
}

export const api = {
  get: <T>(path: string) => request<T>(path, { method: "GET" }),
  post: <T>(path: string, body?: unknown) =>
    request<T>(path, {
      method: "POST",
      body:
        body !== undefined ? (body instanceof FormData ? body : JSON.stringify(body)) : undefined,
    }),
  put: <T>(path: string, body?: unknown) =>
    request<T>(path, {
      method: "PUT",
      body:
        body !== undefined ? (body instanceof FormData ? body : JSON.stringify(body)) : undefined,
    }),
  delete: <T>(path: string) => request<T>(path, { method: "DELETE" }),
};
