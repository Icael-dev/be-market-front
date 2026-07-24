/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { api, getAuthToken, setAuthToken } from '../lib/api';

describe('api helper', () => {
  beforeEach(() => {
    localStorage.clear();
    (globalThis as any).fetch = vi.fn();
  });

  it('returns parsed JSON on success', async () => {
    const mockData = { id: '1', name: 'Test' };
    ((globalThis as any).fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      status: 200,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => mockData,
    });

    const result = await api.get('/test');
    expect(result).toEqual(mockData);
    expect((globalThis as any).fetch).toHaveBeenCalledWith(
      expect.stringContaining('/test'),
      expect.objectContaining({ method: 'GET' })
    );
  });

  it('throws parsed error on non-OK response', async () => {
    ((globalThis as any).fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: false,
      status: 404,
      statusText: 'Not Found',
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => ({ message: 'Not found' }),
    });

    await expect(api.get('/test')).rejects.toEqual({
      status: 404,
      error: 'Not found',
      body: { message: 'Not found' },
    });
  });

  it('attaches Authorization header when token exists', async () => {
    setAuthToken('test-token');
    ((globalThis as any).fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      status: 200,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => ({}),
    });

    await api.get('/test');
    const [, options] = ((globalThis as any).fetch as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(options.headers.get('Authorization')).toBe('Bearer test-token');
  });

  it('skips Content-Type for FormData', async () => {
    const form = new FormData();
    ((globalThis as any).fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      status: 201,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => ({}),
    });

    await api.post('/test', form);
    const callArgs = ((globalThis as any).fetch as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(callArgs[1].body).toBe(form);
  });
});

describe('auth token helpers', () => {
  it('stores and retrieves token', () => {
    setAuthToken('abc');
    expect(getAuthToken()).toBe('abc');
  });

  it('removes token when set to null', () => {
    setAuthToken('abc');
    setAuthToken(null);
    expect(getAuthToken()).toBeNull();
  });
});
