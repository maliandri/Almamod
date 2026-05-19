import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { api } from '../lib/api';
import AppLayout from '../components/AppLayout';

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
      if (prev[item.id]) {
        const next = { ...prev };
        delete next[item.id];
        return next;
      }
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
    const items = Object.values(seleccion).filter(v => v.cantidad > 0).map(v => ({
      parte_id: v.parte_id,
      cantidad: v.cantidad,
    }));
    if (items.length === 0) { setError('Seleccioná al menos un material'); return; }
    setSubmitting(true);
    setError('');
    try {
      await api.remitos.create(token, { obra_id, items, notas: notas || undefined });
      navigate(`/app/obras/${obra_id}?tab=remitos`);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="p-6 text-center text-gray-400 text-sm">Cargando checklist...</div>
      </AppLayout>
    );
  }

  if (checklist.length === 0) {
    return (
      <AppLayout>
        <div className="p-6 max-w-xl">
          <button onClick={() => navigate(`/app/obras/${obra_id}`)} className="text-sm text-gray-400 hover:text-gray-600 mb-4 block">← Volver</button>
          <div className="text-center py-16 text-gray-400">
            <div className="text-4xl mb-3">✅</div>
            <p className="text-sm">Todos los materiales ya fueron entregados</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  const numSeleccionados = Object.keys(seleccion).length;

  return (
    <AppLayout>
      <div className="p-6 max-w-2xl">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate(`/app/obras/${obra_id}`)} className="text-gray-400 hover:text-gray-600 text-lg">←</button>
          <h1 className="text-xl font-bold text-gray-900">Crear Remito</h1>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-4">
            <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
              <p className="text-sm font-medium text-gray-700">Materiales pendientes</p>
              <p className="text-xs text-gray-400 mt-0.5">Seleccioná los que se incluirán en este remito</p>
            </div>
            <div className="divide-y divide-gray-50">
              {checklist.map(item => {
                const faltante = item.cantidad_requerida - item.cantidad_entregada;
                const selected = !!seleccion[item.id];
                return (
                  <div
                    key={item.id}
                    className={`px-4 py-3 flex items-center gap-3 transition-colors ${selected ? 'bg-blue-50' : 'hover:bg-gray-50'}`}
                  >
                    <input
                      type="checkbox"
                      checked={selected}
                      onChange={() => toggle(item)}
                      className="w-4 h-4 text-blue-600 rounded flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-900">{item.partes.nombre}</div>
                      <div className="text-xs text-gray-400">
                        {item.partes.codigo} · Faltante: {faltante} {item.partes.unidad}
                      </div>
                    </div>
                    {selected && (
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <input
                          type="number"
                          min={1}
                          max={seleccion[item.id].max}
                          value={seleccion[item.id].cantidad}
                          onChange={(e) => setCantidad(item.id, e.target.value)}
                          className="w-20 border border-gray-300 rounded px-2 py-1 text-sm text-center focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                        <span className="text-xs text-gray-400">{item.partes.unidad}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Notas del remito</label>
            <textarea
              rows={2}
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              placeholder="Observaciones adicionales..."
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-3 py-2 text-sm mb-4">{error}</div>
          )}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => navigate(`/app/obras/${obra_id}`)}
              className="flex-1 border border-gray-300 text-gray-700 font-medium rounded-lg py-2.5 text-sm hover:border-gray-400 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting || numSeleccionados === 0}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg py-2.5 text-sm transition-colors disabled:opacity-50"
            >
              {submitting ? 'Creando...' : `Crear remito${numSeleccionados > 0 ? ` (${numSeleccionados})` : ''}`}
            </button>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}
