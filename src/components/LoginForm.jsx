// frontend/src/components/LoginForm.jsx
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
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const { email, password } = formData;

  const onChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      // URL ACTUALIZADA para producción
      const response = await axios.post('https://almamod.onrender.com/api/auth/login', formData);
      login(response.data.user, response.data.token);
      
      closeModal();
      navigate('/');

    } catch (err) {
      const errorMsg = err.response?.data?.msg || 'Error al iniciar sesión. Verifique sus credenciales.';
      setError(errorMsg);
    }
  };

  return (
    <div style={{ position: 'relative' }}>
      <button 
        onClick={closeModal} 
        className="close-button" 
        style={{ position: 'absolute', top: '15px', right: '25px', zIndex: 10 }}
      >
        &times;
      </button>

      <form onSubmit={onSubmit} className="register-form">
        <h2>Iniciar Sesión</h2>
        {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}
        <input
          type="email"
          placeholder="Correo Electrónico"
          name="email"
          value={email}
          onChange={onChange}
          required
        />
        <input
          type="password"
          placeholder="Contraseña"
          name="password"
          value={password}
          onChange={onChange}
          required
        />
        <button type="submit" className="submit-button">
          Entrar
        </button>
      </form>
    </div>
  );
}

export default LoginForm;