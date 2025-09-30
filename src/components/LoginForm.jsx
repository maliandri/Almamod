// frontend/src/components/LoginForm.jsx - VERSIÓN MEJORADA
import React, { useState, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

function LoginForm({ closeModal }) {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [isSendingReset, setIsSendingReset] = useState(false);
  
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const { email, password } = formData;

  const onChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    setError('');
    setSuccess('');
    
    // Validaciones básicas
    if (!email.trim() || !email.includes('@')) {
      setError('Email inválido');
      setIsSubmitting(false);
      return;
    }
    
    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      setIsSubmitting(false);
      return;
    }
    
    try {
      const response = await axios.post(
        'https://almamod.onrender.com/api/auth/login', 
        {
          email: email.trim().toLowerCase(),
          password: password
        },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      
      console.log('✅ Login exitoso:', response.data);
      
      login(response.data.user, response.data.token);
      
      setSuccess('¡Bienvenido! Redirigiendo...');
      
      setTimeout(() => {
        closeModal();
        navigate('/');
      }, 1000);

    } catch (err) {
      console.error('❌ Error en login:', err.response?.data);
      
      let errorMsg = 'Error al iniciar sesión. Verifique sus credenciales.';
      
      if (err.response?.data?.msg) {
        errorMsg = err.response.data.msg;
      } else if (err.message === 'Network Error') {
        errorMsg = 'Error de conexión. Verifica tu internet.';
      } else if (err.response?.status === 401) {
        errorMsg = 'Email o contraseña incorrectos';
      }
      
      setError(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    
    if (isSendingReset) return;
    
    setIsSendingReset(true);
    setError('');
    setSuccess('');
    
    if (!resetEmail.trim() || !resetEmail.includes('@')) {
      setError('Por favor, ingresa un email válido');
      setIsSendingReset(false);
      return;
    }
    
    try {
      const response = await axios.post(
        'https://almamod.onrender.com/api/auth/forgot-password',
        { email: resetEmail.trim().toLowerCase() },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      
      setSuccess(response.data.msg || 'Se ha enviado un email con instrucciones para recuperar tu contraseña');
      setResetEmail('');
      
      // Volver al login después de 3 segundos
      setTimeout(() => {
        setShowForgotPassword(false);
        setSuccess('');
      }, 3000);
      
    } catch (err) {
      console.error('❌ Error en recuperación:', err.response?.data);
      
      let errorMsg = 'Error al enviar email de recuperación';
      
      if (err.response?.data?.msg) {
        errorMsg = err.response.data.msg;
      } else if (err.message === 'Network Error') {
        errorMsg = 'Error de conexión. Verifica tu internet.';
      }
      
      setError(errorMsg);
    } finally {
      setIsSendingReset(false);
    }
  };

  return (
    <div style={{ 
      position: 'relative',
      transform: 'scale(0.95)',
      transformOrigin: 'center',
      maxWidth: '500px',
      margin: '0 auto'
    }}>
      <button 
        onClick={closeModal} 
        className="close-button" 
        style={{ 
          position: 'absolute', 
          top: '15px', 
          right: '25px', 
          zIndex: 10,
          background: 'transparent',
          border: 'none',
          fontSize: '2rem',
          cursor: 'pointer',
          color: '#9ca3af',
          padding: '0',
          lineHeight: '1'
        }}
      >
        &times;
      </button>

      {!showForgotPassword ? (
        /* FORMULARIO DE LOGIN */
        <form onSubmit={onSubmit} className="register-form">
          <h2>Iniciar Sesión</h2>
          
          {error && (
            <div style={{ 
              color: '#dc2626', 
              backgroundColor: '#fee2e2',
              padding: '12px',
              borderRadius: '6px',
              marginBottom: '15px',
              textAlign: 'center',
              border: '1px solid #fecaca'
            }}>
              {error}
            </div>
          )}
          
          {success && (
            <div style={{ 
              color: '#16a34a', 
              backgroundColor: '#dcfce7',
              padding: '12px',
              borderRadius: '6px',
              marginBottom: '15px',
              textAlign: 'center',
              border: '1px solid #bbf7d0'
            }}>
              {success}
            </div>
          )}
          
          <input
            type="email"
            placeholder="Correo Electrónico"
            name="email"
            value={email}
            onChange={onChange}
            required
            disabled={isSubmitting}
            style={{
              opacity: isSubmitting ? 0.6 : 1,
              cursor: isSubmitting ? 'not-allowed' : 'text'
            }}
          />
          
          <input
            type="password"
            placeholder="Contraseña"
            name="password"
            value={password}
            onChange={onChange}
            required
            minLength={6}
            disabled={isSubmitting}
            style={{
              opacity: isSubmitting ? 0.6 : 1,
              cursor: isSubmitting ? 'not-allowed' : 'text'
            }}
          />
          
          <div style={{ 
            display: 'flex', 
            justifyContent: 'flex-end', 
            marginBottom: '15px',
            marginTop: '-5px'
          }}>
            <button
              type="button"
              onClick={() => {
                setShowForgotPassword(true);
                setError('');
                setSuccess('');
              }}
              disabled={isSubmitting}
              style={{
                background: 'none',
                border: 'none',
                color: '#3b82f6',
                cursor: 'pointer',
                fontSize: '0.9rem',
                textDecoration: 'underline',
                padding: '0',
                opacity: isSubmitting ? 0.6 : 1
              }}
            >
              ¿Olvidaste tu contraseña?
            </button>
          </div>
          
          <button 
            type="submit" 
            className="submit-button"
            disabled={isSubmitting}
            style={{
              backgroundColor: isSubmitting ? '#9ca3af' : '#111827',
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              padding: '12px',
              border: 'none',
              borderRadius: '4px',
              color: 'white',
              fontSize: '1rem',
              fontWeight: '600',
              width: '100%',
              transition: 'background-color 0.2s'
            }}
          >
            {isSubmitting ? '⏳ Iniciando sesión...' : 'Entrar'}
          </button>
        </form>
      ) : (
        /* FORMULARIO DE RECUPERACIÓN DE CONTRASEÑA */
        <form onSubmit={handleForgotPassword} className="register-form">
          <h2>Recuperar Contraseña</h2>
          <p style={{ 
            textAlign: 'center', 
            color: '#6b7280', 
            fontSize: '0.9rem',
            marginBottom: '20px'
          }}>
            Ingresa tu email y te enviaremos instrucciones para restablecer tu contraseña
          </p>
          
          {error && (
            <div style={{ 
              color: '#dc2626', 
              backgroundColor: '#fee2e2',
              padding: '12px',
              borderRadius: '6px',
              marginBottom: '15px',
              textAlign: 'center',
              border: '1px solid #fecaca'
            }}>
              {error}
            </div>
          )}
          
          {success && (
            <div style={{ 
              color: '#16a34a', 
              backgroundColor: '#dcfce7',
              padding: '12px',
              borderRadius: '6px',
              marginBottom: '15px',
              textAlign: 'center',
              border: '1px solid #bbf7d0'
            }}>
              {success}
            </div>
          )}
          
          <input
            type="email"
            placeholder="Correo Electrónico"
            value={resetEmail}
            onChange={(e) => setResetEmail(e.target.value)}
            required
            disabled={isSendingReset}
            style={{
              opacity: isSendingReset ? 0.6 : 1,
              cursor: isSendingReset ? 'not-allowed' : 'text'
            }}
          />
          
          <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
            <button 
              type="submit"
              disabled={isSendingReset}
              style={{
                flex: 1,
                backgroundColor: isSendingReset ? '#9ca3af' : '#111827',
                cursor: isSendingReset ? 'not-allowed' : 'pointer',
                padding: '12px',
                border: 'none',
                borderRadius: '4px',
                color: 'white',
                fontSize: '1rem',
                fontWeight: '600',
                transition: 'background-color 0.2s'
              }}
            >
              {isSendingReset ? '⏳ Enviando...' : 'Enviar Email'}
            </button>
            
            <button
              type="button"
              onClick={() => {
                setShowForgotPassword(false);
                setResetEmail('');
                setError('');
                setSuccess('');
              }}
              disabled={isSendingReset}
              style={{
                flex: '0 0 30%',
                padding: '12px',
                border: '1px solid #ccc',
                borderRadius: '4px',
                backgroundColor: isSendingReset ? '#9ca3af' : '#6c757d',
                color: 'white',
                cursor: isSendingReset ? 'not-allowed' : 'pointer',
                fontSize: '1rem',
                fontWeight: '600',
                transition: 'background-color 0.2s'
              }}
            >
              Volver
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

export default LoginForm;