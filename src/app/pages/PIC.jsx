import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../hooks/useAuth';
import { api } from '../lib/api';
import AppLayout from '../components/AppLayout';
import { C, S, inputFocus, inputBlur } from '../styles';

const ESTADO_COLOR = {
  pendiente: { bg: C.yellowDim, text: C.yellow },
  aprobado:  { bg: C.blueDim,   text: C.blue },
  comprado:  { bg: C.greenDim,  text: C.green },
  cancelado: { bg: C.redDim,    text: '#ef4444' },
};
const ESTADO_LABEL = { pendiente: 'Pendiente', aprobado: 'Aprobado', comprado: 'Comprado', cancelado: 'Cancelado' };

function EstadoBadge({ estado }) {
  const col = ESTADO_COLOR[estado] || ESTADO_COLOR.pendiente;
  return (
    <span style={{ background: col.bg, color: col.text, fontSize: '0.7rem', fontWeight: 700, padding: '2px 8px', borderRadius: '20px', letterSpacing: '0.04em', whiteSpace: 'nowrap' }}>
      {ESTADO_LABEL[estado] || estado}
    </span>
  );
}

function PartePicker({ partes, onAdd }) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);

  const filtered = query.length > 1
    ? partes.filter(p =>
        p.nombre.toLowerCase().includes(query.toLowerCase()) ||
        (p.codigo || '').toLowerCase().includes(query.toLowerCase())
      ).slice(0, 8)
    : [];

  return (
    <div style={{ position: 'relative' }}>
      <input value={query} onChange={e => { setQuery(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)} onBlur={() => setTimeout(() => setOpen(false), 160)}
        placeholder="Buscar componente por código o nombre..."
        style={{ ...S.input }} onFocus={inputFocus} onBlur={inputBlur} />
      {open && filtered.length > 0 && (
        <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: '#1e2d4a', border: `1px solid ${C.border}`, borderRadius: '8px', zIndex: 20, maxHeight: '200px', overflowY: 'auto', marginTop: '2px' }}>
          {filtered.map(p => (
            <div key={p.id} onMouseDown={() => { onAdd(p); setQuery(''); setOpen(false); }}
              style={{ padding: '9px 14px', cursor: 'pointer', borderBottom: `1px solid rgba(255,255,255,0.04)`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.07)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
              <span style={{ color: C.text, fontSize: '0.85rem' }}>{p.nombre}</span>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <span style={{ color: C.textMuted, fontSize: '0.72rem' }}>{p.codigo}</span>
                <span style={{ color: p.stock_actual < (p.stock_minimo || 0) ? '#ef4444' : C.textMuted, fontSize: '0.72rem' }}>
                  Stock: {p.stock_actual}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function CrearModal({ onClose, onCreado }) {
  const { token } = useAuth();
  const [partes, setPartes] = useState([]);
  const [items, setItems] = useState([]);
  const [notas, setNotas] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api.partes.list(token).then(d => setPartes(d.partes || [])).catch(() => {});
  }, [token]);

  const addItem = (parte) => {
    if (items.find(i => i.parte_id === parte.id)) return;
    setItems(prev => [...prev, { parte_id: parte.id, parte, cantidad: 1 }]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!items.length) { setError('Agregá al menos un ítem'); return; }
    setSaving(true); setError('');
    try {
      await api.pic.create(token, {
        notas,
        items: items.map(i => ({ parte_id: i.parte_id, cantidad: Number(i.cantidad) })),
      });
      onCreado();
      onClose();
    } catch (err) {
      setError(err.message);
    } finally { setSaving(false); }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 50, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '24px 16px', overflowY: 'auto' }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ ...S.card, background: '#1a2035', width: '100%', maxWidth: '560px', marginTop: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ ...S.h2, margin: 0, color: C.gold }}>Nuevo PIC</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: C.textMuted, fontSize: '1.4rem', cursor: 'pointer', lineHeight: 1 }}>×</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label style={S.label}>Motivo / Notas</label>
            <textarea value={notas} onChange={e => setNotas(e.target.value)} rows={2}
              placeholder="Ej: Stock bajo en paneles SIP, urgente para obra #5"
              style={{ ...S.input, resize: 'vertical', fontFamily: 'inherit', minHeight: '58px' }}
              onFocus={inputFocus} onBlur={inputBlur} />
          </div>

          <div style={{ marginBottom: '10px' }}>
            <label style={S.label}>Agregar componente</label>
            <PartePicker partes={partes} onAdd={addItem} />
          </div>

          {items.length > 0 && (
            <div style={{ marginBottom: '20px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {items.map(item => (
                <div key={item.parte_id} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', background: C.goldDim, borderRadius: '8px' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ color: C.text, fontSize: '0.85rem' }}>{item.parte.nombre}</div>
                    <div style={{ color: C.textMuted, fontSize: '0.72rem' }}>{item.parte.codigo} · {item.parte.unidad}</div>
                  </div>
                  <input type="number" min="0.01" step="any" value={item.cantidad}
                    onChange={e => setItems(prev => prev.map(i => i.parte_id === item.parte_id ? { ...i, cantidad: e.target.value } : i))}
                    style={{ ...S.input, width: '72px', padding: '5px 8px', textAlign: 'center', fontSize: '0.85rem' }}
                    onFocus={inputFocus} onBlur={inputBlur} />
                  <button type="button" onClick={() => setItems(prev => prev.filter(i => i.parte_id !== item.parte_id))}
                    style={{ background: 'none', border: 'none', color: C.red, cursor: 'pointer', fontSize: '1.1rem', lineHeight: 1, padding: '0 2px' }}>×</button>
                </div>
              ))}
            </div>
          )}

          {error && <div style={{ ...S.alertError, marginBottom: '14px' }}>{error}</div>}
          <div style={{ display: 'flex', gap: '10px' }}>
            <button type="submit" disabled={saving || !items.length}
              style={{ ...S.btnGold, flex: 1, opacity: saving || !items.length ? 0.6 : 1 }}>
              {saving ? 'Guardando...' : `Crear PIC (${items.length} ítem${items.length !== 1 ? 's' : ''})`}
            </button>
            <button type="button" onClick={onClose} style={S.btnGhost}>Cancelar</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function PICRow({ pic, onRefresh, canApprove }) {
  const { token } = useAuth();
  const [expanded, setExpanded] = useState(false);
  const [detail, setDetail] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);

  const expand = async () => {
    if (!expanded && !detail) {
      const d = await api.pic.get(token, pic.id);
      setDetail(d.pic);
    }
    setExpanded(v => !v);
  };

  const cambiarEstado = async (estado) => {
    setActionLoading(estado);
    try {
      await api.pic.update(token, { id: pic.id, estado });
      onRefresh();
    } finally { setActionLoading(null); }
  };

  const activo = !['comprado', 'cancelado'].includes(pic.estado);

  return (
    <div style={{ ...S.card, padding: 0, overflow: 'hidden' }}>
      {/* Fila principal */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 16px', flexWrap: 'wrap', cursor: 'pointer' }}
        onClick={expand}>
        <span style={{ color: C.textMuted, fontSize: '0.78rem', fontWeight: 600, minWidth: '44px' }}>
          #{String(pic.numero).padStart(3, '0')}
        </span>
        <EstadoBadge estado={pic.estado} />
        <span style={{ color: C.textMuted, fontSize: '0.8rem' }}>
          {pic.pic_items?.length || 0} ítem{pic.pic_items?.length !== 1 ? 's' : ''}
        </span>
        {pic.notas && (
          <span style={{ flex: 1, color: C.textSub, fontSize: '0.82rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', minWidth: 0 }}>
            {pic.notas}
          </span>
        )}
        <span style={{ color: C.textMuted, fontSize: '0.75rem', marginLeft: 'auto' }}>
          {new Date(pic.created_at).toLocaleDateString('es-AR')}
        </span>
        <span style={{ color: C.textMuted, fontSize: '0.75rem' }}>{expanded ? '▲' : '▼'}</span>
      </div>

      {/* Acciones */}
      {activo && (
        <div style={{ padding: '0 16px 12px', display: 'flex', gap: '6px', flexWrap: 'wrap' }} onClick={e => e.stopPropagation()}>
          {pic.estado === 'pendiente' && canApprove && (
            <button onClick={() => cambiarEstado('aprobado')} disabled={!!actionLoading}
              style={{ ...S.btnGold, padding: '5px 14px', fontSize: '0.78rem' }}>
              {actionLoading === 'aprobado' ? '...' : 'Aprobar'}
            </button>
          )}
          {pic.estado === 'aprobado' && (
            <button onClick={() => cambiarEstado('comprado')} disabled={!!actionLoading}
              style={{ padding: '5px 14px', fontSize: '0.78rem', background: C.greenDim, color: C.green, border: `1px solid rgba(16,185,129,0.3)`, borderRadius: '7px', cursor: 'pointer', fontWeight: 600 }}>
              {actionLoading === 'comprado' ? '...' : '✓ Marcar Comprado'}
            </button>
          )}
          {['pendiente', 'aprobado'].includes(pic.estado) && (
            <button onClick={() => { if (confirm('¿Cancelar este PIC?')) cambiarEstado('cancelado'); }}
              disabled={!!actionLoading}
              style={{ padding: '5px 14px', fontSize: '0.78rem', background: C.redDim, color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '7px', cursor: 'pointer', fontWeight: 600 }}>
              Cancelar
            </button>
          )}
        </div>
      )}

      {/* Detalle expandido */}
      {expanded && (
        <div style={{ borderTop: `1px solid ${C.border}`, padding: '14px 16px', background: 'rgba(0,0,0,0.15)' }}>
          {!detail ? (
            <div style={{ color: C.textMuted, fontSize: '0.82rem' }}>Cargando...</div>
          ) : detail.pic_items?.length === 0 ? (
            <div style={{ color: C.textMuted, fontSize: '0.82rem' }}>Sin ítems</div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
              <thead>
                <tr>
                  {['Código', 'Componente', 'Unidad', 'Cantidad', 'Stock actual'].map(h => (
                    <th key={h} style={{ textAlign: 'left', color: C.textMuted, fontWeight: 600, padding: '4px 8px', borderBottom: `1px solid ${C.border}` }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {detail.pic_items.map(it => (
                  <tr key={it.id}>
                    <td style={{ padding: '6px 8px', color: C.textMuted }}>{it.partes?.codigo}</td>
                    <td style={{ padding: '6px 8px', color: C.text }}>{it.partes?.nombre || it.descripcion}</td>
                    <td style={{ padding: '6px 8px', color: C.textMuted }}>{it.partes?.unidad}</td>
                    <td style={{ padding: '6px 8px', color: C.gold, fontWeight: 600 }}>{it.cantidad}</td>
                    <td style={{ padding: '6px 8px', color: (it.partes?.stock_actual || 0) < (it.partes?.stock_minimo || 0) ? '#ef4444' : C.textMuted }}>
                      {it.partes?.stock_actual ?? '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}

export default function PIC() {
  const { token, user } = useAuth();
  const [pics, setPics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creando, setCreando] = useState(false);
  const [error, setError] = useState('');

  const canApprove = ['superadmin', 'dueno'].includes(user?.rol);

  const cargar = () => {
    setLoading(true);
    api.pic.list(token)
      .then(d => setPics(d.pics || []))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { cargar(); }, [token]);

  return (
    <AppLayout>
      <div className="admin-page" style={{ padding: '28px 32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '8px' }}>
          <div>
            <h1 style={{ ...S.h1, margin: 0 }}>🛒 Pedidos Internos de Compra</h1>
            <p style={{ color: C.textMuted, fontSize: '0.85rem', marginTop: '4px', marginBottom: 0 }}>
              Solicitudes de compra de materiales e insumos
            </p>
          </div>
          <button onClick={() => setCreando(true)} style={{ ...S.btnGold, padding: '9px 18px', fontSize: '0.85rem' }}>
            + Nuevo PIC
          </button>
        </div>

        {error && <div style={{ ...S.alertError, margin: '16px 0' }}>{error}</div>}

        <div style={{ marginTop: '24px' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '48px', color: C.textMuted }}>Cargando...</div>
          ) : pics.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px', color: C.textMuted }}>No hay pedidos aún</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {pics.map(pic => (
                <PICRow key={pic.id} pic={pic} onRefresh={cargar} canApprove={canApprove} />
              ))}
            </div>
          )}
        </div>
      </div>

      {creando && <CrearModal onClose={() => setCreando(false)} onCreado={cargar} />}
    </AppLayout>
  );
}
