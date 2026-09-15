import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import DashboardLayout from './layouts/DashboardLayout';
import Acogida from './pages/Acogida';
import Mantenimiento from './pages/Mantenimiento';
import Sostenibilidad from './pages/Sostenibilidad';
import { X } from 'lucide-react';

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard/acogida" />} />

        <Route path="/login" element={<Login />} />

        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <DashboardLayout />
            </PrivateRoute>
          }
        >
          <Route path="acogida" element={<Acogida />} />
          <Route path="mantenimiento" element={<Mantenimiento />} />
          <Route path="sostenibilidad" element={<Sostenibilidad />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
