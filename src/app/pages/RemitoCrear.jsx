import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { api } from '../lib/api';
import AppLayout from '../components/AppLayout';
import { C, S, inputFocus, inputBlur } from '../styles';
import { QRCodeSVG } from 'qrcode.react';

export default function RemitoCrear() {
  const { id: obra_id } = useParams();
  const { token } = useAuth();
  const navigate = useNavigate();

  const [checklist, setChecklist] = useState([]);
  const [seleccion, setSeleccion] = useState({});
  const [notas, setNotas] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [creado, setCreado] = useState(null); // { numero, token_firma }

  useEffect(() => {
    api.checklist.get(token, obra_id)
      .then(data => {
        const pendientes = (data.checklist || []).filter(c => !c.completado);
        setChecklist(pendientes);
      })
      .finally(() => setLoading(false));
  }, [token, obra_id]);

  const toggle = (item) => {
    const faltante = item.cantidad_requerida - item.cantidad_entregada;
    setSeleccion(prev => {
      if (prev[item.id]) { const next = { ...prev }; delete next[item.id]; return next; }
      return { ...prev, [item.id]: { parte_id: item.partes.id, cantidad: faltante, max: faltante } };
    });
  };

  const setCantidad = (id, val) => {
    setSeleccion(prev => ({
      ...prev,
      [id]: { ...prev[id], cantidad: Math.max(1, Math.min(Number(val), prev[id].max)) },
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const items = Object.values(seleccion).filter(v => v.cantidad > 0).map(v => ({ parte_id: v.parte_id, cantidad: v.cantidad }));
    if (items.length === 0) { setError('Seleccioná al menos un material'); return; }
    setSubmitting(true); setError('');
    try {
      const res = await api.remitos.create(token, { obra_id, items, notas: notas || undefined });
      setCreado({ numero: res.numero, token_firma: res.token_firma });
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const backBtn = (
    <button
      onClick={() => navigate(`/app/obras/${obra_id}`)}
      style={{ background: C.goldDim, border: 'none', borderRadius: '8px', width: '36px', height: '36px', color: C.gold, fontSize: '1.1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
    >←</button>
  );

  if (loading) return (
    <AppLayout>
      <div style={{ padding: '28px 32px', color: C.textMuted, textAlign: 'center' }}>Cargando checklist...</div>
    </AppLayout>
  );

  if (checklist.length === 0) return (
    <AppLayout>
      <div style={{ padding: '28px 32px', maxWidth: '560px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '28px' }}>
          {backBtn}
          <h1 style={{ ...S.h1, margin: 0 }}>Crear Remito</h1>
        </div>
        <div style={{ textAlign: 'center', padding: '48px', color: C.textMuted }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>✅</div>
          <p>Todos los materiales ya fueron entregados</p>
        </div>
      </div>
    </AppLayout>
  );

  if (creado) {
    const firmarUrl = `${window.location.origin}/app/firmar/${creado.token_firma}`;
    return (
      <AppLayout>
        <div style={{ padding: '28px 32px', maxWidth: '480px' }}>
          <div style={{ ...S.card, textAlign: 'center' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>📦</div>
            <h2 style={{ ...S.h2, color: C.gold, marginBottom: '4px' }}>Remito #{creado.numero} creado</h2>
            <p style={{ color: C.textMuted, fontSize: '0.85rem', marginBottom: '24px' }}>
              Escaneá el QR o compartí el link para que Fabricación firme la recepción.
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px', padding: '16px', background: '#fff', borderRadius: '12px', display: 'inline-block' }}>
              <QRCodeSVG value={firmarUrl} size={200} level="M" />
            </div>
            <div style={{ background: 'rgba(0,0,0,0.2)', borderRadius: '8px', padding: '10px 14px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ color: C.textMuted, fontSize: '0.75rem', flex: 1, wordBreak: 'break-all', textAlign: 'left' }}>{firmarUrl}</span>
              <button onClick={() => navigator.clipboard.writeText(firmarUrl)}
                style={{ ...S.btnGhost, fontSize: '0.75rem', padding: '4px 10px', flexShrink: 0 }}>
                Copiar
              </button>
            </div>
            <button onClick={() => navigate(`/app/obras/${obra_id}?tab=remitos`)} style={{ ...S.btnGold, width: '100%', padding: '12px' }}>
              Ver obra →
            </button>
          </div>
        </div>
      </AppLayout>
    );
  }

  const numSeleccionados = Object.keys(seleccion).length;

  return (
    <AppLayout>
      <div style={{ padding: '28px 32px', maxWidth: '680px' }}>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '28px' }}>
          {backBtn}
          <h1 style={{ ...S.h1, margin: 0 }}>Crear Remito</h1>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Lista de materiales */}
          <div style={{ ...S.card, padding: 0, marginBottom: '16px', overflow: 'hidden' }}>
            <div style={{ padding: '14px 20px', borderBottom: `1px solid ${C.border}`, background: 'rgba(212,165,116,0.06)' }}>
              <div style={{ color: C.textSub, fontWeight: 600, fontSize: '0.9rem' }}>Materiales pendientes</div>
              <div style={{ color: C.textMuted, fontSize: '0.78rem', marginTop: '2px' }}>Seleccioná los que se incluirán en este remito</div>
            </div>

            {checklist.map((item, i) => {
              const faltante = item.cantidad_requerida - item.cantidad_entregada;
              const selected = !!seleccion[item.id];
              return (
                <div
                  key={item.id}
                  onClick={() => toggle(item)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px 20px',
                    borderBottom: i < checklist.length - 1 ? `1px solid ${C.border}` : 'none',
                    background: selected ? 'rgba(212,165,116,0.07)' : i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)',
                    cursor: 'pointer',
                    transition: 'background 0.15s',
                  }}
                >
                  <div style={{
                    width: '18px', height: '18px', borderRadius: '4px', flexShrink: 0,
                    border: selected ? 'none' : `2px solid ${C.goldBorder}`,
                    background: selected ? C.gold : 'transparent',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {selected && <span style={{ color: '#1a1a2e', fontSize: '0.75rem', fontWeight: 900 }}>✓</span>}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ color: C.text, fontWeight: 500, fontSize: '0.9rem' }}>{item.partes.nombre}</div>
                    <div style={{ color: C.textMuted, fontSize: '0.75rem', marginTop: '2px' }}>
                      {item.partes.codigo} · Faltante: {faltante} {item.partes.unidad}
                    </div>
                  </div>

                  {selected && (
                    <div onClick={e => e.stopPropagation()} style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                      <input
                        type="number"
                        min={1}
                        max={seleccion[item.id].max}
                        value={seleccion[item.id].cantidad}
                        onChange={e => setCantidad(item.id, e.target.value)}
                        style={{ ...S.input, width: '72px', padding: '6px 10px', textAlign: 'center' }}
                        onFocus={inputFocus}
                        onBlur={inputBlur}
                      />
                      <span style={{ color: C.textMuted, fontSize: '0.8rem' }}>{item.partes.unidad}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Notas */}
          <div style={{ ...S.card, marginBottom: '16px' }}>
            <label style={S.label}>Notas del remito</label>
            <textarea
              rows={2}
              value={notas}
              onChange={e => setNotas(e.target.value)}
              placeholder="Observaciones adicionales..."
              style={{ ...S.input, resize: 'none' }}
              onFocus={inputFocus}
              onBlur={inputBlur}
            />
          </div>

          {error && <div style={{ ...S.alertError, marginBottom: '16px' }}>{error}</div>}

          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              type="button"
              onClick={() => navigate(`/app/obras/${obra_id}`)}
              style={{ ...S.btnGhost, flex: 1, padding: '12px' }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting || numSeleccionados === 0}
              style={{ ...S.btnGold, flex: 1, padding: '12px', opacity: (submitting || numSeleccionados === 0) ? 0.5 : 1 }}
            >
              {submitting ? 'Creando...' : `📦 Crear remito${numSeleccionados > 0 ? ` (${numSeleccionados})` : ''}`}
            </button>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}
