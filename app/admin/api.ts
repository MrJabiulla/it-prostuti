export type Row = Record<string, unknown> & { id?: number };
export type Page = {
  data: Row[];
  current_page: number;
  last_page: number;
  total: number;
};

export class ApiError extends Error {
  constructor(
    message: string,
    public status = 0,
    public errors: Record<string, string[]> = {},
  ) {
    super(message);
  }
}

let csrfToken = '';
let csrfRequest: Promise<void> | null = null;

export async function refreshCsrf() {
  if (!csrfRequest) {
    csrfRequest = request<{ csrf_token: string }>('/auth/csrf')
      .then((result) => {
        csrfToken = result.csrf_token;
      })
      .finally(() => {
        csrfRequest = null;
      });
  }
  return csrfRequest;
}

export async function request<T>(
  path: string,
  method = 'GET',
  body?: unknown,
  retry = true,
): Promise<T> {
  const mutation = method !== 'GET';
  if (mutation && !csrfToken) await refreshCsrf();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20000);
  let response: Response;
  try {
    response = await fetch(`/api/v1${path}`, {
      method,
      credentials: 'include',
      cache: 'no-store',
      signal: controller.signal,
      headers: {
        Accept: 'application/json',
        ...(mutation ? { 'X-CSRF-TOKEN': csrfToken } : {}),
        ...(body !== undefined && !(body instanceof FormData)
          ? { 'Content-Type': 'application/json' }
          : {}),
      },
      body:
        body === undefined
          ? undefined
          : body instanceof FormData
            ? body
            : JSON.stringify(body),
    });
  } catch (error) {
    throw new ApiError(
      error instanceof Error && error.name === 'AbortError'
        ? 'The request timed out. Check the list before retrying a save.'
        : 'Unable to connect. Please try again.',
    );
  } finally {
    clearTimeout(timeout);
  }
  if (response.status === 419 && mutation && retry) {
    await refreshCsrf();
    return request<T>(path, method, body, false);
  }
  if (response.status === 204) return undefined as T;
  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    throw new ApiError(
      payload?.message || 'The request failed. Please try again.',
      response.status,
      payload?.errors || {},
    );
  }
  if (payload === null)
    throw new ApiError('The server returned an invalid response.');
  return payload as T;
}

export function message(error: unknown) {
  return error instanceof Error
    ? error.message
    : 'Something went wrong. Please try again.';
}
