import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../hooks/useAuth';
import AppLayout from '../components/AppLayout';
import { C, S } from '../styles';

const CLOUD        = 'dlshym1te';
const UPLOAD_PRESET = 'almamod_cms';
const BACKEND      = '/.netlify/functions';

const FOLDERS = [
  { key: 'todo',            label: 'Todo' },
  { key: 'Modulos',         label: 'Módulos' },
  { key: 'certificaciones', label: 'Certificaciones' },
  { key: 'ObrasAlmamod',    label: 'Obras' },
  { key: 'reels',           label: 'Reels' },
  { key: 'social-media',    label: 'Social' },
];

const thumb = (public_id) =>
  `https://res.cloudinary.com/${CLOUD}/image/upload/w_200,h_160,c_fill,q_65,f_auto/${public_id}`;

function chipStyle(active) {
  return {
    padding: '4px 14px', borderRadius: '20px', fontSize: '0.78rem', fontWeight: 600,
    cursor: 'pointer', border: 'none', transition: 'all 0.15s',
    background: active ? C.goldDim : 'rgba(255,255,255,0.06)',
    color:      active ? C.gold   : C.textMuted,
  };
}

export default function MarketingImagenes() {
  const { token } = useAuth();
  const fileRef = useRef();

  const [folder, setFolder]         = useState('todo');
  const [images, setImages]         = useState([]);
  const [loading, setLoading]       = useState(false);
  const [nextCursor, setNextCursor] = useState(null);
  const [error, setError]           = useState('');
  const [deleting, setDeleting]     = useState(null);
  const [uploading, setUploading]   = useState(false);
  const [uploadFolder, setUploadFolder] = useState('Modulos');
  const [selected, setSelected]     = useState(new Set());
  const [bulkDel, setBulkDel]       = useState(false);

  const cargar = useCallback(async (fld, cursor = null) => {
    setLoading(true); setError('');
    try {
      const qs = new URLSearchParams({ folder: fld });
      if (cursor) qs.set('next_cursor', cursor);
      const res = await fetch(`${BACKEND}/cloudinary-list?${qs}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setImages(prev => cursor ? [...prev, ...(data.images || [])] : (data.images || []));
      setNextCursor(data.next_cursor || null);
    } catch (err) {
      setError(err.message);
    } finally { setLoading(false); }
  }, [token]);

  useEffect(() => {
    setImages([]); setSelected(new Set());
    cargar(folder);
  }, [folder]);

  const handleUpload = async (files) => {
    if (!files?.length) return;
    setUploading(true); setError('');
    try {
      for (const file of Array.from(files)) {
        const fd = new FormData();
        fd.append('file', file);
        fd.append('upload_preset', UPLOAD_PRESET);
        fd.append('folder', uploadFolder);
        const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD}/image/upload`, { method: 'POST', body: fd });
        const data = await res.json();
        if (data.error) throw new Error(data.error.message);
      }
      cargar(folder);
    } catch (err) {
      setError(`Error subiendo: ${err.message}`);
    } finally { setUploading(false); }
  };

  const eliminar = async (public_id) => {
    if (!confirm(`¿Eliminar "${public_id.split('/').pop()}"? No se puede deshacer.`)) return;
    setDeleting(public_id);
    try {
      const res = await fetch(`${BACKEND}/cloudinary-admin`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ public_id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setImages(prev => prev.filter(i => i.public_id !== public_id));
      setSelected(prev => { const n = new Set(prev); n.delete(public_id); return n; });
    } catch (err) {
      setError(err.message);
    } finally { setDeleting(null); }
  };

  const eliminarSeleccionadas = async () => {
    if (!selected.size || !confirm(`¿Eliminar ${selected.size} imágenes?`)) return;
    setBulkDel(true);
    for (const id of selected) await eliminar(id);
    setBulkDel(false);
    setSelected(new Set());
  };

  const toggleSelect = (id) =>
    setSelected(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });

  return (
    <AppLayout>
      <div className="admin-page" style={{ padding: '28px 32px' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '8px' }}>
          <div>
            <h1 style={{ ...S.h1, margin: 0 }}>🖼️ Imágenes del sitio</h1>
            <p style={{ color: C.textMuted, fontSize: '0.85rem', marginTop: '4px' }}>
              Gestión de imágenes Cloudinary — {images.length} imagen{images.length !== 1 ? 'es' : ''}
              {selected.size > 0 && <span style={{ color: C.gold }}> · {selected.size} seleccionada{selected.size !== 1 ? 's' : ''}</span>}
            </p>
          </div>

          {/* Subir */}
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
            <select value={uploadFolder} onChange={e => setUploadFolder(e.target.value)}
              style={{ ...S.input, width: 'auto', fontSize: '0.82rem', padding: '7px 12px' }}>
              {FOLDERS.filter(f => f.key !== 'todo').map(f => (
                <option key={f.key} value={f.key}>{f.label}</option>
              ))}
            </select>
            <button onClick={() => fileRef.current?.click()} disabled={uploading}
              style={{ ...S.btnGold, padding: '8px 18px', fontSize: '0.85rem', opacity: uploading ? 0.6 : 1 }}>
              {uploading ? 'Subiendo...' : '+ Subir imagen'}
            </button>
            <input ref={fileRef} type="file" accept="image/*" multiple style={{ display: 'none' }}
              onChange={e => { handleUpload(e.target.files); e.target.value = ''; }} />
          </div>
        </div>

        {/* Bulk delete */}
        {selected.size > 0 && (
          <div style={{ marginBottom: '16px' }}>
            <button onClick={eliminarSeleccionadas} disabled={bulkDel}
              style={{ padding: '7px 16px', background: C.redDim, border: '1px solid rgba(239,68,68,0.25)', color: '#ef4444', borderRadius: '7px', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600 }}>
              {bulkDel ? 'Eliminando...' : `🗑️ Eliminar ${selected.size} seleccionada${selected.size !== 1 ? 's' : ''}`}
            </button>
          </div>
        )}

        {/* Folder tabs */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '20px' }}>
          {FOLDERS.map(f => (
            <button key={f.key} onClick={() => setFolder(f.key)} style={chipStyle(folder === f.key)}>
              {f.label}
            </button>
          ))}
        </div>

        {error && <div style={{ ...S.alertError, marginBottom: '16px' }}>{error}</div>}

        {/* Grid */}
        {loading && images.length === 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px,1fr))', gap: '8px' }}>
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} style={{ paddingBottom: '80%', background: 'rgba(255,255,255,0.04)', borderRadius: '8px' }} />
            ))}
          </div>
        ) : images.length === 0 && !loading ? (
          <div style={{ textAlign: 'center', padding: '60px', color: C.textMuted }}>
            <p style={{ fontSize: '2rem', marginBottom: '8px' }}>📷</p>
            <p>No hay imágenes en esta carpeta</p>
          </div>
        ) : (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px,1fr))', gap: '8px' }}>
              {images.map(img => {
                const isSelected = selected.has(img.public_id);
                const isDeleting = deleting === img.public_id;
                const filename   = img.public_id.split('/').pop();
                return (
                  <div key={img.public_id} onClick={() => toggleSelect(img.public_id)}
                    style={{ position: 'relative', borderRadius: '8px', overflow: 'hidden', cursor: 'pointer', border: `2px solid ${isSelected ? C.gold : C.border}`, background: 'rgba(255,255,255,0.03)', transition: 'border-color 0.15s', opacity: isDeleting ? 0.4 : 1 }}>

                    {/* Checkbox */}
                    <div style={{ position: 'absolute', top: '6px', left: '6px', zIndex: 10, width: '18px', height: '18px', borderRadius: '4px', background: isSelected ? C.gold : 'rgba(0,0,0,0.55)', border: `2px solid ${isSelected ? C.gold : 'rgba(255,255,255,0.35)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', color: isSelected ? '#1c1a18' : 'transparent' }}>
                      ✓
                    </div>

                    {/* Imagen */}
                    <div style={{ paddingBottom: '80%', position: 'relative', background: 'rgba(255,255,255,0.04)' }}>
                      <img src={thumb(img.public_id)} alt={filename}
                        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>

                    {/* Footer con nombre y delete */}
                    <div style={{ padding: '5px 8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <p style={{ color: C.textMuted, fontSize: '0.62rem', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={filename}>
                        {filename}
                      </p>
                      <button onClick={e => { e.stopPropagation(); eliminar(img.public_id); }}
                        disabled={isDeleting}
                        style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '0.85rem', padding: '1px', lineHeight: 1, flexShrink: 0 }}
                        title="Eliminar imagen">
                        {isDeleting ? '…' : '🗑️'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {nextCursor && !loading && (
              <div style={{ textAlign: 'center', marginTop: '20px' }}>
                <button onClick={() => cargar(folder, nextCursor)}
                  style={{ ...S.btnGhost, padding: '9px 24px', fontSize: '0.85rem' }}>
                  Cargar más imágenes
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </AppLayout>
  );
}
