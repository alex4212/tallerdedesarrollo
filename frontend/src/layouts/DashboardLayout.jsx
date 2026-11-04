import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, Wrench, Wallet, LogOut } from 'lucide-react';

export default function DashboardLayout() {
  const navigate = useNavigate();

  let user = {};
  try {
    const userStr = localStorage.getItem('user');
    if (userStr && userStr !== 'undefined') {
      user = JSON.parse(userStr);
    }
  } catch (e) {
    console.warn("Error leyendo el usuario, reiniciando sesión");
  }

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const navItems = [
    { path: '/dashboard/inicio', label: 'Inicio / Resumen', icon: <LayoutDashboard size={20} /> },
    { path: '/dashboard/acogida', label: 'Niños / Acogida', icon: <Users size={20} /> },
    { path: '/dashboard/mantenimiento', label: 'Mantenimiento', icon: <Wrench size={20} /> },
    { path: '/dashboard/sostenibilidad', label: 'Sostenibilidad', icon: <Wallet size={20} /> },
  ];

  const isAdmin = user.role === 'ADMIN' || user.role === 'Jefa de Aldea';

  return (
    <div className="dashboard-layout">
      <aside className="glass-sidebar">
        <h2>Aldea SOS</h2>

        <div className="user-info">
          <div className="avatar">{user.name ? user.name.charAt(0).toUpperCase() : 'U'}</div>
          <div>
            <span style={{ color: 'white', display: 'block', fontWeight: 600 }}>{user.name}</span>
            <small className="text-muted">
              {isAdmin ? 'Administrador' : 'Educadora'}
            </small>
          </div>
        </div>

        <nav className="nav-links">
          {navItems.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `nav-btn ${isActive ? 'active' : ''}`}
            >
              {item.icon} {item.label}
            </NavLink>
          ))}
        </nav>

        <button onClick={handleLogout} className="btn-logout">
          <LogOut size={20} /> Cerrar Sesión
        </button>
      </aside>

      <main className="dashboard-content">
        <Outlet />
      </main>
    </div>
  );
}