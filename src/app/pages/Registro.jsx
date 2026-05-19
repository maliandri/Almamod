import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { api } from '../lib/api';

const ROL_LABEL = {
  dueno: 'Dueño',
  deposito: 'Depósito',
  fabricacion: 'Fabricación',
  cliente: 'Cliente',
};

export default function Registro() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const invToken = params.get('token');

  const [invitacion, setInvitacion] = useState(null);
  const [invError, setInvError] = useState('');
  const [form, setForm] = useState({
    nombre: '', password: '', confirm: '',
    telefono: '', dni: '', direccion: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!invToken) {
      setInvError('Token de invitación no encontrado en la URL');
      return;
    }
    api.auth.checkInvite(invToken)
      .then(data => setInvitacion(data))
      .catch(err => setInvError(err.message));
  }, [invToken]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) {
      setError('Las contraseñas no coinciden');
      return;
    }
    if (form.password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await api.auth.register({
        token: invToken,
        email: invitacion.email,
        nombre: form.nombre,
        password: form.password,
        telefono: form.telefono || undefined,
        dni: form.dni || undefined,
        direccion: form.direccion || undefined,
      });
      setSuccess(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const field = (key, label, type = 'text', required = false, placeholder = '') => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}{required && ' *'}
      </label>
      <input
        type={type}
        required={required}
        value={form[key]}
        onChange={(e) => setForm({ ...form, [key]: e.target.value })}
        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder={placeholder}
      />
    </div>
  );

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="w-full max-w-sm text-center">
          <div className="text-5xl mb-4">✅</div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">¡Registro completado!</h1>
          <p className="text-gray-500 text-sm mb-6">Tu cuenta fue creada correctamente.</p>
          <button
            onClick={() => navigate('/app/login')}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg py-2.5 px-6 text-sm transition-colors"
          >
            Ir al login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">AlmaMod</h1>
          <p className="text-gray-500 text-sm mt-1">Completá tu registro</p>
        </div>

        {invError ? (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-5 text-sm text-center">
            <div className="text-3xl mb-2">❌</div>
            {invError}
          </div>
        ) : !invitacion ? (
          <div className="text-center text-gray-400 text-sm">Verificando invitación...</div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg px-3 py-2.5 mb-5 text-sm">
              <span className="text-blue-600">Invitado como </span>
              <span className="font-semibold text-blue-800">{ROL_LABEL[invitacion.rol] || invitacion.rol}</span>
              <div className="text-blue-500 text-xs mt-0.5">{invitacion.email}</div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {field('nombre', 'Nombre completo', 'text', true, 'Juan García')}
              {field('password', 'Contraseña', 'password', true, 'Mínimo 8 caracteres')}
              {field('confirm', 'Confirmar contraseña', 'password', true, '••••••••')}
              {field('telefono', 'Teléfono', 'text', false, '+54 299 ...')}

              {invitacion.rol === 'cliente' && (
                <>
                  {field('dni', 'DNI', 'text', false, '12.345.678')}
                  {field('direccion', 'Dirección', 'text', false, 'Calle 123, Neuquén')}
                </>
              )}

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-3 py-2 text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg py-2.5 text-sm transition-colors disabled:opacity-50"
              >
                {loading ? 'Creando cuenta...' : 'Crear cuenta'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
