import { buildQueryString } from './service.utils';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

class HttpFetch {
  private baseURL = 'https://anime-quiz-trainer-production.up.railway.app';
  private abortController: AbortController | null = null;
  private token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;

  private async request<T>(
    method: HttpMethod,
    url: string,
    body?: unknown,
    config?: RequestInit
  ): Promise<T> {

    if (this.abortController) this.abortController.abort();
    this.abortController = new AbortController();

    const fullUrl = url.startsWith('http') ? url : `${this.baseURL}${url.startsWith('/') ? url : `/${url}`}`;

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(this.token ? { 'Authorization': `Bearer ${this.token}` } : {}),
      ...config?.headers,
    };

    try {
      const response = await fetch(fullUrl, {
        ...config,
        method,
        headers,
        signal: this.abortController.signal,
        body: body !== undefined ? JSON.stringify(body) : undefined,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(`HTTP ${response.status}: ${response.statusText}`, { cause: errorData });
      }

      if (response.status === 204 || response.headers.get('content-length') === '0') {
        return null as unknown as T;
      }

      return response.json() as Promise<T>;
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') return null as unknown as T;
      throw err;
    }
  }

  get<T>(url: string, params?: Record<string, any>, config?: RequestInit) {
    const query = params ? buildQueryString(params) : '';
    const separator = url.includes('?') ? '&' : '?';
    return this.request<T>('GET', `${url}${query ? separator + query : ''}`, undefined, config);
  }

  post<T>(url: string, data?: unknown, config?: RequestInit) {
    return this.request<T>('POST', url, data, config);
  }

  put<T>(url: string, data?: unknown, config?: RequestInit) {
    return this.request<T>('PUT', url, data, config);
  }

  delete<T>(url: string, config?: RequestInit) {
    return this.request<T>('DELETE', url, undefined, config);
  }

  cancelRequest() {
    this.abortController?.abort();
    this.abortController = null;
  }
}

export const http = new HttpFetch();