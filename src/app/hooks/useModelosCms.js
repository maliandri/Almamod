import { useState, useEffect } from 'react';

export function useModelosCms() {
  const [modelos, setModelos]   = useState([]);       // objetos completos
  const [nombres, setNombres]   = useState(['AlmaMod en general']);

  useEffect(() => {
    fetch('/.netlify/functions/cms-content')
      .then(r => r.json())
      .then(d => {
        const activos = (d.modelos || [])
          .filter(m => m.activo)
          .sort((a, b) => (a.orden || 99) - (b.orden || 99));
        setModelos(activos);
        setNombres([...activos.map(m => m.nombre), 'AlmaMod en general']);
      })
      .catch(() => {});
  }, []);

  const getModeloData = (nombre) => modelos.find(m => m.nombre === nombre) || null;

  return { nombres, getModeloData };
}
