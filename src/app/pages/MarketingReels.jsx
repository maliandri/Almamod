import { useState, useRef } from 'react';
import AppLayout from '../components/AppLayout';
import { C, S, inputFocus, inputBlur } from '../styles';
import { uploadImagen, generarContenido, publicarEnMake } from '../lib/marketing';

const MODELOS = ['MiCasita', 'Alma 18', 'Alma 27', 'Alma Loft 28', 'Alma 36', 'Alma 36 Refugio', 'AlmaMod en general'];
const TONOS = ['Inspirador', 'Informativo', 'Urgencia', 'Emocional', 'Humorístico', 'Educativo'];

export default function MarketingReels() {
  const fileRef = useRef();
  const [form, setForm] = useState({ tema: '', modelo: 'AlmaMod en general', tono: 'Inspirador' });
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
    if (!form.tema.trim()) { setError('Ingresá el tema del reel'); return; }
    setGenerando(true); setError(''); setResultado(null); setPublishOk(false);
    try {
      const res = await generarContenido('reel', form);
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
      await publicarEnMake('reel', resultado, imagenUrl);
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
        <h1 style={{ ...S.h1, marginBottom: '4px' }}>🎬 Reels</h1>
        <p style={{ color: C.textMuted, fontSize: '0.88rem', marginBottom: '28px' }}>
          Generá guión y caption para Reels de Instagram y Facebook.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: resultado ? '1fr 1fr' : '1fr', gap: '20px' }}>
          {/* Formulario */}
          <div style={S.card}>
            <form onSubmit={handleGenerar}>
              <div style={{ marginBottom: '16px' }}>
                <label style={S.label}>Tema del reel *</label>
                <input value={form.tema}
                  onChange={e => setForm(p => ({ ...p, tema: e.target.value }))}
                  placeholder="Ej: Ventajas de vivir en una casa modular en la Patagonia"
                  style={S.input} onFocus={inputFocus} onBlur={inputBlur} />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={S.label}>Modelo a destacar</label>
                <select value={form.modelo} onChange={e => setForm(p => ({ ...p, modelo: e.target.value }))} style={S.select}>
                  {MODELOS.map(m => <option key={m}>{m}</option>)}
                </select>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={S.label}>Tono</label>
                <select value={form.tono} onChange={e => setForm(p => ({ ...p, tono: e.target.value }))} style={S.select}>
                  {TONOS.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>

              {/* Upload imagen/video */}
              <div style={{ marginBottom: '20px' }}>
                <label style={S.label}>Imagen o thumbnail del reel</label>
                <div
                  onClick={() => fileRef.current?.click()}
                  style={{ border: `2px dashed ${C.goldBorder}`, borderRadius: '8px', padding: '16px', textAlign: 'center', cursor: 'pointer', background: C.goldDim, position: 'relative', minHeight: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {imagen
                    ? <img src={imagen} alt="" style={{ maxHeight: '120px', maxWidth: '100%', borderRadius: '6px' }} />
                    : <div>
                        <div style={{ fontSize: '1.8rem', marginBottom: '6px' }}>📸</div>
                        <div style={{ color: C.textMuted, fontSize: '0.82rem' }}>
                          {uploadingImg ? 'Subiendo...' : 'Clic para subir imagen'}
                        </div>
                      </div>
                  }
                  {uploadingImg && <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.gold }}>Subiendo...</div>}
                </div>
                <input ref={fileRef} type="file" accept="image/*,video/*" style={{ display: 'none' }}
                  onChange={e => { if (e.target.files?.[0]) handleImagen(e.target.files[0]); e.target.value = ''; }} />
                {imagenUrl && <div style={{ color: C.green, fontSize: '0.75rem', marginTop: '4px' }}>✓ Subida a Cloudinary</div>}
              </div>

              {error && <div style={{ ...S.alertError, marginBottom: '14px', fontSize: '0.85rem' }}>{error}</div>}

              <button type="submit" disabled={generando || uploadingImg}
                style={{ ...S.btnGold, width: '100%', padding: '11px', opacity: (generando || uploadingImg) ? 0.6 : 1 }}>
                {generando ? '✨ Generando con IA...' : '✨ Generar contenido'}
              </button>
            </form>
          </div>

          {/* Resultado */}
          {resultado && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[
                { label: '🎯 Hook (primeros 3 seg)', value: resultado.hook },
                { label: '📋 Guión', value: resultado.guion },
                { label: '📝 Caption', value: resultado.caption },
                { label: '#️⃣ Hashtags', value: resultado.hashtags },
                { label: '📣 CTA', value: resultado.cta },
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
