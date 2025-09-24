// frontend/src/components/VerifyEmail.jsx
import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './VerifyEmail.css'; // Crearemos este archivo para los estilos

function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [status, setStatus] = useState('verifying'); // 'verifying', 'success', 'error'
  const [message, setMessage] = useState('Verificando tu cuenta...');

  useEffect(() => {
    const token = searchParams.get('token');

    if (!token) {
      setStatus('error');
      setMessage('Token no encontrado. Por favor, revisa el enlace en tu correo.');
      return;
    }

    const verifyToken = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/auth/verify-email?token=${token}`);
        setStatus('success');
        setMessage(response.data.msg);

        // Redirigir al login después de 5 segundos
        setTimeout(() => {
          navigate('/login');
        }, 5000);

      } catch (err) {
        setStatus('error');
        const errorMsg = err.response?.data?.msg || 'Ocurrió un error al verificar tu cuenta.';
        setMessage(errorMsg);
      }
    };

    verifyToken();
  }, [searchParams, navigate]);

  return (
    <div className="verify-email-container">
      <div className={`verify-email-card ${status}`}>
        <h2>Estado de Verificación</h2>
        <p>{message}</p>
        {status === 'success' && <p>Serás redirigido a la página de inicio de sesión en 5 segundos...</p>}
        {status === 'error' && <p>Si el problema persiste, intenta registrarte de nuevo o contacta a soporte.</p>}
      </div>
    </div>
  );
}

export default VerifyEmail;