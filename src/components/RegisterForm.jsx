// frontend/src/components/RegisterForm.jsx

// --- 👇 CAMBIO 1: Imports adicionales ---
import React, { useState, useEffect } from 'react';
import axios from 'axios'; // Para hacer la llamada a la API
import { useNavigate } from 'react-router-dom'; // Para redirigir al usuario

// Imports from CDN
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'https://esm.sh/react-leaflet@4.2.1';
import L from 'https://esm.sh/leaflet@1.9.4';

// Tu código para arreglar los íconos (se mantiene igual)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Tu componente para centrar el mapa (se mantiene igual)
const ChangeMapView = ({ coords }) => {
  const map = useMap();
  useEffect(() => {
    if (coords) {
      map.setView(coords, 15);
    }
  }, [coords]);
  return null;
}

function RegisterForm() {
  // Tu estado formData (se mantiene igual)
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

  // Tus otros estados para el mapa (se mantienen igual)
  const [mapPosition, setMapPosition] = useState([-38.9516, -68.0591]);
  const [markerPosition, setMarkerPosition] = useState([-38.9516, -68.0591]);
  const [isSearching, setIsSearching] = useState(false);

  // --- 👇 CAMBIO 2: Estados para manejar mensajes al usuario ---
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  // Tu función handleInputChange (se mantiene igual)
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Tu función handleSearchAddress (se mantiene igual)
  const handleSearchAddress = async () => {
    setIsSearching(true);
    const { street, city, department } = formData;
    const query = `${street}, ${city}, ${department}, Neuquén, Argentina`;

    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`);
      const data = await response.json();

      if (data && data.length > 0) {
        const { lat, lon } = data[0];
        const newPos = [parseFloat(lat), parseFloat(lon)];
        setMapPosition(newPos);
        setMarkerPosition(newPos);
      } else {
        alert('No se pudo encontrar la dirección. Por favor, revise los datos o ubique el marcador manualmente.');
      }
    } catch (error) {
      console.error("Error al buscar la dirección:", error);
      alert('Hubo un error al conectar con el servicio de mapas.');
    } finally {
      setIsSearching(false);
    }
  };

  // --- 👇 CAMBIO 3: Reemplazamos tu handleSubmit con la versión que llama a la API ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const finalData = {
      ...formData,
      address: {
          street: formData.street,
          city: formData.city,
          department: formData.department
      },
      location: {
        type: 'Point',
        coordinates: [markerPosition[1], markerPosition[0]]
      }
    };
    delete finalData.street;
    delete finalData.city;
    delete finalData.department;
    
    try {
        const response = await axios.post('http://localhost:5000/api/auth/register', finalData);
        setSuccess(response.data.msg);
        
        // Redirigir al login después de 3 segundos
        setTimeout(() => {
            navigate('/login');
        }, 3000);

    } catch (err) {
        if (err.response && err.response.data && err.response.data.msg) {
            setError(err.response.data.msg);
        } else if (err.response && err.response.data.errors) {
            // Maneja los errores de express-validator
            const errorMsg = err.response.data.errors.map(e => e.msg).join(', ');
            setError(errorMsg);
        } else {
            setError('Ocurrió un error al registrar la cuenta. Intente de nuevo.');
        }
    }
  };

  return (
    <>
      <style>{`
        @import url('https://unpkg.com/leaflet@1.9.4/dist/leaflet.css');
      `}</style>
      <form onSubmit={handleSubmit} className="register-form">
        <h2>Crear una Cuenta</h2>
        
        {/* --- 👇 CAMBIO 4: Mostrar mensajes de error o éxito --- */}
        {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}
        {success && <p style={{ color: 'green', textAlign: 'center' }}>{success}</p>}
        
        {/* Todo tu formulario se mantiene exactamente igual */}
        <input type="text" name="fullName" placeholder="Nombre y Apellido o Razón Social" value={formData.fullName} onChange={handleInputChange} required />
        <input type="email" name="email" placeholder="Correo Electrónico" value={formData.email} onChange={handleInputChange} required />
        <input type="password" name="password" placeholder="Contraseña" value={formData.password} onChange={handleInputChange} required />
        {/* ... el resto de tus inputs y el mapa ... */}
        <div className="map-container">
            {/* ... Tu MapContainer ... */}
        </div>

        <button type="submit" className="submit-button">Registrarse</button>
      </form>
    </>
  );
}

export default RegisterForm;