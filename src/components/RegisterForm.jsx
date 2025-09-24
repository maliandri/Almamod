import React, { useState, useEffect } from 'react';
// Imports from CDN to resolve build errors
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'https://esm.sh/react-leaflet@4.2.1';
import L from 'https://esm.sh/leaflet@1.9.4';

// Arreglo para un bug conocido con los íconos en React-Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});


// Componente para recentrar el mapa dinámicamente
const ChangeMapView = ({ coords }) => {
  const map = useMap();
  useEffect(() => {
    if (coords) {
      map.setView(coords, 15); // Zoom de 15 al encontrar dirección
    }
  }, [coords]);
  return null;
}


function RegisterForm() {
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

  const [mapPosition, setMapPosition] = useState([-38.9516, -68.0591]); // Neuquén Capital
  const [markerPosition, setMarkerPosition] = useState([-38.9516, -68.0591]);
  const [isSearching, setIsSearching] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSearchAddress = async () => {
    setIsSearching(true);
    const { street, city, department } = formData;
    const query = `${street}, ${city}, ${department}, Neuquén, Argentina`;

    try {
      // Usamos la API de Nominatim (OpenStreetMap) para geocodificación gratuita
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

  const handleSubmit = (e) => {
    e.preventDefault();
    const finalData = {
      ...formData,
      address: { // Estructuramos el objeto de dirección para que coincida con el backend
          street: formData.street,
          city: formData.city,
          department: formData.department
      },
      location: {
        type: 'Point',
        coordinates: [markerPosition[1], markerPosition[0]] // [longitud, latitud]
      }
    };
    // Quitamos los campos de dirección del nivel superior para no duplicar datos
    delete finalData.street;
    delete finalData.city;
    delete finalData.department;
    
    console.log('Datos a enviar al backend:', finalData);
    // Aquí iría la llamada a la API para registrar al usuario
  };

  return (
    <>
      {/* Inyectamos el CSS de Leaflet directamente en el componente */}
      <style>{`
        @import url('https://unpkg.com/leaflet@1.9.4/dist/leaflet.css');
      `}</style>
      <form onSubmit={handleSubmit} className="register-form">
        <h2>Crear una Cuenta</h2>
        
        {/* --- Datos Personales --- */}
        <input type="text" name="fullName" placeholder="Nombre y Apellido o Razón Social" value={formData.fullName} onChange={handleInputChange} required />
        <input type="email" name="email" placeholder="Correo Electrónico" value={formData.email} onChange={handleInputChange} required />
        <input type="password" name="password" placeholder="Contraseña" value={formData.password} onChange={handleInputChange} required />
        <input type="tel" name="phone" placeholder="Número de Teléfono" value={formData.phone} onChange={handleInputChange} required />
        <input type="date" name="birthDate" placeholder="Fecha de Nacimiento" value={formData.birthDate} onChange={handleInputChange} />
        
        <div className="doc-type-group">
          <select name="docType" value={formData.docType} onChange={handleInputChange}>
            <option value="DNI">DNI</option>
            <option value="CUIT">CUIT</option>
          </select>
          <input type="text" name="docNumber" placeholder="N° de Documento" value={formData.docNumber} onChange={handleInputChange} required />
        </div>

        {/* --- Dirección y Mapa --- */}
        <h3>Dirección</h3>
        <input type="text" name="street" placeholder="Calle y Número" value={formData.street} onChange={handleInputChange} />
        <input type="text" name="city" placeholder="Localidad" value={formData.city} onChange={handleInputChange} />
        <input type="text" name="department" placeholder="Departamento" value={formData.department} onChange={handleInputChange} />
        
        <button type="button" onClick={handleSearchAddress} disabled={isSearching}>
          {isSearching ? 'Buscando...' : 'Buscar Dirección en Mapa'}
        </button>

        <div className="map-container">
          <MapContainer center={mapPosition} zoom={13} style={{ height: '300px', width: '100%' }}>
            <ChangeMapView coords={mapPosition} />
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            <Marker 
              position={markerPosition} 
              draggable={true}
              eventHandlers={{
                dragend: (e) => {
                  const { lat, lng } = e.target.getLatLng();
                  setMarkerPosition([lat, lng]);
                },
              }}
            >
              <Popup>Arrastra el marcador para ajustar la ubicación exacta.</Popup>
            </Marker>
          </MapContainer>
        </div>

        <button type="submit" className="submit-button">Registrarse</button>
      </form>
    </>
  );
}

export default RegisterForm;