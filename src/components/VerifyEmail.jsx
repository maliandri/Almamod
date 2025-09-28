// src/components/VerifyEmail.jsx - VERSIÓN CORREGIDA
import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { authAPI } from '../utils/api';
import './VerifyEmail.css';

function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('verifying'); // 'verifying', 'success', 'error'
  const [message, setMessage] = useState('Verificando tu email...');

  useEffect(() => {
    const verifyEmail = async () => {
      const token = searchParams.get('token');
      
      if (!token) {
        setStatus('error');
        setMessage('Token de verificación no válido o faltante');
        return;
      }

      try {
        const response = await authAPI.verifyEmail(token);
        setStatus('success');
        setMessage(response.data.msg || '¡Email verificado correctamente! Bienvenido a Almamod.');
        
        // Redirigir al inicio después de 3 segundos
        setTimeout(() => {
          navigate('/');
        }, 3000);
        
      } catch (error) {
        console.error('Error verifying email:', error);
        setStatus('error');
        
        let errorMessage = 'Error al verificar el email. Intenta nuevamente.';
        
        if (error.response?.data?.msg) {
          errorMessage = error.response.data.msg;
        } else if (error.response?.status === 400) {
          errorMessage = 'Token de verificación inválido o expirado';
        } else if (error.message === 'Network Error') {
          errorMessage = 'Error de conexión. Verifica tu internet e intenta nuevamente.';
        }
        
        setMessage(errorMessage);
      }
    };

    verifyEmail();
  }, [searchParams, navigate]);

  const getStatusIcon = () => {
    switch (status) {
      case 'verifying':
        return '⏳';
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      default:
        return '⏳';
    }
  };

  const getStatusTitle = () => {
    switch (status) {
      case 'verifying':
        return 'Verificando Email...';
      case 'success':
        return '¡Verificación Exitosa!';
      case 'error':
        return 'Error de Verificación';
      default:
        return 'Verificando Email...';
    }
  };

  return (
    <div className="verify-email-container">
      <div className={`verify-email-card ${status}`}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>
          {getStatusIcon()}
        </div>
        
        <h2>{getStatusTitle()}</h2>
        
        <p>{message}</p>
        
        {status === 'success' && (
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

export default VerifyEmail;