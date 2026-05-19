import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { api } from '../lib/api';
import AppLayout from '../components/AppLayout';

const ROL_LABEL = {
  superadmin: 'Super Admin',
  dueno: 'Dueño',
  deposito: 'Depósito',
  fabricacion: 'Fabricación',
  cliente: 'Cliente',
};

const ROL_COLOR = {
  superadmin: 'bg-purple-100 text-purple-700',
  dueno: 'bg-blue-100 text-blue-700',
  deposito: 'bg-orange-100 text-orange-700',
  fabricacion: 'bg-green-100 text-green-700',
  cliente: 'bg-gray-100 text-gray-600',
};

export default function Usuarios() {
  const { token } = useAuth();
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ email: '', rol: 'cliente' });
  const [invitando, setInvitando] = useState(false);
  const [invError, setInvError] = useState('');
  const [invSuccess, setInvSuccess] = useState('');

  const cargarUsuarios = () => {
    api.users.list(token)
      .then(data => setUsuarios(data.users || []))
      .finally(() => setLoading(false));
  };

  useEffect(() => { cargarUsuarios(); }, [token]);

  const handleInvitar = async (e) => {
    e.preventDefault();
    setInvError('');
    setInvSuccess('');
    setInvitando(true);
    try {
      await api.auth.invite(token, { email: form.email, rol: form.rol });
      setInvSuccess(`Invitación enviada a ${form.email}`);
      setForm({ email: '', rol: 'cliente' });
    } catch (err) {
      setInvError(err.message);
    } finally {
      setInvitando(false);
    }
  };

  return (
    <AppLayout>
      <div className="p-6 max-w-2xl">
        <h1 className="text-xl font-bold text-gray-900 mb-6">Usuarios</h1>

        {/* Invite form */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
          <h2 className="text-base font-semibold text-gray-900 mb-4">Invitar usuario</h2>
          <form onSubmit={handleInvitar} className="space-y-3">
            <div className="flex gap-2 flex-wrap sm:flex-nowrap">
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="flex-1 min-w-0 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="email@ejemplo.com"
              />
              <select
                value={form.rol}
                onChange={(e) => setForm({ ...form, rol: e.target.value })}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="cliente">Cliente</option>
                <option value="fabricacion">Fabricación</option>
                <option value="deposito">Depósito</option>
                <option value="dueno">Dueño</option>
              </select>
              <button
                type="submit"
                disabled={invitando}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg px-4 py-2 text-sm transition-colors disabled:opacity-50 whitespace-nowrap"
              >
                {invitando ? 'Enviando...' : 'Invitar'}
              </button>
            </div>

            {invError && (
              <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-3 py-2 text-sm">{invError}</div>
            )}
            {invSuccess && (
              <div className="bg-green-50 border border-green-200 text-green-700 rounded-lg px-3 py-2 text-sm">
                ✓ {invSuccess}
              </div>
            )}
          </form>
        </div>

        {/* Users list */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
            <h2 className="text-sm font-medium text-gray-600">Usuarios activos</h2>
            <span className="text-xs text-gray-400">{usuarios.length}</span>
          </div>

          {loading ? (
            <div className="text-center py-8 text-gray-400 text-sm">Cargando...</div>
          ) : usuarios.length === 0 ? (
            <div className="text-center py-8 text-gray-400 text-sm">No hay usuarios registrados</div>
          ) : (
            <div className="divide-y divide-gray-50">
              {usuarios.map(u => (
                <div key={u.id} className="px-5 py-3 flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-gray-900">{u.nombre}</div>
                    <div className="text-xs text-gray-400 truncate">{u.email}</div>
                    {u.telefono && (
                      <div className="text-xs text-gray-400">{u.telefono}</div>
                    )}
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium flex-shrink-0 ${ROL_COLOR[u.rol] || 'bg-gray-100 text-gray-600'}`}>
                    {ROL_LABEL[u.rol] || u.rol}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
