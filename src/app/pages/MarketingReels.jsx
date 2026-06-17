import { useState } from 'react';
import AppLayout from '../components/AppLayout';
import { C, S, inputFocus, inputBlur } from '../styles';
import { uploadImagen, generarContenido, publicarEnMake } from '../lib/marketing';
import SelectorImagenModelo from '../components/SelectorImagenModelo';
import CampoEditable from '../components/CampoEditable';
import { useModelosCms } from '../hooks/useModelosCms';
const TONOS = ['Inspirador', 'Informativo', 'Urgencia', 'Emocional', 'Humorístico', 'Educativo'];

export default function MarketingReels() {
  const { nombres: MODELOS, getModeloData } = useModelosCms();
  const [form, setForm] = useState({ tema: '', modelo: 'AlmaMod en general', tono: 'Inspirador' });
  const [imagenUrl, setImagenUrl] = useState('');
  const [uploadingImg, setUploadingImg] = useState(false);
  const [generando, setGenerando] = useState(false);
  const [publicando, setPublicando] = useState(false);
  const [resultado, setResultado] = useState(null);
  const [error, setError] = useState('');
  const [publishOk, setPublishOk] = useState(false);

  const handleImagen = async (file) => {
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
      const res = await generarContenido('reel', { ...form, modeloData: getModeloData(form.modelo) });
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
                <select value={form.modelo} onChange={e => { setForm(p => ({ ...p, modelo: e.target.value })); setImagenUrl(''); }} style={S.select}>
                  {MODELOS.map(m => <option key={m}>{m}</option>)}
                </select>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={S.label}>Tono</label>
                <select value={form.tono} onChange={e => setForm(p => ({ ...p, tono: e.target.value }))} style={S.select}>
                  {TONOS.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={S.label}>Imagen del reel</label>
                <SelectorImagenModelo
                  modelo={form.modelo}
                  selectedUrl={imagenUrl}
                  onSelectUrl={url => setImagenUrl(url)}
                  onUploadFile={handleImagen}
                  uploading={uploadingImg}
                  fotosExternas={getModeloData(form.modelo)?.fotos || []}
                />
                {imagenUrl && !uploadingImg && (
                  <div style={{ color: C.green, fontSize: '0.75rem', marginTop: '4px' }}>✓ Imagen seleccionada</div>
                )}
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
              <p style={{ color: C.textMuted, fontSize: '0.78rem', margin: '0 0 2px' }}>
                ✏️ Editá cualquier campo antes de publicar. Lo que dejes acá es lo que se envía a Make.
              </p>
              {[
                { label: '🎯 Hook (primeros 3 seg)', key: 'hook' },
                { label: '📋 Guión', key: 'guion' },
                { label: '📝 Caption', key: 'caption' },
                { label: '#️⃣ Hashtags', key: 'hashtags' },
                { label: '📣 CTA', key: 'cta' },
              ].map(({ label, key }) => key in resultado && (
                <CampoEditable key={key} label={label} value={resultado[key] || ''}
                  onChange={v => setResultado(p => ({ ...p, [key]: v }))} />
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
