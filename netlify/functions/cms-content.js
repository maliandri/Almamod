import { supabase, response, corsHeaders } from './lib/supabase.js';

// Endpoint público — sin auth — devuelve datos CMS para el sitio público
export async function handler(event) {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers: corsHeaders, body: '' };
  if (event.httpMethod !== 'GET') return response(405, { error: 'Método no permitido' });

  const [{ data: modelos, error: e1 }, { data: obras, error: e2 }] = await Promise.all([
    supabase
      .from('modelos')
      .select('id, slug, nombre, precio, descripcion, plazo, ventajas, fotos, imagen_portada, superficie, orden, activo')
      .order('orden'),
    supabase
      .from('obras_galeria')
      .select('id, titulo, ubicacion, descripcion, imagen_portada, fotos, orden')
      .eq('activo', true)
      .order('orden'),
  ]);

  if (e1) return response(500, { error: e1.message });

  return response(200, { modelos: modelos || [], obras: obras || [] });
}
