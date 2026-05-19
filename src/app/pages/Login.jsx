import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { api } from '../lib/api';
import logoAlmamod from '../../assets/almamod.webp';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { token, user } = await api.auth.login(form.email, form.password);
      login(user, token);
      navigate('/app/obras');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f172a 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
    }}>
      <div style={{ width: '100%', maxWidth: '380px' }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <img src={logoAlmamod} alt="AlmaMod" style={{ height: '48px', objectFit: 'contain', marginBottom: '12px' }} />
          <p style={{ color: '#94a3b8', fontSize: '0.8rem', letterSpacing: '0.08em' }}>
            SISTEMA DE GESTIÓN DE OBRAS
          </p>
        </div>

        {/* Card */}
        <div style={{
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(212,165,116,0.2)',
          borderRadius: '16px',
          padding: '32px 28px',
          backdropFilter: 'blur(12px)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
        }}>
          <h2 style={{ color: '#d4a574', fontSize: '1.25rem', fontWeight: 700, marginBottom: '24px', margin: '0 0 24px 0' }}>
            Iniciar sesión
          </h2>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', color: '#cbd5e1', fontSize: '0.85rem', fontWeight: 500, marginBottom: '6px' }}>
                Email
              </label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="tu@email.com"
                autoComplete="email"
                style={{
                  width: '100%',
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(212,165,116,0.25)',
                  borderRadius: '8px',
                  padding: '10px 14px',
                  color: '#e2e8f0',
                  fontSize: '0.9rem',
                  outline: 'none',
                  boxSizing: 'border-box',
                  transition: 'border-color 0.2s',
                }}
                onFocus={e => e.target.style.borderColor = '#d4a574'}
                onBlur={e => e.target.style.borderColor = 'rgba(212,165,116,0.25)'}
              />
            </div>

            <div>
              <label style={{ display: 'block', color: '#cbd5e1', fontSize: '0.85rem', fontWeight: 500, marginBottom: '6px' }}>
                Contraseña
              </label>
              <input
                type="password"
                required
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="••••••••"
                autoComplete="current-password"
                style={{
                  width: '100%',
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(212,165,116,0.25)',
                  borderRadius: '8px',
                  padding: '10px 14px',
                  color: '#e2e8f0',
                  fontSize: '0.9rem',
                  outline: 'none',
                  boxSizing: 'border-box',
                  transition: 'border-color 0.2s',
                }}
                onFocus={e => e.target.style.borderColor = '#d4a574'}
                onBlur={e => e.target.style.borderColor = 'rgba(212,165,116,0.25)'}
              />
            </div>

            {error && (
              <div style={{
                background: 'rgba(239,68,68,0.1)',
                border: '1px solid rgba(239,68,68,0.3)',
                color: '#fca5a5',
                borderRadius: '8px',
                padding: '10px 14px',
                fontSize: '0.85rem',
              }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                background: loading ? 'rgba(212,165,116,0.4)' : 'linear-gradient(135deg, #d4a574 0%, #8b6f47 100%)',
                border: 'none',
                borderRadius: '8px',
                padding: '12px',
                color: '#1a1a2e',
                fontWeight: 700,
                fontSize: '0.95rem',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease',
                marginTop: '4px',
              }}
              onMouseEnter={e => { if (!loading) e.currentTarget.style.transform = 'translateY(-1px)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              {loading ? 'Ingresando...' : 'Ingresar'}
            </button>
          </form>
        </div>

        <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '0.85rem' }}>
          <Link to="/" style={{ color: '#94a3b8', textDecoration: 'none', transition: 'color 0.2s' }}
            onMouseEnter={e => e.target.style.color = '#d4a574'}
            onMouseLeave={e => e.target.style.color = '#94a3b8'}
          >
            ← Volver al sitio
          </Link>
        </p>
      </div>
    </div>
  );
}
