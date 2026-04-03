export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://localhost:5183/api';

export async function fetchApi(endpoint: string, options: RequestInit = {}) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  const headers = new Headers(options.headers);
  headers.set('Content-Type', 'application/json');
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorMsg = 'An error occurred';
    try {
      const data = await response.json();
      errorMsg = data.message || errorMsg;
    } catch {
      // Ignore JSON parse error
    }
    throw new Error(errorMsg);
  }

  // Handle 204 No Content
  if (response.status === 204) return null;

  return response.json();
}
