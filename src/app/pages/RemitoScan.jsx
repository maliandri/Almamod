import { useState, useRef, useEffect } from 'react';
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
      resolve(dataUrl.split(',')[1]);
    };
    img.src = url;
  });
}

function matchPartes(items, partes) {
  return items.map(item => {
    const codigo = (item.codigo || '').trim().toUpperCase();
    const matched = codigo ? partes.find(p => p.codigo.toUpperCase() === codigo) : null;
    return { ...item, parte_id: matched?.id || null, _parte: matched || null, _familia_filtro: matched?.familia_id ? String(matched.familia_id) : '' };
  });
}

function sugerirCodigo(descripcion, codigoOriginal) {
  if (codigoOriginal) return codigoOriginal.trim().toUpperCase();
  return (descripcion || '')
    .toUpperCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^A-Z0-9\s]/g, '')
    .trim()
    .split(/\s+/)
    .slice(0, 4)
    .join('-');
}

function ModalNuevaParte({ item, familias, onClose, onCreated }) {
  const { token } = useAuth();
  const [form, setForm] = useState({
    codigo: sugerirCodigo(item.descripcion, item.codigo),
    nombre: item.descripcion || '',
    unidad: item.unidad || 'unidad',
    familia_id: item._familia_filtro || '',
    costo: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const f = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSave = async () => {
    if (!form.codigo.trim() || !form.nombre.trim()) { setError('Código y nombre son requeridos'); return; }
    setLoading(true); setError('');
    try {
      const { parte } = await api.partes.create(token, {
        codigo: form.codigo.trim(),
        nombre: form.nombre.trim(),
        unidad: form.unidad.trim() || 'unidad',
        costo: Number(form.costo) || 0,
        stock_actual: 0,
        stock_minimo: 0,
        familia_id: form.familia_id || null,
      });
      onCreated(parte);
    } catch (err) {
      setError(err.message);
    } finally { setLoading(false); }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
      <div style={{ ...S.card, width: '100%', maxWidth: '440px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
          <h2 style={{ ...S.h2, margin: 0, color: C.gold }}>Nueva parte del catálogo</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: C.textMuted, fontSize: '1.4rem', cursor: 'pointer', lineHeight: 1 }}>×</button>
        </div>
        <p style={{ color: C.textMuted, fontSize: '0.8rem', marginTop: 0, marginBottom: '16px' }}>
          Se creará en el catálogo de componentes y quedará vinculada a este ítem del remito.
        </p>

        <div style={{ marginBottom: '12px' }}>
          <label style={S.label}>Código *</label>
          <input value={form.codigo} onChange={e => f('codigo', e.target.value.toUpperCase())} style={S.input} onFocus={inputFocus} onBlur={inputBlur} />
        </div>
        <div style={{ marginBottom: '12px' }}>
          <label style={S.label}>Nombre / Descripción *</label>
          <input value={form.nombre} onChange={e => f('nombre', e.target.value)} style={S.input} onFocus={inputFocus} onBlur={inputBlur} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
          <div>
            <label style={S.label}>Unidad</label>
            <input value={form.unidad} onChange={e => f('unidad', e.target.value)} style={S.input} onFocus={inputFocus} onBlur={inputBlur} />
          </div>
          <div>
            <label style={S.label}>Costo $</label>
            <input type="number" min="0" value={form.costo} onChange={e => f('costo', e.target.value)} style={S.input} onFocus={inputFocus} onBlur={inputBlur} />
          </div>
        </div>
        <div style={{ marginBottom: '18px' }}>
          <label style={S.label}>Familia</label>
          <select value={form.familia_id} onChange={e => f('familia_id', e.target.value)} style={S.select}>
            <option value="">— Sin familia —</option>
            {familias.map(fam => <option key={fam.id} value={fam.id}>{fam.nombre}</option>)}
          </select>
        </div>

        {error && <div style={{ ...S.alertError, marginBottom: '12px' }}>{error}</div>}
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={onClose} style={{ ...S.btnGhost, flex: 1 }}>Cancelar</button>
          <button onClick={handleSave} disabled={loading} style={{ ...S.btnGold, flex: 1, opacity: loading ? 0.6 : 1 }}>
            {loading ? 'Creando...' : 'Crear y vincular'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function RemitoScan() {
  const { token } = useAuth();
  const fileRef = useRef();
  const cameraRef = useRef();
  const [preview, setPreview] = useState(null);
  const [file, setFile] = useState(null);
  const [partes, setPartes] = useState([]);
  const [familias, setFamilias] = useState([]);
  const [analizando, setAnalizando] = useState(false);
  const [resultado, setResultado] = useState(null);
  const [guardando, setGuardando] = useState(false);
  const [guardado, setGuardado] = useState(false);
  const [error, setError] = useState('');
  const [nuevaParteIdx, setNuevaParteIdx] = useState(null);

  useEffect(() => {
    Promise.all([
      api.partes.list(token),
      api.familias.list(token),
    ]).then(([p, f]) => {
      setPartes(p.partes || []);
      setFamilias(f.familias || []);
    });
  }, [token]);

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
      setResultado({ ...data, items: matchPartes(data.items || [], partes) });
    } catch (err) {
      setError(err.message);
    } finally {
      setAnalizando(false);
    }
  };

  const updateItem = (i, field, value) => {
    setResultado(prev => ({
      ...prev,
      items: prev.items.map((it, idx) => {
        if (idx !== i) return it;
        if (field === 'parte_id') {
          const parte = partes.find(p => p.id === Number(value));
          return { ...it, parte_id: parte?.id || null, _parte: parte || null };
        }
        return { ...it, [field]: value };
      }),
    }));
  };

  const removeItem = (i) => {
    setResultado(prev => ({ ...prev, items: prev.items.filter((_, idx) => idx !== i) }));
  };

  const handleParteCreada = (idx, parte) => {
    setPartes(prev => [...prev, parte]);
    setResultado(prev => ({
      ...prev,
      items: prev.items.map((it, i) => i === idx
        ? { ...it, parte_id: parte.id, _parte: parte, _familia_filtro: parte.familia_id ? String(parte.familia_id) : '' }
        : it),
    }));
    setNuevaParteIdx(null);
  };

  const handleGuardar = async () => {
    const itemsConParte = resultado?.items?.filter(it => it.parte_id) || [];
    if (!itemsConParte.length) return;
    setGuardando(true); setError('');
    try {
      const notas = `Ingreso por remito${resultado.numero_doc ? ` #${resultado.numero_doc}` : ''}${resultado.proveedor ? ` — ${resultado.proveedor}` : ''}`;
      for (const item of itemsConParte) {
        await api.stock.registrar(token, {
          parte_id: item.parte_id,
          tipo: 'ingreso',
          cantidad: Number(item.cantidad) || 1,
          notas,
        });
      }
      setGuardado(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setGuardando(false);
    }
  };

  const sinMatch = resultado?.items?.filter(it => !it.parte_id).length || 0;
  const conMatch = resultado?.items?.filter(it => it.parte_id).length || 0;

  return (
    <AppLayout>
      <div style={{ padding: '28px 32px', maxWidth: '760px' }}>
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
            <div style={{ color: C.textMuted, fontSize: '0.78rem', marginTop: '8px' }}>{file.name}</div>
          )}
          <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFile} />
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

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px', flexWrap: 'wrap' }}>
              <span style={{ color: C.text, fontWeight: 600 }}>
                {resultado.items?.length} ítem{resultado.items?.length !== 1 ? 's' : ''} detectados
              </span>
              {conMatch > 0 && (
                <span style={{ background: 'rgba(16,185,129,0.15)', color: '#10b981', fontSize: '0.75rem', fontWeight: 600, padding: '2px 8px', borderRadius: '20px' }}>
                  ✓ {conMatch} vinculado{conMatch !== 1 ? 's' : ''}
                </span>
              )}
              {sinMatch > 0 && (
                <span style={{ background: 'rgba(249,115,22,0.15)', color: '#f97316', fontSize: '0.75rem', fontWeight: 600, padding: '2px 8px', borderRadius: '20px' }}>
                  ⚠ {sinMatch} sin vincular
                </span>
              )}
            </div>

            {sinMatch > 0 && (
              <div style={{ ...S.alertError, marginBottom: '14px', fontSize: '0.82rem' }}>
                Los ítems sin vincular no se guardarán en stock. Seleccioná la parte correspondiente del catálogo o eliminalos.
              </div>
            )}

            {/* Tabla ítems */}
            <div style={{ overflowX: 'auto', marginBottom: '16px' }}>
              <div style={{ ...S.card, padding: 0, overflow: 'hidden', minWidth: '580px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 72px 60px 200px 36px', gap: 0, padding: '8px 14px', background: 'rgba(255,255,255,0.03)', borderBottom: `1px solid ${C.border}` }}>
                  {['Descripción del remito', 'Cantidad', 'Unidad', 'Parte del catálogo', ''].map((h, i) => (
                    <div key={i} style={{ color: C.textMuted, fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase' }}>{h}</div>
                  ))}
                </div>
                {resultado.items?.map((item, i) => {
                  const partesFiltradas = partes.filter(p =>
                    !item._familia_filtro || String(p.familia_id) === item._familia_filtro
                  );
                  return (
                    <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 72px 60px 200px 36px', gap: '6px', padding: '8px 14px', borderBottom: `1px solid ${C.border}`, alignItems: 'center', background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)' }}>
                      <input value={item.descripcion} onChange={e => updateItem(i, 'descripcion', e.target.value)}
                        style={{ ...S.input, padding: '5px 8px', fontSize: '0.82rem' }} onFocus={inputFocus} onBlur={inputBlur} />
                      <input
                        type="text"
                        inputMode="numeric"
                        value={item.cantidad}
                        onChange={e => updateItem(i, 'cantidad', e.target.value.replace(/[^0-9.]/g, ''))}
                        style={{ ...S.input, padding: '5px 8px', fontSize: '0.88rem', textAlign: 'center' }}
                        onFocus={inputFocus} onBlur={inputBlur}
                      />
                      <input value={item.unidad || ''} onChange={e => updateItem(i, 'unidad', e.target.value)}
                        style={{ ...S.input, padding: '5px 8px', fontSize: '0.82rem' }} onFocus={inputFocus} onBlur={inputBlur} />
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                        <select
                          value={item._familia_filtro || ''}
                          onChange={e => updateItem(i, '_familia_filtro', e.target.value)}
                          style={{ background: 'rgba(255,255,255,0.05)', border: `1px solid rgba(212,165,116,0.15)`, borderRadius: '4px', padding: '2px 5px', color: C.textMuted, fontSize: '0.68rem', outline: 'none', cursor: 'pointer' }}
                        >
                          <option value="">— Filtrar familia —</option>
                          {familias.map(f => <option key={f.id} value={String(f.id)}>{f.nombre}</option>)}
                        </select>
                        <select
                          value={item.parte_id || ''}
                          onChange={e => {
                            if (e.target.value === '__nueva__') { setNuevaParteIdx(i); return; }
                            updateItem(i, 'parte_id', e.target.value);
                          }}
                          style={{
                            ...S.select,
                            padding: '4px 7px',
                            fontSize: '0.78rem',
                            borderColor: item.parte_id ? 'rgba(16,185,129,0.5)' : 'rgba(249,115,22,0.5)',
                            color: item.parte_id ? '#10b981' : '#f97316',
                          }}
                        >
                          <option value="">— Sin vincular</option>
                          <option value="__nueva__">+ Crear nueva parte...</option>
                          {partesFiltradas.map(p => (
                            <option key={p.id} value={p.id}>{p.codigo} — {p.nombre}</option>
                          ))}
                        </select>
                      </div>
                      <button onClick={() => removeItem(i)}
                        style={{ background: 'rgba(239,68,68,0.1)', border: 'none', borderRadius: '6px', color: '#ef4444', cursor: 'pointer', fontSize: '0.85rem', padding: '4px', width: '28px', height: '28px', alignSelf: 'center' }}>×</button>
                    </div>
                  );
                })}
              </div>
            </div>

            {guardado ? (
              <div style={{ ...S.alertSuccess }}>
                ✓ {conMatch} ítem{conMatch !== 1 ? 's' : ''} registrado{conMatch !== 1 ? 's' : ''} en stock correctamente
              </div>
            ) : (
              <button onClick={handleGuardar} disabled={guardando || conMatch === 0}
                style={{ ...S.btnGold, padding: '11px 24px', opacity: (guardando || conMatch === 0) ? 0.5 : 1 }}>
                {guardando ? 'Guardando...' : `💾 Registrar ${conMatch} ítem${conMatch !== 1 ? 's' : ''} en stock`}
              </button>
            )}
          </div>
        )}
      </div>

      {nuevaParteIdx !== null && (
        <ModalNuevaParte
          item={resultado.items[nuevaParteIdx]}
          familias={familias}
          onClose={() => setNuevaParteIdx(null)}
          onCreated={(parte) => handleParteCreada(nuevaParteIdx, parte)}
        />
      )}
    </AppLayout>
  );
}
