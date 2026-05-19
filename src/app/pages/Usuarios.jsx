import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { api } from '../lib/api';
import AppLayout from '../components/AppLayout';
import { C, S, ROL_STYLE, ROL_LABEL, inputFocus, inputBlur } from '../styles';

export default function Usuarios() {
  const { token } = useAuth();
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ email: '', rol: 'cliente' });
  const [invitando, setInvitando] = useState(false);
  const [invError, setInvError] = useState('');
  const [invSuccess, setInvSuccess] = useState('');
  const [inviteLink, setInviteLink] = useState('');

  const cargarUsuarios = () => {
    api.users.list(token)
      .then(data => setUsuarios(data.users || []))
      .finally(() => setLoading(false));
  };

  useEffect(() => { cargarUsuarios(); }, [token]);

  const handleInvitar = async (e) => {
    e.preventDefault();
    setInvError(''); setInvSuccess(''); setInviteLink('');
    setInvitando(true);
    try {
      const res = await api.auth.invite(token, { email: form.email, rol: form.rol });
      const link = `${window.location.origin}/app/registro?token=${res.token}`;
      setInvSuccess(`Invitación creada para ${form.email}`);
      setInviteLink(link);
      setForm({ email: '', rol: 'cliente' });
      cargarUsuarios();
    } catch (err) {
      setInvError(err.message);
    } finally {
      setInvitando(false);
    }
  };

  return (
    <AppLayout>
      <div style={{ padding: '28px 32px', maxWidth: '760px' }}>

        <h1 style={S.h1}>👥 Usuarios</h1>

        {/* Invite form */}
        <div style={{ ...S.card, marginBottom: '24px' }}>
          <h2 style={{ ...S.h2, color: C.gold }}>Invitar usuario</h2>
          <form onSubmit={handleInvitar}>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '12px' }}>
              <input
                type="email"
                required
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                placeholder="email@ejemplo.com"
                style={{ ...S.input, flex: '1', minWidth: '200px' }}
                onFocus={inputFocus}
                onBlur={inputBlur}
              />
              <select
                value={form.rol}
                onChange={e => setForm({ ...form, rol: e.target.value })}
                style={{ ...S.select, minWidth: '140px' }}
              >
                <option value="cliente">Cliente</option>
                <option value="fabricacion">Fabricación</option>
                <option value="deposito">Depósito</option>
                <option value="dueno">Dueño</option>
              </select>
              <button
                type="submit"
                disabled={invitando}
                style={{ ...S.btnGold, opacity: invitando ? 0.6 : 1 }}
              >
                {invitando ? 'Creando...' : '+ Invitar'}
              </button>
            </div>

            {invError && <div style={S.alertError}>{invError}</div>}

            {invSuccess && (
              <div style={{ ...S.alertSuccess, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <span>✓ {invSuccess}</span>
                {inviteLink && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <input
                      readOnly
                      value={inviteLink}
                      style={{ ...S.input, flex: 1, fontSize: '0.78rem', padding: '6px 10px', color: C.textMuted }}
                    />
                    <button
                      type="button"
                      onClick={() => { navigator.clipboard.writeText(inviteLink); }}
                      style={{ ...S.btnGhost, fontSize: '0.78rem', padding: '6px 12px' }}
                    >
                      Copiar
                    </button>
                  </div>
                )}
              </div>
            )}
          </form>
        </div>

        {/* Users list */}
        <div style={S.card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2 style={{ ...S.h2, margin: 0 }}>Usuarios activos</h2>
            <span style={{ background: C.goldDim, color: C.gold, borderRadius: '20px', padding: '2px 10px', fontSize: '0.8rem', fontWeight: 700 }}>
              {usuarios.length}
            </span>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '32px', color: C.textMuted, fontSize: '0.9rem' }}>Cargando...</div>
          ) : usuarios.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '32px', color: C.textMuted, fontSize: '0.9rem' }}>No hay usuarios registrados</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
              {usuarios.map((u, i) => {
                const rolStyle = ROL_STYLE[u.rol] || ROL_STYLE.cliente;
                return (
                  <div key={u.id} style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '12px',
                    padding: '12px 16px',
                    borderRadius: '8px',
                    background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.02)',
                    borderBottom: `1px solid ${C.border}`,
                  }}>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ color: C.text, fontWeight: 600, fontSize: '0.9rem' }}>{u.nombre}</div>
                      <div style={{ color: C.textMuted, fontSize: '0.78rem', marginTop: '2px' }}>{u.email}</div>
                      {u.telefono && <div style={{ color: C.textMuted, fontSize: '0.78rem' }}>{u.telefono}</div>}
                    </div>
                    <span style={{ ...rolStyle, padding: '3px 10px', borderRadius: '20px', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.04em', flexShrink: 0 }}>
                      {ROL_LABEL[u.rol] || u.rol}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
