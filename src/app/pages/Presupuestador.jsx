import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../hooks/useAuth';
import { api } from '../lib/api';
import AppLayout from '../components/AppLayout';
import { C, S, inputFocus, inputBlur } from '../styles';

const ESTADO_STYLE = {
  borrador:  { bg: 'rgba(148,163,184,0.15)', text: '#94a3b8', label: 'Borrador' },
  enviado:   { bg: C.blueDim,                text: C.blue,    label: 'Enviado' },
  aprobado:  { bg: C.greenDim,               text: C.green,   label: 'Aprobado' },
  rechazado: { bg: C.redDim,                 text: '#ef4444', label: 'Rechazado' },
};

function EstadoBadge({ estado }) {
  const e = ESTADO_STYLE[estado] || ESTADO_STYLE.borrador;
  return (
    <span style={{ background: e.bg, color: e.text, fontSize: '0.7rem', fontWeight: 700, padding: '3px 9px', borderRadius: '20px', whiteSpace: 'nowrap' }}>
      {e.label}
    </span>
  );
}

const money = (v) => `$${Number(v || 0).toLocaleString('es-AR', { maximumFractionDigits: 0 })}`;

const FORM_INICIAL = {
  tipo_modelo: 'catalogo',
  modelo_id: '',
  modelo_nombre: '',
  modelo_descripcion: '',
  cliente_nombre: '',
  cliente_contacto: '',
  cliente_direccion: '',
  margen_pct: 30,
  precio_total: 0,
  notas: '',
  estado: 'borrador',
  items: [],
};

export default function Presupuestador() {
  const { token } = useAuth();
  const [view, setView] = useState('lista'); // lista | form
  const [presupuestos, setPresupuestos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const [modelos, setModelos] = useState([]);
  const [partes, setPartes] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(FORM_INICIAL);
  const [addingItem, setAddingItem] = useState(false);
  const [parteSearch, setParteSearch] = useState('');

  const cargarLista = () => {
    setLoading(true);
    api.presupuestos.list(token)
      .then(d => setPresupuestos(d.presupuestos || []))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { cargarLista(); }, [token]);

  useEffect(() => {
    api.modelos.list(token).then(d => setModelos((d.modelos || []).filter(m => m.activo !== false)));
    api.partes.list(token).then(d => setPartes(d.partes || []));
  }, [token]);

  const costoTotal = useMemo(() =>
    form.items.reduce((sum, it) => sum + (Number(it.cantidad) || 0) * (Number(it.costo_unitario) || 0), 0)
  , [form.items]);

  // Recalcula precio_total cuando cambia el costo o el margen
  useEffect(() => {
    setForm(f => ({ ...f, precio_total: Math.round(costoTotal * (1 + (Number(f.margen_pct) || 0) / 100)) }));
  }, [costoTotal]);

  const handleMargenChange = (v) => {
    const margen = Number(v) || 0;
    setForm(f => ({ ...f, margen_pct: margen, precio_total: Math.round(costoTotal * (1 + margen / 100)) }));
  };

  const handlePrecioChange = (v) => {
    const precio = Number(v) || 0;
    const margen = costoTotal > 0 ? ((precio / costoTotal - 1) * 100) : 0;
    setForm(f => ({ ...f, precio_total: precio, margen_pct: Math.round(margen * 100) / 100 }));
  };

  const nuevoPresupuesto = () => {
    setEditingId(null);
    setForm(FORM_INICIAL);
    setError('');
    setView('form');
  };

  const editarPresupuesto = async (id) => {
    setError('');
    try {
      const { presupuesto } = await api.presupuestos.get(token, id);
      setEditingId(id);
      setForm({
        tipo_modelo: presupuesto.modelo_id ? 'catalogo' : 'personalizado',
        modelo_id: presupuesto.modelo_id || '',
        modelo_nombre: presupuesto.modelo_nombre || '',
        modelo_descripcion: presupuesto.modelo_descripcion || '',
        cliente_nombre: presupuesto.cliente_nombre || '',
        cliente_contacto: presupuesto.cliente_contacto || '',
        cliente_direccion: presupuesto.cliente_direccion || '',
        margen_pct: presupuesto.margen_pct ?? 30,
        precio_total: presupuesto.precio_total ?? 0,
        notas: presupuesto.notas || '',
        estado: presupuesto.estado || 'borrador',
        items: (presupuesto.items || []).map(it => ({
          parte_id: it.parte_id || null,
          descripcion: it.descripcion,
          unidad: it.unidad || '',
          cantidad: it.cantidad,
          costo_unitario: it.costo_unitario,
        })),
      });
      setView('form');
    } catch (err) {
      setError(err.message);
    }
  };

  const eliminarPresupuesto = async (id) => {
    if (!confirm('¿Eliminar este presupuesto?')) return;
    try {
      await api.presupuestos.delete(token, id);
      setPresupuestos(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      setError(err.message);
    }
  };

  const cambiarTipoModelo = (tipo) => {
    setForm(f => ({
      ...f,
      tipo_modelo: tipo,
      modelo_id: '',
      modelo_nombre: tipo === 'personalizado' ? f.modelo_nombre : '',
      items: tipo === 'personalizado' ? f.items : [],
    }));
  };

  const seleccionarModelo = async (modelo_id) => {
    if (!modelo_id) {
      setForm(f => ({ ...f, modelo_id: '', modelo_nombre: '', items: [] }));
      return;
    }
    const modelo = modelos.find(m => String(m.id) === String(modelo_id));
    try {
      const { partes: bomItems } = await api.bom.list(token, modelo_id);
      const items = (bomItems || []).map(b => ({
        parte_id: b.partes?.id || null,
        descripcion: b.partes?.nombre || '',
        unidad: b.partes?.unidad || '',
        cantidad: b.cantidad_necesaria,
        costo_unitario: b.partes?.costo || 0,
      }));
      setForm(f => ({ ...f, modelo_id, modelo_nombre: modelo?.nombre || '', items }));
    } catch (err) {
      setError(err.message);
    }
  };

  const agregarItemLibre = () => {
    setForm(f => ({ ...f, items: [...f.items, { parte_id: null, descripcion: '', unidad: '', cantidad: 1, costo_unitario: 0 }] }));
  };

  const agregarItemParte = (parte) => {
    setForm(f => ({ ...f, items: [...f.items, { parte_id: parte.id, descripcion: parte.nombre, unidad: parte.unidad, cantidad: 1, costo_unitario: parte.costo || 0 }] }));
    setAddingItem(false);
    setParteSearch('');
  };

  const actualizarItem = (idx, field, value) => {
    setForm(f => ({
      ...f,
      items: f.items.map((it, i) => i === idx ? { ...it, [field]: value } : it),
    }));
  };

  const eliminarItem = (idx) => {
    setForm(f => ({ ...f, items: f.items.filter((_, i) => i !== idx) }));
  };

  const guardar = async () => {
    setError('');
    if (form.tipo_modelo === 'catalogo' && !form.modelo_id) return setError('Seleccioná un modelo del catálogo');
    if (form.tipo_modelo === 'personalizado' && !form.modelo_nombre.trim()) return setError('Ingresá un nombre para el modelo personalizado');

    setSaving(true);
    try {
      const payload = {
        modelo_id: form.tipo_modelo === 'catalogo' ? Number(form.modelo_id) : null,
        modelo_nombre: form.modelo_nombre,
        modelo_descripcion: form.modelo_descripcion,
        cliente_nombre: form.cliente_nombre,
        cliente_contacto: form.cliente_contacto,
        cliente_direccion: form.cliente_direccion,
        margen_pct: form.margen_pct,
        costo_total: costoTotal,
        precio_total: form.precio_total,
        notas: form.notas,
        estado: form.estado,
        items: form.items.map((it, idx) => ({ ...it, orden: idx })),
      };
      if (editingId) {
        await api.presupuestos.update(token, { id: editingId, ...payload });
      } else {
        await api.presupuestos.create(token, payload);
      }
      cargarLista();
      setView('lista');
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const partesFiltradas = partes.filter(p =>
    !parteSearch || p.nombre.toLowerCase().includes(parteSearch.toLowerCase()) || p.codigo.toLowerCase().includes(parteSearch.toLowerCase())
  );

  // ------------------------------------------------------------------
  // Vista: lista
  // ------------------------------------------------------------------
  if (view === 'lista') {
    return (
      <AppLayout>
        <div style={S.page}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
            <h1 style={{ ...S.h1, margin: 0 }}>🧮 Presupuestador</h1>
            <button onClick={nuevoPresupuesto} style={S.btnGold}>+ Nuevo presupuesto</button>
          </div>

          {error && <div style={{ ...S.alertError, marginBottom: '16px' }}>{error}</div>}

          {loading ? (
            <div style={{ textAlign: 'center', padding: '48px', color: C.textMuted }}>Cargando...</div>
          ) : presupuestos.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '64px', color: C.textMuted }}>
              <div style={{ fontSize: '3rem', marginBottom: '12px' }}>🧮</div>
              <p>Todavía no hay presupuestos creados</p>
            </div>
          ) : (
            <div style={{ ...S.card, padding: 0, overflow: 'hidden' }}>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '720px' }}>
                  <thead>
                    <tr style={{ borderBottom: `1px solid ${C.border}` }}>
                      {['#', 'Cliente', 'Modelo', 'Margen', 'Costo', 'Precio', 'Estado', 'Fecha', ''].map(h => (
                        <th key={h} style={{ textAlign: 'left', padding: '10px 14px', color: C.textMuted, fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {presupuestos.map((p, i) => (
                      <tr key={p.id} style={{ borderBottom: `1px solid ${C.border}`, background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)' }}>
                        <td style={{ padding: '10px 14px', color: C.gold, fontFamily: 'monospace', fontSize: '0.8rem' }}>#{String(p.numero).padStart(3, '0')}</td>
                        <td style={{ padding: '10px 14px', color: C.text, fontSize: '0.85rem' }}>{p.cliente_nombre || '—'}</td>
                        <td style={{ padding: '10px 14px', color: C.textSub, fontSize: '0.85rem' }}>{p.modelos?.nombre || p.modelo_nombre}</td>
                        <td style={{ padding: '10px 14px', color: C.textMuted, fontSize: '0.85rem' }}>{Number(p.margen_pct).toFixed(0)}%</td>
                        <td style={{ padding: '10px 14px', color: C.textSub, fontSize: '0.85rem' }}>{money(p.costo_total)}</td>
                        <td style={{ padding: '10px 14px', color: C.gold, fontWeight: 700, fontSize: '0.85rem' }}>{money(p.precio_total)}</td>
                        <td style={{ padding: '10px 14px' }}><EstadoBadge estado={p.estado} /></td>
                        <td style={{ padding: '10px 14px', color: C.textMuted, fontSize: '0.78rem', whiteSpace: 'nowrap' }}>{new Date(p.created_at).toLocaleDateString('es-AR')}</td>
                        <td style={{ padding: '10px 14px', whiteSpace: 'nowrap' }}>
                          <button onClick={() => editarPresupuesto(p.id)} style={{ ...S.btnGhost, padding: '5px 10px', fontSize: '0.75rem', marginRight: '6px' }}>Ver/Editar</button>
                          <button onClick={() => api.presupuestos.pdf(token, p.id, p.numero)} style={{ ...S.btnGhost, padding: '5px 10px', fontSize: '0.75rem', marginRight: '6px' }}>PDF</button>
                          <button onClick={() => eliminarPresupuesto(p.id)} style={{ ...S.btnDanger, padding: '5px 10px', fontSize: '0.75rem' }}>×</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </AppLayout>
    );
  }

  // ------------------------------------------------------------------
  // Vista: formulario
  // ------------------------------------------------------------------
  return (
    <AppLayout>
      <div style={S.page}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
          <h1 style={{ ...S.h1, margin: 0 }}>🧮 {editingId ? 'Editar presupuesto' : 'Nuevo presupuesto'}</h1>
          <button onClick={() => setView('lista')} style={S.btnGhost}>← Volver al listado</button>
        </div>

        {error && <div style={{ ...S.alertError, marginBottom: '16px' }}>{error}</div>}

        {/* Datos del cliente */}
        <div style={{ ...S.card, marginBottom: '16px' }}>
          <h2 style={S.h2}>Cliente</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
            <div>
              <label style={S.label}>Nombre</label>
              <input value={form.cliente_nombre} onChange={e => setForm(f => ({ ...f, cliente_nombre: e.target.value }))}
                style={S.input} onFocus={inputFocus} onBlur={inputBlur} />
            </div>
            <div>
              <label style={S.label}>Contacto (tel/email)</label>
              <input value={form.cliente_contacto} onChange={e => setForm(f => ({ ...f, cliente_contacto: e.target.value }))}
                style={S.input} onFocus={inputFocus} onBlur={inputBlur} />
            </div>
            <div>
              <label style={S.label}>Dirección</label>
              <input value={form.cliente_direccion} onChange={e => setForm(f => ({ ...f, cliente_direccion: e.target.value }))}
                style={S.input} onFocus={inputFocus} onBlur={inputBlur} />
            </div>
          </div>
        </div>

        {/* Modelo */}
        <div style={{ ...S.card, marginBottom: '16px' }}>
          <h2 style={S.h2}>Modelo</h2>
          <div style={{ display: 'flex', gap: '10px', marginBottom: '14px' }}>
            <button onClick={() => cambiarTipoModelo('catalogo')}
              style={{ ...S.btnGhost, ...(form.tipo_modelo === 'catalogo' ? { background: C.goldDim, borderColor: C.gold } : {}) }}>
              📦 Modelo del catálogo
            </button>
            <button onClick={() => cambiarTipoModelo('personalizado')}
              style={{ ...S.btnGhost, ...(form.tipo_modelo === 'personalizado' ? { background: C.goldDim, borderColor: C.gold } : {}) }}>
              ✏️ Personalizado
            </button>
          </div>

          {form.tipo_modelo === 'catalogo' ? (
            <div>
              <label style={S.label}>Modelo</label>
              <select value={form.modelo_id} onChange={e => seleccionarModelo(e.target.value)} style={{ ...S.select, minWidth: '240px' }}>
                <option value="">Seleccioná un modelo</option>
                {modelos.map(m => <option key={m.id} value={m.id}>{m.nombre} ({m.superficie}m²)</option>)}
              </select>
            </div>
          ) : (
            <div>
              <label style={S.label}>Nombre del modelo / proyecto</label>
              <input value={form.modelo_nombre} onChange={e => setForm(f => ({ ...f, modelo_nombre: e.target.value }))}
                placeholder="Ej: Casa a medida 45m²" style={{ ...S.input, marginBottom: '14px' }} onFocus={inputFocus} onBlur={inputBlur} />
            </div>
          )}

          <div style={{ marginTop: '14px' }}>
            <label style={S.label}>Descripción</label>
            <textarea value={form.modelo_descripcion} onChange={e => setForm(f => ({ ...f, modelo_descripcion: e.target.value }))}
              rows={3} style={{ ...S.input, resize: 'vertical', fontFamily: 'inherit' }} onFocus={inputFocus} onBlur={inputBlur} />
          </div>
        </div>

        {/* Items */}
        <div style={{ ...S.card, marginBottom: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <h2 style={{ ...S.h2, margin: 0 }}>Ítems</h2>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={() => setAddingItem(v => !v)} style={{ ...S.btnGhost, fontSize: '0.8rem', padding: '6px 12px' }}>+ Del catálogo</button>
              <button onClick={agregarItemLibre} style={{ ...S.btnGhost, fontSize: '0.8rem', padding: '6px 12px' }}>+ Ítem libre</button>
            </div>
          </div>

          {addingItem && (
            <div style={{ marginBottom: '14px', padding: '10px', border: `1px solid ${C.border}`, borderRadius: '8px' }}>
              <input
                autoFocus
                value={parteSearch}
                onChange={e => setParteSearch(e.target.value)}
                placeholder="Buscar parte por código o nombre..."
                style={{ ...S.input, marginBottom: '8px' }}
                onFocus={inputFocus} onBlur={inputBlur}
              />
              <div style={{ maxHeight: '180px', overflowY: 'auto' }}>
                {partesFiltradas.slice(0, 30).map(p => (
                  <button key={p.id}
                    onMouseDown={e => e.preventDefault()}
                    onClick={() => agregarItemParte(p)}
                    style={{ display: 'flex', width: '100%', padding: '6px 10px', background: 'transparent', border: 'none', borderBottom: `1px solid ${C.border}`, color: C.textSub, cursor: 'pointer', textAlign: 'left', fontSize: '0.85rem', gap: '8px', alignItems: 'center' }}
                    onMouseEnter={e => { e.currentTarget.style.background = C.goldDim; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                  >
                    <span style={{ color: C.gold, fontFamily: 'monospace', fontSize: '0.78rem', minWidth: '90px' }}>{p.codigo}</span>
                    <span style={{ flex: 1 }}>{p.nombre}</span>
                    <span style={{ color: C.textMuted, fontSize: '0.78rem' }}>{money(p.costo)}</span>
                  </button>
                ))}
                {partesFiltradas.length === 0 && <div style={{ color: C.textMuted, fontSize: '0.85rem', padding: '8px' }}>Sin resultados</div>}
              </div>
              <button onClick={() => { setAddingItem(false); setParteSearch(''); }} style={{ ...S.btnGhost, marginTop: '8px', fontSize: '0.8rem', padding: '5px 12px' }}>Cancelar</button>
            </div>
          )}

          {form.items.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '24px', color: C.textMuted, fontSize: '0.85rem' }}>
              Sin ítems. Agregá partes del catálogo o ítems libres.
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <div style={{ minWidth: '640px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 90px 90px 130px 130px 36px', gap: '8px', padding: '0 0 8px', borderBottom: `1px solid ${C.border}` }}>
                  {['Descripción', 'Unidad', 'Cant.', 'Costo unit.', 'Subtotal', ''].map(h => (
                    <div key={h} style={{ color: C.textMuted, fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{h}</div>
                  ))}
                </div>
                {form.items.map((it, idx) => {
                  const subtotal = (Number(it.cantidad) || 0) * (Number(it.costo_unitario) || 0);
                  return (
                    <div key={idx} style={{ display: 'grid', gridTemplateColumns: '1fr 90px 90px 130px 130px 36px', gap: '8px', padding: '8px 0', borderBottom: `1px solid ${C.border}`, alignItems: 'center' }}>
                      <input value={it.descripcion} onChange={e => actualizarItem(idx, 'descripcion', e.target.value)}
                        disabled={!!it.parte_id}
                        style={{ ...S.input, padding: '6px 10px', fontSize: '0.85rem', opacity: it.parte_id ? 0.7 : 1 }} onFocus={inputFocus} onBlur={inputBlur} />
                      <input value={it.unidad} onChange={e => actualizarItem(idx, 'unidad', e.target.value)}
                        disabled={!!it.parte_id}
                        style={{ ...S.input, padding: '6px 10px', fontSize: '0.85rem', opacity: it.parte_id ? 0.7 : 1 }} onFocus={inputFocus} onBlur={inputBlur} />
                      <input type="number" min="0" step="0.01" value={it.cantidad} onChange={e => actualizarItem(idx, 'cantidad', e.target.value)}
                        style={{ ...S.input, padding: '6px 10px', fontSize: '0.85rem', textAlign: 'center' }} onFocus={inputFocus} onBlur={inputBlur} />
                      <input type="number" min="0" step="0.01" value={it.costo_unitario} onChange={e => actualizarItem(idx, 'costo_unitario', e.target.value)}
                        style={{ ...S.input, padding: '6px 10px', fontSize: '0.85rem', textAlign: 'right' }} onFocus={inputFocus} onBlur={inputBlur} />
                      <div style={{ color: C.textSub, fontSize: '0.85rem', textAlign: 'right', paddingRight: '8px' }}>{money(subtotal)}</div>
                      <button onClick={() => eliminarItem(idx)} style={{ background: 'rgba(239,68,68,0.1)', border: 'none', borderRadius: '6px', padding: '5px 8px', color: '#ef4444', cursor: 'pointer', fontSize: '0.8rem' }}>×</button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Totales */}
        <div style={{ ...S.card, marginBottom: '16px' }}>
          <h2 style={S.h2}>Totales</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px', alignItems: 'end' }}>
            <div>
              <label style={S.label}>Costo total</label>
              <div style={{ ...S.input, background: 'rgba(255,255,255,0.02)', color: C.textSub, fontWeight: 600 }}>{money(costoTotal)}</div>
            </div>
            <div>
              <label style={S.label}>Margen %</label>
              <input type="number" min="0" step="1" value={form.margen_pct} onChange={e => handleMargenChange(e.target.value)}
                style={S.input} onFocus={inputFocus} onBlur={inputBlur} />
            </div>
            <div>
              <label style={S.label}>Precio total</label>
              <input type="number" min="0" step="1" value={form.precio_total} onChange={e => handlePrecioChange(e.target.value)}
                style={{ ...S.input, color: C.gold, fontWeight: 700 }} onFocus={inputFocus} onBlur={inputBlur} />
            </div>
            <div>
              <label style={S.label}>Estado</label>
              <select value={form.estado} onChange={e => setForm(f => ({ ...f, estado: e.target.value }))} style={S.select}>
                {Object.entries(ESTADO_STYLE).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
              </select>
            </div>
          </div>

          <div style={{ marginTop: '14px' }}>
            <label style={S.label}>Notas</label>
            <textarea value={form.notas} onChange={e => setForm(f => ({ ...f, notas: e.target.value }))}
              rows={3} style={{ ...S.input, resize: 'vertical', fontFamily: 'inherit' }} onFocus={inputFocus} onBlur={inputBlur} />
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
          <button onClick={() => setView('lista')} style={S.btnGhost}>Cancelar</button>
          <button onClick={guardar} disabled={saving} style={{ ...S.btnGold, opacity: saving ? 0.6 : 1 }}>
            {saving ? 'Guardando...' : 'Guardar presupuesto'}
          </button>
        </div>
      </div>
    </AppLayout>
  );
}
