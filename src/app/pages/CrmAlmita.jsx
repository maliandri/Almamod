import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../hooks/useAuth';
import { api } from '../lib/api';
import AppLayout from '../components/AppLayout';
import { C, S } from '../styles';

const PRODUCTOS = ['MiCasita', 'Alma 18', 'Alma 27', 'Alma Loft 28', 'Alma 36', 'Alma 36 Refugio'];

function Badge({ children, color, bg }) {
  return (
    <span style={{ background: bg, color, fontSize: '0.7rem', fontWeight: 700, padding: '2px 8px', borderRadius: '12px', whiteSpace: 'nowrap' }}>
      {children}
    </span>
  );
}

function formatFecha(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  const ahora = Date.now();
  const diff = ahora - d.getTime();
  if (diff < 60000) return 'Hace un momento';
  if (diff < 3600000) return `Hace ${Math.floor(diff / 60000)} min`;
  if (diff < 86400000) return `Hace ${Math.floor(diff / 3600000)}h`;
  if (diff < 172800000) return 'Ayer';
  return d.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function ConversacionCard({ conv, onDelete }) {
  const [expanded, setExpanded] = useState(false);
  const [confirmDel, setConfirmDel] = useState(false);
  const tieneContacto = conv.email || conv.telefono;
  const msgs = Array.isArray(conv.mensajes) ? conv.mensajes : [];

  return (
    <div style={{
      background: C.bgCard, border: `1px solid ${C.border}`,
      borderRadius: '10px', overflow: 'hidden',
      borderLeft: tieneContacto ? '3px solid #10b981' : '3px solid rgba(148,163,184,0.3)',
    }}>
      {/* Header de la card */}
      <div style={{ padding: '14px 16px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '6px' }}>
            {tieneContacto
              ? <Badge color="#10b981" bg="rgba(16,185,129,0.12)">Con contacto</Badge>
              : <Badge color="#94a3b8" bg="rgba(148,163,184,0.1)">Anónimo</Badge>
            }
            {conv.producto_interes && (
              <Badge color="#d4a574" bg="rgba(212,165,116,0.12)">{conv.producto_interes}</Badge>
            )}
            <span style={{ color: C.textMuted, fontSize: '0.75rem', marginLeft: 'auto' }}>
              {formatFecha(conv.updated_at)}
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '4px 16px' }}>
            <div>
              <span style={{ color: C.textMuted, fontSize: '0.72rem' }}>Nombre </span>
              <span style={{ color: C.text, fontSize: '0.85rem', fontWeight: 600 }}>
                {conv.nombre || <em style={{ color: C.textMuted, fontWeight: 400 }}>No capturado</em>}
              </span>
            </div>
            <div>
              <span style={{ color: C.textMuted, fontSize: '0.72rem' }}>Email </span>
              <span style={{ color: C.text, fontSize: '0.85rem' }}>
                {conv.email || <em style={{ color: C.textMuted, fontWeight: 400 }}>—</em>}
              </span>
            </div>
            <div>
              <span style={{ color: C.textMuted, fontSize: '0.72rem' }}>Teléfono </span>
              <span style={{ color: C.text, fontSize: '0.85rem' }}>
                {conv.telefono || <em style={{ color: C.textMuted, fontWeight: 400 }}>—</em>}
              </span>
            </div>
          </div>

          <div style={{ color: C.textMuted, fontSize: '0.75rem', marginTop: '6px' }}>
            {msgs.length} mensaje{msgs.length !== 1 ? 's' : ''}
            {msgs.length > 0 && (
              <span style={{ marginLeft: '10px', color: C.textMuted }}>
                · Última: &ldquo;{msgs[msgs.length - 1]?.text?.slice(0, 60)}{msgs[msgs.length - 1]?.text?.length > 60 ? '…' : ''}&rdquo;
              </span>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
          <button onClick={() => setExpanded(e => !e)}
            style={{ background: C.goldDim, border: 'none', borderRadius: '6px', padding: '5px 10px', color: C.gold, cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600 }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(212,165,116,0.3)'}
            onMouseLeave={e => e.currentTarget.style.background = C.goldDim}>
            {expanded ? 'Ocultar ▲' : 'Ver ▼'}
          </button>
          {!confirmDel ? (
            <button onClick={() => setConfirmDel(true)}
              style={{ background: 'rgba(239,68,68,0.08)', border: 'none', borderRadius: '6px', padding: '5px 8px', color: C.red, cursor: 'pointer', fontSize: '0.78rem' }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.18)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(239,68,68,0.08)'}>
              ✕
            </button>
          ) : (
            <div style={{ display: 'flex', gap: '4px' }}>
              <button onClick={() => onDelete(conv.id)}
                style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '6px', padding: '4px 8px', color: C.red, cursor: 'pointer', fontSize: '0.72rem', fontWeight: 700 }}>
                Eliminar
              </button>
              <button onClick={() => setConfirmDel(false)}
                style={{ background: 'transparent', border: `1px solid ${C.border}`, borderRadius: '6px', padding: '4px 8px', color: C.textMuted, cursor: 'pointer', fontSize: '0.72rem' }}>
                No
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Chat expandido */}
      {expanded && (
        <div style={{ borderTop: `1px solid ${C.border}`, padding: '14px 16px', maxHeight: '400px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px', background: 'rgba(0,0,0,0.15)' }}>
          {msgs.length === 0 ? (
            <div style={{ color: C.textMuted, fontSize: '0.85rem', textAlign: 'center', padding: '16px' }}>Sin mensajes guardados</div>
          ) : msgs.map((m, i) => (
            <div key={i} style={{ display: 'flex', flexDirection: m.role === 'user' ? 'row-reverse' : 'row', gap: '8px', alignItems: 'flex-end' }}>
              <div style={{
                maxWidth: '75%',
                background: m.role === 'user' ? 'rgba(102,126,234,0.18)' : 'rgba(255,255,255,0.06)',
                border: `1px solid ${m.role === 'user' ? 'rgba(102,126,234,0.3)' : C.border}`,
                borderRadius: m.role === 'user' ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
                padding: '8px 12px',
                color: C.text, fontSize: '0.83rem', lineHeight: 1.45,
              }}>
                {m.text}
              </div>
              <span style={{ color: C.textMuted, fontSize: '0.65rem', flexShrink: 0, paddingBottom: '2px' }}>
                {m.role === 'user' ? '👤' : '🤖'}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function CrmAlmita() {
  const { token } = useAuth();
  const [conversaciones, setConversaciones] = useState([]);
  const [stats, setStats] = useState({ total: 0, conContacto: 0, deHoy: 0 });
  const [loading, setLoading] = useState(true);
  const [filtros, setFiltros] = useState({ q: '', contacto: '', producto: '', dias: '' });
  const [error, setError] = useState('');

  const cargar = async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      if (filtros.contacto) params.set('contacto', filtros.contacto);
      if (filtros.producto) params.set('producto', filtros.producto);
      if (filtros.dias)     params.set('dias', filtros.dias);
      if (filtros.q)        params.set('q', filtros.q);
      const data = await api.crm.list(token, params.toString());
      setConversaciones(data.conversaciones || []);
      setStats(data.stats || { total: 0, conContacto: 0, deHoy: 0 });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { cargar(); }, [token, filtros.contacto, filtros.producto, filtros.dias]);

  // Búsqueda de texto con debounce
  const searchTimer = useRef(null);
  const handleSearch = (v) => {
    setFiltros(f => ({ ...f, q: v }));
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(cargar, 400);
  };

  const handleDelete = async (id) => {
    try {
      await api.crm.delete(token, id);
      setConversaciones(prev => prev.filter(c => c.id !== id));
      setStats(prev => ({ ...prev, total: prev.total - 1 }));
    } catch (err) {
      setError(err.message);
    }
  };

  const inputStyle = {
    background: 'rgba(255,255,255,0.06)', border: `1px solid ${C.border}`,
    borderRadius: '8px', padding: '7px 12px', color: C.text,
    fontSize: '0.85rem', outline: 'none',
  };

  return (
    <AppLayout>
      <div style={{ padding: '28px 32px', maxWidth: '900px' }}>
        <h1 style={S.h1}>🤖 CRM Almita</h1>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '12px', marginBottom: '24px' }}>
          {[
            { label: 'Total conversaciones', value: stats.total, color: C.gold, bg: C.goldDim },
            { label: 'Con datos de contacto', value: stats.conContacto, color: '#10b981', bg: 'rgba(16,185,129,0.12)' },
            { label: 'Actualizadas hoy', value: stats.deHoy, color: '#667eea', bg: 'rgba(102,126,234,0.12)' },
            { label: 'Sin contacto', value: stats.total - stats.conContacto, color: '#94a3b8', bg: 'rgba(148,163,184,0.1)' },
          ].map(s => (
            <div key={s.label} style={{ background: s.bg, border: `1px solid ${s.color}22`, borderRadius: '10px', padding: '14px 16px' }}>
              <div style={{ color: s.color, fontSize: '1.6rem', fontWeight: 700 }}>{s.value}</div>
              <div style={{ color: C.textMuted, fontSize: '0.75rem', marginTop: '2px' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Filtros */}
        <div style={{ ...S.card, marginBottom: '20px', padding: '14px 18px' }}>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
            <input
              type="text" placeholder="Buscar nombre, email o teléfono..."
              value={filtros.q}
              onChange={e => handleSearch(e.target.value)}
              style={{ ...inputStyle, flex: '1', minWidth: '200px' }}
            />
            <select value={filtros.contacto} onChange={e => setFiltros(f => ({ ...f, contacto: e.target.value }))}
              style={{ ...inputStyle, cursor: 'pointer' }}>
              <option value="">Todos</option>
              <option value="si">Con contacto</option>
              <option value="no">Sin datos</option>
            </select>
            <select value={filtros.producto} onChange={e => setFiltros(f => ({ ...f, producto: e.target.value }))}
              style={{ ...inputStyle, cursor: 'pointer' }}>
              <option value="">Todos los modelos</option>
              {PRODUCTOS.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
            <select value={filtros.dias} onChange={e => setFiltros(f => ({ ...f, dias: e.target.value }))}
              style={{ ...inputStyle, cursor: 'pointer' }}>
              <option value="">Todo el tiempo</option>
              <option value="1">Hoy</option>
              <option value="7">Última semana</option>
              <option value="30">Último mes</option>
            </select>
            <button onClick={cargar}
              style={{ background: C.goldDim, border: 'none', borderRadius: '8px', padding: '7px 14px', color: C.gold, cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600, flexShrink: 0 }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(212,165,116,0.3)'}
              onMouseLeave={e => e.currentTarget.style.background = C.goldDim}>
              Actualizar
            </button>
          </div>
        </div>

        {error && <div style={{ ...S.alertError, marginBottom: '16px' }}>{error}</div>}

        {/* Lista */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '48px', color: C.textMuted }}>Cargando...</div>
        ) : conversaciones.length === 0 ? (
          <div style={{ ...S.card, textAlign: 'center', padding: '48px', color: C.textMuted }}>
            <div style={{ fontSize: '2rem', marginBottom: '12px' }}>💬</div>
            <div>Aún no hay conversaciones registradas</div>
            <div style={{ fontSize: '0.82rem', marginTop: '6px', color: C.textMuted }}>
              Aparecerán aquí a medida que los visitantes interactúen con Almita
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {conversaciones.map(conv => (
              <ConversacionCard key={conv.id} conv={conv} onDelete={handleDelete} />
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
