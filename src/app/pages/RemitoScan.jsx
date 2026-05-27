import { useState, useRef } from 'react';
import { useAuth } from '../hooks/useAuth';
import { api } from '../lib/api';
import AppLayout from '../components/AppLayout';
import { C, S, inputFocus, inputBlur } from '../styles';

async function resizeAndEncode(file) {
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const MAX = 1280;
      let w = img.width, h = img.height;
      if (w > MAX || h > MAX) {
        if (w > h) { h = Math.round(h * MAX / w); w = MAX; }
        else { w = Math.round(w * MAX / h); h = MAX; }
      }
      const canvas = document.createElement('canvas');
      canvas.width = w; canvas.height = h;
      canvas.getContext('2d').drawImage(img, 0, 0, w, h);
      URL.revokeObjectURL(url);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.82);
      resolve(dataUrl.split(',')[1]); // solo el base64
    };
    img.src = url;
  });
}

export default function RemitoScan() {
  const { token } = useAuth();
  const fileRef = useRef();
  const cameraRef = useRef();
  const [preview, setPreview] = useState(null);
  const [file, setFile] = useState(null);
  const [analizando, setAnalizando] = useState(false);
  const [resultado, setResultado] = useState(null);
  const [guardando, setGuardando] = useState(false);
  const [guardado, setGuardado] = useState(false);
  const [error, setError] = useState('');

  const handleFile = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setResultado(null);
    setError('');
    setGuardado(false);
    const reader = new FileReader();
    reader.onload = (ev) => setPreview(ev.target.result);
    reader.readAsDataURL(f);
    e.target.value = '';
  };

  const handleAnalizar = async () => {
    if (!file) return;
    setAnalizando(true); setError(''); setResultado(null);
    try {
      const imagen_base64 = await resizeAndEncode(file);
      const data = await api.remitos.scan(token, { imagen_base64, mime_type: 'image/jpeg' });
      setResultado(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setAnalizando(false);
    }
  };

  const updateItem = (i, field, value) => {
    setResultado(prev => ({
      ...prev,
      items: prev.items.map((it, idx) => idx === i ? { ...it, [field]: value } : it),
    }));
  };

  const removeItem = (i) => {
    setResultado(prev => ({ ...prev, items: prev.items.filter((_, idx) => idx !== i) }));
  };

  const handleGuardar = async () => {
    if (!resultado?.items?.length) return;
    setGuardando(true); setError('');
    try {
      for (const item of resultado.items) {
        await api.stock.registrar(token, {
          tipo: 'entrada',
          cantidad: Number(item.cantidad) || 1,
          motivo: `Ingreso por remito${resultado.numero_doc ? ` #${resultado.numero_doc}` : ''}${resultado.proveedor ? ` — ${resultado.proveedor}` : ''}`,
          descripcion_manual: item.descripcion,
          codigo_manual: item.codigo || null,
        });
      }
      setGuardado(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setGuardando(false);
    }
  };

  return (
    <AppLayout>
      <div style={{ padding: '28px 32px', maxWidth: '720px' }}>
        <h1 style={{ ...S.h1, marginBottom: '6px' }}>📷 Escanear Remito</h1>
        <p style={{ color: C.textMuted, fontSize: '0.88rem', marginBottom: '28px' }}>
          Sacá foto o subí un remito de proveedor — la IA extrae los ítems automáticamente.
        </p>

        {/* Upload */}
        <div style={{ ...S.card, marginBottom: '20px' }}>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
            <button onClick={() => cameraRef.current?.click()}
              style={{ ...S.btnGold, padding: '10px 20px' }}>
              📷 Tomar foto
            </button>
            <button onClick={() => fileRef.current?.click()}
              style={{ ...S.btnGhost, padding: '10px 20px' }}>
              📎 Elegir archivo
            </button>
            {file && (
              <button onClick={handleAnalizar} disabled={analizando}
                style={{ ...S.btnGold, padding: '10px 20px', opacity: analizando ? 0.6 : 1 }}>
                {analizando ? '⏳ Analizando...' : '🔍 Analizar con IA'}
              </button>
            )}
          </div>
          {file && !analizando && (
            <div style={{ color: C.textMuted, fontSize: '0.78rem', marginTop: '8px' }}>
              {file.name}
            </div>
          )}
          {/* Abre galería */}
          <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFile} />
          {/* Abre cámara directamente */}
          <input ref={cameraRef} type="file" accept="image/*" capture="environment" style={{ display: 'none' }} onChange={handleFile} />

          {preview && (
            <div style={{ marginTop: '16px', borderRadius: '10px', overflow: 'hidden', maxHeight: '320px' }}>
              <img src={preview} alt="remito" style={{ width: '100%', objectFit: 'contain', maxHeight: '320px', background: '#000' }} />
            </div>
          )}
        </div>

        {error && <div style={{ ...S.alertError, marginBottom: '16px' }}>{error}</div>}

        {/* Resultado */}
        {resultado && (
          <div style={S.card}>
            {/* Datos del documento */}
            {(resultado.proveedor || resultado.fecha || resultado.numero_doc) && (
              <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', marginBottom: '20px', padding: '12px 16px', background: 'rgba(212,165,116,0.06)', borderRadius: '8px', borderLeft: `3px solid ${C.gold}` }}>
                {resultado.proveedor && <div><span style={{ color: C.textMuted, fontSize: '0.75rem' }}>Proveedor</span><div style={{ color: C.text, fontWeight: 600 }}>{resultado.proveedor}</div></div>}
                {resultado.fecha && <div><span style={{ color: C.textMuted, fontSize: '0.75rem' }}>Fecha</span><div style={{ color: C.text, fontWeight: 600 }}>{resultado.fecha}</div></div>}
                {resultado.numero_doc && <div><span style={{ color: C.textMuted, fontSize: '0.75rem' }}>Nro. documento</span><div style={{ color: C.text, fontWeight: 600 }}>{resultado.numero_doc}</div></div>}
              </div>
            )}

            <div style={{ color: C.text, fontWeight: 600, marginBottom: '12px' }}>
              {resultado.items?.length} ítem{resultado.items?.length !== 1 ? 's' : ''} detectados
              <span style={{ color: C.textMuted, fontWeight: 400, fontSize: '0.82rem', marginLeft: '8px' }}>— podés editar antes de guardar</span>
            </div>

            {/* Tabla ítems */}
            <div style={{ ...S.card, padding: 0, overflow: 'hidden', marginBottom: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 80px 80px 80px 36px', gap: 0, padding: '8px 14px', background: 'rgba(255,255,255,0.03)', borderBottom: `1px solid ${C.border}` }}>
                {['Descripción', 'Cantidad', 'Unidad', 'Código', ''].map((h, i) => (
                  <div key={i} style={{ color: C.textMuted, fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase' }}>{h}</div>
                ))}
              </div>
              {resultado.items?.map((item, i) => (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 80px 80px 80px 36px', gap: '8px', padding: '8px 14px', borderBottom: `1px solid ${C.border}`, alignItems: 'center', background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)' }}>
                  <input value={item.descripcion} onChange={e => updateItem(i, 'descripcion', e.target.value)}
                    style={{ ...S.input, padding: '5px 8px', fontSize: '0.82rem' }} onFocus={inputFocus} onBlur={inputBlur} />
                  <input type="number" value={item.cantidad} onChange={e => updateItem(i, 'cantidad', e.target.value)}
                    style={{ ...S.input, padding: '5px 8px', fontSize: '0.82rem', textAlign: 'center' }} onFocus={inputFocus} onBlur={inputBlur} />
                  <input value={item.unidad || ''} onChange={e => updateItem(i, 'unidad', e.target.value)}
                    style={{ ...S.input, padding: '5px 8px', fontSize: '0.82rem' }} onFocus={inputFocus} onBlur={inputBlur} />
                  <input value={item.codigo || ''} onChange={e => updateItem(i, 'codigo', e.target.value)}
                    style={{ ...S.input, padding: '5px 8px', fontSize: '0.82rem' }} onFocus={inputFocus} onBlur={inputBlur} />
                  <button onClick={() => removeItem(i)}
                    style={{ background: 'rgba(239,68,68,0.1)', border: 'none', borderRadius: '6px', color: '#ef4444', cursor: 'pointer', fontSize: '0.85rem', padding: '4px', width: '28px', height: '28px' }}>×</button>
                </div>
              ))}
            </div>

            {guardado ? (
              <div style={{ ...S.alertSuccess }}>✓ Ítems registrados en stock correctamente</div>
            ) : (
              <button onClick={handleGuardar} disabled={guardando || !resultado.items?.length}
                style={{ ...S.btnGold, padding: '11px 24px', opacity: guardando ? 0.6 : 1 }}>
                {guardando ? 'Guardando...' : `💾 Registrar ${resultado.items?.length} ítem${resultado.items?.length !== 1 ? 's' : ''} en stock`}
              </button>
            )}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
