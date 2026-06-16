import { supabase, response, corsHeaders } from './lib/supabase.js';

// Reseñas de Google (Places API) cacheadas 24 h en Supabase.
// Env requeridas: GOOGLE_PLACES_API_KEY, GOOGLE_PLACE_ID
const TTL_MS = 24 * 60 * 60 * 1000;
const EMPTY = { rating: null, total: 0, reviews: [], url: null };

export async function handler(event) {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers: corsHeaders, body: '' };
  if (event.httpMethod !== 'GET') return response(405, { error: 'Método no permitido' });

  const apiKey  = process.env.GOOGLE_PLACES_API_KEY;
  const placeId = process.env.GOOGLE_PLACE_ID;

  // 1) Caché
  let cache = null;
  try {
    const { data } = await supabase.from('google_reviews_cache').select('*').eq('id', 1).maybeSingle();
    cache = data;
  } catch { /* la tabla puede no existir todavía */ }

  const fresh = cache?.updated_at && (Date.now() - new Date(cache.updated_at).getTime() < TTL_MS);
  if (cache?.data && fresh) return response(200, cache.data);

  // 2) Sin configurar → devolver lo cacheado o vacío (con diagnóstico no sensible)
  if (!apiKey || !placeId) {
    const _diag = {
      hasKey: !!apiKey,
      hasPlace: !!placeId,
      vars: Object.keys(process.env).filter(k => /GOOGLE|PLACE/i.test(k)),
    };
    return response(200, { ...(cache?.data || EMPTY), _diag });
  }

  // 3) Traer de Google Places
  try {
    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${encodeURIComponent(placeId)}&fields=rating,user_ratings_total,reviews,url,name&reviews_sort=newest&language=es&key=${apiKey}`;
    const r = await fetch(url);
    const j = await r.json();
    if (j.status !== 'OK') return response(200, cache?.data || { ...EMPTY, error: j.status, error_message: j.error_message || null });

    const res = j.result || {};
    const payload = {
      rating: res.rating ?? null,
      total:  res.user_ratings_total ?? 0,
      url:    res.url || null,
      nombre: res.name || null,
      reviews: (res.reviews || []).map(rv => ({
        author: rv.author_name,
        photo:  rv.profile_photo_url,
        rating: rv.rating,
        text:   rv.text,
        when:   rv.relative_time_description,
      })),
    };

    try {
      await supabase.from('google_reviews_cache').upsert({ id: 1, data: payload, updated_at: new Date().toISOString() });
    } catch { /* sin tabla, igual devolvemos */ }

    return response(200, payload);
  } catch {
    return response(200, cache?.data || EMPTY);
  }
}
