import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import logoAlmamod from '../../assets/almamod.webp';

const inputStyle = {
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
};

export default function ResetPassword() {
  const navigate = useNavigate();
  const [token, setToken]       = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm]   = useState('');
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [ok, setOk]             = useState(false);
  const [invalidLink, setInvalidLink] = useState(false);

  useEffect(() => {
    // Supabase pone el token en el hash de la URL
    const hash = window.location.hash.substring(1);
    const params = new URLSearchParams(hash);
    const type = params.get('type');
    const accessToken = params.get('access_token');

    if (type === 'recovery' && accessToken) {
      setToken(accessToken);
    } else {
      setInvalidLink(true);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirm) { setError('Las contraseñas no coinciden'); return; }
    if (password.length < 8)  { setError('Debe tener al menos 8 caracteres'); return; }

    setLoading(true); setError('');
    try {
      const res = await fetch('/.netlify/functions/auth-reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ access_token: token, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al cambiar la contraseña');
      setOk(true);
      setTimeout(() => navigate('/app/login'), 3000);
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
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px',
    }}>
      <div style={{ width: '100%', maxWidth: '380px' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <img src={logoAlmamod} alt="AlmaMod" style={{ height: '48px', objectFit: 'contain', marginBottom: '12px' }} />
          <p style={{ color: '#94a3b8', fontSize: '0.8rem', letterSpacing: '0.08em' }}>
            SISTEMA DE GESTIÓN DE OBRAS
          </p>
        </div>

        <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(212,165,116,0.2)', borderRadius: '16px', padding: '32px 28px', backdropFilter: 'blur(12px)', boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}>

          {invalidLink ? (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', marginBottom: '12px' }}>⚠️</div>
              <h2 style={{ color: '#d4a574', marginBottom: '12px' }}>Link inválido</h2>
              <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '20px' }}>
                Este link no es válido o ya fue utilizado. Solicitá un nuevo link desde el login.
              </p>
              <Link to="/app/login" style={{ color: '#d4a574', fontSize: '0.85rem' }}>← Volver al login</Link>
            </div>
          ) : ok ? (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', marginBottom: '12px' }}>✅</div>
              <h2 style={{ color: '#10b981', marginBottom: '12px' }}>Contraseña actualizada</h2>
              <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>
                Redirigiendo al login en unos segundos...
              </p>
            </div>
          ) : (
            <>
              <h2 style={{ color: '#d4a574', fontSize: '1.25rem', fontWeight: 700, margin: '0 0 8px 0' }}>
                Nueva contraseña
              </h2>
              <p style={{ color: '#94a3b8', fontSize: '0.82rem', marginBottom: '24px' }}>
                Elegí una contraseña nueva para tu cuenta.
              </p>

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', color: '#cbd5e1', fontSize: '0.85rem', fontWeight: 500, marginBottom: '6px' }}>
                    Nueva contraseña
                  </label>
                  <input type="password" required value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Mínimo 8 caracteres"
                    autoComplete="new-password"
                    style={inputStyle}
                    onFocus={e => e.target.style.borderColor = '#d4a574'}
                    onBlur={e => e.target.style.borderColor = 'rgba(212,165,116,0.25)'}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', color: '#cbd5e1', fontSize: '0.85rem', fontWeight: 500, marginBottom: '6px' }}>
                    Confirmar contraseña
                  </label>
                  <input type="password" required value={confirm}
                    onChange={e => setConfirm(e.target.value)}
                    placeholder="Repetí la contraseña"
                    autoComplete="new-password"
                    style={inputStyle}
                    onFocus={e => e.target.style.borderColor = '#d4a574'}
                    onBlur={e => e.target.style.borderColor = 'rgba(212,165,116,0.25)'}
                  />
                </div>

                {error && (
                  <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#fca5a5', borderRadius: '8px', padding: '10px 14px', fontSize: '0.85rem' }}>
                    {error}
                  </div>
                )}

                <button type="submit" disabled={loading}
                  style={{ width: '100%', background: loading ? 'rgba(212,165,116,0.4)' : 'linear-gradient(135deg, #d4a574 0%, #8b6f47 100%)', border: 'none', borderRadius: '8px', padding: '12px', color: '#1a1a2e', fontWeight: 700, fontSize: '0.95rem', cursor: loading ? 'not-allowed' : 'pointer', marginTop: '4px' }}>
                  {loading ? 'Guardando...' : 'Cambiar contraseña'}
                </button>
              </form>
            </>
          )}
        </div>

        <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '0.85rem' }}>
          <Link to="/app/login" style={{ color: '#94a3b8', textDecoration: 'none' }}
            onMouseEnter={e => e.target.style.color = '#d4a574'}
            onMouseLeave={e => e.target.style.color = '#94a3b8'}>
            ← Volver al login
          </Link>
        </p>
      </div>
    </div>
  );
}
