/**
 * Thin typed fetch wrapper around the Pijaca Plus API.
 * Base URL comes from EXPO_PUBLIC_API_URL; default targets the Android emulator
 * host loopback (10.0.2.2). For a physical device set EXPO_PUBLIC_API_URL to your
 * machine's LAN IP, e.g. http://192.168.1.20:4000.
 */
export const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://10.0.2.2:4000';

let authToken: string | null = null;

/** Called by the auth store whenever the token changes. */
export function setAuthToken(token: string | null) {
  authToken = token;
}

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  /** Skip JSON encoding (used for multipart uploads). */
  raw?: boolean;
  headers?: Record<string, string>;
}

export async function api<T = unknown>(path: string, opts: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, raw, headers = {} } = opts;

  const finalHeaders: Record<string, string> = { ...headers };
  if (authToken) finalHeaders.Authorization = `Bearer ${authToken}`;

  let payload: BodyInit | undefined;
  if (body !== undefined) {
    if (raw) {
      payload = body as BodyInit;
    } else {
      finalHeaders['Content-Type'] = 'application/json';
      payload = JSON.stringify(body);
    }
  }

  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, { method, headers: finalHeaders, body: payload });
  } catch {
    throw new ApiError('Nije moguće povezati se sa serverom. Proverite da li je server pokrenut.', 0);
  }

  const text = await res.text();
  const data = text ? safeJson(text) : null;

  if (!res.ok) {
    const message =
      (data && typeof data === 'object' && 'error' in data && (data as { error?: string }).error) ||
      'Došlo je do greške.';
    throw new ApiError(message as string, res.status);
  }

  return data as T;
}

function safeJson(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

/** Upload a local file URI as multipart/form-data; returns the served URL. */
export async function uploadImage(uri: string): Promise<string> {
  const form = new FormData();
  const name = uri.split('/').pop() || 'photo.jpg';
  const ext = name.split('.').pop()?.toLowerCase();
  const type = ext === 'png' ? 'image/png' : 'image/jpeg';
  // React Native FormData file shape
  form.append('image', { uri, name, type } as unknown as Blob);
  const { url } = await api<{ url: string }>('/api/uploads', { method: 'POST', body: form, raw: true });
  return url;
}
