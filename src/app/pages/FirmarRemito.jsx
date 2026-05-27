import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';

const BASE = '/.netlify/functions';

const S = {
  label: { display: 'block', color: '#94a3b8', fontSize: '0.8rem', fontWeight: 600, marginBottom: '6px', letterSpacing: '0.04em', textTransform: 'uppercase' },
  input: { width: '100%', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '8px', color: '#e2e8f0', padding: '10px 14px', fontSize: '0.95rem', outline: 'none', boxSizing: 'border-box' },
};

export default function FirmarRemito() {
  const { token } = useParams();
  const [remito, setRemito] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ nombre: '', dni: '' });
  const [firmando, setFirmando] = useState(false);
  const [firmado, setFirmado] = useState(false);
  const canvasRef = useRef();
  const drawing = useRef(false);
  const lastPos = useRef(null);

  useEffect(() => {
    fetch(`${BASE}/remito-token?token=${token}`)
      .then(r => r.json())
      .then(d => {
        if (d.error) setError(d.error);
        else setRemito(d.remito);
      })
      .catch(() => setError('Error de conexión'))
      .finally(() => setLoading(false));
  }, [token]);

  const getPos = (e, canvas) => {
    const rect = canvas.getBoundingClientRect();
    const src = e.touches ? e.touches[0] : e;
    return { x: src.clientX - rect.left, y: src.clientY - rect.top };
  };

  const startDraw = (e) => {
    e.preventDefault();
    drawing.current = true;
    const canvas = canvasRef.current;
    lastPos.current = getPos(e, canvas);
  };

  const draw = (e) => {
    e.preventDefault();
    if (!drawing.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const pos = getPos(e, canvas);
    ctx.beginPath();
    ctx.moveTo(lastPos.current.x, lastPos.current.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.strokeStyle = '#1a1a2e';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.stroke();
    lastPos.current = pos;
  };

  const stopDraw = () => { drawing.current = false; };

  const limpiarFirma = () => {
    const canvas = canvasRef.current;
    canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
  };

  const handleFirmar = async () => {
    if (!form.nombre.trim() || !form.dni.trim()) {
      setError('Completá nombre y DNI');
      return;
    }
    const canvas = canvasRef.current;
    const firma_imagen = canvas.toDataURL('image/png');
    setFirmando(true); setError('');
    try {
      const res = await fetch(`${BASE}/remito-token?token=${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre: form.nombre, dni: form.dni, firma_imagen }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setFirmado(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setFirmando(false);
    }
  };

  const bg = { minHeight: '100vh', background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', padding: '24px 16px', fontFamily: 'system-ui, sans-serif' };
  const card = { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '24px', maxWidth: '480px', margin: '0 auto' };
  const gold = '#d4a574';

  if (loading) return (
    <div style={bg}>
      <div style={{ ...card, textAlign: 'center', color: '#94a3b8' }}>Cargando remito...</div>
    </div>
  );

  if (error && !remito) return (
    <div style={bg}>
      <div style={{ ...card, textAlign: 'center' }}>
        <div style={{ fontSize: '2rem', marginBottom: '8px' }}>⚠️</div>
        <p style={{ color: '#fca5a5' }}>{error}</p>
      </div>
    </div>
  );

  if (firmado) return (
    <div style={bg}>
      <div style={{ ...card, textAlign: 'center' }}>
        <div style={{ fontSize: '3rem', marginBottom: '12px' }}>✅</div>
        <h2 style={{ color: gold, marginBottom: '8px' }}>¡Remito firmado!</h2>
        <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>La recepción de materiales quedó registrada correctamente.</p>
        <p style={{ color: '#64748b', fontSize: '0.8rem', marginTop: '8px' }}>Podés cerrar esta ventana.</p>
      </div>
    </div>
  );

  if (remito?.estado === 'firmado') return (
    <div style={bg}>
      <div style={{ ...card, textAlign: 'center' }}>
        <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>✅</div>
        <h2 style={{ color: gold, marginBottom: '8px' }}>Remito #{remito.numero}</h2>
        <p style={{ color: '#94a3b8' }}>Este remito ya fue firmado.</p>
        {remito.firmado_nombre && <p style={{ color: '#64748b', fontSize: '0.82rem', marginTop: '8px' }}>Firmado por: {remito.firmado_nombre}</p>}
      </div>
    </div>
  );

  return (
    <div style={bg}>
      <div style={card}>
        {/* Header */}
        <div style={{ marginBottom: '20px', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '16px' }}>
          <div style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '4px' }}>AlmaMod</div>
          <h1 style={{ color: gold, fontSize: '1.3rem', fontWeight: 700, margin: 0 }}>Remito #{remito.numero}</h1>
          <div style={{ color: '#94a3b8', fontSize: '0.82rem', marginTop: '4px' }}>
            Obra #{remito.obras?.numero_obra} · {remito.obras?.modelos?.nombre}
          </div>
        </div>

        {/* Ítems */}
        <div style={{ marginBottom: '20px' }}>
          <div style={{ color: '#94a3b8', fontSize: '0.78rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '10px' }}>Materiales a recibir</div>
          {remito.remito_items?.map((item, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.05)', color: '#e2e8f0', fontSize: '0.88rem' }}>
              <span>{item.partes?.nombre}</span>
              <span style={{ color: gold, fontWeight: 600 }}>{item.cantidad} {item.partes?.unidad}</span>
            </div>
          ))}
          {remito.notas && <p style={{ color: '#64748b', fontSize: '0.8rem', marginTop: '10px', fontStyle: 'italic' }}>Nota: {remito.notas}</p>}
        </div>

        {/* Datos del firmante */}
        <div style={{ marginBottom: '16px' }}>
          <label style={S.label}>Nombre completo *</label>
          <input value={form.nombre} onChange={e => setForm(p => ({ ...p, nombre: e.target.value }))}
            placeholder="Juan Pérez" style={S.input} />
        </div>
        <div style={{ marginBottom: '20px' }}>
          <label style={S.label}>DNI *</label>
          <input value={form.dni} onChange={e => setForm(p => ({ ...p, dni: e.target.value }))}
            placeholder="30123456" style={{ ...S.input, maxWidth: '180px' }} />
        </div>

        {/* Pad de firma */}
        <div style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <label style={S.label}>Firma</label>
            <button onClick={limpiarFirma} style={{ background: 'none', border: 'none', color: '#64748b', fontSize: '0.75rem', cursor: 'pointer', padding: '2px 6px' }}>Borrar</button>
          </div>
          <canvas
            ref={canvasRef}
            width={432}
            height={140}
            style={{ width: '100%', height: '140px', background: '#fff', borderRadius: '8px', cursor: 'crosshair', touchAction: 'none', display: 'block' }}
            onMouseDown={startDraw} onMouseMove={draw} onMouseUp={stopDraw} onMouseLeave={stopDraw}
            onTouchStart={startDraw} onTouchMove={draw} onTouchEnd={stopDraw}
          />
          <p style={{ color: '#475569', fontSize: '0.72rem', marginTop: '6px' }}>Firmá con el dedo o el mouse</p>
        </div>

        {error && <div style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '8px', padding: '10px 14px', color: '#fca5a5', fontSize: '0.85rem', marginBottom: '16px' }}>{error}</div>}

        <button onClick={handleFirmar} disabled={firmando}
          style={{ width: '100%', padding: '14px', background: 'linear-gradient(135deg, #d4a574, #b8865a)', border: 'none', borderRadius: '10px', color: '#1a1a2e', fontWeight: 700, fontSize: '1rem', cursor: firmando ? 'not-allowed' : 'pointer', opacity: firmando ? 0.6 : 1 }}>
          {firmando ? 'Firmando...' : '✍️ Confirmar recepción'}
        </button>
      </div>
    </div>
  );
}
