import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { api } from '../lib/api';
import AppLayout from '../components/AppLayout';
import { MODULOS, rolDefaultLabel, rolDefaultPerm } from '../lib/modulos';
import { C, S, ROL_STYLE, ROL_LABEL, inputFocus, inputBlur } from '../styles';

const PERM_OPTS = [
  { value: 'default', label: 'Rol', color: '#64748b', bg: 'rgba(100,116,139,0.15)' },
  { value: 'none',    label: 'Sin acceso', color: '#ef4444', bg: 'rgba(239,68,68,0.12)' },
  { value: 'read',    label: 'Solo lectura', color: '#667eea', bg: 'rgba(102,126,234,0.12)' },
  { value: 'write',   label: 'Escritura', color: '#10b981', bg: 'rgba(16,185,129,0.12)' },
];

function PermisosModal({ usuario, onClose, onSave }) {
  const [permisos, setPermisos] = useState(() => ({ ...(usuario.permisos || {}) }));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const setValue = (key, value) => {
    setPermisos(prev => {
      const next = { ...prev };
      if (value === 'default') {
        delete next[key];
      } else {
        next[key] = value;
      }
      return next;
    });
  };

  // Aplicar el mismo nivel a TODOS los módulos de una
  const setAll = (value) => {
    if (value === 'default') { setPermisos({}); return; }
    const next = {};
    MODULOS.forEach(m => { next[m.key] = value; });
    setPermisos(next);
  };

  const handleSave = async () => {
    setError('');
    setSaving(true);
    try {
      await onSave(usuario.id, { permisos });
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const rolColor = ROL_STYLE[usuario.rol] || ROL_STYLE.cliente;

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ ...S.card, width: '100%', maxWidth: '620px', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div>
            <h2 style={{ color: C.gold, fontSize: '1.1rem', fontWeight: 700, margin: '0 0 4px 0' }}>
              Permisos por módulo
            </h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ color: C.textSub, fontSize: '0.88rem' }}>{usuario.nombre}</span>
              <span style={{ ...rolColor, padding: '2px 8px', borderRadius: '20px', fontSize: '0.7rem', fontWeight: 700 }}>
                {ROL_LABEL[usuario.rol] || usuario.rol}
              </span>
            </div>
          </div>
          <button onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: C.textMuted, fontSize: '1.3rem', cursor: 'pointer', lineHeight: 1, padding: '0 4px' }}>
            ×
          </button>
        </div>

        {/* Explicación */}
        <div style={{ background: C.goldDim, border: `1px solid ${C.goldBorder}`, borderRadius: '8px', padding: '10px 12px', marginBottom: '14px', fontSize: '0.8rem', color: C.textSub, lineHeight: 1.5 }}>
          Por defecto cada usuario ve los menús de su <strong>rol</strong>. Acá podés <strong style={{ color: C.gold }}>darle o quitarle menús puntuales sin cambiarle el rol</strong>.
          A la derecha de cada módulo, el indicador <strong>Ve / No ve</strong> muestra cómo queda con la configuración actual.
        </div>

        {/* Aplicar a todos */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center', marginBottom: '14px' }}>
          <span style={{ color: C.textMuted, fontSize: '0.75rem', fontWeight: 600 }}>Aplicar a todos:</span>
          {PERM_OPTS.map(opt => (
            <button key={opt.value} onClick={() => setAll(opt.value)}
              style={{ background: opt.bg, border: `1px solid ${opt.color}44`, borderRadius: '6px', padding: '3px 10px', color: opt.color, fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer' }}>
              {opt.value === 'default' ? 'Rol' : opt.label}
            </button>
          ))}
        </div>

        {/* Module list */}
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '2px' }}>
          {MODULOS.map(mod => {
            const current = permisos[mod.key] ?? 'default';
            const defaultLabel = rolDefaultLabel(usuario.rol, mod.key);
            const efectivo = current === 'default' ? rolDefaultPerm(usuario.rol, mod.key) : current;
            const efBadge = efectivo === 'write' ? { t: 'Ve · edición', c: '#10b981', b: 'rgba(16,185,129,0.12)' }
                          : efectivo === 'read'  ? { t: 'Ve · lectura', c: '#667eea', b: 'rgba(102,126,234,0.12)' }
                          :                          { t: 'No ve', c: '#ef4444', b: 'rgba(239,68,68,0.12)' };
            return (
              <div key={mod.key} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                gap: '12px', padding: '12px 4px',
                borderBottom: `1px solid ${C.border}`,
              }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '1rem' }}>{mod.icon}</span>
                    <span style={{ color: C.text, fontWeight: 600, fontSize: '0.88rem' }}>{mod.label}</span>
                    <span style={{ background: efBadge.b, color: efBadge.c, fontWeight: 700, fontSize: '0.66rem', padding: '1px 7px', borderRadius: '10px' }}>{efBadge.t}</span>
                  </div>
                  <div style={{ color: C.textMuted, fontSize: '0.75rem', marginTop: '2px', paddingLeft: '22px' }}>
                    {mod.desc}
                  </div>
                </div>

                {/* Segmented control */}
                <div style={{ display: 'flex', gap: '3px', flexShrink: 0 }}>
                  {PERM_OPTS.map(opt => {
                    const isActive = current === opt.value;
                    const label = opt.value === 'default' ? `Rol (${defaultLabel})` : opt.label;
                    return (
                      <button key={opt.value} onClick={() => setValue(mod.key, opt.value)}
                        title={label}
                        style={{
                          background: isActive ? opt.bg : 'transparent',
                          border: `1px solid ${isActive ? opt.color + '55' : C.border}`,
                          borderRadius: '6px',
                          padding: '4px 8px',
                          color: isActive ? opt.color : C.textMuted,
                          fontSize: '0.7rem',
                          fontWeight: isActive ? 700 : 500,
                          cursor: 'pointer',
                          whiteSpace: 'nowrap',
                          transition: 'all 0.15s',
                        }}
                        onMouseEnter={e => { if (!isActive) { e.currentTarget.style.background = opt.bg; e.currentTarget.style.color = opt.color; } }}
                        onMouseLeave={e => { if (!isActive) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = C.textMuted; } }}
                      >
                        {opt.value === 'default' ? `Rol` : opt.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {error && <div style={{ ...S.alertError, marginTop: '14px' }}>{error}</div>}

        <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
          <button onClick={handleSave} disabled={saving}
            style={{ ...S.btnGold, flex: 1, opacity: saving ? 0.6 : 1 }}>
            {saving ? 'Guardando...' : 'Guardar permisos'}
          </button>
          <button onClick={onClose} style={{ ...S.btnGhost }}>Cancelar</button>
        </div>
      </div>
    </div>
  );
}

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
              type="tel"
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
              <option value="marketing">Marketing</option>
              <option value="arquitectura">Arquitectura</option>
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
  const [reenviando, setReenviando] = useState(null);
  const [editando, setEditando] = useState(null);
  const [permisosUsuario, setPermisosUsuario] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [confirmSignout, setConfirmSignout] = useState(null);

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

  const handleSignout = async (id) => {
    await api.users.signout(token, id);
    setConfirmSignout(null);
  };

  return (
    <AppLayout>
      <div style={{ padding: '28px 32px', maxWidth: '820px' }}>

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
                <option value="marketing">Marketing</option>
                <option value="arquitectura">Arquitectura</option>
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
          <p style={{ color: C.textMuted, fontSize: '0.78rem', marginBottom: '14px' }}>
            💡 Para dar o quitar menús a un usuario <strong>sin cambiarle el rol</strong>, usá el botón <strong style={{ color: '#8b5cf6' }}>«Permisos»</strong>.
          </p>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '32px', color: C.textMuted, fontSize: '0.9rem' }}>Cargando...</div>
          ) : usuarios.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '32px', color: C.textMuted, fontSize: '0.9rem' }}>No hay usuarios registrados</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
              {usuarios.map((u, i) => {
                const rolStyle = ROL_STYLE[u.rol] || ROL_STYLE.cliente;
                const overrideCount = Object.keys(u.permisos || {}).length;
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
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                      <span style={{ ...rolStyle, padding: '3px 10px', borderRadius: '20px', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.04em' }}>
                        {ROL_LABEL[u.rol] || u.rol}
                      </span>
                      {overrideCount > 0 && (
                        <span title={`${overrideCount} permiso${overrideCount !== 1 ? 's' : ''} personalizado${overrideCount !== 1 ? 's' : ''}`}
                          style={{ background: 'rgba(139,92,246,0.15)', color: '#8b5cf6', padding: '2px 7px', borderRadius: '20px', fontSize: '0.68rem', fontWeight: 700 }}>
                          {overrideCount} perm.
                        </span>
                      )}
                    </div>
                    <div style={{ display: 'flex', gap: '5px', flexShrink: 0, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                      <button onClick={() => setEditando(u)}
                        style={{ background: C.goldDim, border: 'none', borderRadius: '6px', padding: '5px 10px', color: C.gold, cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600 }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(212,165,116,0.3)'}
                        onMouseLeave={e => e.currentTarget.style.background = C.goldDim}>
                        Editar
                      </button>
                      <button onClick={() => setPermisosUsuario(u)}
                        style={{ background: 'rgba(139,92,246,0.12)', border: 'none', borderRadius: '6px', padding: '5px 10px', color: '#8b5cf6', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600 }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(139,92,246,0.25)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'rgba(139,92,246,0.12)'}>
                        Permisos
                      </button>
                      <button onClick={() => setConfirmSignout(u)} title="Forzar cierre de sesión"
                        style={{ background: 'rgba(102,126,234,0.12)', border: 'none', borderRadius: '6px', padding: '5px 10px', color: '#667eea', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600 }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(102,126,234,0.25)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'rgba(102,126,234,0.12)'}>
                        Cerrar sesión
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

      {/* Permisos modal */}
      {permisosUsuario && (
        <PermisosModal
          usuario={permisosUsuario}
          onClose={() => setPermisosUsuario(null)}
          onSave={handleSave}
        />
      )}

      {/* Edit modal */}
      {editando && (
        <EditModal usuario={editando} onClose={() => setEditando(null)} onSave={handleSave} />
      )}

      {/* Signout confirm modal */}
      {confirmSignout && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}
          onClick={e => e.target === e.currentTarget && setConfirmSignout(null)}>
          <div style={{ ...S.card, width: '100%', maxWidth: '360px', textAlign: 'center' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>🔒</div>
            <h2 style={{ color: '#667eea', fontSize: '1.1rem', fontWeight: 700, marginBottom: '8px' }}>Cerrar sesión del usuario</h2>
            <p style={{ color: C.textSub, fontSize: '0.9rem', marginBottom: '4px' }}>{confirmSignout.nombre}</p>
            <p style={{ color: C.textMuted, fontSize: '0.82rem', marginBottom: '24px' }}>{confirmSignout.email}</p>
            <p style={{ color: C.textMuted, fontSize: '0.82rem', marginBottom: '24px' }}>
              El próximo request del usuario será rechazado y tendrá que volver a iniciar sesión.
            </p>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => handleSignout(confirmSignout.id)}
                style={{ flex: 1, background: 'rgba(102,126,234,0.15)', border: '1px solid rgba(102,126,234,0.3)', borderRadius: '8px', padding: '10px', color: '#667eea', fontWeight: 700, cursor: 'pointer', fontSize: '0.9rem' }}>
                Sí, cerrar sesión
              </button>
              <button onClick={() => setConfirmSignout(null)} style={{ ...S.btnGhost, flex: 1 }}>Cancelar</button>
            </div>
          </div>
        </div>
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
