// src/components/RegisterForm.jsx - VERSIÓN CORREGIDA
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function RegisterForm({ closeModal }) { 
  const [formData, setFormData] = useState({
    fullName: '', 
    email: '', 
    password: '', 
    phone: '', 
    docType: 'DNI',
    docNumber: '', 
    birthDate: '', 
    street: '', 
    city: 'Neuquén', 
    department: 'Confluencia',
  });
  const [markerPosition] = useState([-38.9516, -68.0591]); // Coordenadas por defecto de Neuquén
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    setError(''); 
    setSuccess('');
    
    // Validaciones básicas del frontend
    if (!formData.fullName.trim()) {
      setError('El nombre es obligatorio');
      setIsSubmitting(false);
      return;
    }
    
    if (!formData.email.trim() || !formData.email.includes('@')) {
      setError('Email inválido');
      setIsSubmitting(false);
      return;
    }
    
    if (formData.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      setIsSubmitting(false);
      return;
    }
    
    if (!formData.phone.trim()) {
      setError('El teléfono es obligatorio');
      setIsSubmitting(false);
      return;
    }
    
    if (!formData.docNumber.trim()) {
      setError('El número de documento es obligatorio');
      setIsSubmitting(false);
      return;
    }
    
    // Datos estructurados correctamente para el backend
    const finalData = {
      fullName: formData.fullName.trim(),
      email: formData.email.trim().toLowerCase(),
      password: formData.password,
      phone: formData.phone.trim(),
      docType: formData.docType,
      docNumber: formData.docNumber.trim(),
      birthDate: formData.birthDate || undefined,
      address: {
        street: formData.street.trim() || '',
        city: formData.city.trim() || 'Neuquén',
        department: formData.department.trim() || 'Confluencia',
        province: 'Neuquén'
      },
      location: {
        type: 'Point',
        coordinates: [markerPosition[1], markerPosition[0]]
      }
    };

    console.log('📤 Datos a enviar al backend:', finalData);

    try {
      const response = await axios.post(
        'https://almamod.onrender.com/api/auth/register', 
        finalData,
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      
      console.log('✅ Respuesta del servidor:', response.data);
      
      setSuccess(response.data.msg + " Redirigiendo...");
      setTimeout(() => {
        closeModal();
      }, 3000);
    } catch (err) {
      console.error('❌ Error completo:', err);
      console.error('❌ Error response:', err.response?.data);
      
      let errorMessage = 'Error al registrar usuario. Por favor, verifica los datos.';
      
      if (err.response?.data?.errors && Array.isArray(err.response.data.errors)) {
        // Si hay múltiples errores, mostrar el primero
        errorMessage = err.response.data.errors[0].msg || err.response.data.errors[0];
      } else if (err.response?.data?.msg) {
        errorMessage = err.response.data.msg;
      } else if (err.message === 'Network Error') {
        errorMessage = 'Error de conexión. Verifica tu internet.';
      } else if (err.response?.status === 400) {
        errorMessage = 'Datos inválidos. Verifica todos los campos.';
      } else if (err.response?.status === 500) {
        errorMessage = 'Error del servidor. Intenta nuevamente más tarde.';
      }
      
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ 
      position: 'relative',
      transform: 'scale(0.95)',
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
          type="text" 
          name="fullName" 
          placeholder="Nombre y Apellido o Razón Social" 
          value={formData.fullName} 
          onChange={handleInputChange} 
          required 
          disabled={isSubmitting}
          style={{
            opacity: isSubmitting ? 0.6 : 1,
            cursor: isSubmitting ? 'not-allowed' : 'text'
          }}
        />
        
        <input 
          type="email" 
          name="email" 
          placeholder="Correo Electrónico" 
          value={formData.email} 
          onChange={handleInputChange} 
          required 
          disabled={isSubmitting}
          style={{
            opacity: isSubmitting ? 0.6 : 1,
            cursor: isSubmitting ? 'not-allowed' : 'text'
          }}
        />
        
        <input 
          type="password" 
          name="password" 
          placeholder="Contraseña (mín. 6 caracteres)" 
          value={formData.password} 
          onChange={handleInputChange} 
          required 
          minLength={6}
          disabled={isSubmitting}
          style={{
            opacity: isSubmitting ? 0.6 : 1,
            cursor: isSubmitting ? 'not-allowed' : 'text'
          }}
        />
        
        <input 
          type="tel" 
          name="phone" 
          placeholder="Teléfono (Ej: 2995414422)" 
          value={formData.phone} 
          onChange={handleInputChange} 
          required 
          disabled={isSubmitting}
          style={{
            opacity: isSubmitting ? 0.6 : 1,
            cursor: isSubmitting ? 'not-allowed' : 'text'
          }}
        />
        
        <div style={{ display: 'flex', gap: '10px' }}>
          <select 
            name="docType" 
            value={formData.docType} 
            onChange={handleInputChange} 
            required
            disabled={isSubmitting}
            style={{ 
              flex: '0 0 30%',
              opacity: isSubmitting ? 0.6 : 1,
              cursor: isSubmitting ? 'not-allowed' : 'pointer'
            }}
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
            style={{ 
              flex: '1',
              opacity: isSubmitting ? 0.6 : 1,
              cursor: isSubmitting ? 'not-allowed' : 'text'
            }}
          />
        </div>
        
        <input 
          type="date" 
          name="birthDate" 
          value={formData.birthDate} 
          onChange={handleInputChange} 
          disabled={isSubmitting}
          placeholder="Fecha de Nacimiento (opcional)"
          style={{
            opacity: isSubmitting ? 0.6 : 1,
            cursor: isSubmitting ? 'not-allowed' : 'text'
          }}
        />
        
        <input 
          type="text" 
          name="street" 
          placeholder="Calle y Número (opcional)" 
          value={formData.street} 
          onChange={handleInputChange} 
          disabled={isSubmitting}
          style={{
            opacity: isSubmitting ? 0.6 : 1,
            cursor: isSubmitting ? 'not-allowed' : 'text'
          }}
        />
        
        <input 
          type="text" 
          name="city" 
          placeholder="Ciudad" 
          value={formData.city} 
          onChange={handleInputChange} 
          disabled={isSubmitting}
          style={{
            opacity: isSubmitting ? 0.6 : 1,
            cursor: isSubmitting ? 'not-allowed' : 'text'
          }}
        />
        
        <input 
          type="text" 
          name="department" 
          placeholder="Departamento" 
          value={formData.department} 
          onChange={handleInputChange} 
          disabled={isSubmitting}
          style={{
            opacity: isSubmitting ? 0.6 : 1,
            cursor: isSubmitting ? 'not-allowed' : 'text'
          }}
        />

        <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
          <button 
            type="submit" 
            className="submit-button" 
            style={{ 
              flex: 1,
              backgroundColor: isSubmitting ? '#9ca3af' : '#111827',
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              padding: '12px',
              border: 'none',
              borderRadius: '4px',
              color: 'white',
              fontSize: '1rem',
              fontWeight: '600',
              transition: 'background-color 0.2s'
            }}
            disabled={isSubmitting}
          >
            {isSubmitting ? '⏳ Registrando...' : 'Registrarse'}
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
              fontWeight: '600',
              transition: 'background-color 0.2s'
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