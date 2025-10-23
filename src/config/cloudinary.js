// ✅ Configuración Cloudinary (Generada automáticamente)
const CLOUD_NAME = 'dlshym1te';

/**
 * Genera una URL completa de Cloudinary para imágenes
 * @param {string} fileName - Nombre de archivo con extensión (.webp, .jpg, etc.)
 * @param {number} width - Ancho deseado
 */
export const getImageUrl = (fileName, width = 400) => {
  if (!fileName) return '';
  // Usa la fecha actual para forzar actualización de caché diariamente
  const version = new Date().toISOString().split('T')[0].replace(/-/g, '');
  return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/w_${width},q_auto,f_auto/${fileName}?v=${version}`;
};

/**
 * Genera una URL completa de Cloudinary para videos
 * @param {string} fileName - Nombre de archivo con extensión (.mp4, .webm, etc.)
 * @param {number} width - Ancho deseado (opcional)
 */
export const getVideoUrl = (fileName, width = null) => {
  if (!fileName) return '';
  const version = new Date().toISOString().split('T')[0].replace(/-/g, '');
  const widthParam = width ? `w_${width},` : '';
  return `https://res.cloudinary.com/${CLOUD_NAME}/video/upload/${widthParam}q_auto/${fileName}?v=${version}`;
};

// Alias usado por TiendaAlma.jsx
export const getCloudinaryUrl = getImageUrl;

// Tamaños predefinidos
export const IMG_CARD = 400;   // Para las tarjetas
export const IMG_DETAIL = 800; // Para el modal
export const IMG_THUMB = 200;  // Para miniaturas
export const IMG_HERO = 1200;  // Para portada