// src/components/RegisterForm.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'https://esm.sh/react-leaflet@4.2.1';
import L from 'https://esm.sh/leaflet@1.9.4';

// Código de íconos y mapa (sin cambios)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});
const ChangeMapView = ({ coords }) => {
  const map = useMap();
  useEffect(() => {
    if (coords) map.setView(coords, 15);
  }, [coords, map]);
  return null;
}

// AÑADIMOS 'closeModal' como prop
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

  const handleSearchAddress = async () => { /* ... (sin cambios) */ };

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
    // ... (resto de la lógica de submit sin cambios)
    try {
        const response = await axios.post('http://localhost:5000/api/auth/register', finalData);
        setSuccess(response.data.msg + " Redirigiendo a Login...");
        setTimeout(() => {
            closeModal(); // Cierra este modal y abre el de login
        }, 3000);
    } catch (err) {
        // ... (manejo de errores sin cambios)
    }
  };

  return (
    // Añadimos un contenedor y el botón de cierre
    <div style={{ position: 'relative' }}> 
      <button onClick={closeModal} className="close-button" style={{ position: 'absolute', top: '15px', right: '15px', zIndex: 10 }}>&times;</button>
      <form onSubmit={handleSubmit} className="register-form">
        <h2>Crear una Cuenta</h2>
        
        {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}
        {success && <p style={{ color: 'green', textAlign: 'center' }}>{success}</p>}
        
        {/* El resto de tu formulario aquí, sin cambios */}
        <input type="text" name="fullName" placeholder="Nombre y Apellido o Razón Social" value={formData.fullName} onChange={handleInputChange} required />
        <input type="email" name="email" placeholder="Correo Electrónico" value={formData.email} onChange={handleInputChange} required />
        <input type="password" name="password" placeholder="Contraseña" value={formData.password} onChange={handleInputChange} required />
        {/* ... etc ... */}
        <button type="submit" className="submit-button">Registrarse</button>
      </form>
    </div>
  );
}

export default RegisterForm;