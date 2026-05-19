import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { api } from '../lib/api';
import AppLayout from '../components/AppLayout';
import { C, S, inputFocus, inputBlur } from '../styles';

export default function ObraNueva() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [modelos, setModelos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [loadError, setLoadError] = useState('');
  const [form, setForm] = useState({ modelo_id: '', cliente_id: '', fecha_inicio: '', direccion: '', notas: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([api.modelos.list(token), api.users.list(token, 'cliente')])
      .then(([mod, usr]) => {
        setModelos(mod.modelos || []);
        setClientes(usr.users || []);
      })
      .catch(err => setLoadError(err.message));
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.modelo_id || !form.cliente_id) { setError('Modelo y cliente son requeridos'); return; }
    setLoading(true); setError('');
    try {
      const { obra } = await api.obras.create(token, {
        modelo_id: form.modelo_id,
        cliente_id: form.cliente_id,
        fecha_inicio: form.fecha_inicio || undefined,
        direccion: form.direccion || undefined,
        notas: form.notas || undefined,
      });
      navigate(`/app/obras/${obra.id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fieldStyle = { marginBottom: '20px' };

  return (
    <AppLayout>
      <div style={{ padding: '28px 32px', maxWidth: '560px' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '28px' }}>
          <button
            onClick={() => navigate('/app/obras')}
            style={{ background: C.goldDim, border: 'none', borderRadius: '8px', width: '36px', height: '36px', color: C.gold, fontSize: '1.1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
          >
            ←
          </button>
          <h1 style={{ ...S.h1, margin: 0 }}>Nueva Obra</h1>
        </div>

        {loadError && <div style={{ ...S.alertError, marginBottom: '16px' }}>{loadError}</div>}

        <div style={S.card}>
          <form onSubmit={handleSubmit}>

            <div style={fieldStyle}>
              <label style={S.label}>Modelo *</label>
              <select
                required
                value={form.modelo_id}
                onChange={e => setForm({ ...form, modelo_id: e.target.value })}
                style={{ ...S.select, width: '100%' }}
              >
                <option value="">Seleccioná un modelo</option>
                {modelos.map(m => (
                  <option key={m.id} value={m.id}>{m.nombre} ({m.superficie}m²)</option>
                ))}
              </select>
            </div>

            <div style={fieldStyle}>
              <label style={S.label}>Cliente *</label>
              {clientes.length === 0 ? (
                <div style={{ ...S.cardSm, color: C.textMuted, fontSize: '0.85rem' }}>
                  No hay clientes registrados.{' '}
                  <button
                    type="button"
                    onClick={() => navigate('/app/usuarios')}
                    style={{ background: 'none', border: 'none', color: C.gold, cursor: 'pointer', fontWeight: 600, padding: 0 }}
                  >
                    Invitá uno primero →
                  </button>
                </div>
              ) : (
                <select
                  required
                  value={form.cliente_id}
                  onChange={e => setForm({ ...form, cliente_id: e.target.value })}
                  style={{ ...S.select, width: '100%' }}
                >
                  <option value="">Seleccioná un cliente</option>
                  {clientes.map(c => (
                    <option key={c.id} value={c.id}>{c.nombre} — {c.email}</option>
                  ))}
                </select>
              )}
            </div>

            <div style={fieldStyle}>
              <label style={S.label}>Fecha de inicio</label>
              <input
                type="date"
                value={form.fecha_inicio}
                onChange={e => setForm({ ...form, fecha_inicio: e.target.value })}
                style={S.input}
                onFocus={inputFocus}
                onBlur={inputBlur}
              />
            </div>

            <div style={fieldStyle}>
              <label style={S.label}>Dirección de la obra</label>
              <input
                value={form.direccion}
                onChange={e => setForm({ ...form, direccion: e.target.value })}
                placeholder="Calle 123, Neuquén"
                style={S.input}
                onFocus={inputFocus}
                onBlur={inputBlur}
              />
            </div>

            <div style={{ ...fieldStyle, marginBottom: '24px' }}>
              <label style={S.label}>Notas</label>
              <textarea
                rows={3}
                value={form.notas}
                onChange={e => setForm({ ...form, notas: e.target.value })}
                placeholder="Observaciones adicionales..."
                style={{ ...S.input, resize: 'none' }}
                onFocus={inputFocus}
                onBlur={inputBlur}
              />
            </div>

            {error && <div style={{ ...S.alertError, marginBottom: '16px' }}>{error}</div>}

            <button
              type="submit"
              disabled={loading}
              style={{ ...S.btnGold, width: '100%', padding: '12px', fontSize: '0.95rem', opacity: loading ? 0.6 : 1 }}
            >
              {loading ? 'Creando obra...' : '🏗️ Crear Obra'}
            </button>
          </form>
        </div>
      </div>
    </AppLayout>
  );
}
