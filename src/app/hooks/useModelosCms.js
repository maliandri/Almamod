import { useState, useEffect } from 'react';

export function useModelosCms() {
  const [modelos, setModelos] = useState(['AlmaMod en general']);

  useEffect(() => {
    fetch('/.netlify/functions/cms-content')
      .then(r => r.json())
      .then(d => {
        const nombres = (d.modelos || [])
          .filter(m => m.activo)
          .sort((a, b) => (a.orden || 99) - (b.orden || 99))
          .map(m => m.nombre);
        setModelos([...nombres, 'AlmaMod en general']);
      })
      .catch(() => {});
  }, []);

  return modelos;
}
