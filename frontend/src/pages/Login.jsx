import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchAPI } from '../services/api';
import { LogIn } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('Ivresse.jorquera@aldeasinfantiles.cl');
  const [password, setPassword] = useState('Ivresse Jorquera');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const data = await fetchAPI('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      });
      
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      navigate('/dashboard/acogida');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="login-screen">
      <div className="bg-shape shape1"></div>
      <div class="bg-shape shape2"></div>
      
      <div className="login-box glass-container">
        <h2>Aldea SOS <br/><span>Administración</span></h2>
        <p className="text-muted">Ingresa tus credenciales</p>
        
        <form onSubmit={handleLogin}>
          <div className="input-group">
            <label>Correo Electrónico</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <div className="input-group">
            <label>Contraseña</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required />
          </div>
          
          <button type="submit" className="btn-primary" style={{ display: 'flex', justifyContent: 'center', gap: '8px', alignItems: 'center' }}>
            <LogIn size={20} /> Ingresar
          </button>
          
          {error && <p className="error-msg">{error}</p>}
        </form>
      </div>
    </div>
  );
}
