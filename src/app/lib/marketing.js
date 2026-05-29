const CLOUD_NAME = 'dlshym1te';
const UPLOAD_PRESET = 'almamod_cms';
const WEBHOOKS_KEY = 'almamod_make_webhooks';

export async function uploadImagen(file) {
  const fd = new FormData();
  fd.append('file', file);
  fd.append('upload_preset', UPLOAD_PRESET);
  fd.append('folder', 'almamod/marketing');
  const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, { method: 'POST', body: fd });
  const data = await res.json();
  if (data.error) throw new Error(data.error.message);
  return data.secure_url;
}

export async function generarContenido(tipo, datos) {
  const res = await fetch('/.netlify/functions/marketing-generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tipo, ...datos }),
  });
  const data = await res.json().catch(() => ({ error: 'Sin respuesta del servidor (timeout)' }));
  if (!res.ok) throw new Error(data.error || 'Error generando contenido');
  return data;
}

export async function publicarEnMake(tipo, contenido, imagen_url) {
  const res = await fetch('/.netlify/functions/make-proxy', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      payload: {
        tipo,
        ...contenido,
        imagen_url: imagen_url || '',
        redes: ['instagram', 'facebook'],
        timestamp: new Date().toISOString(),
      },
    }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Error ${res.status}`);
}
