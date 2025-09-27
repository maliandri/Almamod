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
  const [isSubmitting, setIsSubmitting] = useState(false); // 👈 NUEVO ESTADO PARA PREVENIR DOBLE ENVÍO
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
    
    // Prevenir múltiples envíos
    if (isSubmitting) return; // 👈 SALIR SI YA ESTÁ ENVIANDO
    
    setIsSubmitting(true); // 👈 BLOQUEAR BOTÓN
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
        province: 'Neuquén'
      },
      location: {
        type: 'Point',
        coordinates: [markerPosition[1], markerPosition[0]]
      }
    };

    try {
      const response = await axios.post('https://almamod.onrender.com/api/auth/register', finalData);
      setSuccess(response.data.msg + " Redirigiendo a Login...");
      setTimeout(() => {
        closeModal();
      }, 3000);
    } catch (err) {
      console.log('Error completo:', err.response?.data);
      if (err.response?.data?.errors) {
        setError(err.response.data.errors[0].msg);
      } else if (err.response?.data?.msg) {
        setError(err.response.data.msg);
      } else {
        setError('Error al registrar usuario. Por favor, verifica los datos.');
      }
    } finally {
      setIsSubmitting(false); // 👈 SIEMPRE DESBLOQUEAR BOTÓN AL FINAL
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
          disabled={isSubmitting}
        />
        
        <input 
          type="email" 
          name="email" 
          placeholder="Correo Electrónico" 
          value={formData.email} 
          onChange={handleInputChange} 
          required 
          disabled={isSubmitting}
        />
        
        <input 
          type="password" 
          name="password" 
          placeholder="Contraseña (mín. 6 caracteres)" 
          value={formData.password} 
          onChange={handleInputChange} 
          required 
          disabled={isSubmitting}
        />
        
        <input 
          type="text" 
          name="phone" 
          placeholder="Teléfono" 
          value={formData.phone} 
          onChange={handleInputChange} 
          required 
          disabled={isSubmitting}
        />
        
        <div style={{ display: 'flex', gap: '10px' }}>
          <select 
            name="docType" 
            value={formData.docType} 
            onChange={handleInputChange} 
            required
            disabled={isSubmitting}
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
            disabled={isSubmitting}
            style={{ flex: '1' }}
          />
        </div>
        
        <input 
          type="date" 
          name="birthDate" 
          value={formData.birthDate} 
          onChange={handleInputChange} 
          disabled={isSubmitting}
          placeholder="Fecha de Nacimiento (opcional)"
        />
        
        <input 
          type="text" 
          name="street" 
          placeholder="Calle y Número (opcional)" 
          value={formData.street} 
          onChange={handleInputChange} 
          disabled={isSubmitting}
        />
        
        <input 
          type="text" 
          name="city" 
          placeholder="Ciudad" 
          value={formData.city} 
          onChange={handleInputChange} 
          disabled={isSubmitting}
        />
        
        <input 
          type="text" 
          name="department" 
          placeholder="Departamento" 
          value={formData.department} 
          onChange={handleInputChange} 
          disabled={isSubmitting}
        />

        <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
          <button 
            type="submit" 
            className="submit-button" 
            style={{ 
              flex: 1,
              backgroundColor: isSubmitting ? '#9ca3af' : '#111827',
              cursor: isSubmitting ? 'not-allowed' : 'pointer'
            }}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Registrando...' : 'Registrarse'}
          </button>
          
          <button 
            type="button" 
            onClick={closeModal}
            disabled={isSubmitting}
            style={{
              flex: '0 0 30%',
              padding: '12px',
              border: '1px solid #ccc',
              borderRadius: '4px',
              backgroundColor: isSubmitting ? '#9ca3af' : '#6c757d',
              color: 'white',
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
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