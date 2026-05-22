import { useState, useRef } from 'react';
import AppLayout from '../components/AppLayout';
import { C, S, inputFocus, inputBlur } from '../styles';
import { uploadImagen, generarContenido, publicarEnMake } from '../lib/marketing';

export default function MarketingLibre() {
  const fileRef = useRef();
  const [instruccion, setInstruccion] = useState('');
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

  return (
    <AppLayout>
      <div style={{ padding: '28px 32px', maxWidth: '780px' }}>
        <h1 style={{ ...S.h1, marginBottom: '4px' }}>✍️ Publicación libre</h1>
        <p style={{ color: C.textMuted, fontSize: '0.88rem', marginBottom: '28px' }}>
          Describí lo que necesitás y la IA lo genera para vos.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: resultado ? '1fr 1fr' : '1fr', gap: '20px' }}>
          <div style={S.card}>
            <form onSubmit={handleGenerar}>
              <div style={{ marginBottom: '16px' }}>
                <label style={S.label}>¿Qué querés publicar? *</label>
                <textarea
                  value={instruccion}
                  onChange={e => setInstruccion(e.target.value)}
                  rows={6}
                  placeholder={`Ejemplos:\n• "Post anunciando que entregamos la obra del Alma 27 en Junín de los Andes, con tono emotivo"\n• "Reel explicando por qué las casas SIP ahorran energía"\n• "Post de precio del MiCasita con urgencia, válido hasta fin de mes"`}
                  style={{ ...S.input, resize: 'vertical', fontFamily: 'inherit', lineHeight: 1.6, minHeight: '130px' }}
                  onFocus={inputFocus} onBlur={inputBlur}
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={S.label}>Imagen (opcional)</label>
                <div onClick={() => fileRef.current?.click()}
                  style={{ border: `2px dashed ${C.goldBorder}`, borderRadius: '8px', padding: '14px', textAlign: 'center', cursor: 'pointer', background: C.goldDim, minHeight: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                  {imagen
                    ? <img src={imagen} alt="" style={{ maxHeight: '100px', maxWidth: '100%', borderRadius: '6px' }} />
                    : <div style={{ color: C.textMuted, fontSize: '0.82rem' }}>
                        {uploadingImg ? 'Subiendo...' : '📸 Subir imagen (opcional)'}
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
                {generando ? '✨ Generando con IA...' : '✨ Generar contenido'}
              </button>
            </form>
          </div>

          {resultado && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[
                { label: '📝 Contenido generado', value: resultado.contenido },
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
