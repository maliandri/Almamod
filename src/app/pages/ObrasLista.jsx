import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { api } from '../lib/api';
import AppLayout from '../components/AppLayout';
import { C, S, ESTADO_STYLE, ETAPA_STYLE } from '../styles';

export default function ObrasLista() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [obras, setObras] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.obras.list(token)
      .then(data => setObras(data.obras || []))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [token]);

  return (
    <AppLayout>
      <div style={{ padding: '28px 32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h1 style={{ ...S.h1, margin: 0 }}>🏗️ Obras</h1>
          {obras.length > 0 && (
            <span style={{ background: C.goldDim, color: C.gold, borderRadius: '20px', padding: '4px 14px', fontSize: '0.85rem', fontWeight: 700 }}>
              {obras.length} obra{obras.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>

        {loading && (
          <div style={{ textAlign: 'center', padding: '64px', color: C.textMuted, fontSize: '0.95rem' }}>
            Cargando obras...
          </div>
        )}

        {error && <div style={S.alertError}>{error}</div>}

        {!loading && !error && obras.length === 0 && (
          <div style={{ textAlign: 'center', padding: '64px', color: C.textMuted }}>
            <div style={{ fontSize: '3rem', marginBottom: '12px' }}>🏗️</div>
            <p style={{ fontSize: '0.95rem' }}>No hay obras registradas</p>
          </div>
        )}

        <div style={{ display: 'grid', gap: '16px', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
          {obras.map(obra => {
            const etapas = [...(obra.etapas_obra || [])].sort((a, b) => a.numero - b.numero);
            const firmadas = etapas.filter(e => e.estado === 'firmada').length;
            const estadoStyle = ESTADO_STYLE[obra.estado] || ESTADO_STYLE.finalizada;

            return (
              <button
                key={obra.id}
                onClick={() => navigate(`/app/obras/${obra.id}`)}
                style={{
                  background: C.bgCard,
                  border: `1px solid ${C.border}`,
                  borderRadius: '12px',
                  padding: '20px',
                  textAlign: 'left',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  width: '100%',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = C.bgCardHov;
                  e.currentTarget.style.borderColor = C.gold;
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = `0 8px 24px rgba(212,165,116,0.15)`;
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = C.bgCard;
                  e.currentTarget.style.borderColor = C.border;
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                {/* Header obra */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <div>
                    <div style={{ color: C.gold, fontWeight: 700, fontSize: '1rem' }}>
                      Obra #{obra.numero_obra}
                    </div>
                    <div style={{ color: C.textMuted, fontSize: '0.78rem', marginTop: '2px' }}>
                      {obra.modelos?.nombre} · {obra.modelos?.superficie}m²
                    </div>
                  </div>
                  <span style={{
                    background: estadoStyle.background,
                    color: estadoStyle.color,
                    border: `1px solid ${estadoStyle.border}`,
                    padding: '3px 10px',
                    borderRadius: '20px',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    letterSpacing: '0.04em',
                    flexShrink: 0,
                    textTransform: 'uppercase',
                  }}>
                    {obra.estado}
                  </span>
                </div>

                {/* Cliente */}
                <div style={{ marginBottom: '14px', padding: '10px 12px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
                  <div style={{ color: C.textSub, fontWeight: 600, fontSize: '0.88rem' }}>{obra.cliente?.nombre}</div>
                  <div style={{ color: C.textMuted, fontSize: '0.75rem', marginTop: '2px' }}>{obra.cliente?.email}</div>
                </div>

                {/* Progreso de etapas */}
                {etapas.length > 0 && (
                  <div>
                    <div style={{ display: 'flex', gap: '4px', marginBottom: '6px' }}>
                      {etapas.map(etapa => (
                        <div
                          key={etapa.id}
                          title={`Etapa ${etapa.numero}: ${etapa.nombre} (${etapa.estado})`}
                          style={{
                            flex: 1,
                            height: '6px',
                            borderRadius: '3px',
                            ...ETAPA_STYLE[etapa.estado] || ETAPA_STYLE.pendiente,
                          }}
                        />
                      ))}
                    </div>
                    <div style={{ color: C.textMuted, fontSize: '0.75rem' }}>
                      {firmadas}/{etapas.length} etapas firmadas
                    </div>
                  </div>
                )}

                {obra.direccion && (
                  <div style={{ color: C.textMuted, fontSize: '0.75rem', marginTop: '10px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    📍 {obra.direccion}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </AppLayout>
  );
}
