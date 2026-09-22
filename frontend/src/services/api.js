const API_URL = import.meta.env.VITE_API_URL || '/api';

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

  let data;
  try {
    const text = await response.text();
    data = text ? JSON.parse(text) : {};
  } catch (e) {
    throw new Error(`Error de conexión: El servidor no devolvió datos válidos. Revisa que VITE_API_URL apunte al puerto correcto del backend.`);
  }

  if (!response.ok) {
    throw new Error(data?.message || 'Error en la petición al servidor');
  }

  return data;
};
