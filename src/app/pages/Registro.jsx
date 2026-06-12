import { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import logoAlmamod from '../../assets/almamod.webp';
import { C, S, ROL_STYLE, ROL_LABEL, inputFocus, inputBlur } from '../styles';

function Field({ k, label, type = 'text', required = false, placeholder = '', inputMode, form, setForm }) {
  return (
    <div style={{ marginBottom: '16px' }}>
      <label style={S.label}>{label}{required && ' *'}</label>
      <input
        type={type}
        inputMode={inputMode}
        required={required}
        value={form[k]}
        onChange={e => setForm(prev => ({ ...prev, [k]: e.target.value }))}
        placeholder={placeholder}
        style={S.input}
        onFocus={inputFocus}
        onBlur={inputBlur}
      />
    </div>
  );
}

export default function Registro() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const invToken = params.get('token');

  const [invitacion, setInvitacion] = useState(null);
  const [invError, setInvError] = useState('');
  const [form, setForm] = useState({ nombre: '', password: '', confirm: '', telefono: '', dni: '', direccion: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!invToken) { setInvError('Token de invitación no encontrado en la URL'); return; }
    api.auth.checkInvite(invToken)
      .then(data => setInvitacion(data))
      .catch(err => setInvError(err.message));
  }, [invToken]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) { setError('Las contraseñas no coinciden'); return; }
    if (form.password.length < 8) { setError('La contraseña debe tener al menos 8 caracteres'); return; }
    setError(''); setLoading(true);
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

  if (success) return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f172a 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px',
    }}>
      <div style={{ width: '100%', maxWidth: '380px', textAlign: 'center' }}>
        <img src={logoAlmamod} alt="AlmaMod" style={{ height: '44px', objectFit: 'contain', marginBottom: '24px' }} />
        <div style={{ ...S.card, textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: '16px' }}>✅</div>
          <h1 style={{ color: C.gold, fontSize: '1.3rem', fontWeight: 700, margin: '0 0 8px 0' }}>¡Registro completado!</h1>
          <p style={{ color: C.textMuted, fontSize: '0.9rem', marginBottom: '24px' }}>Tu cuenta fue creada correctamente.</p>
          <button
            onClick={() => navigate('/app/login')}
            style={{ ...S.btnGold, width: '100%', padding: '12px', fontSize: '0.95rem' }}
          >
            Ir al login →
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f172a 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px',
    }}>
      <div style={{ width: '100%', maxWidth: '400px' }}>
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <img src={logoAlmamod} alt="AlmaMod" style={{ height: '44px', objectFit: 'contain', marginBottom: '10px' }} />
          <p style={{ color: C.textMuted, fontSize: '0.8rem', letterSpacing: '0.08em' }}>COMPLETÁ TU REGISTRO</p>
        </div>

        {invError ? (
          <div style={{ ...S.card, textAlign: 'center' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>❌</div>
            <div style={{ color: C.red, fontSize: '0.9rem' }}>{invError}</div>
          </div>
        ) : !invitacion ? (
          <div style={{ textAlign: 'center', color: C.textMuted, fontSize: '0.9rem', padding: '32px' }}>
            Verificando invitación...
          </div>
        ) : (
          <div style={S.card}>
            {/* Badge de rol */}
            {(() => {
              const rolStyle = ROL_STYLE[invitacion.rol] || ROL_STYLE.cliente;
              return (
                <div style={{ ...rolStyle, border: `1px solid ${rolStyle.color}40`, borderRadius: '10px', padding: '10px 14px', marginBottom: '20px' }}>
                  <div style={{ fontSize: '0.75rem', opacity: 0.8, marginBottom: '2px' }}>Invitado como</div>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{ROL_LABEL[invitacion.rol] || invitacion.rol}</div>
                  <div style={{ fontSize: '0.8rem', opacity: 0.7, marginTop: '2px' }}>{invitacion.email}</div>
                </div>
              );
            })()}

            <form onSubmit={handleSubmit}>
              <Field k="nombre"   label="Nombre completo"      type="text"     required placeholder="Juan García"          form={form} setForm={setForm} />
              <Field k="password" label="Contraseña"           type="password" required placeholder="Mínimo 8 caracteres"  form={form} setForm={setForm} />
              <Field k="confirm"  label="Confirmar contraseña" type="password" required placeholder="••••••••"             form={form} setForm={setForm} />
              <Field k="telefono" label="Teléfono"             type="tel"             placeholder="+54 299 ..."            form={form} setForm={setForm} />

              {invitacion.rol === 'cliente' && <>
                <Field k="dni"      label="DNI"       type="text" inputMode="numeric" placeholder="12.345.678"         form={form} setForm={setForm} />
                <Field k="direccion" label="Dirección" type="text" placeholder="Calle 123, Neuquén" form={form} setForm={setForm} />
              </>}

              {error && <div style={{ ...S.alertError, marginBottom: '16px' }}>{error}</div>}

              <button
                type="submit"
                disabled={loading}
                style={{ ...S.btnGold, width: '100%', padding: '12px', fontSize: '0.95rem', opacity: loading ? 0.6 : 1, marginTop: '8px' }}
              >
                {loading ? 'Creando cuenta...' : 'Crear cuenta'}
              </button>
            </form>
          </div>
        )}

        <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '0.85rem' }}>
          <Link to="/app/login" style={{ color: C.textMuted, textDecoration: 'none' }}
            onMouseEnter={e => e.target.style.color = C.gold}
            onMouseLeave={e => e.target.style.color = C.textMuted}
          >
            ← Ya tengo cuenta
          </Link>
        </p>
      </div>
    </div>
  );
}
