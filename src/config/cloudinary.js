// ✅ Configuración Cloudinary
const CLOUD_NAME = 'dlshym1te';

/**
 * Genera una URL completa de Cloudinary (mantiene extensión)
 * @param {string} fileName - Nombre de archivo con extensión (.webp, .jpg, etc.)
 * @param {number} width - Ancho deseado
 */
export const getImageUrl = (fileName, width = 400) => {
  if (!fileName) return '';
  return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/w_${width},q_auto,f_auto/Modulos/${fileName}`;
};

// ✅ Alias usado por TiendaAlma.jsx
export const getCloudinaryUrl = getImageUrl;

// Tamaños predefinidos
export const IMG_CARD = 400;   // Para las tarjetas
export const IMG_DETAIL = 800; // Para el modal
export const IMG_THUMB = 200;  // Para miniaturas
export const IMG_HERO = 1200;  // Para portada
