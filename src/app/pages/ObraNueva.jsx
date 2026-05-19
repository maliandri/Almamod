import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { api } from '../lib/api';
import AppLayout from '../components/AppLayout';

export default function ObraNueva() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [modelos, setModelos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [loadError, setLoadError] = useState('');
  const [form, setForm] = useState({
    modelo_id: '',
    cliente_id: '',
    fecha_inicio: '',
    direccion: '',
    notas: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([
      api.modelos.list(token),
      api.users.list(token, 'cliente'),
    ])
      .then(([mod, usr]) => {
        setModelos(mod.modelos || []);
        setClientes(usr.users || []);
      })
      .catch(err => setLoadError(err.message));
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.modelo_id || !form.cliente_id) {
      setError('Modelo y cliente son requeridos');
      return;
    }
    setLoading(true);
    setError('');
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

  return (
    <AppLayout>
      <div className="p-6 max-w-xl">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate('/app/obras')} className="text-gray-400 hover:text-gray-600 text-lg">←</button>
          <h1 className="text-xl font-bold text-gray-900">Nueva Obra</h1>
        </div>

        {loadError && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 text-sm mb-4">{loadError}</div>
        )}

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Modelo *</label>
              <select
                required
                value={form.modelo_id}
                onChange={(e) => setForm({ ...form, modelo_id: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Seleccioná un modelo</option>
                {modelos.map(m => (
                  <option key={m.id} value={m.id}>{m.nombre} ({m.superficie}m²)</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cliente *</label>
              {clientes.length === 0 ? (
                <div className="text-sm text-gray-500 bg-gray-50 rounded-lg p-3 border border-gray-200">
                  No hay clientes registrados.{' '}
                  <button
                    type="button"
                    onClick={() => navigate('/app/usuarios')}
                    className="text-blue-600 hover:underline"
                  >
                    Invitá uno primero →
                  </button>
                </div>
              ) : (
                <select
                  required
                  value={form.cliente_id}
                  onChange={(e) => setForm({ ...form, cliente_id: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Seleccioná un cliente</option>
                  {clientes.map(c => (
                    <option key={c.id} value={c.id}>{c.nombre} — {c.email}</option>
                  ))}
                </select>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de inicio</label>
              <input
                type="date"
                value={form.fecha_inicio}
                onChange={(e) => setForm({ ...form, fecha_inicio: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Dirección de la obra</label>
              <input
                value={form.direccion}
                onChange={(e) => setForm({ ...form, direccion: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Calle 123, Neuquén"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Notas</label>
              <textarea
                rows={3}
                value={form.notas}
                onChange={(e) => setForm({ ...form, notas: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                placeholder="Observaciones adicionales..."
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-3 py-2 text-sm">{error}</div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg py-2.5 text-sm transition-colors disabled:opacity-50"
            >
              {loading ? 'Creando obra...' : 'Crear obra'}
            </button>
          </form>
        </div>
      </div>
    </AppLayout>
  );
}
