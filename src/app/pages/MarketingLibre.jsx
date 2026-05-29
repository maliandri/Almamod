import { useState, useRef, useEffect, useCallback } from 'react';
import AppLayout from '../components/AppLayout';
import { C, S, inputFocus, inputBlur } from '../styles';
import { uploadImagen, generarContenido, publicarEnMake } from '../lib/marketing';
import { useAuth } from '../hooks/useAuth';
import { api } from '../lib/api';

const CLOUD = 'dlshym1te';
const thumb = (public_id) =>
  `https://res.cloudinary.com/${CLOUD}/image/upload/w_160,h_120,c_fill,q_65,f_auto/${public_id}`;
const full = (public_id) =>
  `https://res.cloudinary.com/${CLOUD}/image/upload/q_85,f_auto/${public_id}`;

const FOLDERS = [
  { key: 'todo',           label: 'Todo' },
  { key: 'Modulos',        label: 'Módulos' },
  { key: 'certificaciones', label: 'Certificaciones' },
  { key: 'ObrasAlmamod',   label: 'Obras' },
  { key: 'reels',          label: 'Reels' },
  { key: 'social-media',   label: 'Social' },
];

function GaleriaCloudinary({ onSelect, selected }) {
  const { token } = useAuth();
  const [folder, setFolder]       = useState('todo');
  const [images, setImages]       = useState([]);
  const [loading, setLoading]     = useState(false);
  const [nextCursor, setNextCursor] = useState(null);
  const [error, setError]         = useState('');

  const cargar = useCallback(async (fld = folder, cursor = null) => {
    setLoading(true); setError('');
    try {
      const d = await api.cloudinary.list(token, fld, cursor);
      setImages(prev => cursor ? [...prev, ...(d.images || [])] : (d.images || []));
      setNextCursor(d.next_cursor || null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token, folder]);

  useEffect(() => { cargar(folder, null); }, [folder]);

  const changeFolder = (fld) => {
    setFolder(fld);
    setImages([]);
    setNextCursor(null);
  };

  return (
    <div>
      {/* Tabs carpetas */}
      <div style={{ display: 'flex', gap: '6px', marginBottom: '12px', flexWrap: 'wrap' }}>
        {FOLDERS.map(f => (
          <button key={f.key} onClick={() => changeFolder(f.key)}
            style={{ padding: '4px 12px', borderRadius: '20px', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer', border: 'none', background: folder === f.key ? C.goldDim : 'rgba(255,255,255,0.06)', color: folder === f.key ? C.gold : C.textMuted, transition: 'all 0.15s' }}>
            {f.label}
          </button>
        ))}
      </div>

      {error && <div style={{ color: '#ef4444', fontSize: '0.8rem', marginBottom: '8px' }}>{error}</div>}

      {/* Grid de imágenes */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '6px', maxHeight: '320px', overflowY: 'auto', padding: '2px' }}>
        {images.map(img => {
          const isSelected = selected === img.secure_url;
          return (
            <div key={img.public_id} onClick={() => onSelect(img)}
              style={{ position: 'relative', paddingBottom: '75%', cursor: 'pointer', borderRadius: '6px', overflow: 'hidden', border: `2px solid ${isSelected ? C.gold : 'transparent'}`, transition: 'border-color 0.15s' }}>
              <img src={thumb(img.public_id)} alt=""
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                loading="lazy" />
              {isSelected && (
                <div style={{ position: 'absolute', inset: 0, background: 'rgba(212,165,116,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem' }}>✓</div>
              )}
            </div>
          );
        })}
        {loading && Array.from({ length: 8 }).map((_, i) => (
          <div key={i} style={{ paddingBottom: '75%', background: 'rgba(255,255,255,0.04)', borderRadius: '6px' }} />
        ))}
      </div>

      {/* Cargar más */}
      {nextCursor && !loading && (
        <button onClick={() => cargar(folder, nextCursor)}
          style={{ ...S.btnGhost, width: '100%', marginTop: '10px', fontSize: '0.8rem', padding: '7px' }}>
          Cargar más imágenes
        </button>
      )}

      {!loading && images.length === 0 && !error && (
        <div style={{ textAlign: 'center', color: C.textMuted, fontSize: '0.82rem', padding: '20px' }}>
          No hay imágenes en esta carpeta
        </div>
      )}
    </div>
  );
}

export default function MarketingLibre() {
  const fileRef = useRef();
  const [instruccion, setInstruccion] = useState('');
  const [imagenMode, setImagenMode]   = useState('upload'); // 'upload' | 'gallery'
  const [imagen, setImagen]           = useState(null);     // preview local
  const [imagenUrl, setImagenUrl]     = useState('');       // URL final Cloudinary
  const [uploadingImg, setUploadingImg] = useState(false);
  const [generando, setGenerando]     = useState(false);
  const [publicando, setPublicando]   = useState(false);
  const [resultado, setResultado]     = useState(null);
  const [error, setError]             = useState('');
  const [publishOk, setPublishOk]     = useState(false);

  const handleImagen = async (file) => {
    setImagen(URL.createObjectURL(file));
    setUploadingImg(true);
    try {
      const url = await uploadImagen(file);
      setImagenUrl(url);
    } catch (err) {
      setError(`Error subiendo imagen: ${err.message}`);
    } finally {
      setUploadingImg(false);
    }
  };

  const handleSelectGaleria = (img) => {
    setImagenUrl(full(img.public_id));
    setImagen(thumb(img.public_id));
  };

  const handleGenerar = async (e) => {
    e.preventDefault();
    if (!instruccion.trim()) { setError('Escribí las instrucciones'); return; }
    setGenerando(true); setError(''); setResultado(null); setPublishOk(false);
    try {
      const res = await generarContenido('libre', { instruccion });
      setResultado(res);
    } catch (err) {
      setError(err.message);
    } finally {
      setGenerando(false);
    }
  };

  const handlePublicar = async () => {
    setPublicando(true); setError('');
    try {
      await publicarEnMake('libre', { ...resultado, caption: resultado.contenido }, imagenUrl);
      setPublishOk(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setPublicando(false);
    }
  };

  const tabStyle = (active) => ({
    flex: 1, padding: '8px', borderRadius: '7px', border: 'none', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600, transition: 'all 0.15s',
    background: active ? C.goldDim : 'transparent',
    color: active ? C.gold : C.textMuted,
  });

  return (
    <AppLayout>
      <div style={{ padding: '28px 32px', maxWidth: '820px' }}>
        <h1 style={{ ...S.h1, marginBottom: '4px' }}>✍️ Publicación libre</h1>
        <p style={{ color: C.textMuted, fontSize: '0.88rem', marginBottom: '28px' }}>
          Describí lo que necesitás y la IA lo genera para vos.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: resultado ? '1fr 1fr' : '1fr', gap: '20px' }}>
          <div style={S.card}>
            <form onSubmit={handleGenerar}>
              {/* Instrucción */}
              <div style={{ marginBottom: '16px' }}>
                <label style={S.label}>¿Qué querés publicar? *</label>
                <textarea value={instruccion} onChange={e => setInstruccion(e.target.value)} rows={5}
                  placeholder={`Ejemplos:\n• "Post anunciando que entregamos la obra del Alma 27 en Junín de los Andes, con tono emotivo"\n• "Reel explicando por qué las casas SIP ahorran energía"\n• "Post de precio del MiCasita con urgencia, válido hasta fin de mes"`}
                  style={{ ...S.input, resize: 'vertical', fontFamily: 'inherit', lineHeight: 1.6, minHeight: '120px' }}
                  onFocus={inputFocus} onBlur={inputBlur} />
              </div>

              {/* Imagen — toggle upload / galería */}
              <div style={{ marginBottom: '20px' }}>
                <label style={S.label}>Imagen</label>

                {/* Toggle */}
                <div style={{ display: 'flex', gap: '4px', background: 'rgba(255,255,255,0.04)', borderRadius: '9px', padding: '3px', marginBottom: '12px' }}>
                  <button type="button" onClick={() => setImagenMode('upload')} style={tabStyle(imagenMode === 'upload')}>
                    📤 Subir nueva
                  </button>
                  <button type="button" onClick={() => setImagenMode('gallery')} style={tabStyle(imagenMode === 'gallery')}>
                    🖼️ Galería AlmaMod
                  </button>
                </div>

                {imagenMode === 'upload' ? (
                  <>
                    <div onClick={() => fileRef.current?.click()}
                      style={{ border: `2px dashed ${C.goldBorder}`, borderRadius: '8px', padding: '14px', textAlign: 'center', cursor: 'pointer', background: C.goldDim, minHeight: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                      {imagen
                        ? <img src={imagen} alt="" style={{ maxHeight: '100px', maxWidth: '100%', borderRadius: '6px' }} />
                        : <div style={{ color: C.textMuted, fontSize: '0.82rem' }}>
                            {uploadingImg ? 'Subiendo...' : '📸 Subir imagen (opcional)'}
                          </div>
                      }
                      {uploadingImg && (
                        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.gold }}>
                          Subiendo...
                        </div>
                      )}
                    </div>
                    <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }}
                      onChange={e => { if (e.target.files?.[0]) handleImagen(e.target.files[0]); e.target.value = ''; }} />
                    {imagenUrl && <div style={{ color: C.green, fontSize: '0.75rem', marginTop: '4px' }}>✓ Subida a Cloudinary</div>}
                  </>
                ) : (
                  <div style={{ background: 'rgba(0,0,0,0.2)', borderRadius: '10px', padding: '12px', border: `1px solid ${C.border}` }}>
                    {imagenUrl && imagen && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px', padding: '8px', background: C.goldDim, borderRadius: '7px' }}>
                        <img src={imagen} alt="" style={{ width: '48px', height: '36px', objectFit: 'cover', borderRadius: '4px' }} />
                        <span style={{ color: C.gold, fontSize: '0.8rem', fontWeight: 600 }}>✓ Imagen seleccionada</span>
                        <button type="button" onClick={() => { setImagenUrl(''); setImagen(null); }}
                          style={{ marginLeft: 'auto', background: 'none', border: 'none', color: C.textMuted, cursor: 'pointer', fontSize: '1rem' }}>×</button>
                      </div>
                    )}
                    <GaleriaCloudinary onSelect={handleSelectGaleria} selected={imagenUrl} />
                  </div>
                )}
              </div>

              {error && <div style={{ ...S.alertError, marginBottom: '14px', fontSize: '0.85rem' }}>{error}</div>}

              <button type="submit" disabled={generando || uploadingImg}
                style={{ ...S.btnGold, width: '100%', padding: '11px', opacity: (generando || uploadingImg) ? 0.6 : 1 }}>
                {generando ? '✨ Generando con IA...' : '✨ Generar contenido'}
              </button>
            </form>
          </div>

          {resultado && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[
                { label: '📝 Contenido generado', value: resultado.contenido },
                { label: '#️⃣ Hashtags',           value: resultado.hashtags },
                { label: '📣 CTA',                value: resultado.cta },
              ].map(({ label, value }) => value && (
                <div key={label} style={S.card}>
                  <div style={{ color: C.gold, fontSize: '0.75rem', fontWeight: 700, marginBottom: '6px', letterSpacing: '0.04em' }}>{label}</div>
                  <div style={{ color: C.textSub, fontSize: '0.85rem', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{value}</div>
                  <button onClick={() => navigator.clipboard.writeText(value)}
                    style={{ ...S.btnGhost, fontSize: '0.72rem', padding: '4px 10px', marginTop: '8px' }}>Copiar</button>
                </div>
              ))}

              {imagenUrl && (
                <div style={S.card}>
                  <div style={{ color: C.gold, fontSize: '0.75rem', fontWeight: 700, marginBottom: '8px' }}>🖼️ IMAGEN SELECCIONADA</div>
                  <img src={thumb(imagenUrl.includes('cloudinary') ? imagenUrl.split('/upload/')[1] : imagenUrl)} alt=""
                    style={{ width: '100%', borderRadius: '8px', objectFit: 'cover', maxHeight: '160px' }}
                    onError={e => { e.target.src = imagenUrl; }} />
                </div>
              )}

              {publishOk
                ? <div style={{ ...S.alertSuccess, textAlign: 'center', fontWeight: 600 }}>✓ Enviado a Make correctamente</div>
                : <button onClick={handlePublicar} disabled={publicando}
                    style={{ ...S.btnGold, padding: '12px', textAlign: 'center', opacity: publicando ? 0.6 : 1 }}>
                    {publicando ? 'Enviando a Make...' : '🚀 Publicar en Instagram / Facebook'}
                  </button>
              }
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
