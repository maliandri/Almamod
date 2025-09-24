// frontend/src/components/LoginForm.jsx
import React, { useState, useContext } from 'react'; // <-- CAMBIO: Se importa useContext
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext'; // <-- CAMBIO: Se importa el AuthContext

function LoginForm() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();
  
  const { login } = useContext(AuthContext); // <-- CAMBIO: Se obtiene la función 'login' del contexto

  const { email, password } = formData;

  const onChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const response = await axios.post('http://localhost:5000/api/auth/login', formData);
      
      // --- CAMBIO PRINCIPAL ---
      // En lugar de solo mostrar un alert, usamos la función 'login' del contexto
      // para guardar los datos del usuario y el token en el estado global.
      login(response.data.user, response.data.token);

      // Mantenemos la redirección al inicio
      navigate('/');

    } catch (err) {
      const errorMsg = err.response?.data?.msg || 'Error al iniciar sesión. Verifique sus credenciales.';
      setError(errorMsg);
    }
  };

  return (
    <form onSubmit={onSubmit} className="register-form" style={{ marginTop: '100px' }}>
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
  );
}

export default LoginForm;