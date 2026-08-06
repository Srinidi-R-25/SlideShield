const API_BASE = process.env.NEXT_PUBLIC_API_URL || '/api';

export async function fetchApi<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('slideshield_token') : null;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({ detail: 'API Error' }));
      throw new Error(errorData.detail || `HTTP Error ${res.status}`);
    }

    return await res.json();
  } catch (err: any) {
    console.warn(`API call ${endpoint} error:`, err.message);
    throw err;
  }
}

// Image upload helper
export async function uploadImageApi(file: File) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('slideshield_token') : null;
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch(`${API_BASE}/reports/upload-image`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData,
  });

  if (!res.ok) throw new Error('Failed to upload image');
  return res.json();
}
