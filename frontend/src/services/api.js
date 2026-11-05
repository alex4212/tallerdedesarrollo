export const API_URL =
  import.meta.env.VITE_API_URL ||
  (typeof window !== 'undefined'
    ? (window.location.port === '1626'
        ? '/api'
        : `${window.location.protocol}//${window.location.hostname}:1626/api`)
    : 'http://localhost:1626/api');

export const BACKEND_URL = API_URL.replace(/\/api\/?$/, '');

export const fetchAPI = async (endpoint, options = {}) => {
  const token = localStorage.getItem('token');

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const contentType = response.headers.get('content-type') || '';
  let data;
  if (contentType.includes('application/json')) {
    data = await response.json().catch(() => ({}));
  } else {
    const rawText = await response.text();
    console.warn(`Respuesta no JSON de ${endpoint} (HTTP ${response.status}):`, rawText.substring(0, 200));
    data = { message: `Respuesta inesperada del servidor (HTTP ${response.status})` };
  }

  if (!response.ok) {
    // Solo redirigir a login si el token expiró o es inválido (no en el intento de login)
    if (!endpoint.includes('/auth/login') && (response.status === 401 || (response.status === 403 && data.message === 'Token inválido'))) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      const currentPath = window.location.pathname.replace(/\/$/, '');
      if (currentPath !== '/login') {
        window.location.href = '/login';
      }
    }
    throw new Error(data.message || `Error del servidor (${response.status})`);
  }

  return data;
};
