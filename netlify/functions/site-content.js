import { supabase, response, corsHeaders, getUserFromToken, getAuthUser } from './lib/supabase.js';

const ALLOWED = ['superadmin', 'dueno', 'marketing', 'arquitectura'];

export async function handler(event) {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers: corsHeaders, body: '' };

  const qs = event.queryStringParameters || {};

  // ── GET público ──────────────────────────────────────────────────────────
  if (event.httpMethod === 'GET') {
    // ?tipo=sections → secciones del home
    if (qs.tipo === 'sections') {
      const { data, error } = await supabase.from('site_sections').select('*');
      if (error) return response(500, { error: error.message });
      const map = {};
      (data || []).forEach(s => { map[s.seccion] = s; });
      return response(200, { sections: map });
    }
    // default → hero slides activos
    const { data, error } = await supabase
      .from('hero_slides').select('*').eq('activo', true).order('orden');
    if (error) return response(500, { error: error.message });
    return response(200, { slides: data || [] });
  }

  // Resto requiere auth
  const token = getUserFromToken(event.headers.authorization);
  if (!token) return response(401, { error: 'No autorizado' });
  const user = await getAuthUser(token);
  if (!user || !ALLOWED.includes(user.rol)) return response(403, { error: 'Sin permisos' });

  // ── Hero slides ──────────────────────────────────────────────────────────
  if (event.httpMethod === 'POST') {
    const body = JSON.parse(event.body || '{}');
    if (body.seccion) {
      // Upsert de sección
      const allowed = ['titulo','subtitulo','descripcion','badge','imagen_url','cta_texto','cta_url','extra'];
      const fields  = Object.fromEntries(Object.entries(body).filter(([k]) => allowed.includes(k)));
      const { data, error } = await supabase
        .from('site_sections')
        .upsert({ seccion: body.seccion, ...fields, updated_at: new Date().toISOString() }, { onConflict: 'seccion' })
        .select().single();
      if (error) return response(500, { error: error.message });
      return response(200, { section: data });
    }
    const { titulo, pretitulo, subtitulo, align, badge, imagen_public_id, video_public_id, media_type, orden } = body;
    if (!titulo) return response(400, { error: 'titulo requerido' });
    const { data, error } = await supabase.from('hero_slides')
      .insert({ titulo, pretitulo: pretitulo||null, subtitulo: subtitulo||null, align: align||'center', badge: badge||null, imagen_public_id: imagen_public_id||null, video_public_id: video_public_id||null, media_type: media_type||'image', orden: orden||99 })
      .select().single();
    if (error) return response(500, { error: error.message });
    return response(201, { slide: data });
  }

  if (event.httpMethod === 'PUT') {
    const body = JSON.parse(event.body || '{}');
    const { id, ...fields } = body;
    if (!id) return response(400, { error: 'id requerido' });
    const allowed = ['titulo','pretitulo','subtitulo','align','badge','imagen_public_id','video_public_id','media_type','orden','activo'];
    const update = Object.fromEntries(Object.entries(fields).filter(([k]) => allowed.includes(k)));
    const { data, error } = await supabase.from('hero_slides').update(update).eq('id', id).select().single();
    if (error) return response(500, { error: error.message });
    return response(200, { slide: data });
  }

  if (event.httpMethod === 'DELETE') {
    const { id } = qs;
    if (!id) return response(400, { error: 'id requerido' });
    const { error } = await supabase.from('hero_slides').delete().eq('id', id);
    if (error) return response(500, { error: error.message });
    return response(200, { ok: true });
  }

  return response(405, { error: 'Metodo no permitido' });
}
