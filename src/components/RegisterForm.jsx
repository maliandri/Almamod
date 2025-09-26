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
    setError(''); setSuccess('');
    const finalData = {
      ...formData,
      address: {
          street: formData.street, city: formData.city, department: formData.department
      },
      location: {
        type: 'Point', coordinates: [markerPosition[1], markerPosition[0]]
      }
    };

    try {
        // URL ACTUALIZADA para producción
        const response = await axios.post('https://almamod.onrender.com/api/auth/register', finalData);
        setSuccess(response.data.msg + " Redirigiendo a Login...");
        setTimeout(() => {
            closeModal();
        }, 3000);
    } catch (err) {
        setError(err.response?.data?.msg || 'Error al registrar usuario');
    }
  };

  return (
    <div style={{ position: 'relative' }}> 
      <button onClick={closeModal} className="close-button" style={{ position: 'absolute', top: '15px', right: '15px', zIndex: 10 }}>&times;</button>
      <form onSubmit={handleSubmit} className="register-form">
        <h2>Crear una Cuenta</h2>
        
        {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}
        {success && <p style={{ color: 'green', textAlign: 'center' }}>{success}</p>}
        
        <input type="text" name="fullName" placeholder="Nombre y Apellido o Razón Social" value={formData.fullName} onChange={handleInputChange} required />
        <input type="email" name="email" placeholder="Correo Electrónico" value={formData.email} onChange={handleInputChange} required />
        <input type="password" name="password" placeholder="Contraseña" value={formData.password} onChange={handleInputChange} required />
        <input type="text" name="phone" placeholder="Teléfono" value={formData.phone} onChange={handleInputChange} required />
        
        <select name="docType" value={formData.docType} onChange={handleInputChange} required>
          <option value="DNI">DNI</option>
          <option value="CUIT">CUIT</option>
        </select>
        
        <input type="text" name="docNumber" placeholder="Número de Documento" value={formData.docNumber} onChange={handleInputChange} required />
        <input type="date" name="birthDate" value={formData.birthDate} onChange={handleInputChange} />
        
        <input type="text" name="street" placeholder="Calle y Número" value={formData.street} onChange={handleInputChange} />
        <input type="text" name="city" placeholder="Ciudad" value={formData.city} onChange={handleInputChange} />
        <input type="text" name="department" placeholder="Departamento" value={formData.department} onChange={handleInputChange} />

        <button type="submit" className="submit-button">Registrarse</button>
      </form>
    </div>
  );
}

export default RegisterForm;