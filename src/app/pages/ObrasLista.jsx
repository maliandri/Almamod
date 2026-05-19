import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { api } from '../lib/api';
import AppLayout from '../components/AppLayout';

const ESTADO_COLOR = {
  activa: 'bg-green-100 text-green-700',
  finalizada: 'bg-gray-100 text-gray-600',
  cancelada: 'bg-red-100 text-red-700',
};

const ETAPA_COLOR = {
  pendiente: 'bg-gray-200',
  cargada: 'bg-yellow-400',
  firmada: 'bg-green-500',
};

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
      <div className="p-6">
        <h1 className="text-xl font-bold text-gray-900 mb-6">Obras</h1>

        {loading && (
          <div className="text-center py-16 text-gray-400 text-sm">Cargando obras...</div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4 text-sm">
            {error}
          </div>
        )}

        {!loading && !error && obras.length === 0 && (
          <div className="text-center py-16 text-gray-400">
            <div className="text-5xl mb-3">🏗️</div>
            <p className="text-sm">No hay obras registradas</p>
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {obras.map(obra => {
            const etapas = [...(obra.etapas_obra || [])].sort((a, b) => a.numero - b.numero);
            const firmadas = etapas.filter(e => e.estado === 'firmada').length;

            return (
              <button
                key={obra.id}
                onClick={() => navigate(`/app/obras/${obra.id}`)}
                className="bg-white rounded-xl border border-gray-200 p-5 text-left hover:shadow-md hover:border-blue-200 transition-all"
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <div className="font-semibold text-gray-900">Obra #{obra.numero_obra}</div>
                    <div className="text-xs text-gray-500 mt-0.5">
                      {obra.modelos?.nombre} · {obra.modelos?.superficie}m²
                    </div>
                  </div>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${ESTADO_COLOR[obra.estado] || 'bg-gray-100 text-gray-600'}`}>
                    {obra.estado}
                  </span>
                </div>

                <div className="mb-3">
                  <div className="text-sm font-medium text-gray-700">{obra.cliente?.nombre}</div>
                  <div className="text-xs text-gray-400">{obra.cliente?.email}</div>
                </div>

                {etapas.length > 0 && (
                  <>
                    <div className="flex gap-1 mb-1">
                      {etapas.map(etapa => (
                        <div
                          key={etapa.id}
                          className={`flex-1 h-2 rounded-full ${ETAPA_COLOR[etapa.estado] || 'bg-gray-200'}`}
                          title={`Etapa ${etapa.numero}: ${etapa.nombre} (${etapa.estado})`}
                        />
                      ))}
                    </div>
                    <div className="text-xs text-gray-400">{firmadas}/{etapas.length} etapas firmadas</div>
                  </>
                )}

                {obra.direccion && (
                  <div className="text-xs text-gray-400 mt-2 truncate">📍 {obra.direccion}</div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </AppLayout>
  );
}
