import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../hooks/useAuth';
import { api } from '../lib/api';
import AppLayout from '../components/AppLayout';
import { C, S, inputFocus, inputBlur } from '../styles';

const CLOUD_NAME = 'dlshym1te';
const UPLOAD_PRESET = 'almamod_cms';

async function uploadToCloudinary(file) {
  const fd = new FormData();
  fd.append('file', file);
  fd.append('upload_preset', UPLOAD_PRESET);
  fd.append('folder', 'almamod/obras');
  const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, { method: 'POST', body: fd });
  const data = await res.json();
  if (data.error) throw new Error(data.error.message);
  return data.secure_url;
}

function FotosUploader({ fotos, onChange, uploading, setUploading }) {
  const fileRef = useRef();

  const handleFiles = async (files) => {
    setUploading(true);
    try {
      const urls = [];
      for (const f of files) {
        const url = await uploadToCloudinary(f);
        urls.push(url);
      }
      onChange([...fotos, ...urls]);
    } catch (err) {
      alert(`Error subiendo foto: ${err.message}`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '8px' }}>
        {fotos.map((url, i) => (
          <div key={i} style={{ position: 'relative', width: '80px', height: '80px', borderRadius: '6px', overflow: 'hidden', border: `1px solid ${C.border}` }}>
            <img src={url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            <button type="button" onClick={() => onChange(fotos.filter((_, j) => j !== i))}
              style={{ position: 'absolute', top: '2px', right: '2px', background: 'rgba(0,0,0,0.7)', border: 'none', borderRadius: '50%', width: '18px', height: '18px', color: '#fff', cursor: 'pointer', fontSize: '0.7rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
          </div>
        ))}
        <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading}
          style={{ width: '80px', height: '80px', background: C.goldDim, border: `2px dashed ${C.goldBorder}`, borderRadius: '6px', color: C.gold, cursor: 'pointer', fontSize: '1.2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '2px' }}>
          {uploading ? <span style={{ fontSize: '0.65rem', color: C.textMuted }}>...</span> : <>
            <span>+</span><span style={{ fontSize: '0.6rem' }}>Subir</span>
          </>}
        </button>
      </div>
      <input ref={fileRef} type="file" accept="image/*" multiple style={{ display: 'none' }}
        onChange={e => { handleFiles(Array.from(e.target.files || [])); e.target.value = ''; }} />
    </div>
  );
}

const EMPTY_FORM = { titulo: '', ubicacion: '', descripcion: '', imagen_portada: '', fotos: [], orden: 0 };

function ObraModal({ obra, onClose, onSaved, token }) {
  const isNew = !obra?.id;
  const [form, setForm] = useState(obra ? { ...obra } : { ...EMPTY_FORM });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true); setError('');
    try {
      if (isNew) {
        await api.cms.obras.create(token, form);
      } else {
        await api.cms.obras.update(token, { id: obra.id, ...form });
      }
      onSaved();
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const setPortadaFromFotos = (url) => setForm(p => ({ ...p, imagen_portada: url }));

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 50, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '24px 16px', overflowY: 'auto' }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ ...S.card, width: '100%', maxWidth: '520px', marginTop: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ ...S.h2, margin: 0, color: C.gold }}>{isNew ? 'Nueva obra' : 'Editar obra'}</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: C.textMuted, fontSize: '1.4rem', cursor: 'pointer' }}>×</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '14px' }}>
            <label style={S.label}>Título *</label>
            <input required value={form.titulo} onChange={e => setForm(p => ({ ...p, titulo: e.target.value }))}
              placeholder="Módulo Alma 27 — Junín de los Andes"
              style={S.input} onFocus={inputFocus} onBlur={inputBlur} />
          </div>
          <div style={{ marginBottom: '14px' }}>
            <label style={S.label}>Ubicación</label>
            <input value={form.ubicacion} onChange={e => setForm(p => ({ ...p, ubicacion: e.target.value }))}
              placeholder="Junín de los Andes, Neuquén"
              style={S.input} onFocus={inputFocus} onBlur={inputBlur} />
          </div>
          <div style={{ marginBottom: '14px' }}>
            <label style={S.label}>Descripción</label>
            <textarea value={form.descripcion} onChange={e => setForm(p => ({ ...p, descripcion: e.target.value }))}
              rows={3} placeholder="Descripción de la obra..."
              style={{ ...S.input, resize: 'vertical', fontFamily: 'inherit', lineHeight: 1.5 }}
              onFocus={inputFocus} onBlur={inputBlur} />
          </div>
          <div style={{ marginBottom: '14px' }}>
            <label style={S.label}>Orden de aparición</label>
            <input type="number" value={form.orden} onChange={e => setForm(p => ({ ...p, orden: Number(e.target.value) }))}
              style={{ ...S.input, width: '100px' }} onFocus={inputFocus} onBlur={inputBlur} />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={S.label}>Fotos de la obra</label>
            <FotosUploader fotos={form.fotos} onChange={fs => setForm(p => ({ ...p, fotos: fs }))} uploading={uploading} setUploading={setUploading} />
            {form.fotos.length > 0 && (
              <div style={{ marginTop: '10px' }}>
                <label style={{ ...S.label, marginBottom: '6px' }}>Foto de portada (clic para seleccionar)</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {form.fotos.map((url, i) => (
                    <div key={i} onClick={() => setPortadaFromFotos(url)}
                      style={{ width: '60px', height: '60px', borderRadius: '4px', overflow: 'hidden', cursor: 'pointer', border: `2px solid ${form.imagen_portada === url ? C.gold : C.border}`, opacity: form.imagen_portada === url ? 1 : 0.6, transition: 'all 0.15s' }}>
                      <img src={url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {error && <div style={{ ...S.alertError, marginBottom: '14px' }}>{error}</div>}

          <div style={{ display: 'flex', gap: '10px' }}>
            <button type="submit" disabled={saving || uploading} style={{ ...S.btnGold, flex: 1, opacity: (saving || uploading) ? 0.6 : 1 }}>
              {saving ? 'Guardando...' : isNew ? 'Crear obra' : 'Guardar cambios'}
            </button>
            <button type="button" onClick={onClose} style={S.btnGhost}>Cancelar</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function CmsObras() {
  const { token } = useAuth();
  const [obras, setObras] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null); // null | 'new' | obra object
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [error, setError] = useState('');

  const cargar = () => {
    setLoading(true);
    api.cms.obras.list(token)
      .then(d => setObras(d.obras || []))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { cargar(); }, [token]);

  const handleDelete = async (id) => {
    try {
      await api.cms.obras.delete(token, id);
      setConfirmDelete(null);
      cargar();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <AppLayout>
      <div style={{ padding: '28px 32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <h1 style={{ ...S.h1, margin: 0 }}>🏗️ Galería de Obras</h1>
          <button onClick={() => setModal('new')} style={S.btnGold}>+ Nueva obra</button>
        </div>
        <p style={{ color: C.textMuted, fontSize: '0.88rem', marginBottom: '28px' }}>
          Las obras aparecen en la sección "Nuestros trabajos" de <strong style={{ color: C.gold }}>almamod.com.ar</strong>
        </p>

        {error && <div style={{ ...S.alertError, marginBottom: '16px' }}>{error}</div>}

        {loading ? (
          <div style={{ textAlign: 'center', padding: '48px', color: C.textMuted }}>Cargando...</div>
        ) : obras.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '64px', color: C.textMuted }}>
            <div style={{ fontSize: '3rem', marginBottom: '12px' }}>🏗️</div>
            <p>No hay obras cargadas. Creá la primera.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '16px' }}>
            {obras.map(o => (
              <div key={o.id} style={{ ...S.card, padding: 0, overflow: 'hidden' }}>
                <div style={{ height: '150px', background: 'rgba(255,255,255,0.03)', position: 'relative' }}>
                  {o.imagen_portada
                    ? <img src={o.imagen_portada} alt={o.titulo} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.textMuted, fontSize: '2rem' }}>🏗️</div>
                  }
                  <div style={{ position: 'absolute', top: '8px', right: '8px', background: 'rgba(0,0,0,0.6)', borderRadius: '4px', padding: '3px 8px', color: C.textMuted, fontSize: '0.72rem' }}>
                    {o.fotos?.length || 0} foto{o.fotos?.length !== 1 ? 's' : ''}
                  </div>
                </div>
                <div style={{ padding: '14px 16px' }}>
                  <div style={{ color: C.text, fontWeight: 700, fontSize: '0.92rem', marginBottom: '2px' }}>{o.titulo}</div>
                  {o.ubicacion && <div style={{ color: C.textMuted, fontSize: '0.78rem', marginBottom: '10px' }}>{o.ubicacion}</div>}
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={() => setModal(o)}
                      style={{ flex: 1, background: C.goldDim, border: 'none', borderRadius: '6px', padding: '7px', color: C.gold, cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(212,165,116,0.3)'}
                      onMouseLeave={e => e.currentTarget.style.background = C.goldDim}>
                      Editar
                    </button>
                    <button onClick={() => setConfirmDelete(o)}
                      style={{ background: C.redDim, border: 'none', borderRadius: '6px', padding: '7px 12px', color: C.red, cursor: 'pointer', fontSize: '0.8rem' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.2)'}
                      onMouseLeave={e => e.currentTarget.style.background = C.redDim}>
                      ×
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {modal && (
        <ObraModal obra={modal === 'new' ? null : modal} onClose={() => setModal(null)} onSaved={cargar} token={token} />
      )}

      {confirmDelete && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}
          onClick={e => e.target === e.currentTarget && setConfirmDelete(null)}>
          <div style={{ ...S.card, maxWidth: '340px', textAlign: 'center' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>⚠️</div>
            <h2 style={{ color: C.red, fontSize: '1.1rem', fontWeight: 700, marginBottom: '8px' }}>Eliminar obra</h2>
            <p style={{ color: C.textSub, fontSize: '0.9rem', marginBottom: '24px' }}>{confirmDelete.titulo}</p>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => handleDelete(confirmDelete.id)} style={{ ...S.btnDanger, flex: 1 }}>Eliminar</button>
              <button onClick={() => setConfirmDelete(null)} style={{ ...S.btnGhost, flex: 1 }}>Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
