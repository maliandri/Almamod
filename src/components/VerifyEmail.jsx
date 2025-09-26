// src/components/VerifyEmail.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useSearchParams } from 'react-router-dom';

function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const [message, setMessage] = useState('Verificando email...');
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    const verifyEmail = async () => {
      const token = searchParams.get('token');
      
      if (!token) {
        setMessage('Token de verificación no válido');
        setIsError(true);
        return;
      }

      try {
        // URL ACTUALIZADA para producción
        const response = await axios.get(`https://almamod.onrender.com/api/auth/verify-email?token=${token}`);
        setMessage(response.data.msg);
        setIsError(false);
      } catch (error) {
        setMessage(error.response?.data?.msg || 'Error al verificar el email');
        setIsError(true);
      }
    };

    verifyEmail();
  }, [searchParams]);

  return (
    <div style={{ textAlign: 'center', padding: '2rem' }}>
      <h2>Verificación de Email</h2>
      <p style={{ color: isError ? 'red' : 'green' }}>{message}</p>
    </div>
  );
}

export default VerifyEmail;