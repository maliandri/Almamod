// frontend/src/components/ResetPassword.jsx
import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './VerifyEmail.css'; // Reutilizamos los estilos

function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [status, setStatus] = useState('form'); // 'form', 'loading', 'success', 'error'
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validaciones
    if (password.length < 6) {
      setStatus('error');
      setMessage('La contraseña debe tener al menos 6 caracteres');
      return;
    }
    
    if (password !== confirmPassword) {
      setStatus('error');
      setMessage('Las contraseñas no coinciden');
      return;
    }
    
    setStatus('loading');
    setMessage('Restableciendo contraseña...');
    
    const token = searchParams.get('token');
    
    if (!token) {
      setStatus('error');
      setMessage('Token de recuperación no válido');
      return;
    }
    
    try {
      const response = await axios.post(
        `https://almamod.onrender.com/api/auth/reset-password?token=${token}`,
        { password },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      
      setStatus('success');
      setMessage(response.data.msg || 'Contraseña restablecida correctamente');
      
      // Redirigir al login después de 3 segundos
      setTimeout(() => {
        navigate('/');
      }, 3000);
      
    } catch (error) {
      console.error('Error al restablecer contraseña:', error);
      
      setStatus('error');
      
      let errorMessage = 'Error al restablecer la contraseña';
      
      if (error.response?.data?.msg) {
        errorMessage = error.response.data.msg;
      } else if (error.response?.status === 400) {
        errorMessage = 'Token inválido o expirado. Solicita uno nuevo.';
      } else if (error.message === 'Network Error') {
        errorMessage = 'Error de conexión. Verifica tu internet.';
      }
      
      setMessage(errorMessage);
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'loading':
        return '⏳';
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      default:
        return '🔐';
    }
  };

  const getStatusTitle = () => {
    switch (status) {
      case 'loading':
        return 'Restableciendo...';
      case 'success':
        return '¡Contraseña Restablecida!';
      case 'error':
        return 'Error';
      default:
        return 'Nueva Contraseña';
    }
  };

  return (
    <div className="verify-email-container">
      <div className={`verify-email-card ${status}`}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>
          {getStatusIcon()}
        </div>
        
        <h2>{getStatusTitle()}</h2>
        
        {status === 'form' && (
          <form onSubmit={handleSubmit} style={{ marginTop: '20px' }}>
            <p style={{ marginBottom: '20px', color: '#6b7280' }}>
              Ingresa tu nueva contraseña
            </p>
            
            <input
              type="password"
              placeholder="Nueva contraseña (mín. 6 caracteres)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              style={{
                width: '100%',
                padding: '12px',
                marginBottom: '15px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '1rem',
                boxSizing: 'border-box'
              }}
            />
            
            <input
              type="password"
              placeholder="Confirmar contraseña"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={6}
              style={{
                width: '100%',
                padding: '12px',
                marginBottom: '20px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '1rem',
                boxSizing: 'border-box'
              }}
            />
            
            <button
              type="submit"
              style={{
                width: '100%',
                padding: '12px',
                backgroundColor: '#111827',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'background-color 0.2s'
              }}
              onMouseOver={(e) => e.target.style.backgroundColor = '#1f2937'}
              onMouseOut={(e) => e.target.style.backgroundColor = '#111827'}
            >
              Restablecer Contraseña
            </button>
          </form>
        )}
        
        {(status === 'loading' || status === 'error') && (
          <p style={{ marginTop: '15px' }}>{message}</p>
        )}
        
        {status === 'success' && (
          <div>
            <p style={{ marginTop: '15px' }}>{message}</p>
            <div style={{ 
              marginTop: '20px', 
              padding: '15px', 
              backgroundColor: '#f0fdf4', 
              borderRadius: '8px',
              border: '1px solid #bbf7d0'
            }}>
              <p style={{ margin: 0, fontSize: '0.9rem', color: '#16a34a' }}>
                Redirigiendo al inicio en unos segundos...
              </p>
            </div>
          </div>
        )}
        
        {status === 'error' && (
          <div style={{ marginTop: '20px' }}>
            <button 
              onClick={() => navigate('/')}
              style={{
                padding: '12px 24px',
                backgroundColor: '#111827',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '1rem',
                cursor: 'pointer',
                transition: 'background-color 0.2s'
              }}
              onMouseOver={(e) => e.target.style.backgroundColor = '#1f2937'}
              onMouseOut={(e) => e.target.style.backgroundColor = '#111827'}
            >
              Volver al Inicio
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default ResetPassword;