import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { api } from '../lib/api';
import AppLayout from '../components/AppLayout';
import { C, S, ROL_STYLE, ROL_LABEL, inputFocus, inputBlur } from '../styles';

function EditModal({ usuario, onClose, onSave }) {
  const [form, setForm] = useState({ nombre: usuario.nombre, rol: usuario.rol, telefono: usuario.telefono || '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      await onSave(usuario.id, form);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ ...S.card, width: '100%', maxWidth: '400px' }}>
        <h2 style={{ ...S.h2, marginBottom: '20px', color: C.gold }}>Editar usuario</h2>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '14px' }}>
            <label style={S.label}>Email</label>
            <div style={{ ...S.input, opacity: 0.5, cursor: 'not-allowed', color: C.textMuted }}>{usuario.email}</div>
          </div>
          <div style={{ marginBottom: '14px' }}>
            <label style={S.label}>Nombre *</label>
            <input
              required value={form.nombre}
              onChange={e => setForm(p => ({ ...p, nombre: e.target.value }))}
              style={S.input} onFocus={inputFocus} onBlur={inputBlur}
            />
          </div>
          <div style={{ marginBottom: '14px' }}>
            <label style={S.label}>Teléfono</label>
            <input
              value={form.telefono}
              onChange={e => setForm(p => ({ ...p, telefono: e.target.value }))}
              placeholder="+54 299 ..."
              style={S.input} onFocus={inputFocus} onBlur={inputBlur}
            />
          </div>
          <div style={{ marginBottom: '20px' }}>
            <label style={S.label}>Rol *</label>
            <select value={form.rol} onChange={e => setForm(p => ({ ...p, rol: e.target.value }))} style={S.select}>
              <option value="cliente">Cliente</option>
              <option value="fabricacion">Fabricación</option>
              <option value="deposito">Depósito</option>
              <option value="dueno">Dueño</option>
            </select>
          </div>
          {error && <div style={{ ...S.alertError, marginBottom: '14px' }}>{error}</div>}
          <div style={{ display: 'flex', gap: '10px' }}>
            <button type="submit" disabled={loading} style={{ ...S.btnGold, flex: 1, opacity: loading ? 0.6 : 1 }}>
              {loading ? 'Guardando...' : 'Guardar cambios'}
            </button>
            <button type="button" onClick={onClose} style={S.btnGhost}>Cancelar</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Usuarios() {
  const { token } = useAuth();
  const [usuarios, setUsuarios] = useState([]);
  const [pendientes, setPendientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ email: '', rol: 'cliente' });
  const [invitando, setInvitando] = useState(false);
  const [invError, setInvError] = useState('');
  const [invSuccess, setInvSuccess] = useState('');
  const [inviteLink, setInviteLink] = useState('');
  const [reenviando, setReenviando] = useState(null); // email que se está reenviando
  const [editando, setEditando] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const cargarUsuarios = () => {
    Promise.all([
      api.users.list(token),
      api.auth.invitacionesPendientes(token),
    ]).then(([uData, iData]) => {
      setUsuarios(uData.users || []);
      setPendientes(iData.pendientes || []);
    }).finally(() => setLoading(false));
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

  const handleReenviar = async (inv) => {
    setReenviando(inv.email);
    setInvError(''); setInvSuccess(''); setInviteLink('');
    try {
      const res = await api.auth.reenviarInvite(token, inv.email, inv.rol);
      const link = `${window.location.origin}/app/registro?token=${res.token}`;
      setInvSuccess(`Invitación reenviada a ${inv.email}`);
      setInviteLink(link);
      cargarUsuarios();
    } catch (err) {
      setInvError(err.message);
    } finally {
      setReenviando(null);
    }
  };

  const handleSave = async (id, data) => {
    await api.users.update(token, { id, ...data });
    cargarUsuarios();
  };

  const handleDelete = async (id) => {
    await api.users.delete(token, id);
    setConfirmDelete(null);
    cargarUsuarios();
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
                type="email" required value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                placeholder="email@ejemplo.com"
                style={{ ...S.input, flex: '1', minWidth: '200px' }}
                onFocus={inputFocus} onBlur={inputBlur}
              />
              <select value={form.rol} onChange={e => setForm({ ...form, rol: e.target.value })} style={{ ...S.select, minWidth: '140px' }}>
                <option value="cliente">Cliente</option>
                <option value="fabricacion">Fabricación</option>
                <option value="deposito">Depósito</option>
                <option value="dueno">Dueño</option>
              </select>
              <button type="submit" disabled={invitando} style={{ ...S.btnGold, opacity: invitando ? 0.6 : 1 }}>
                {invitando ? 'Creando...' : '+ Invitar'}
              </button>
            </div>
            {invError && <div style={S.alertError}>{invError}</div>}
            {invSuccess && (
              <div style={{ ...S.alertSuccess, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <span>✓ {invSuccess}</span>
                {inviteLink && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <input readOnly value={inviteLink}
                      style={{ ...S.input, flex: 1, fontSize: '0.78rem', padding: '6px 10px', color: C.textMuted }}
                    />
                    <button type="button" onClick={() => navigator.clipboard.writeText(inviteLink)}
                      style={{ ...S.btnGhost, fontSize: '0.78rem', padding: '6px 12px' }}>
                      Copiar
                    </button>
                  </div>
                )}
              </div>
            )}
          </form>
        </div>

        {/* Invitaciones pendientes */}
        {pendientes.length > 0 && (
          <div style={{ ...S.card, marginBottom: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 style={{ ...S.h2, margin: 0 }}>Invitaciones pendientes</h2>
              <span style={{ background: 'rgba(245,158,11,0.15)', color: '#f59e0b', borderRadius: '20px', padding: '2px 10px', fontSize: '0.8rem', fontWeight: 700 }}>
                {pendientes.length}
              </span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
              {pendientes.map((inv, i) => {
                const expira = new Date(inv.expires_at);
                const diasRestantes = Math.ceil((expira - Date.now()) / 86400000);
                return (
                  <div key={inv.id} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    gap: '12px', padding: '12px 16px', borderRadius: '8px',
                    background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.02)',
                    borderBottom: `1px solid ${C.border}`,
                  }}>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={{ color: C.text, fontWeight: 600, fontSize: '0.9rem' }}>{inv.email}</div>
                      <div style={{ color: C.textMuted, fontSize: '0.78rem', marginTop: '2px' }}>
                        Expira en {diasRestantes} día{diasRestantes !== 1 ? 's' : ''}
                      </div>
                    </div>
                    <span style={{ background: 'rgba(245,158,11,0.12)', color: '#f59e0b', padding: '3px 10px', borderRadius: '20px', fontSize: '0.72rem', fontWeight: 700, flexShrink: 0 }}>
                      {ROL_LABEL[inv.rol] || inv.rol}
                    </span>
                    <button
                      onClick={() => handleReenviar(inv)}
                      disabled={reenviando === inv.email}
                      style={{ background: C.goldDim, border: 'none', borderRadius: '6px', padding: '5px 12px', color: C.gold, cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600, flexShrink: 0, opacity: reenviando === inv.email ? 0.6 : 1 }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(212,165,116,0.3)'}
                      onMouseLeave={e => e.currentTarget.style.background = C.goldDim}>
                      {reenviando === inv.email ? 'Reenviando...' : 'Reenviar'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

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
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    gap: '12px', padding: '12px 16px', borderRadius: '8px',
                    background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.02)',
                    borderBottom: `1px solid ${C.border}`,
                  }}>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={{ color: C.text, fontWeight: 600, fontSize: '0.9rem' }}>{u.nombre}</div>
                      <div style={{ color: C.textMuted, fontSize: '0.78rem', marginTop: '2px' }}>{u.email}</div>
                      {u.telefono && <div style={{ color: C.textMuted, fontSize: '0.78rem' }}>{u.telefono}</div>}
                    </div>
                    <span style={{ ...rolStyle, padding: '3px 10px', borderRadius: '20px', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.04em', flexShrink: 0 }}>
                      {ROL_LABEL[u.rol] || u.rol}
                    </span>
                    <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                      <button onClick={() => setEditando(u)}
                        style={{ background: C.goldDim, border: 'none', borderRadius: '6px', padding: '5px 10px', color: C.gold, cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600 }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(212,165,116,0.3)'}
                        onMouseLeave={e => e.currentTarget.style.background = C.goldDim}>
                        Editar
                      </button>
                      <button onClick={() => setConfirmDelete(u)}
                        style={{ background: C.redDim, border: 'none', borderRadius: '6px', padding: '5px 10px', color: C.red, cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600 }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.2)'}
                        onMouseLeave={e => e.currentTarget.style.background = C.redDim}>
                        Eliminar
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Edit modal */}
      {editando && (
        <EditModal usuario={editando} onClose={() => setEditando(null)} onSave={handleSave} />
      )}

      {/* Delete confirm modal */}
      {confirmDelete && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}
          onClick={e => e.target === e.currentTarget && setConfirmDelete(null)}>
          <div style={{ ...S.card, width: '100%', maxWidth: '360px', textAlign: 'center' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>⚠️</div>
            <h2 style={{ color: C.red, fontSize: '1.1rem', fontWeight: 700, marginBottom: '8px' }}>Desactivar usuario</h2>
            <p style={{ color: C.textSub, fontSize: '0.9rem', marginBottom: '4px' }}>{confirmDelete.nombre}</p>
            <p style={{ color: C.textMuted, fontSize: '0.82rem', marginBottom: '24px' }}>{confirmDelete.email}</p>
            <p style={{ color: C.textMuted, fontSize: '0.82rem', marginBottom: '24px' }}>El usuario no podrá acceder al sistema. Esta acción se puede revertir manualmente.</p>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => handleDelete(confirmDelete.id)}
                style={{ ...S.btnDanger, flex: 1 }}>
                Sí, desactivar
              </button>
              <button onClick={() => setConfirmDelete(null)} style={{ ...S.btnGhost, flex: 1 }}>Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
