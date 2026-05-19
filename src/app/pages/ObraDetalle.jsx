import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { api } from '../lib/api';
import AppLayout from '../components/AppLayout';

const ETAPA_EST = {
  pendiente: { label: 'Pendiente', badge: 'bg-gray-100 text-gray-600' },
  cargada:   { label: 'Cargado',   badge: 'bg-yellow-100 text-yellow-700' },
  firmada:   { label: 'Firmada',   badge: 'bg-green-100 text-green-700' },
};

const REMITO_EST = {
  pendiente: { label: 'Pendiente firma', badge: 'bg-yellow-100 text-yellow-700' },
  firmado:   { label: 'Firmado',         badge: 'bg-green-100 text-green-700' },
};

// ── Modal para cargar avance de etapa ──────────────────────────────────
function EtapaCargarModal({ etapa, token, onClose, onSuccess }) {
  const [descripcion, setDescripcion] = useState('');
  const [fotosText, setFotosText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!descripcion.trim()) { setError('La descripción es requerida'); return; }
    setLoading(true);
    setError('');
    try {
      const fotos = fotosText.split('\n').map(u => u.trim()).filter(Boolean);
      await api.etapas.cargar(token, {
        etapa_obra_id: etapa.id,
        descripcion: descripcion.trim(),
        fotos,
      });
      onSuccess();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
        <div className="p-5 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900">Cargar avance</h3>
          <p className="text-sm text-gray-500 mt-0.5">Etapa {etapa.numero}: {etapa.nombre}</p>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descripción *</label>
            <textarea
              required
              rows={4}
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              placeholder="Describí el trabajo realizado en esta etapa..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              URLs de fotos <span className="text-gray-400 font-normal">(una por línea, opcional)</span>
            </label>
            <textarea
              rows={3}
              value={fotosText}
              onChange={(e) => setFotosText(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              placeholder="https://..."
            />
          </div>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-3 py-2 text-sm">{error}</div>
          )}
          <div className="flex gap-3 justify-end">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700">
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg px-4 py-2 text-sm transition-colors disabled:opacity-50"
            >
              {loading ? 'Cargando...' : 'Cargar avance'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Tab: Etapas ────────────────────────────────────────────────────────
function EtapasTab({ etapas, user, token, onRefresh }) {
  const [modalEtapa, setModalEtapa] = useState(null);
  const [firmando, setFirmando] = useState(null);
  const [errFirma, setErrFirma] = useState('');

  const canCargar = ['superadmin', 'fabricacion'].includes(user.rol);
  const canFirmar = ['superadmin', 'dueno'].includes(user.rol);

  const nextCargar = canCargar
    ? etapas.find((e, i) => {
        if (e.estado === 'firmada') return false;
        if (i === 0) return e.estado !== 'cargada';
        return etapas[i - 1]?.estado === 'firmada' && e.estado !== 'cargada';
      })
    : null;

  const handleFirmar = async (etapa) => {
    if (!window.confirm(`¿Confirmás firmar la etapa "${etapa.nombre}"?`)) return;
    setFirmando(etapa.id);
    setErrFirma('');
    try {
      await api.etapas.firmar(token, { etapa_obra_id: etapa.id, confirmado: true });
      onRefresh();
    } catch (err) {
      setErrFirma(err.message);
    } finally {
      setFirmando(null);
    }
  };

  return (
    <div className="space-y-3">
      {errFirma && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-3 py-2 text-sm">{errFirma}</div>
      )}

      {etapas.map(etapa => {
        const est = ETAPA_EST[etapa.estado] || ETAPA_EST.pendiente;
        const puedeCargar = canCargar && nextCargar?.id === etapa.id;
        const puedeFirmar = canFirmar && etapa.estado === 'cargada';

        return (
          <div key={etapa.id} className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className={`w-8 h-8 flex-shrink-0 rounded-full flex items-center justify-center text-sm font-bold ${
                  etapa.estado === 'firmada' ? 'bg-green-500 text-white' :
                  etapa.estado === 'cargada' ? 'bg-yellow-400 text-white' :
                  'bg-gray-200 text-gray-500'
                }`}>
                  {etapa.estado === 'firmada' ? '✓' : etapa.numero}
                </div>
                <div className="min-w-0">
                  <div className="font-medium text-gray-900 text-sm">{etapa.nombre}</div>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${est.badge}`}>{est.label}</span>
                </div>
              </div>

              <div className="flex gap-2 flex-shrink-0">
                {puedeCargar && (
                  <button
                    onClick={() => setModalEtapa(etapa)}
                    className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg px-3 py-1.5 transition-colors"
                  >
                    Cargar avance
                  </button>
                )}
                {puedeFirmar && (
                  <button
                    onClick={() => handleFirmar(etapa)}
                    disabled={firmando === etapa.id}
                    className="bg-green-600 hover:bg-green-700 text-white text-xs font-medium rounded-lg px-3 py-1.5 transition-colors disabled:opacity-50"
                  >
                    {firmando === etapa.id ? 'Firmando...' : 'Firmar'}
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      })}

      {modalEtapa && (
        <EtapaCargarModal
          etapa={modalEtapa}
          token={token}
          onClose={() => setModalEtapa(null)}
          onSuccess={() => { setModalEtapa(null); onRefresh(); }}
        />
      )}
    </div>
  );
}

// ── Tab: Checklist ─────────────────────────────────────────────────────
function ChecklistTab({ obra, user, token }) {
  const [checklist, setChecklist] = useState([]);
  const [resumen, setResumen] = useState(null);
  const [loading, setLoading] = useState(true);
  const [exportando, setExportando] = useState(false);

  useEffect(() => {
    api.checklist.get(token, obra.id)
      .then(data => { setChecklist(data.checklist || []); setResumen(data.resumen); })
      .finally(() => setLoading(false));
  }, [token, obra.id]);

  const handleExportPDF = async () => {
    setExportando(true);
    try { await api.pdf.download(token, obra.id, obra.numero_obra); }
    catch (err) { alert(err.message); }
    finally { setExportando(false); }
  };

  const canCreateRemito = ['superadmin', 'deposito'].includes(user.rol);

  if (loading) return <div className="text-center py-10 text-gray-400 text-sm">Cargando checklist...</div>;

  return (
    <div>
      {resumen && (
        <div className="grid grid-cols-3 gap-3 mb-5">
          {[
            { label: 'Total', value: resumen.total, color: 'text-gray-900' },
            { label: 'Completados', value: resumen.completados, color: 'text-green-600' },
            { label: 'Pendientes', value: resumen.pendientes, color: 'text-orange-500' },
          ].map(({ label, value, color }) => (
            <div key={label} className="bg-white rounded-lg border border-gray-200 p-3 text-center">
              <div className={`text-2xl font-bold ${color}`}>{value}</div>
              <div className="text-xs text-gray-500 mt-0.5">{label}</div>
            </div>
          ))}
        </div>
      )}

      <div className="flex gap-2 mb-4 flex-wrap">
        {canCreateRemito && resumen?.pendientes > 0 && (
          <Link
            to={`/app/obras/${obra.id}/remito/nuevo`}
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg px-4 py-2 transition-colors"
          >
            Crear remito
          </Link>
        )}
        <button
          onClick={handleExportPDF}
          disabled={exportando}
          className="border border-gray-300 hover:border-gray-400 text-gray-700 text-sm font-medium rounded-lg px-4 py-2 transition-colors disabled:opacity-50"
        >
          {exportando ? 'Generando PDF...' : 'Exportar PDF'}
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[500px]">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-left">
                <th className="px-4 py-3 text-gray-500 font-medium text-xs">Código</th>
                <th className="px-4 py-3 text-gray-500 font-medium text-xs">Material</th>
                <th className="px-4 py-3 text-gray-500 font-medium text-xs text-right">Req.</th>
                <th className="px-4 py-3 text-gray-500 font-medium text-xs text-right">Entr.</th>
                <th className="px-4 py-3 text-gray-500 font-medium text-xs text-center">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {checklist.map(item => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-4 py-2.5 font-mono text-xs text-gray-400">{item.partes.codigo}</td>
                  <td className="px-4 py-2.5 text-gray-800">{item.partes.nombre}</td>
                  <td className="px-4 py-2.5 text-right text-gray-500 text-xs">
                    {item.cantidad_requerida} <span className="text-gray-400">{item.partes.unidad}</span>
                  </td>
                  <td className="px-4 py-2.5 text-right text-gray-500 text-xs">
                    {item.cantidad_entregada} <span className="text-gray-400">{item.partes.unidad}</span>
                  </td>
                  <td className="px-4 py-2.5 text-center">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${item.completado ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                      {item.completado ? '✓ OK' : 'Pendiente'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ── Tab: Remitos ───────────────────────────────────────────────────────
function RemitosTab({ obra, user, token }) {
  const [remitos, setRemitos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [firmando, setFirmando] = useState(null);

  const canFirmarRemito = ['superadmin', 'fabricacion'].includes(user.rol);

  const cargar = useCallback(() => {
    setLoading(true);
    api.remitos.list(token, obra.id)
      .then(data => setRemitos(data.remitos || []))
      .finally(() => setLoading(false));
  }, [token, obra.id]);

  useEffect(() => { cargar(); }, [cargar]);

  const handleFirmar = async (remito_id) => {
    if (!window.confirm('¿Confirmás firmar este remito? El checklist se actualizará automáticamente.')) return;
    setFirmando(remito_id);
    try {
      await api.remitos.firmar(token, { remito_id });
      cargar();
    } catch (err) {
      alert(err.message);
    } finally {
      setFirmando(null);
    }
  };

  if (loading) return <div className="text-center py-10 text-gray-400 text-sm">Cargando remitos...</div>;

  if (remitos.length === 0) {
    return <div className="text-center py-10 text-gray-400 text-sm">No hay remitos para esta obra</div>;
  }

  return (
    <div className="space-y-3">
      {remitos.map(remito => {
        const est = REMITO_EST[remito.estado] || REMITO_EST.pendiente;
        return (
          <div key={remito.id} className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="font-medium text-gray-900 text-sm">Remito #{remito.numero}</div>
                <div className="text-xs text-gray-400 mt-0.5">
                  {remito.creador?.nombre} · {new Date(remito.created_at).toLocaleDateString('es-AR')}
                </div>
              </div>
              <span className={`text-xs px-2 py-1 rounded-full font-medium ${est.badge}`}>{est.label}</span>
            </div>

            <div className="space-y-1 mb-3">
              {remito.remito_items?.map((item, i) => (
                <div key={i} className="flex justify-between text-sm">
                  <span className="text-gray-700">{item.partes?.nombre}</span>
                  <span className="text-gray-400 text-xs">{item.cantidad} {item.partes?.unidad}</span>
                </div>
              ))}
            </div>

            {remito.notas && (
              <div className="text-xs text-gray-400 mb-3 italic">"{remito.notas}"</div>
            )}

            {canFirmarRemito && remito.estado === 'pendiente' && (
              <button
                onClick={() => handleFirmar(remito.id)}
                disabled={firmando === remito.id}
                className="bg-green-600 hover:bg-green-700 text-white text-xs font-medium rounded-lg px-3 py-1.5 transition-colors disabled:opacity-50"
              >
                {firmando === remito.id ? 'Firmando...' : 'Firmar remito'}
              </button>
            )}

            {remito.estado === 'firmado' && (
              <div className="text-xs text-gray-400">
                Firmado por {remito.firmado_por_user?.nombre}
                {remito.fecha_firma && ` · ${new Date(remito.fecha_firma).toLocaleDateString('es-AR')}`}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Página principal ───────────────────────────────────────────────────
export default function ObraDetalle() {
  const { id } = useParams();
  const { token, user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [obra, setObra] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tab, setTab] = useState(searchParams.get('tab') || 'etapas');

  const cargarObra = useCallback(() => {
    api.obras.list(token)
      .then(data => {
        const found = (data.obras || []).find(o => o.id === id);
        if (!found) setError('Obra no encontrada');
        else setObra(found);
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [token, id]);

  useEffect(() => { cargarObra(); }, [cargarObra]);

  const etapas = obra ? [...(obra.etapas_obra || [])].sort((a, b) => a.numero - b.numero) : [];
  const showRemitos = ['superadmin', 'dueno', 'deposito', 'fabricacion'].includes(user?.rol);

  const tabs = ['etapas', 'checklist', ...(showRemitos ? ['remitos'] : [])];

  if (loading) {
    return (
      <AppLayout>
        <div className="p-6 text-center text-gray-400 text-sm">Cargando obra...</div>
      </AppLayout>
    );
  }

  if (error || !obra) {
    return (
      <AppLayout>
        <div className="p-6">
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4 text-sm">
            {error || 'Obra no encontrada'}
          </div>
          <button
            onClick={() => navigate('/app/obras')}
            className="mt-4 text-sm text-blue-600 hover:underline"
          >
            ← Volver a obras
          </button>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <button
          onClick={() => navigate('/app/obras')}
          className="text-sm text-gray-400 hover:text-gray-600 mb-3 block"
        >
          ← Obras
        </button>
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-gray-900">Obra #{obra.numero_obra}</h1>
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                obra.estado === 'activa' ? 'bg-green-100 text-green-700' :
                obra.estado === 'finalizada' ? 'bg-gray-100 text-gray-600' :
                'bg-red-100 text-red-700'
              }`}>{obra.estado}</span>
            </div>
            <p className="text-sm text-gray-500">{obra.modelos?.nombre} · {obra.modelos?.superficie}m²</p>
          </div>
        </div>
        <div className="mt-2">
          <span className="text-sm font-medium text-gray-700">{obra.cliente?.nombre}</span>
          {obra.cliente?.email && (
            <span className="text-sm text-gray-400"> · {obra.cliente.email}</span>
          )}
          {obra.cliente?.telefono && (
            <span className="text-sm text-gray-400"> · {obra.cliente.telefono}</span>
          )}
        </div>
        {obra.direccion && (
          <div className="text-xs text-gray-400 mt-1">📍 {obra.direccion}</div>
        )}
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200 px-6 flex gap-1">
        {tabs.map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors capitalize ${
              tab === t
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="p-6">
        {tab === 'etapas' && (
          <EtapasTab etapas={etapas} user={user} token={token} onRefresh={cargarObra} />
        )}
        {tab === 'checklist' && (
          <ChecklistTab obra={obra} user={user} token={token} />
        )}
        {tab === 'remitos' && showRemitos && (
          <RemitosTab obra={obra} user={user} token={token} />
        )}
      </div>
    </AppLayout>
  );
}
