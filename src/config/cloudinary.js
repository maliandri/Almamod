/// ✅ Configuración Cloudinary Optimizada
const CLOUD_NAME = 'dlshym1te';

// ===== PRESETS DE OPTIMIZACIÓN AVANZADA =====

/**
 * 📸 THUMBNAILS (Búsqueda, miniaturas)
 * Peso estimado: 5-10 KB
 */
export const IMG_THUMB = {
  width: 150,
  height: 150,
  crop: 'fill',       // Recorta para llenar
  quality: 70         // Calidad optimizada para thumbnails
};

/**
 * 🃏 CARDS (Tarjetas de productos en grid)
 * Peso estimado: 15-30 KB
 */
export const IMG_CARD = {
  width: 400,
  height: 300,
  crop: 'fit',        // Ajusta sin recortar
  quality: 75
};

/**
 * 🖼️ DETAIL (Vista de detalle de producto)
 * Peso estimado: 80-150 KB
 */
export const IMG_DETAIL = {
  width: 1200,
  height: 900,
  crop: 'limit',      // Limita tamaño máximo
  quality: 80
};

/**
 * 📱 MOBILE (Imágenes para móvil)
 * Peso estimado: 40-80 KB
 */
export const IMG_MOBILE = {
  width: 800,
  height: 600,
  crop: 'limit',
  quality: 75
};

/**
 * 🖥️ HERO (Imágenes hero/banner)
 * Peso estimado: 150-250 KB
 */
export const IMG_HERO = {
  width: 1920,
  height: 1080,
  crop: 'limit',
  quality: 85
};

// ===== FUNCIONES DE GENERACIÓN DE URLs =====

/**
 * Genera URL de Cloudinary con transformaciones avanzadas
 * @param {string} fileName - Nombre del archivo con extensión
 * @param {object|number} transformations - Objeto con transformaciones o número (ancho)
 * @returns {string} URL completa optimizada
 * 
 * @example
 * // Usando preset
 * getCloudinaryUrl('imagen.webp', IMG_CARD)
 * 
 * // Usando ancho simple (retrocompatibilidad)
 * getCloudinaryUrl('imagen.webp', 400)
 */
export const getCloudinaryUrl = (fileName, transformations = IMG_CARD) => {
  if (!fileName) return '';
  
  // Cache-busting diario
  const version = new Date().toISOString().split('T')[0].replace(/-/g, '');
  
  // Retrocompatibilidad: si recibe un número, solo aplica width
  if (typeof transformations === 'number') {
    return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/w_${transformations},q_auto,f_auto,fl_progressive/${fileName}?v=${version}`;
  }
  
  // Si recibe un objeto, construye transformaciones completas
  const transforms = [];
  
  if (transformations.width) transforms.push(`w_${transformations.width}`);
  if (transformations.height) transforms.push(`h_${transformations.height}`);
  if (transformations.crop) transforms.push(`c_${transformations.crop}`);
  if (transformations.quality) transforms.push(`q_${transformations.quality}`);
  
  // Agregar optimizaciones automáticas
  transforms.push('f_auto');        // Formato automático (WebP)
  transforms.push('fl_progressive'); // Carga progresiva
  
  const transformString = transforms.join(',');
  
  return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/${transformString}/${fileName}?v=${version}`;
};

/**
 * Genera URL de video con optimizaciones
 * @param {string} fileName - Nombre del video con extensión
 * @param {number} width - Ancho deseado (opcional)
 * @param {number} quality - Calidad del video 1-100 (default: 80)
 * @returns {string} URL completa del video
 * 
 * @example
 * getVideoUrl('video.mp4', 800, 75)
 */
export const getVideoUrl = (fileName, width = null, quality = 80) => {
  if (!fileName) return '';
  
  const version = new Date().toISOString().split('T')[0].replace(/-/g, '');
  
  const transforms = [];
  if (width) transforms.push(`w_${width}`);
  transforms.push(`q_${quality}`);
  transforms.push('f_auto');      // Formato automático (MP4/WebM)
  transforms.push('vc_auto');     // Codec automático
  
  const transformString = transforms.join(',');
  
  return `https://res.cloudinary.com/${CLOUD_NAME}/video/upload/${transformString}/${fileName}?v=${version}`;
};

/**
 * RETROCOMPATIBILIDAD: Alias de getCloudinaryUrl
 * Mantiene compatibilidad con código existente
 */
export const getImageUrl = (fileName, width = 400) => {
  return getCloudinaryUrl(fileName, width);
};

/**
 * Genera blur placeholder ultra-liviano para lazy loading
 * Peso: ~2-3 KB
 * @param {string} fileName - Nombre del archivo
 * @returns {string} URL del placeholder
 */
export const getBlurPlaceholder = (fileName) => {
  if (!fileName) return '';
  return getCloudinaryUrl(fileName, {
    width: 20,
    quality: 20,
    effect: 'blur:1000'
  });
};

/**
 * Genera URLs responsive con múltiples resoluciones
 * @param {string} fileName - Nombre del archivo
 * @param {object} baseTransformations - Transformaciones base
 * @returns {object} { src, srcset }
 */
export const getResponsiveImageUrl = (fileName, baseTransformations = IMG_CARD) => {
  if (!fileName) return { src: '', srcset: '' };
  
  const widths = [400, 800, 1200, 1600];
  
  const srcset = widths.map(width => {
    const transforms = { ...baseTransformations, width };
    const url = getCloudinaryUrl(fileName, transforms);
    return `${url} ${width}w`;
  }).join(', ');
  
  const src = getCloudinaryUrl(fileName, baseTransformations);
  
  return { src, srcset };
};

// ===== EXPORTACIÓN DEFAULT =====
export default {
  CLOUD_NAME,
  IMG_THUMB,
  IMG_CARD,
  IMG_DETAIL,
  IMG_MOBILE,
  IMG_HERO,
  getCloudinaryUrl,
  getImageUrl,
  getVideoUrl,
  getBlurPlaceholder,
  getResponsiveImageUrl
};
