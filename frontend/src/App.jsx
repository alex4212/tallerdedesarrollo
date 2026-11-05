import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastProvider } from './context/ToastContext';
import Login from './pages/Login';
import DashboardLayout from './layouts/DashboardLayout';
import Inicio from './pages/Inicio';
import Acogida from './pages/Acogida';
import Mantenimiento from './pages/Mantenimiento';
import Sostenibilidad from './pages/Sostenibilidad';

const isTokenValid = () => {
  const token = localStorage.getItem('token');
  if (!token) return false;
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return false;
    // Normalizar Base64URL a Base64 estándar antes de decodificar
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    const payload = JSON.parse(jsonPayload);
    if (payload.exp && payload.exp * 1000 < Date.now()) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      return false;
    }
    return true;
  } catch (err) {
    console.error('Error validando token:', err);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    return false;
  }
};

const PrivateRoute = ({ children }) => {
  return isTokenValid() ? children : <Navigate to="/login" replace />;
};

function App() {
  return (
    <ToastProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />

          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <DashboardLayout />
              </PrivateRoute>
            }
          >
            <Route index element={<Navigate to="inicio" replace />} />
            <Route path="inicio" element={<Inicio />} />
            <Route path="acogida" element={<Acogida />} />
            <Route path="mantenimiento" element={<Mantenimiento />} />
            <Route path="sostenibilidad" element={<Sostenibilidad />} />
          </Route>

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </ToastProvider>
  );
}

export default App;
