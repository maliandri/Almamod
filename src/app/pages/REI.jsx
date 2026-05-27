import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { api } from '../lib/api';
import AppLayout from '../components/AppLayout';
import { C, S, inputFocus, inputBlur } from '../styles';

const ESTADO_COLOR = {
  borrador:  { bg: 'rgba(148,163,184,0.12)', text: C.textMuted },
  entregado: { bg: C.greenDim, text: C.green },
};

function EstadoBadge({ estado }) {
  const col = ESTADO_COLOR[estado] || ESTADO_COLOR.borrador;
  return (
    <span style={{ background: col.bg, color: col.text, fontSize: '0.7rem', fontWeight: 700, padding: '2px 8px', borderRadius: '20px', letterSpacing: '0.04em', whiteSpace: 'nowrap' }}>
      {estado === 'entregado' ? '✓ Entregado' : 'Borrador'}
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
        placeholder="Buscar componente..."
        style={{ ...S.input }} onFocus={inputFocus} onBlur={inputBlur} />
      {open && filtered.length > 0 && (
        <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: '#1e2d4a', border: `1px solid ${C.border}`, borderRadius: '8px', zIndex: 20, maxHeight: '200px', overflowY: 'auto', marginTop: '2px' }}>
          {filtered.map(p => (
            <div key={p.id} onMouseDown={() => { onAdd(p); setQuery(''); setOpen(false); }}
              style={{ padding: '9px 14px', cursor: 'pointer', borderBottom: `1px solid rgba(255,255,255,0.04)`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.07)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
              <span style={{ color: C.text, fontSize: '0.85rem' }}>{p.nombre}</span>
              <div style={{ display: 'flex', gap: '8px' }}>
                <span style={{ color: C.textMuted, fontSize: '0.72rem' }}>{p.codigo}</span>
                <span style={{ color: (p.stock_actual || 0) < (p.stock_minimo || 0) ? '#ef4444' : C.textMuted, fontSize: '0.72rem' }}>
                  Stock: {p.stock_actual ?? 0}
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
  const [partes, setPartes]   = useState([]);
  const [ots, setOts]         = useState([]);
  const [modelos, setModelos] = useState([]);
  const [etapas, setEtapas]   = useState([]);

  const [items, setItems]           = useState([]);
  const [notas, setNotas]           = useState('');
  const [otId, setOtId]             = useState('');
  const [modeloId, setModeloId]     = useState('');
  const [etapaId, setEtapaId]       = useState('');
  const [loadingEtapa, setLoadingEtapa] = useState(false);
  const [saving, setSaving]         = useState(false);
  const [error, setError]           = useState('');

  useEffect(() => {
    api.partes.list(token).then(d => setPartes(d.partes || [])).catch(() => {});
    api.ot.list(token).then(d => setOts((d.ots || []).filter(o => o.estado !== 'cancelada' && o.estado !== 'completada'))).catch(() => {});
    api.modelos.list(token).then(d => setModelos(d.modelos || [])).catch(() => {});
  }, [token]);

  // Cargar etapas cuando cambia el modelo
  useEffect(() => {
    setEtapaId('');
    if (!modeloId) { setEtapas([]); return; }
    api.etapasProduccion.list(token, modeloId)
      .then(d => setEtapas(d.etapas || []))
      .catch(() => {});
  }, [modeloId, token]);

  const addItem = (parte) => {
    if (items.find(i => i.parte_id === parte.id)) return;
    setItems(prev => [...prev, { parte_id: parte.id, parte, cantidad: 1 }]);
  };

  const cargarDesdeEtapa = async () => {
    if (!etapaId || !modeloId) return;
    setLoadingEtapa(true);
    try {
      const d = await api.rei.itemsFromEtapa(token, etapaId, modeloId);
      for (const it of (d.items || [])) {
        if (!items.find(i => i.parte_id === it.parte_id)) {
          setItems(prev => [...prev, {
            parte_id: it.parte_id,
            parte: it.partes,
            cantidad: it.cantidad_necesaria || 1,
          }]);
        }
      }
    } finally { setLoadingEtapa(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!items.length) { setError('Agregá al menos un ítem'); return; }
    setSaving(true); setError('');
    try {
      await api.rei.create(token, {
        notas,
        ot_id:               otId    || undefined,
        etapa_produccion_id: etapaId || undefined,
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
      <div style={{ ...S.card, background: '#1a2035', width: '100%', maxWidth: '580px', marginTop: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ ...S.h2, margin: 0, color: C.gold }}>Nuevo REI</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: C.textMuted, fontSize: '1.4rem', cursor: 'pointer', lineHeight: 1 }}>×</button>
        </div>
        <form onSubmit={handleSubmit}>
          {/* Vincular a OT (opcional) */}
          <div style={{ marginBottom: '14px' }}>
            <label style={S.label}>Vincular a OT (opcional)</label>
            <select value={otId} onChange={e => setOtId(e.target.value)}
              style={{ ...S.input }} onFocus={inputFocus} onBlur={inputBlur}>
              <option value="">— Sin OT —</option>
              {ots.map(o => <option key={o.id} value={o.id}>OT #{String(o.numero).padStart(3,'0')} · {o.titulo}</option>)}
            </select>
          </div>

          {/* Cargar desde etapa BOM */}
          <div style={{ marginBottom: '16px', padding: '14px', background: C.goldDim, borderRadius: '10px', border: `1px solid ${C.goldBorder}` }}>
            <div style={{ color: C.gold, fontSize: '0.78rem', fontWeight: 700, marginBottom: '10px', letterSpacing: '0.04em' }}>
              CARGAR DESDE ETAPA BOM
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '8px', alignItems: 'end' }}>
              <div>
                <label style={{ ...S.label, marginBottom: '4px' }}>Modelo</label>
                <select value={modeloId} onChange={e => setModeloId(e.target.value)}
                  style={{ ...S.input }} onFocus={inputFocus} onBlur={inputBlur}>
                  <option value="">— Modelo —</option>
                  {modelos.map(m => <option key={m.id} value={m.id}>{m.nombre}</option>)}
                </select>
              </div>
              <div>
                <label style={{ ...S.label, marginBottom: '4px' }}>Etapa</label>
                <select value={etapaId} onChange={e => setEtapaId(e.target.value)} disabled={!modeloId || !etapas.length}
                  style={{ ...S.input }} onFocus={inputFocus} onBlur={inputBlur}>
                  <option value="">— Etapa —</option>
                  {etapas.map(ep => <option key={ep.id} value={ep.id}>{ep.nombre}</option>)}
                </select>
              </div>
              <button type="button" onClick={cargarDesdeEtapa} disabled={!etapaId || loadingEtapa}
                style={{ ...S.btnGold, padding: '9px 14px', fontSize: '0.8rem', opacity: !etapaId ? 0.5 : 1, whiteSpace: 'nowrap' }}>
                {loadingEtapa ? '...' : '↓ Cargar'}
              </button>
            </div>
          </div>

          {/* Buscar y agregar partes manualmente */}
          <div style={{ marginBottom: '10px' }}>
            <label style={S.label}>Agregar componente manual</label>
            <PartePicker partes={partes} onAdd={addItem} />
          </div>

          {/* Lista de ítems */}
          {items.length > 0 && (
            <div style={{ marginBottom: '16px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {items.map(item => (
                <div key={item.parte_id} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', background: C.goldDim, borderRadius: '8px' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ color: C.text, fontSize: '0.85rem' }}>{item.parte?.nombre}</div>
                    <div style={{ color: C.textMuted, fontSize: '0.72rem' }}>{item.parte?.codigo} · {item.parte?.unidad} · Stock: {item.parte?.stock_actual ?? 0}</div>
                  </div>
                  <input type="number" min="0.01" step="any" value={item.cantidad}
                    onChange={e => setItems(prev => prev.map(i => i.parte_id === item.parte_id ? { ...i, cantidad: e.target.value } : i))}
                    style={{ ...S.input, width: '72px', padding: '5px 8px', textAlign: 'center', fontSize: '0.85rem' }}
                    onFocus={inputFocus} onBlur={inputBlur} />
                  <button type="button" onClick={() => setItems(prev => prev.filter(i => i.parte_id !== item.parte_id))}
                    style={{ background: 'none', border: 'none', color: C.red, cursor: 'pointer', fontSize: '1.1rem', lineHeight: 1 }}>×</button>
                </div>
              ))}
            </div>
          )}

          <div style={{ marginBottom: '16px' }}>
            <label style={S.label}>Notas</label>
            <textarea value={notas} onChange={e => setNotas(e.target.value)} rows={2}
              style={{ ...S.input, resize: 'vertical', fontFamily: 'inherit', minHeight: '52px' }}
              onFocus={inputFocus} onBlur={inputBlur} />
          </div>

          {error && <div style={{ ...S.alertError, marginBottom: '14px' }}>{error}</div>}
          <div style={{ display: 'flex', gap: '10px' }}>
            <button type="submit" disabled={saving || !items.length}
              style={{ ...S.btnGold, flex: 1, opacity: saving || !items.length ? 0.6 : 1 }}>
              {saving ? 'Guardando...' : `Crear REI (${items.length} ítem${items.length !== 1 ? 's' : ''})`}
            </button>
            <button type="button" onClick={onClose} style={S.btnGhost}>Cancelar</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function REIRow({ rei, onRefresh }) {
  const { token } = useAuth();
  const [expanded, setExpanded] = useState(false);
  const [detail, setDetail]     = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const expand = async () => {
    if (!expanded && !detail) {
      const d = await api.rei.get(token, rei.id);
      setDetail(d.rei);
    }
    setExpanded(v => !v);
  };

  const entregar = async () => {
    if (!confirm(`¿Confirmar entrega de REI #${String(rei.numero).padStart(3,'0')}? El stock de los ítems se actualizará automáticamente.`)) return;
    setActionLoading(true);
    try {
      await api.rei.entregar(token, rei.id);
      onRefresh();
    } finally { setActionLoading(false); }
  };

  return (
    <div style={{ ...S.card, padding: 0, overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 16px', flexWrap: 'wrap', cursor: 'pointer' }}
        onClick={expand}>
        <span style={{ color: C.textMuted, fontSize: '0.78rem', fontWeight: 600, minWidth: '44px' }}>
          #{String(rei.numero).padStart(3, '0')}
        </span>
        <EstadoBadge estado={rei.estado} />
        <span style={{ color: C.textMuted, fontSize: '0.8rem' }}>
          {rei.rei_items?.length || 0} ítem{rei.rei_items?.length !== 1 ? 's' : ''}
        </span>
        {rei.ot && (
          <span style={{ color: C.textMuted, fontSize: '0.8rem' }}>
            OT #{String(rei.ot.numero).padStart(3,'0')} · {rei.ot.titulo}
          </span>
        )}
        {rei.notas && (
          <span style={{ flex: 1, color: C.textSub, fontSize: '0.82rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', minWidth: 0 }}>
            {rei.notas}
          </span>
        )}
        <span style={{ color: C.textMuted, fontSize: '0.75rem', marginLeft: 'auto' }}>
          {rei.entregado_en
            ? new Date(rei.entregado_en).toLocaleDateString('es-AR')
            : new Date(rei.created_at).toLocaleDateString('es-AR')
          }
        </span>
        <span style={{ color: C.textMuted, fontSize: '0.75rem' }}>{expanded ? '▲' : '▼'}</span>
      </div>

      {rei.estado === 'borrador' && (
        <div style={{ padding: '0 16px 12px' }} onClick={e => e.stopPropagation()}>
          <button onClick={entregar} disabled={actionLoading}
            style={{ padding: '6px 16px', fontSize: '0.8rem', background: C.greenDim, color: C.green, border: `1px solid rgba(16,185,129,0.3)`, borderRadius: '7px', cursor: 'pointer', fontWeight: 700 }}>
            {actionLoading ? '...' : '📦 Confirmar entrega'}
          </button>
        </div>
      )}

      {expanded && (
        <div style={{ borderTop: `1px solid ${C.border}`, padding: '14px 16px', background: 'rgba(0,0,0,0.15)' }}>
          {!detail ? (
            <div style={{ color: C.textMuted, fontSize: '0.82rem' }}>Cargando...</div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
              <thead>
                <tr>
                  {['Código', 'Componente', 'Unidad', 'Cantidad', 'Stock'].map(h => (
                    <th key={h} style={{ textAlign: 'left', color: C.textMuted, fontWeight: 600, padding: '4px 8px', borderBottom: `1px solid ${C.border}` }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(detail.rei_items || []).map(it => (
                  <tr key={it.id}>
                    <td style={{ padding: '6px 8px', color: C.textMuted }}>{it.partes?.codigo}</td>
                    <td style={{ padding: '6px 8px', color: C.text }}>{it.partes?.nombre}</td>
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

export default function REI() {
  const { token } = useAuth();
  const [reis, setReis]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [creando, setCreando] = useState(false);
  const [error, setError]   = useState('');

  const cargar = () => {
    setLoading(true);
    api.rei.list(token)
      .then(d => setReis(d.reis || []))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { cargar(); }, [token]);

  return (
    <AppLayout>
      <div className="admin-page" style={{ padding: '28px 32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '8px' }}>
          <div>
            <h1 style={{ ...S.h1, margin: 0 }}>📦 Remitos Entrega Insumo</h1>
            <p style={{ color: C.textMuted, fontSize: '0.85rem', marginTop: '4px', marginBottom: 0 }}>
              Entrega interna de componentes desde depósito
            </p>
          </div>
          <button onClick={() => setCreando(true)} style={{ ...S.btnGold, padding: '9px 18px', fontSize: '0.85rem' }}>
            + Nuevo REI
          </button>
        </div>

        {error && <div style={{ ...S.alertError, margin: '16px 0' }}>{error}</div>}

        <div style={{ marginTop: '24px' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '48px', color: C.textMuted }}>Cargando...</div>
          ) : reis.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px', color: C.textMuted }}>No hay remitos de insumo aún</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {reis.map(r => <REIRow key={r.id} rei={r} onRefresh={cargar} />)}
            </div>
          )}
        </div>
      </div>

      {creando && <CrearModal onClose={() => setCreando(false)} onCreado={cargar} />}
    </AppLayout>
  );
}
