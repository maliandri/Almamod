import { useState, useRef } from 'react';
import AppLayout from '../components/AppLayout';
import { C, S, inputFocus, inputBlur } from '../styles';
import { uploadImagen, generarContenido, publicarEnMake } from '../lib/marketing';

const MODELOS = ['MiCasita', 'Alma 18', 'Alma 27', 'Alma Loft 28', 'Alma 36', 'Alma 36 Refugio', 'AlmaMod en general'];
const TONOS = ['Inspirador', 'Informativo', 'Urgencia', 'Emocional', 'Educativo'];
const FORMATOS = ['Imagen única', 'Carrusel', 'Comparativa', 'Testimonio', 'Precio/Oferta'];

export default function MarketingPublicaciones() {
  const fileRef = useRef();
  const [form, setForm] = useState({ tema: '', modelo: 'AlmaMod en general', tono: 'Informativo', formato: 'Imagen única' });
  const [imagen, setImagen] = useState(null);
  const [imagenUrl, setImagenUrl] = useState('');
  const [uploadingImg, setUploadingImg] = useState(false);
  const [generando, setGenerando] = useState(false);
  const [publicando, setPublicando] = useState(false);
  const [resultado, setResultado] = useState(null);
  const [error, setError] = useState('');
  const [publishOk, setPublishOk] = useState(false);

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

  const handleGenerar = async (e) => {
    e.preventDefault();
    if (!form.tema.trim()) { setError('Ingresá el tema de la publicación'); return; }
    setGenerando(true); setError(''); setResultado(null); setPublishOk(false);
    try {
      const res = await generarContenido('post', form);
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
      await publicarEnMake('post', resultado, imagenUrl);
      setPublishOk(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setPublicando(false);
    }
  };

  return (
    <AppLayout>
      <div style={{ padding: '28px 32px', maxWidth: '780px' }}>
        <h1 style={{ ...S.h1, marginBottom: '4px' }}>📱 Publicaciones</h1>
        <p style={{ color: C.textMuted, fontSize: '0.88rem', marginBottom: '28px' }}>
          Generá posts para el feed de Instagram y Facebook.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: resultado ? '1fr 1fr' : '1fr', gap: '20px' }}>
          <div style={S.card}>
            <form onSubmit={handleGenerar}>
              <div style={{ marginBottom: '16px' }}>
                <label style={S.label}>Tema de la publicación *</label>
                <input value={form.tema}
                  onChange={e => setForm(p => ({ ...p, tema: e.target.value }))}
                  placeholder="Ej: Cuánto cuesta una casa modular en Neuquén"
                  style={S.input} onFocus={inputFocus} onBlur={inputBlur} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                <div>
                  <label style={S.label}>Modelo</label>
                  <select value={form.modelo} onChange={e => setForm(p => ({ ...p, modelo: e.target.value }))} style={S.select}>
                    {MODELOS.map(m => <option key={m}>{m}</option>)}
                  </select>
                </div>
                <div>
                  <label style={S.label}>Tono</label>
                  <select value={form.tono} onChange={e => setForm(p => ({ ...p, tono: e.target.value }))} style={S.select}>
                    {TONOS.map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={S.label}>Formato</label>
                <select value={form.formato} onChange={e => setForm(p => ({ ...p, formato: e.target.value }))} style={S.select}>
                  {FORMATOS.map(f => <option key={f}>{f}</option>)}
                </select>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={S.label}>Imagen del post</label>
                <div onClick={() => fileRef.current?.click()}
                  style={{ border: `2px dashed ${C.goldBorder}`, borderRadius: '8px', padding: '16px', textAlign: 'center', cursor: 'pointer', background: C.goldDim, minHeight: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                  {imagen
                    ? <img src={imagen} alt="" style={{ maxHeight: '120px', maxWidth: '100%', borderRadius: '6px' }} />
                    : <div>
                        <div style={{ fontSize: '1.8rem', marginBottom: '6px' }}>🖼️</div>
                        <div style={{ color: C.textMuted, fontSize: '0.82rem' }}>{uploadingImg ? 'Subiendo...' : 'Clic para subir imagen'}</div>
                      </div>
                  }
                  {uploadingImg && <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.gold }}>Subiendo...</div>}
                </div>
                <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }}
                  onChange={e => { if (e.target.files?.[0]) handleImagen(e.target.files[0]); e.target.value = ''; }} />
                {imagenUrl && <div style={{ color: C.green, fontSize: '0.75rem', marginTop: '4px' }}>✓ Subida a Cloudinary</div>}
              </div>

              {error && <div style={{ ...S.alertError, marginBottom: '14px', fontSize: '0.85rem' }}>{error}</div>}

              <button type="submit" disabled={generando || uploadingImg}
                style={{ ...S.btnGold, width: '100%', padding: '11px', opacity: (generando || uploadingImg) ? 0.6 : 1 }}>
                {generando ? '✨ Generando con IA...' : '✨ Generar publicación'}
              </button>
            </form>
          </div>

          {resultado && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[
                { label: '🎯 Título / Primera línea', value: resultado.titulo },
                { label: '📝 Caption completo', value: resultado.caption },
                { label: '#️⃣ Hashtags', value: resultado.hashtags },
                { label: '📣 CTA', value: resultado.cta },
                { label: '🖼️ Sugerencia visual', value: resultado.sugerencia_visual },
              ].map(({ label, value }) => value && (
                <div key={label} style={S.card}>
                  <div style={{ color: C.gold, fontSize: '0.75rem', fontWeight: 700, marginBottom: '6px', letterSpacing: '0.04em' }}>{label}</div>
                  <div style={{ color: C.textSub, fontSize: '0.85rem', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{value}</div>
                  <button onClick={() => navigator.clipboard.writeText(value)}
                    style={{ ...S.btnGhost, fontSize: '0.72rem', padding: '4px 10px', marginTop: '8px' }}>Copiar</button>
                </div>
              ))}

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
