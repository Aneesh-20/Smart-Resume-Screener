const API_BASE = '/api/v1';

export class ApiError extends Error {
  code: string;
  status: number;
  details: any[];

  constructor(code: string, message: string, status: number, details: any[] = []) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

export async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = endpoint.startsWith('http') || endpoint.startsWith('/api') || endpoint.startsWith('/health')
    ? endpoint
    : `${API_BASE}${endpoint}`;

  const headers = new Headers(options.headers || {});
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorData: any = {};
    try {
      errorData = await response.json();
    } catch {
      errorData = { error: { code: 'HTTP_ERROR', message: response.statusText, details: [] } };
    }

    const err = errorData.error || {
      code: `HTTP_${response.status}`,
      message: errorData.message || 'An error occurred',
      details: errorData.details || [],
    };

    throw new ApiError(err.code, err.message, response.status, err.details);
  }

  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}
