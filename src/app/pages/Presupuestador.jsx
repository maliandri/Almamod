import { useState, useEffect } from 'react';
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
  costo_total: 0,
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
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(FORM_INICIAL);

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
  }, [token]);

  const handleCostoChange = (v) => {
    const costo = Number(v) || 0;
    const margen = Number(form.margen_pct) || 0;
    setForm(f => ({ ...f, costo_total: costo, precio_total: Math.round(costo * (1 + margen / 100)) }));
  };

  const handleMargenChange = (v) => {
    const margen = Number(v) || 0;
    const costo = Number(form.costo_total) || 0;
    setForm(f => ({ ...f, margen_pct: margen, precio_total: Math.round(costo * (1 + margen / 100)) }));
  };

  const handlePrecioChange = (v) => {
    const precio = Number(v) || 0;
    const costo = Number(form.costo_total) || 0;
    const margen = costo > 0 ? ((precio / costo - 1) * 100) : Number(form.margen_pct) || 0;
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
        costo_total: presupuesto.costo_total ?? 0,
        precio_total: presupuesto.precio_total ?? 0,
        notas: presupuesto.notas || '',
        estado: presupuesto.estado || 'borrador',
        items: (presupuesto.items || []).map(it => ({ descripcion: it.descripcion })),
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

  const seleccionarModelo = (modelo_id) => {
    if (!modelo_id) {
      setForm(f => ({ ...f, modelo_id: '', modelo_nombre: '', modelo_descripcion: '', items: [], precio_total: 0 }));
      return;
    }
    const modelo = modelos.find(m => String(m.id) === String(modelo_id));
    if (!modelo) return;
    const ventajas = Array.isArray(modelo.ventajas) ? modelo.ventajas : [];
    setForm(f => ({
      ...f,
      modelo_id,
      modelo_nombre: modelo.nombre || '',
      modelo_descripcion: modelo.descripcion || '',
      items: ventajas.map(v => ({ descripcion: v })),
      precio_total: Number(modelo.precio) || 0,
    }));
  };

  const agregarCaracteristica = () => {
    setForm(f => ({ ...f, items: [...f.items, { descripcion: '' }] }));
  };

  const actualizarCaracteristica = (idx, value) => {
    setForm(f => ({
      ...f,
      items: f.items.map((it, i) => i === idx ? { ...it, descripcion: value } : it),
    }));
  };

  const eliminarCaracteristica = (idx) => {
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
        costo_total: form.costo_total,
        precio_total: form.precio_total,
        notas: form.notas,
        estado: form.estado,
        items: form.items
          .filter(it => it.descripcion && it.descripcion.trim())
          .map((it, idx) => ({ descripcion: it.descripcion.trim(), orden: idx })),
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

        {/* Características incluidas */}
        <div style={{ ...S.card, marginBottom: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <h2 style={{ ...S.h2, margin: 0 }}>Características incluidas</h2>
            <button onClick={agregarCaracteristica} style={{ ...S.btnGhost, fontSize: '0.8rem', padding: '6px 12px' }}>+ Agregar característica</button>
          </div>

          {form.items.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '24px', color: C.textMuted, fontSize: '0.85rem' }}>
              Sin características. Seleccioná un modelo del catálogo o agregá manualmente.
            </div>
          ) : (
            <div>
              {form.items.map((it, idx) => (
                <div key={idx} style={{ display: 'flex', gap: '8px', padding: '6px 0', alignItems: 'center' }}>
                  <input value={it.descripcion} onChange={e => actualizarCaracteristica(idx, e.target.value)}
                    placeholder="Ej: Aislación térmica SIP de alta eficiencia"
                    style={{ ...S.input, padding: '8px 10px', fontSize: '0.85rem', flex: 1 }} onFocus={inputFocus} onBlur={inputBlur} />
                  <button onClick={() => eliminarCaracteristica(idx)} style={{ background: 'rgba(239,68,68,0.1)', border: 'none', borderRadius: '6px', padding: '7px 10px', color: '#ef4444', cursor: 'pointer', fontSize: '0.8rem' }}>×</button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Totales */}
        <div style={{ ...S.card, marginBottom: '16px' }}>
          <h2 style={S.h2}>Totales</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px', alignItems: 'end' }}>
            <div>
              <label style={S.label}>Costo total</label>
              <input type="number" min="0" step="1" value={form.costo_total} onChange={e => handleCostoChange(e.target.value)}
                style={S.input} onFocus={inputFocus} onBlur={inputBlur} />
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
