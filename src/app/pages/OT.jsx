import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../hooks/useAuth';
import { api } from '../lib/api';
import AppLayout from '../components/AppLayout';
import { C, S, inputFocus, inputBlur } from '../styles';

const ESTADO_COLOR = {
  pendiente:  { bg: C.yellowDim, text: C.yellow },
  en_proceso: { bg: C.blueDim,   text: C.blue },
  completada: { bg: C.greenDim,  text: C.green },
  cancelada:  { bg: C.redDim,    text: '#ef4444' },
};
const ESTADO_LABEL  = { pendiente: 'Pendiente', en_proceso: 'En proceso', completada: 'Completada', cancelada: 'Cancelada' };
const TIPO_COLOR    = { fabricacion: { bg: 'rgba(139,92,246,0.15)', text: '#8b5cf6' }, servicio: { bg: C.goldDim, text: C.gold } };

const TIPO_INC_COLOR = { avance: { bg: C.blueDim, text: C.blue }, incidencia: { bg: C.redDim, text: '#ef4444' } };
const TIPO_INC_LABEL = { avance: 'Avance', incidencia: 'Incidencia' };

const CLOUD_NAME = 'dlshym1te';
const UPLOAD_PRESET = 'almamod_cms';

async function uploadFoto(file) {
  const fd = new FormData();
  fd.append('file', file);
  fd.append('upload_preset', UPLOAD_PRESET);
  fd.append('folder', 'almamod/produccion');
  const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, { method: 'POST', body: fd });
  const data = await res.json();
  if (data.error) throw new Error(data.error.message);
  return data.secure_url;
}

function EstadoBadge({ estado }) {
  const col = ESTADO_COLOR[estado] || ESTADO_COLOR.pendiente;
  return <span style={{ background: col.bg, color: col.text, fontSize: '0.7rem', fontWeight: 700, padding: '2px 8px', borderRadius: '20px', letterSpacing: '0.04em', whiteSpace: 'nowrap' }}>{ESTADO_LABEL[estado] || estado}</span>;
}
function TipoBadge({ tipo }) {
  const col = TIPO_COLOR[tipo] || TIPO_COLOR.servicio;
  return <span style={{ background: col.bg, color: col.text, fontSize: '0.68rem', fontWeight: 700, padding: '2px 8px', borderRadius: '20px', letterSpacing: '0.04em', whiteSpace: 'nowrap' }}>{tipo === 'fabricacion' ? 'Fabricación' : 'Servicio'}</span>;
}

function CrearModal({ onClose, onCreado }) {
  const { token } = useAuth();
  const [tipo, setTipo] = useState('fabricacion');
  const [form, setForm] = useState({ titulo: '', descripcion: '', obra_id: '', modelo_id: '', fecha_inicio: '', fecha_entrega: '' });
  const [obras, setObras] = useState([]);
  const [modelos, setModelos] = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api.obras.list(token).then(d => setObras((d.obras || []).filter(o => o.estado === 'activa'))).catch(() => {});
    api.modelos.list(token).then(d => setModelos(d.modelos || [])).catch(() => {});
  }, [token]);

  // Auto-generar título cuando se seleccionan obra + modelo en fabricación
  useEffect(() => {
    if (tipo === 'fabricacion' && form.obra_id && form.modelo_id) {
      const obra   = obras.find(o => o.id === form.obra_id);
      const modelo = modelos.find(m => m.id === form.modelo_id);
      if (obra && modelo && !form.titulo)
        setForm(p => ({ ...p, titulo: `${modelo.nombre} — Obra #${obra.numero_obra}` }));
    }
  }, [form.obra_id, form.modelo_id, tipo]);

  const f = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true); setError('');
    try {
      await api.ot.create(token, {
        tipo,
        titulo:        form.titulo,
        descripcion:   form.descripcion   || undefined,
        obra_id:       tipo === 'fabricacion' && form.obra_id    ? form.obra_id    : undefined,
        modelo_id:     tipo === 'fabricacion' && form.modelo_id  ? form.modelo_id  : undefined,
        fecha_inicio:  form.fecha_inicio  || undefined,
        fecha_entrega: form.fecha_entrega || undefined,
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
          <h2 style={{ ...S.h2, margin: 0, color: C.gold }}>Nueva OT</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: C.textMuted, fontSize: '1.4rem', cursor: 'pointer', lineHeight: 1 }}>×</button>
        </div>
        <form onSubmit={handleSubmit}>
          {/* Tipo */}
          <div style={{ marginBottom: '18px' }}>
            <label style={S.label}>Tipo de orden</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              {[['fabricacion', '🏗️ Fabricación'], ['servicio', '🔧 Servicio']].map(([val, label]) => (
                <button key={val} type="button" onClick={() => setTipo(val)}
                  style={{ flex: 1, padding: '10px', borderRadius: '8px', border: `2px solid ${tipo === val ? C.gold : C.border}`, background: tipo === val ? C.goldDim : 'transparent', color: tipo === val ? C.gold : C.textMuted, cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem', transition: 'all 0.15s' }}>
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Campos según tipo */}
          {tipo === 'fabricacion' && (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                <div>
                  <label style={S.label}>Obra</label>
                  <select value={form.obra_id} onChange={e => f('obra_id', e.target.value)}
                    style={{ ...S.input }} onFocus={inputFocus} onBlur={inputBlur}>
                    <option value="">— Seleccionar —</option>
                    {obras.map(o => <option key={o.id} value={o.id}>Obra #{o.numero_obra}{o.nombre_contacto ? ` · ${o.nombre_contacto}` : ''}</option>)}
                  </select>
                </div>
                <div>
                  <label style={S.label}>Modelo</label>
                  <select value={form.modelo_id} onChange={e => f('modelo_id', e.target.value)}
                    style={{ ...S.input }} onFocus={inputFocus} onBlur={inputBlur}>
                    <option value="">— Seleccionar —</option>
                    {modelos.map(m => <option key={m.id} value={m.id}>{m.nombre}</option>)}
                  </select>
                </div>
              </div>
            </>
          )}

          <div style={{ marginBottom: '14px' }}>
            <label style={S.label}>Título *</label>
            <input required value={form.titulo} onChange={e => f('titulo', e.target.value)}
              placeholder={tipo === 'fabricacion' ? 'Ej: Alma 36 — Obra #12' : 'Ej: Mantenimiento generador'}
              style={S.input} onFocus={inputFocus} onBlur={inputBlur} />
          </div>

          <div style={{ marginBottom: '14px' }}>
            <label style={S.label}>Descripción</label>
            <textarea value={form.descripcion} onChange={e => f('descripcion', e.target.value)}
              rows={2} placeholder="Detalles adicionales..."
              style={{ ...S.input, resize: 'vertical', fontFamily: 'inherit', minHeight: '56px' }}
              onFocus={inputFocus} onBlur={inputBlur} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
            <div>
              <label style={S.label}>Fecha inicio</label>
              <input type="date" value={form.fecha_inicio} onChange={e => f('fecha_inicio', e.target.value)}
                style={S.input} onFocus={inputFocus} onBlur={inputBlur} />
            </div>
            <div>
              <label style={S.label}>Fecha entrega</label>
              <input type="date" value={form.fecha_entrega} onChange={e => f('fecha_entrega', e.target.value)}
                style={S.input} onFocus={inputFocus} onBlur={inputBlur} />
            </div>
          </div>

          {error && <div style={{ ...S.alertError, marginBottom: '14px' }}>{error}</div>}
          <div style={{ display: 'flex', gap: '10px' }}>
            <button type="submit" disabled={saving} style={{ ...S.btnGold, flex: 1, opacity: saving ? 0.6 : 1 }}>
              {saving ? 'Guardando...' : 'Crear OT'}
            </button>
            <button type="button" onClick={onClose} style={S.btnGhost}>Cancelar</button>
          </div>
        </form>
      </div>
    </div>
  );
}

const TRANSICIONES = {
  pendiente:  { label: 'Iniciar', next: 'en_proceso', color: C.blue },
  en_proceso: { label: 'Completar', next: 'completada', color: C.green },
};

function IncidenciasPanel({ ot }) {
  const { token } = useAuth();
  const fileRef = useRef();
  const [incidencias, setIncidencias] = useState([]);
  const [etapas, setEtapas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tipo, setTipo] = useState('avance');
  const [etapaId, setEtapaId] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [foto, setFoto] = useState(null);
  const [fotoPreview, setFotoPreview] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const cargar = () => {
    setLoading(true);
    api.otIncidencias.list(token, ot.id)
      .then(d => setIncidencias(d.incidencias || []))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    cargar();
    if (ot.modelo_id) {
      api.etapasProduccion.list(token, ot.modelo_id).then(d => setEtapas(d.etapas || [])).catch(() => {});
    }
  }, [ot.id]);

  const handleFile = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFoto(f);
    const reader = new FileReader();
    reader.onload = ev => setFotoPreview(ev.target.result);
    reader.readAsDataURL(f);
    e.target.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!descripcion.trim()) return;
    setSaving(true); setError('');
    try {
      let fotos = [];
      if (foto) fotos = [await uploadFoto(foto)];
      await api.otIncidencias.create(token, {
        ot_id: ot.id,
        etapa_produccion_id: etapaId || undefined,
        tipo,
        descripcion: descripcion.trim(),
        fotos,
      });
      setDescripcion(''); setFoto(null); setFotoPreview(null); setTipo('avance'); setEtapaId('');
      cargar();
    } catch (err) {
      setError(err.message);
    } finally { setSaving(false); }
  };

  const eliminar = async (id) => {
    if (!confirm('¿Eliminar este registro?')) return;
    await api.otIncidencias.delete(token, id);
    cargar();
  };

  return (
    <div style={{ borderTop: `1px solid ${C.border}`, padding: '14px 16px', background: 'rgba(0,0,0,0.15)' }} onClick={e => e.stopPropagation()}>
      <div style={{ color: C.gold, fontSize: '0.78rem', fontWeight: 700, marginBottom: '10px', letterSpacing: '0.04em' }}>
        AVANCES E INCIDENCIAS
      </div>

      <form onSubmit={handleSubmit} style={{ marginBottom: '14px' }}>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '8px' }}>
          <div style={{ display: 'flex', gap: '6px' }}>
            {[['avance', '📈 Avance'], ['incidencia', '⚠️ Incidencia']].map(([val, label]) => (
              <button key={val} type="button" onClick={() => setTipo(val)}
                style={{ padding: '6px 12px', borderRadius: '7px', border: `1px solid ${tipo === val ? C.gold : C.border}`, background: tipo === val ? C.goldDim : 'transparent', color: tipo === val ? C.gold : C.textMuted, cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600 }}>
                {label}
              </button>
            ))}
          </div>
          {etapas.length > 0 && (
            <select value={etapaId} onChange={e => setEtapaId(e.target.value)}
              style={{ ...S.input, width: 'auto', fontSize: '0.8rem', padding: '6px 10px' }}
              onFocus={inputFocus} onBlur={inputBlur}>
              <option value="">— Sin etapa —</option>
              {etapas.map(ep => <option key={ep.id} value={ep.id}>{ep.nombre}</option>)}
            </select>
          )}
        </div>
        <textarea value={descripcion} onChange={e => setDescripcion(e.target.value)} rows={2}
          placeholder="Detalle del avance o incidencia..."
          style={{ ...S.input, resize: 'vertical', fontFamily: 'inherit', minHeight: '50px', marginBottom: '8px' }}
          onFocus={inputFocus} onBlur={inputBlur} />
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <button type="button" onClick={() => fileRef.current?.click()} style={{ ...S.btnGhost, padding: '6px 12px', fontSize: '0.78rem' }}>
            📷 {foto ? foto.name : 'Adjuntar foto'}
          </button>
          <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFile} />
          <button type="submit" disabled={saving || !descripcion.trim()}
            style={{ ...S.btnGold, padding: '6px 16px', fontSize: '0.8rem', opacity: (saving || !descripcion.trim()) ? 0.5 : 1 }}>
            {saving ? 'Guardando...' : '+ Agregar'}
          </button>
        </div>
        {fotoPreview && <img src={fotoPreview} alt="" style={{ marginTop: '8px', maxHeight: '90px', borderRadius: '6px' }} />}
        {error && <div style={{ ...S.alertError, marginTop: '8px', fontSize: '0.78rem' }}>{error}</div>}
      </form>

      {loading ? (
        <div style={{ color: C.textMuted, fontSize: '0.8rem' }}>Cargando...</div>
      ) : incidencias.length === 0 ? (
        <div style={{ color: C.textMuted, fontSize: '0.8rem' }}>Sin registros todavía</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {incidencias.map(inc => {
            const col = TIPO_INC_COLOR[inc.tipo] || TIPO_INC_COLOR.avance;
            return (
              <div key={inc.id} style={{ padding: '8px 12px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', borderLeft: `3px solid ${col.text}` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '4px' }}>
                  <span style={{ background: col.bg, color: col.text, fontSize: '0.68rem', fontWeight: 700, padding: '1px 8px', borderRadius: '20px' }}>
                    {TIPO_INC_LABEL[inc.tipo] || inc.tipo}
                  </span>
                  {inc.etapas_produccion && (
                    <span style={{ color: C.textMuted, fontSize: '0.72rem' }}>· {inc.etapas_produccion.nombre}</span>
                  )}
                  <span style={{ color: C.textMuted, fontSize: '0.7rem', marginLeft: 'auto' }}>
                    {inc.usuario?.nombre ? `${inc.usuario.nombre} · ` : ''}
                    {new Date(inc.created_at).toLocaleString('es-AR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <button onClick={() => eliminar(inc.id)} style={{ background: 'none', border: 'none', color: C.red, cursor: 'pointer', fontSize: '0.9rem', lineHeight: 1 }}>×</button>
                </div>
                <div style={{ color: C.text, fontSize: '0.84rem' }}>{inc.descripcion}</div>
                {inc.fotos?.length > 0 && (
                  <div style={{ display: 'flex', gap: '6px', marginTop: '6px', flexWrap: 'wrap' }}>
                    {inc.fotos.map((url, i) => (
                      <a key={i} href={url} target="_blank" rel="noreferrer">
                        <img src={url} alt="" style={{ height: '60px', borderRadius: '6px', objectFit: 'cover' }} />
                      </a>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function OTRow({ ot, onRefresh }) {
  const { token } = useAuth();
  const [actionLoading, setActionLoading] = useState(null);
  const [expanded, setExpanded] = useState(false);

  const avanzar = async () => {
    const t = TRANSICIONES[ot.estado];
    if (!t) return;
    setActionLoading('avanzar');
    try {
      await api.ot.update(token, { id: ot.id, estado: t.next });
      onRefresh();
    } finally { setActionLoading(null); }
  };

  const cancelar = async () => {
    if (!confirm('¿Cancelar esta OT?')) return;
    setActionLoading('cancelar');
    try {
      await api.ot.update(token, { id: ot.id, estado: 'cancelada' });
      onRefresh();
    } finally { setActionLoading(null); }
  };

  const trans = TRANSICIONES[ot.estado];

  return (
    <div style={{ ...S.card, padding: 0, overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', padding: '14px 16px', cursor: 'pointer' }}
        onClick={() => setExpanded(v => !v)}>
        <span style={{ color: C.textMuted, fontSize: '0.78rem', fontWeight: 600, minWidth: '44px' }}>
          #{String(ot.numero).padStart(3, '0')}
        </span>
        <TipoBadge tipo={ot.tipo} />
        <EstadoBadge estado={ot.estado} />

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ color: C.text, fontSize: '0.88rem', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ot.titulo}</div>
          {(ot.obras || ot.modelos) && (
            <div style={{ color: C.textMuted, fontSize: '0.75rem', marginTop: '2px' }}>
              {ot.obras && `Obra #${ot.obras.numero_obra}`}
              {ot.obras && ot.modelos && ' · '}
              {ot.modelos && ot.modelos.nombre}
            </div>
          )}
        </div>

        {ot.fecha_entrega && (
          <div style={{ textAlign: 'right', flexShrink: 0 }}>
            <div style={{ color: C.textMuted, fontSize: '0.7rem' }}>Entrega</div>
            <div style={{ color: C.text, fontSize: '0.8rem' }}>{new Date(ot.fecha_entrega + 'T00:00').toLocaleDateString('es-AR')}</div>
          </div>
        )}

        <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }} onClick={e => e.stopPropagation()}>
          {trans && (
            <button onClick={avanzar} disabled={!!actionLoading}
              style={{ padding: '5px 14px', fontSize: '0.78rem', background: `rgba(${trans.color === C.blue ? '102,126,234' : '16,185,129'},0.15)`, color: trans.color, border: `1px solid ${trans.color}33`, borderRadius: '7px', cursor: 'pointer', fontWeight: 600 }}>
              {actionLoading === 'avanzar' ? '...' : trans.label}
            </button>
          )}
          {!['completada', 'cancelada'].includes(ot.estado) && (
            <button onClick={cancelar} disabled={!!actionLoading}
              style={{ padding: '5px 10px', fontSize: '0.78rem', background: C.redDim, color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '7px', cursor: 'pointer', fontWeight: 600 }}>
              ✕
            </button>
          )}
        </div>

        <span style={{ color: C.textMuted, fontSize: '0.75rem' }}>{expanded ? '▲' : '▼'}</span>
      </div>

      {expanded && <IncidenciasPanel ot={ot} />}
    </div>
  );
}

export default function OT() {
  const { token } = useAuth();
  const [ots, setOts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creando, setCreando] = useState(false);
  const [filtroEstado, setFiltroEstado] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('');
  const [error, setError] = useState('');

  const cargar = () => {
    setLoading(true);
    api.ot.list(token)
      .then(d => setOts(d.ots || []))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { cargar(); }, [token]);

  const filtradas = ots.filter(o =>
    (!filtroEstado || o.estado === filtroEstado) &&
    (!filtroTipo   || o.tipo   === filtroTipo)
  );

  const chipStyle = (activo) => ({
    padding: '4px 12px', borderRadius: '20px', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer', border: 'none',
    background: activo ? C.goldDim : 'rgba(255,255,255,0.06)',
    color: activo ? C.gold : C.textMuted,
  });

  return (
    <AppLayout>
      <div className="admin-page" style={{ padding: '28px 32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '8px' }}>
          <div>
            <h1 style={{ ...S.h1, margin: 0 }}>🔧 Órdenes de Trabajo</h1>
            <p style={{ color: C.textMuted, fontSize: '0.85rem', marginTop: '4px', marginBottom: 0 }}>
              Fabricación de módulos y trabajos de servicio
            </p>
          </div>
          <button onClick={() => setCreando(true)} style={{ ...S.btnGold, padding: '9px 18px', fontSize: '0.85rem' }}>
            + Nueva OT
          </button>
        </div>

        {/* Filtros */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '18px', marginBottom: '16px' }}>
          <button onClick={() => setFiltroEstado('')} style={chipStyle(!filtroEstado)}>Todos</button>
          {Object.entries(ESTADO_LABEL).map(([k, v]) => (
            <button key={k} onClick={() => setFiltroEstado(filtroEstado === k ? '' : k)} style={chipStyle(filtroEstado === k)}>{v}</button>
          ))}
          <div style={{ width: '1px', background: C.border, margin: '0 4px' }} />
          {[['fabricacion', '🏗️ Fab.'], ['servicio', '🔧 Serv.']].map(([k, v]) => (
            <button key={k} onClick={() => setFiltroTipo(filtroTipo === k ? '' : k)} style={chipStyle(filtroTipo === k)}>{v}</button>
          ))}
        </div>

        {error && <div style={{ ...S.alertError, marginBottom: '16px' }}>{error}</div>}

        {loading ? (
          <div style={{ textAlign: 'center', padding: '48px', color: C.textMuted }}>Cargando...</div>
        ) : filtradas.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px', color: C.textMuted }}>No hay órdenes de trabajo</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {filtradas.map(ot => <OTRow key={ot.id} ot={ot} onRefresh={cargar} />)}
          </div>
        )}
      </div>

      {creando && <CrearModal onClose={() => setCreando(false)} onCreado={cargar} />}
    </AppLayout>
  );
}
