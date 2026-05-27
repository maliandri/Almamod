import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../hooks/useAuth';
import { api } from '../lib/api';
import AppLayout from '../components/AppLayout';
import { C, S, inputFocus, inputBlur } from '../styles';

const CLOUD_NAME = 'dlshym1te';
const UPLOAD_PRESET = 'almamod_cms';
const fotoThumb = url => url?.startsWith('http')
  ? url
  : `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/w_120,h_120,c_fill,q_70,f_auto/${url}`;

async function uploadToCloudinary(file) {
  const fd = new FormData();
  fd.append('file', file);
  fd.append('upload_preset', UPLOAD_PRESET);
  fd.append('folder', 'modulos');
  const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, { method: 'POST', body: fd });
  const data = await res.json();
  if (data.error) throw new Error(data.error.message);
  return data.secure_url;
}

function VentajasEditor({ ventajas, onChange }) {
  const [nueva, setNueva] = useState('');
  const agregar = () => {
    if (!nueva.trim()) return;
    onChange([...ventajas, nueva.trim()]);
    setNueva('');
  };
  return (
    <div>
      <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
        <input value={nueva} onChange={e => setNueva(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), agregar())}
          placeholder="Agregar ventaja..."
          style={{ ...S.input, flex: 1, fontSize: '0.85rem' }} onFocus={inputFocus} onBlur={inputBlur} />
        <button type="button" onClick={agregar} style={{ ...S.btnGold, padding: '8px 14px', fontSize: '0.85rem' }}>+</button>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {ventajas.map((v, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 10px', background: C.goldDim, borderRadius: '6px' }}>
            <span style={{ flex: 1, color: C.textSub, fontSize: '0.85rem' }}>{v}</span>
            <button type="button" onClick={() => onChange(ventajas.filter((_, j) => j !== i))}
              style={{ background: 'none', border: 'none', color: C.red, cursor: 'pointer', fontSize: '1rem', lineHeight: 1 }}>×</button>
          </div>
        ))}
      </div>
    </div>
  );
}

function FotosManager({ fotos, onAdd, onDelete, uploading }) {
  const fileRef = useRef();
  return (
    <div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '10px' }}>
        {fotos.map((url, i) => (
          <div key={i} style={{ position: 'relative', width: '90px', height: '90px', borderRadius: '8px', overflow: 'hidden', border: `1px solid ${C.border}` }}>
            <img src={fotoThumb(url)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            <button type="button" onClick={() => onDelete(i)}
              style={{ position: 'absolute', top: '2px', right: '2px', background: 'rgba(0,0,0,0.7)', border: 'none', borderRadius: '50%', width: '20px', height: '20px', color: '#fff', cursor: 'pointer', fontSize: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
          </div>
        ))}
        <button type="button" onClick={() => fileRef.current?.click()}
          disabled={uploading}
          style={{ width: '90px', height: '90px', background: C.goldDim, border: `2px dashed ${C.goldBorder}`, borderRadius: '8px', color: C.gold, cursor: 'pointer', fontSize: '1.4rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
          {uploading ? <span style={{ fontSize: '0.7rem' }}>...</span> : <>
            <span>+</span>
            <span style={{ fontSize: '0.65rem' }}>Subir foto</span>
          </>}
        </button>
      </div>
      <input ref={fileRef} type="file" accept="image/*" multiple style={{ display: 'none' }}
        onChange={async e => {
          const files = Array.from(e.target.files || []);
          for (const f of files) await onAdd(f);
          e.target.value = '';
        }} />
    </div>
  );
}

function EditModal({ modelo, onClose, onSaved }) {
  const { token } = useAuth();
  const [form, setForm] = useState({
    precio: modelo.precio || '',
    descripcion: modelo.descripcion || '',
    plazo: modelo.plazo || '30 días',
    ventajas: modelo.ventajas || [],
    fotos: modelo.fotos || [],
    imagen_portada: modelo.imagen_portada || '',
  });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const handleUpload = async (file) => {
    setUploading(true);
    try {
      const url = await uploadToCloudinary(file);
      setForm(p => ({ ...p, fotos: [...p.fotos, url] }));
    } catch (err) {
      setError(`Error subiendo foto: ${err.message}`);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true); setError('');
    try {
      await api.cms.modelos.update(token, { id: modelo.id, ...form, precio: Number(form.precio) });
      onSaved();
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 50, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '24px 16px', overflowY: 'auto' }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ ...S.card, background: '#1a2035', width: '100%', maxWidth: '580px', marginTop: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ ...S.h2, margin: 0, color: C.gold }}>{modelo.nombre}</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: C.textMuted, fontSize: '1.4rem', cursor: 'pointer', lineHeight: 1 }}>×</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label style={S.label}>Precio ($) *</label>
            <input type="number" required value={form.precio}
              onChange={e => setForm(p => ({ ...p, precio: e.target.value }))}
              placeholder="58720000" style={S.input} onFocus={inputFocus} onBlur={inputBlur} />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={S.label}>Plazo de entrega</label>
            <input value={form.plazo} onChange={e => setForm(p => ({ ...p, plazo: e.target.value }))}
              placeholder="45 días" style={S.input} onFocus={inputFocus} onBlur={inputBlur} />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={S.label}>Descripción</label>
            <textarea value={form.descripcion}
              onChange={e => setForm(p => ({ ...p, descripcion: e.target.value }))}
              rows={4} placeholder="Descripción del modelo..."
              style={{ ...S.input, resize: 'vertical', minHeight: '100px', fontFamily: 'inherit', lineHeight: 1.5 }}
              onFocus={inputFocus} onBlur={inputBlur} />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={S.label}>Imagen portada (nombre Cloudinary o URL)</label>
            <input value={form.imagen_portada}
              onChange={e => setForm(p => ({ ...p, imagen_portada: e.target.value }))}
              placeholder="ALMAMOD_36_PORTADA.webp o https://..."
              style={S.input} onFocus={inputFocus} onBlur={inputBlur} />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={S.label}>Ventajas (aparecen en la ficha del modelo)</label>
            <VentajasEditor ventajas={form.ventajas} onChange={v => setForm(p => ({ ...p, ventajas: v }))} />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={S.label}>Fotos adicionales</label>
            <div style={{ marginBottom: '6px', color: C.textMuted, fontSize: '0.78rem' }}>
              Las fotos se suben a Cloudinary automáticamente. Requiere preset "almamod_cms" configurado.
            </div>
            <FotosManager
              fotos={form.fotos}
              onAdd={handleUpload}
              onDelete={i => setForm(p => ({ ...p, fotos: p.fotos.filter((_, j) => j !== i) }))}
              uploading={uploading}
            />
          </div>

          {error && <div style={{ ...S.alertError, marginBottom: '14px' }}>{error}</div>}

          <div style={{ display: 'flex', gap: '10px' }}>
            <button type="submit" disabled={saving} style={{ ...S.btnGold, flex: 1, opacity: saving ? 0.6 : 1 }}>
              {saving ? 'Guardando...' : 'Guardar cambios'}
            </button>
            <button type="button" onClick={onClose} style={S.btnGhost}>Cancelar</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function CrearModal({ onClose, onCreado }) {
  const { token } = useAuth();
  const [form, setForm] = useState({ nombre: '', superficie: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true); setError('');
    try {
      await api.cms.modelos.create(token, form);
      onCreado();
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px 16px' }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ ...S.card, background: '#1a2035', width: '100%', maxWidth: '440px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2 style={{ ...S.h2, margin: 0, color: C.gold }}>Nuevo Modelo</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: C.textMuted, fontSize: '1.4rem', cursor: 'pointer', lineHeight: 1 }}>×</button>
        </div>
        <p style={{ color: C.textMuted, fontSize: '0.85rem', marginBottom: '20px' }}>
          Se crea como <strong style={{ color: C.text }}>no publicado</strong>. Completá precio, fotos y descripción después con Editar.
        </p>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label style={S.label}>Nombre *</label>
            <input required value={form.nombre} onChange={e => setForm(p => ({ ...p, nombre: e.target.value }))}
              placeholder="Ej: Alma 45" style={S.input} onFocus={inputFocus} onBlur={inputBlur} autoFocus />
          </div>
          <div style={{ marginBottom: '20px' }}>
            <label style={S.label}>Superficie</label>
            <input value={form.superficie} onChange={e => setForm(p => ({ ...p, superficie: e.target.value }))}
              placeholder="Ej: 45m²" style={S.input} onFocus={inputFocus} onBlur={inputBlur} />
          </div>
          {error && <div style={{ ...S.alertError, marginBottom: '14px' }}>{error}</div>}
          <div style={{ display: 'flex', gap: '10px' }}>
            <button type="submit" disabled={saving} style={{ ...S.btnGold, flex: 1, opacity: saving ? 0.6 : 1 }}>
              {saving ? 'Creando...' : 'Crear modelo'}
            </button>
            <button type="button" onClick={onClose} style={S.btnGhost}>Cancelar</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function CmsModelos() {
  const { token } = useAuth();
  const [modelos, setModelos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editando, setEditando] = useState(null);
  const [creando, setCreando] = useState(false);
  const [toggling, setToggling] = useState(new Set());
  const [error, setError] = useState('');

  const cargar = () => {
    setLoading(true);
    api.cms.modelos.list(token)
      .then(d => setModelos(d.modelos || []))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { cargar(); }, [token]);

  const toggleActivo = async (modelo) => {
    if (toggling.has(modelo.id)) return;
    const nuevoActivo = !modelo.activo;
    setToggling(prev => new Set([...prev, modelo.id]));
    setModelos(prev => prev.map(m => m.id === modelo.id ? { ...m, activo: nuevoActivo } : m));
    try {
      await api.cms.modelos.update(token, { id: modelo.id, activo: nuevoActivo });
    } catch {
      setModelos(prev => prev.map(m => m.id === modelo.id ? { ...m, activo: modelo.activo } : m));
    } finally {
      setToggling(prev => { const next = new Set(prev); next.delete(modelo.id); return next; });
    }
  };

  return (
    <AppLayout>
      <div style={{ padding: '28px 32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '8px' }}>
          <h1 style={{ ...S.h1, margin: 0 }}>🏠 Modelos — Sitio Web</h1>
          <button onClick={() => setCreando(true)} style={{ ...S.btnGold, padding: '9px 18px', fontSize: '0.85rem' }}>
            + Nuevo Modelo
          </button>
        </div>
        <p style={{ color: C.textMuted, fontSize: '0.88rem', marginBottom: '28px' }}>
          Los cambios se publican al instante en <strong style={{ color: C.gold }}>almamod.com.ar</strong>
        </p>

        {error && <div style={{ ...S.alertError, marginBottom: '16px' }}>{error}</div>}

        {loading ? (
          <div style={{ textAlign: 'center', padding: '48px', color: C.textMuted }}>Cargando...</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
            {modelos.map(m => {
              const portadaUrl = m.imagen_portada?.startsWith('http')
                ? m.imagen_portada
                : m.imagen_portada
                  ? `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/w_400,h_280,c_fill,q_75,f_auto/${m.imagen_portada}`
                  : null;
              const isToggling = toggling.has(m.id);

              return (
                <div key={m.id} style={{ ...S.card, padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column', opacity: m.activo ? 1 : 0.8 }}>
                  {/* Toggle publicar/despublicar */}
                  <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '8px 12px',
                    background: m.activo ? 'rgba(16,185,129,0.1)' : 'rgba(148,163,184,0.07)',
                    borderBottom: `1px solid ${m.activo ? 'rgba(16,185,129,0.18)' : 'rgba(148,163,184,0.12)'}`,
                  }}>
                    <span style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: m.activo ? C.green : C.textMuted }}>
                      {m.activo ? '● Publicado' : '○ No publicado'}
                    </span>
                    <button
                      onClick={() => toggleActivo(m)}
                      disabled={isToggling}
                      title={m.activo ? 'Despublicar de la tienda' : 'Publicar en la tienda'}
                      style={{
                        position: 'relative', width: '36px', height: '20px', border: 'none', borderRadius: '10px', cursor: isToggling ? 'wait' : 'pointer', flexShrink: 0, padding: 0,
                        background: m.activo ? C.green : 'rgba(148,163,184,0.35)',
                        transition: 'background 0.2s',
                      }}
                    >
                      <span style={{
                        position: 'absolute', top: '3px', left: m.activo ? '17px' : '3px',
                        width: '14px', height: '14px', borderRadius: '50%', background: '#fff',
                        transition: 'left 0.18s', display: 'block',
                      }} />
                    </button>
                  </div>

                  {/* Imagen */}
                  <div style={{ height: '160px', background: 'rgba(255,255,255,0.03)', position: 'relative', overflow: 'hidden' }}>
                    {portadaUrl
                      ? <img src={portadaUrl} alt={m.nombre} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.textMuted, fontSize: '2rem' }}>🏠</div>
                    }
                    <div style={{ position: 'absolute', top: '8px', right: '8px', background: 'rgba(0,0,0,0.6)', borderRadius: '4px', padding: '3px 8px', color: C.textMuted, fontSize: '0.72rem' }}>
                      {m.fotos?.length || 0} foto{m.fotos?.length !== 1 ? 's' : ''}
                    </div>
                  </div>

                  {/* Info */}
                  <div style={{ padding: '16px', flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <div style={{ color: C.text, fontWeight: 700, fontSize: '1rem' }}>{m.nombre}</div>
                    {m.superficie && <div style={{ color: C.textMuted, fontSize: '0.8rem' }}>{m.superficie}</div>}
                    <div style={{ color: C.gold, fontWeight: 700, fontSize: '1.1rem', marginTop: '4px' }}>
                      {m.precio ? `$${Number(m.precio).toLocaleString('es-AR')}` : <span style={{ color: C.textMuted, fontSize: '0.8rem' }}>Sin precio cargado</span>}
                    </div>
                    {m.plazo && <div style={{ color: C.textMuted, fontSize: '0.78rem' }}>Entrega: {m.plazo}</div>}
                  </div>

                  <div style={{ padding: '0 16px 16px' }}>
                    <button onClick={() => setEditando(m)} style={{ ...S.btnGold, width: '100%', padding: '9px', fontSize: '0.85rem' }}>
                      Editar
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {editando && (
        <EditModal modelo={editando} onClose={() => setEditando(null)} onSaved={cargar} />
      )}
      {creando && (
        <CrearModal onClose={() => setCreando(false)} onCreado={cargar} />
      )}
    </AppLayout>
  );
}
