// ✅ TU CLOUD NAME CORRECTO
const CLOUD_NAME = 'dishym1te'; 

/**
 * Extrae el nombre del archivo sin extensión
 * '/modulos/AlmaMod_36_portada.webp' → 'AlmaMod_36_portada'
 */
export const extractImageName = (path) => {
  if (!path) return '';
  const fileName = path.split('/').pop();
  return fileName.replace(/\.(webp|jpg|jpeg|png)$/i, '');
};

/**
 * Genera URL de Cloudinary
 * @param {string} imageName - Nombre de la imagen sin extensión
 * @param {number} width - Ancho deseado
 */
export const getImageUrl = (imageName, width = 400) => {
  return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/w_${width},q_auto,f_auto/modulos/${imageName}`;
};

/**
 * Genera URL desde una ruta local (con carpeta y extensión)
 * @param {string} localPath - Ruta completa: '/modulos/imagen.webp'
 * @param {number} width - Ancho deseado
 */
export const getCloudinaryUrlFromPath = (localPath, width = 400) => {
  const imageName = extractImageName(localPath);
  return getImageUrl(imageName, width);
};

// Tamaños predefinidos
export const IMG_CARD = 400;      // Para las tarjetas en el grid
export const IMG_DETAIL = 800;    // Para el modal de detalle
export const IMG_THUMB = 200;     // Para miniaturas en búsqueda
export const IMG_HERO = 1200;     // Para imágenes grandes/carrusel
