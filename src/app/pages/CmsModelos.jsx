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

function generarPublicId(modeloNombre, fotosActuales) {
  const slug = modeloNombre
    .toUpperCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/\s+/g, '_')
    .replace(/[^A-Z0-9_]/g, '');
  const sufijo = fotosActuales === 0 ? 'PORTADA' : String(fotosActuales);
  return `Modulos/ALMAMOD_${slug}_${sufijo}`;
}

// Categorías de documentación por modelo. grupo define visibilidad:
// 'comercial' → clientes · 'tecnica' → solo dueño/depósito
const DOC_CATS = [
  { key: 'comercial',       label: 'Comercial',             grupo: 'comercial' },
  { key: 'fundaciones',     label: 'Plano de fundaciones',  grupo: 'tecnica' },
  { key: 'patines',         label: 'Plano de patines',      grupo: 'tecnica' },
  { key: 'agua',            label: 'Agua',                  grupo: 'tecnica' },
  { key: 'gas',             label: 'Gas',                   grupo: 'tecnica' },
  { key: 'cloacas',         label: 'Plano de cloacas',      grupo: 'tecnica' },
  { key: 'paneles_piso',    label: 'Paneles · Piso',        grupo: 'tecnica' },
  { key: 'paneles_techo',   label: 'Paneles · Techo',       grupo: 'tecnica' },
  { key: 'paneles_paredes', label: 'Paneles · Paredes',     grupo: 'tecnica' },
];

function generarDocPublicId(modeloNombre, cat, n) {
  const slug = (modeloNombre || 'MODELO')
    .toUpperCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/\s+/g, '_')
    .replace(/[^A-Z0-9_]/g, '');
  return `Documentos/ALMAMOD_${slug}_${cat.toUpperCase()}_${n + 1}`;
}

async function uploadToCloudinary(file, publicId) {
  const fd = new FormData();
  fd.append('file', file);
  fd.append('upload_preset', UPLOAD_PRESET);
  if (publicId) {
    fd.append('public_id', publicId);
  } else {
    fd.append('folder', 'Modulos');
  }
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

function FotosUnificadas({ fotos, fotosPortada, onAdd, onDelete, onTogglePortada, uploading }) {
  const fileRef = useRef();
  const portadas = fotosPortada || [];

  // Todas las fotos únicas (fotos + portadas que no estén ya)
  const todas = [...new Set([...portadas, ...fotos])];

  return (
    <div>
      <div style={{ marginBottom: '8px', padding: '8px 12px', background: C.goldDim, borderRadius: '7px', border: `1px solid ${C.goldBorder}` }}>
        <p style={{ color: C.gold, fontSize: '0.72rem', fontWeight: 700, margin: '0 0 2px', letterSpacing: '0.04em' }}>⭐ FOTOS DE PORTADA (carrusel)</p>
        <p style={{ color: C.textMuted, fontSize: '0.72rem', margin: 0 }}>
          Clic en ⭐ para agregar/quitar del carrusel de portada. El número indica el orden. Podés tener varias.
        </p>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '10px' }}>
        {todas.map((url, i) => {
          const idxPortada = portadas.indexOf(url);
          const esPortada  = idxPortada !== -1;
          return (
            <div key={i} style={{ position: 'relative', width: '90px', height: '90px', borderRadius: '8px', overflow: 'hidden', border: `2px solid ${esPortada ? C.gold : C.border}` }}>
              <img src={fotoThumb(url)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />

              {/* Badge orden en portada */}
              {esPortada && (
                <div style={{ position: 'absolute', top: '2px', left: '2px', background: C.gold, color: '#1a1a2e', borderRadius: '4px', fontSize: '0.6rem', fontWeight: 900, padding: '1px 5px', lineHeight: 1.6 }}>
                  ⭐ {idxPortada + 1}
                </div>
              )}

              {/* Toggle portada */}
              <button type="button" onClick={() => onTogglePortada(url)} title={esPortada ? 'Quitar del carrusel' : 'Agregar al carrusel de portada'}
                style={{ position: 'absolute', bottom: '2px', left: '2px', background: esPortada ? C.gold : 'rgba(0,0,0,0.65)', border: `1px solid ${esPortada ? C.gold : C.goldBorder}`, borderRadius: '4px', color: esPortada ? '#1a1a2e' : C.gold, cursor: 'pointer', fontSize: '0.6rem', fontWeight: 700, padding: '2px 5px', lineHeight: 1.4 }}>
                {esPortada ? '✓ portada' : '+ portada'}
              </button>

              {/* Eliminar */}
              <button type="button" onClick={() => onDelete(url)} title="Eliminar foto"
                style={{ position: 'absolute', top: '2px', right: '2px', background: 'rgba(0,0,0,0.7)', border: 'none', borderRadius: '50%', width: '20px', height: '20px', color: '#fff', cursor: 'pointer', fontSize: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
            </div>
          );
        })}

        {/* Subir */}
        <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading}
          style={{ width: '90px', height: '90px', background: C.goldDim, border: `2px dashed ${C.goldBorder}`, borderRadius: '8px', color: C.gold, cursor: 'pointer', fontSize: '1.4rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
          {uploading ? <span style={{ fontSize: '0.7rem' }}>...</span> : <><span>+</span><span style={{ fontSize: '0.65rem' }}>Subir foto</span></>}
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

function DocCatRow({ cat, urls, onUpload, onDelete, uploading }) {
  const fileRef = useRef();
  return (
    <div style={{ marginBottom: '10px' }}>
      <p style={{ color: C.textSub, fontSize: '0.78rem', fontWeight: 600, marginBottom: '6px' }}>{cat.label}</p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
        {urls.map((url, i) => (
          <div key={i} style={{ position: 'relative', width: '74px', height: '74px', borderRadius: '8px', overflow: 'hidden', border: `1px solid ${C.border}` }}>
            <a href={url} target="_blank" rel="noopener noreferrer">
              <img src={fotoThumb(url)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </a>
            <button type="button" onClick={() => onDelete(cat.key, url)} title="Eliminar"
              style={{ position: 'absolute', top: '2px', right: '2px', background: 'rgba(0,0,0,0.7)', border: 'none', borderRadius: '50%', width: '18px', height: '18px', color: '#fff', cursor: 'pointer', fontSize: '0.7rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
          </div>
        ))}
        <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading}
          style={{ width: '74px', height: '74px', background: C.goldDim, border: `2px dashed ${C.goldBorder}`, borderRadius: '8px', color: C.gold, cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '2px' }}>
          {uploading ? <span style={{ fontSize: '0.7rem' }}>...</span> : <><span style={{ fontSize: '1.2rem' }}>+</span><span style={{ fontSize: '0.6rem' }}>Subir</span></>}
        </button>
      </div>
      <input ref={fileRef} type="file" accept="image/*" multiple style={{ display: 'none' }}
        onChange={async e => {
          const files = Array.from(e.target.files || []);
          for (const f of files) await onUpload(f, cat.key);
          e.target.value = '';
        }} />
    </div>
  );
}

function DocsEditor({ documentos, onUpload, onDelete, uploadingDoc }) {
  return (
    <div>
      <div style={{ marginBottom: '12px', padding: '8px 12px', background: 'rgba(16,185,129,0.08)', borderRadius: '7px', border: '1px solid rgba(16,185,129,0.2)' }}>
        <p style={{ color: C.green, fontSize: '0.72rem', fontWeight: 700, margin: '0 0 8px', letterSpacing: '0.04em' }}>🟢 COMERCIAL — visible para clientes</p>
        {DOC_CATS.filter(c => c.grupo === 'comercial').map(cat => (
          <DocCatRow key={cat.key} cat={cat} urls={documentos[cat.key] || []} onUpload={onUpload} onDelete={onDelete} uploading={uploadingDoc === cat.key} />
        ))}
      </div>
      <div style={{ padding: '8px 12px', background: C.goldDim, borderRadius: '7px', border: `1px solid ${C.goldBorder}` }}>
        <p style={{ color: C.gold, fontSize: '0.72rem', fontWeight: 700, margin: '0 0 8px', letterSpacing: '0.04em' }}>🔒 TÉCNICA — solo dueño/depósito</p>
        {DOC_CATS.filter(c => c.grupo === 'tecnica').map(cat => (
          <DocCatRow key={cat.key} cat={cat} urls={documentos[cat.key] || []} onUpload={onUpload} onDelete={onDelete} uploading={uploadingDoc === cat.key} />
        ))}
      </div>
    </div>
  );
}

function EditModal({ modelo, onClose, onSaved }) {
  const { token } = useAuth();
  // Normalizar fotos_portada: si viene vacío, inicializar desde imagen_portada existente
  const initFotosPortada = () => {
    if (modelo.fotos_portada?.length) return modelo.fotos_portada;
    if (modelo.imagen_portada) {
      const url = modelo.imagen_portada.startsWith('http')
        ? modelo.imagen_portada
        : `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/${modelo.imagen_portada}`;
      return [url];
    }
    return [];
  };

  const [form, setForm] = useState({
    nombre:        modelo.nombre        || '',
    precio:        modelo.precio        || '',
    descripcion:   modelo.descripcion   || '',
    plazo:         modelo.plazo         || '30 días',
    ventajas:      modelo.ventajas      || [],
    fotos:         modelo.fotos         || [],
    fotos_portada: initFotosPortada(),
    imagen_portada: modelo.imagen_portada || '',
    documentos:    modelo.documentos    || {},
  });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadingDoc, setUploadingDoc] = useState(null);
  const [error, setError] = useState('');

  const handleUpload = async (file) => {
    setUploading(true);
    try {
      const publicId = generarPublicId(form.nombre || 'MODELO', form.fotos.length);
      const url = await uploadToCloudinary(file, publicId);
      setForm(p => ({ ...p, fotos: [...p.fotos, url] }));
    } catch (err) {
      setError(`Error subiendo foto: ${err.message}`);
    } finally {
      setUploading(false);
    }
  };

  const handleUploadDoc = async (file, cat) => {
    setUploadingDoc(cat);
    try {
      const arr = form.documentos[cat] || [];
      const publicId = generarDocPublicId(form.nombre, cat, arr.length);
      const url = await uploadToCloudinary(file, publicId);
      setForm(p => ({ ...p, documentos: { ...p.documentos, [cat]: [...(p.documentos[cat] || []), url] } }));
    } catch (err) {
      setError(`Error subiendo documento: ${err.message}`);
    } finally {
      setUploadingDoc(null);
    }
  };

  const handleDeleteDoc = (cat, url) => {
    setForm(p => ({ ...p, documentos: { ...p.documentos, [cat]: (p.documentos[cat] || []).filter(u => u !== url) } }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true); setError('');
    try {
      // imagen_portada = primera foto del carrusel (compatibilidad hacia atrás)
      const imagen_portada = form.fotos_portada?.[0] || form.imagen_portada || '';
      await api.cms.modelos.update(token, {
        id: modelo.id, ...form,
        precio: Number(form.precio),
        imagen_portada,
      });
      onSaved();
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: '#1a2035', zIndex: 50, display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: `1px solid ${C.border}`, flexShrink: 0 }}>
        <h2 style={{ ...S.h2, margin: 0, color: C.gold }}>{modelo.nombre}</h2>
        <button onClick={onClose} style={{ background: 'none', border: 'none', color: C.textMuted, fontSize: '1.6rem', cursor: 'pointer', lineHeight: 1 }}>×</button>
      </div>

      <form onSubmit={handleSubmit} style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <div style={{ marginBottom: '16px' }}>
            <label style={S.label}>Nombre del modelo</label>
            <input value={form.nombre} onChange={e => setForm(p => ({ ...p, nombre: e.target.value }))}
              placeholder="Ej: Alma 36" style={S.input} onFocus={inputFocus} onBlur={inputBlur} />
          </div>

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
            <label style={S.label}>Ventajas (aparecen en la ficha del modelo)</label>
            <VentajasEditor ventajas={form.ventajas} onChange={v => setForm(p => ({ ...p, ventajas: v }))} />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={S.label}>Fotos</label>
            <FotosUnificadas
              fotos={form.fotos}
              fotosPortada={form.fotos_portada}
              onAdd={handleUpload}
              onDelete={url => setForm(p => ({
                ...p,
                fotos:         p.fotos.filter(f => f !== url),
                fotos_portada: p.fotos_portada.filter(f => f !== url),
              }))}
              onTogglePortada={url => setForm(p => {
                const ya = p.fotos_portada.includes(url);
                return {
                  ...p,
                  fotos_portada: ya
                    ? p.fotos_portada.filter(f => f !== url)   // quitar
                    : [...p.fotos_portada, url],               // agregar al final
                  // Si no está en fotos todavía, agregarla
                  fotos: p.fotos.includes(url) ? p.fotos : [...p.fotos, url],
                };
              })}
              uploading={uploading}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={S.label}>Documentación (imágenes)</label>
            <DocsEditor
              documentos={form.documentos}
              onUpload={handleUploadDoc}
              onDelete={handleDeleteDoc}
              uploadingDoc={uploadingDoc}
            />
          </div>

          {error && <div style={{ ...S.alertError, marginBottom: '14px' }}>{error}</div>}
          </div>
        </div>

        <div style={{ flexShrink: 0, padding: '14px 20px', borderTop: `1px solid ${C.border}`, background: '#161c2e', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
          <button type="button" onClick={onClose} style={S.btnGhost}>Cancelar</button>
          <button type="submit" disabled={saving} style={{ ...S.btnGold, minWidth: '170px', opacity: saving ? 0.6 : 1 }}>
            {saving ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </div>
      </form>
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
