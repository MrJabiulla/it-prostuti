// Laravel owns authentication, validation and scoring. The browser uses its cookie.
const apiEnabled = document.documentElement.dataset.api === 'server';
let apiReady = false;
let apiCsrfToken = '';
let csrfRequest: Promise<void> | null = null;
let apiMutationPending = false;
let apiTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Dhaka';
class StudentApiError extends Error {
  constructor(message: string, public status = 0) {
    super(message);
  }
}
async function refreshApiCsrf(): Promise<void> {
  if (!csrfRequest) {
    csrfRequest = apiRequest<{
      csrf_token: string;
    }>('/auth/csrf')
      .then((response) => { apiCsrfToken = response.csrf_token; })
      .finally(() => { csrfRequest = null; });
  }
  return csrfRequest;
}
async function apiRequest<T>(path: string, method = 'GET', body?: unknown, retryCsrf = true): Promise<T> {
  const mutation = method !== 'GET';
  if (mutation && !apiCsrfToken)
    await refreshApiCsrf();
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
        ...(mutation ? {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': apiCsrfToken
        } : {}),
      },
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    });
  }
  catch (error) {
    throw new StudentApiError(error.name === 'AbortError'
      ? 'The request timed out. Please try again.'
      : 'Unable to connect. Check your connection and try again.');
  }
  finally {
    clearTimeout(timeout);
  }
  if (response.status === 419 && mutation && retryCsrf) {
    await refreshApiCsrf();
    return apiRequest<T>(path, method, body, false);
  }
  if (response.status === 204)
    return undefined as T;
  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    const message = response.status === 401
      ? 'Your session has ended. Please log in to continue.'
      : payload?.message || 'The request failed. Please try again.';
    throw new StudentApiError(message, response.status);
  }
  if (payload === null)
    throw new StudentApiError('The server returned an invalid response.');
  return payload as T;
}
interface ApiPage<T> {
  data: T[];
  current_page: number;
  last_page: number;
}
async function apiPages<T>(path: string): Promise<T[]> {
  const rows: T[] = [];
  let currentPage = 1;
  let lastPage = 1;
  do {
    const separator = path.includes('?') ? '&' : '?';
    const response = await apiRequest<ApiPage<T>>(`${path}${separator}per_page=50&page=${currentPage}`);
    rows.push(...response.data);
    lastPage = response.last_page;
    currentPage++;
  } while (currentPage <= lastPage);
  return rows;
}
// Bound catalogue requests without adding a queue library.
async function apiMap<T, R>(items: T[], load: (item: T) => Promise<R>): Promise<R[]> {
  const results: R[] = [];
  for (let index = 0; index < items.length; index += 4) {
    results.push(...await Promise.all(items.slice(index, index + 4).map(load)));
  }
  return results;
}
function apiStatus(message: string) {
  const element = document.getElementById('api-status');
  if (element) {
    element.textContent = message;
    element.hidden = !message;
  }
}
function apiFailure(error: unknown) {
  const message = error instanceof Error ? error.message : 'Unable to save. Please try again.';
  if (error instanceof StudentApiError && error.status === 401) {
    apiReady = false;
    setAccountUser(null);
    apiStatus(message);
  }
  toast(message);
}
async function apiWrite(action: () => Promise<void>): Promise<boolean> {
  if (!apiReady) {
    toast('Your study account is not connected yet.');
    return false;
  }
  if (apiMutationPending) {
    toast('Please wait for the current save to finish.');
    return false;
  }
  apiMutationPending = true;
  const active = document.activeElement as HTMLButtonElement | null;
  const button = active?.tagName === 'BUTTON' ? active : null;
  if (button) button.disabled = true;
  document.getElementById('main')?.setAttribute('aria-busy', 'true');
  try {
    await action();
    return true;
  }
  catch (error) {
    apiFailure(error);
    return false;
  }
  finally {
    apiMutationPending = false;
    if (button) button.disabled = false;
    document.getElementById('main')?.removeAttribute('aria-busy');
  }
}
