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
  const [form, setForm] = useState({ modelo_id: '', nombre_contacto: '', fecha_inicio: '', direccion: '', notas: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api.modelos.list(token)
      .then(d => setModelos(d.modelos || []))
      .catch(err => setError(err.message));
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.modelo_id) { setError('Seleccioná un modelo'); return; }
    setLoading(true); setError('');
    try {
      const { obra } = await api.obras.create(token, {
        modelo_id: form.modelo_id,
        nombre_contacto: form.nombre_contacto || undefined,
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

  return (
    <AppLayout>
      <div style={{ padding: '28px 32px', maxWidth: '560px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '28px' }}>
          <button onClick={() => navigate('/app/obras')}
            style={{ background: C.goldDim, border: 'none', borderRadius: '8px', width: '36px', height: '36px', color: C.gold, fontSize: '1.1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            ←
          </button>
          <h1 style={{ ...S.h1, margin: 0 }}>Nueva Obra</h1>
        </div>

        <div style={S.card}>
          <form onSubmit={handleSubmit}>

            <div style={{ marginBottom: '20px' }}>
              <label style={S.label}>Modelo *</label>
              <select required value={form.modelo_id}
                onChange={e => setForm(p => ({ ...p, modelo_id: e.target.value }))}
                style={{ ...S.select, width: '100%' }}>
                <option value="">Seleccioná un modelo</option>
                {modelos.map(m => (
                  <option key={m.id} value={m.id}>{m.nombre} ({m.superficie})</option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={S.label}>Nombre del cliente / contacto</label>
              <input value={form.nombre_contacto}
                onChange={e => setForm(p => ({ ...p, nombre_contacto: e.target.value }))}
                placeholder="Ej: Juan García"
                style={S.input} onFocus={inputFocus} onBlur={inputBlur} />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={S.label}>Dirección de la obra</label>
              <input value={form.direccion}
                onChange={e => setForm(p => ({ ...p, direccion: e.target.value }))}
                placeholder="Calle 123, Neuquén"
                style={S.input} onFocus={inputFocus} onBlur={inputBlur} />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={S.label}>Fecha de inicio</label>
              <input type="date" value={form.fecha_inicio}
                onChange={e => setForm(p => ({ ...p, fecha_inicio: e.target.value }))}
                style={S.input} onFocus={inputFocus} onBlur={inputBlur} />
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={S.label}>Notas</label>
              <textarea rows={3} value={form.notas}
                onChange={e => setForm(p => ({ ...p, notas: e.target.value }))}
                placeholder="Observaciones adicionales..."
                style={{ ...S.input, resize: 'none', fontFamily: 'inherit' }}
                onFocus={inputFocus} onBlur={inputBlur} />
            </div>

            {error && <div style={{ ...S.alertError, marginBottom: '16px' }}>{error}</div>}

            <button type="submit" disabled={loading}
              style={{ ...S.btnGold, width: '100%', padding: '12px', fontSize: '0.95rem', opacity: loading ? 0.6 : 1 }}>
              {loading ? 'Creando obra...' : '🏗️ Crear Obra'}
            </button>
          </form>
        </div>
      </div>
    </AppLayout>
  );
}
