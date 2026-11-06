const resolveApiUrl = () => {
  // Si la página la sirve el propio backend (puerto 1626), usar siempre la misma
  // origen: evita depender de VITE_API_URL mal configurado.
  if (typeof window !== 'undefined' && window.location.port === '1626') {
    return '/api';
  }
  const envUrl = (import.meta.env.VITE_API_URL || '').trim().replace(/\/+$/, '');
  if (envUrl) {
    return /\/api$/.test(envUrl) ? envUrl : `${envUrl}/api`;
  }
  if (typeof window !== 'undefined') {
    return `${window.location.protocol}//${window.location.hostname}:1626/api`;
  }
  return 'http://localhost:1626/api';
};

export const API_URL = resolveApiUrl();

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
    const isHtml = /^\s*<!doctype html|^\s*<html/i.test(rawText);
    data = {
      message: isHtml
        ? `El servidor devolvió una página HTML en vez de la API (${API_URL}${endpoint}). El backend no está respondiendo en esa dirección.`
        : `Respuesta inesperada del servidor (HTTP ${response.status})`,
    };
    if (isHtml && response.ok) {
      throw new Error(data.message);
    }
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
