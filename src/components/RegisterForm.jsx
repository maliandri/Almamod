// src/components/RegisterForm.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function RegisterForm({ closeModal }) { 
  const [formData, setFormData] = useState({
    fullName: '', email: '', password: '', phone: '', docType: 'DNI',
    docNumber: '', birthDate: '', street: '', city: 'Neuquén', department: 'Confluencia',
  });
  const [mapPosition, setMapPosition] = useState([-38.9516, -68.0591]);
  const [markerPosition, setMarkerPosition] = useState([-38.9516, -68.0591]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSearchAddress = async () => {
    // Lógica de búsqueda de dirección (sin cambios)
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); 
    setSuccess('');
    
    // Datos estructurados correctamente para el backend
    const finalData = {
      fullName: formData.fullName,
      email: formData.email,
      password: formData.password,
      phone: formData.phone,
      docType: formData.docType,
      docNumber: formData.docNumber,
      birthDate: formData.birthDate || null,
      address: {
        street: formData.street || '',
        city: formData.city || 'Neuquén',
        department: formData.department || 'Confluencia',
        province: 'Neuquén'  // 👈 Campo requerido por el modelo
      },
      location: {
        type: 'Point',
        coordinates: [markerPosition[1], markerPosition[0]] // [longitud, latitud]
      }
    };

    try {
      const response = await axios.post('https://almamod.onrender.com/api/auth/register', finalData);
      setSuccess(response.data.msg + " Redirigiendo a Login...");
      setTimeout(() => {
        closeModal();
      }, 3000);
    } catch (err) {
      console.log('Error completo:', err.response?.data); // Para debugging
      // Mejor manejo de errores
      if (err.response?.data?.errors) {
        // Si hay errores de validación, muestra el primero
        setError(err.response.data.errors[0].msg);
      } else if (err.response?.data?.msg) {
        // Si hay un mensaje de error específico
        setError(err.response.data.msg);
      } else {
        // Error genérico
        setError('Error al registrar usuario. Por favor, verifica los datos.');
      }
    }
  };

  return (
    <div style={{ 
      position: 'relative',
      transform: 'scale(0.95)', // 5% más pequeño
      transformOrigin: 'center',
      maxWidth: '570px',
      margin: '0 auto'
    }}> 
      {/* Botón X para cerrar */}
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
      
      <form onSubmit={handleSubmit} className="register-form">
        <h2>Crear una Cuenta</h2>
        
        {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}
        {success && <p style={{ color: 'green', textAlign: 'center' }}>{success}</p>}
        
        <input 
          type="text" 
          name="fullName" 
          placeholder="Nombre y Apellido o Razón Social" 
          value={formData.fullName} 
          onChange={handleInputChange} 
          required 
        />
        
        <input 
          type="email" 
          name="email" 
          placeholder="Correo Electrónico" 
          value={formData.email} 
          onChange={handleInputChange} 
          required 
        />
        
        <input 
          type="password" 
          name="password" 
          placeholder="Contraseña (mín. 6 caracteres)" 
          value={formData.password} 
          onChange={handleInputChange} 
          required 
        />
        
        <input 
          type="text" 
          name="phone" 
          placeholder="Teléfono" 
          value={formData.phone} 
          onChange={handleInputChange} 
          required 
        />
        
        <div style={{ display: 'flex', gap: '10px' }}>
          <select 
            name="docType" 
            value={formData.docType} 
            onChange={handleInputChange} 
            required
            style={{ flex: '0 0 30%' }}
          >
            <option value="DNI">DNI</option>
            <option value="CUIT">CUIT</option>
          </select>
          
          <input 
            type="text" 
            name="docNumber" 
            placeholder="Número de Documento" 
            value={formData.docNumber} 
            onChange={handleInputChange} 
            required 
            style={{ flex: '1' }}
          />
        </div>
        
        <input 
          type="date" 
          name="birthDate" 
          value={formData.birthDate} 
          onChange={handleInputChange} 
          placeholder="Fecha de Nacimiento (opcional)"
        />
        
        <input 
          type="text" 
          name="street" 
          placeholder="Calle y Número (opcional)" 
          value={formData.street} 
          onChange={handleInputChange} 
        />
        
        <input 
          type="text" 
          name="city" 
          placeholder="Ciudad" 
          value={formData.city} 
          onChange={handleInputChange} 
        />
        
        <input 
          type="text" 
          name="department" 
          placeholder="Departamento" 
          value={formData.department} 
          onChange={handleInputChange} 
        />

        <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
          <button type="submit" className="submit-button" style={{ flex: 1 }}>
            Registrarse
          </button>
          
          <button 
            type="button" 
            onClick={closeModal}
            style={{
              flex: '0 0 30%',
              padding: '12px',
              border: '1px solid #ccc',
              borderRadius: '4px',
              backgroundColor: '#6c757d',
              color: 'white',
              cursor: 'pointer',
              fontSize: '1rem',
              fontWeight: '600'
            }}
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}

export default RegisterForm;