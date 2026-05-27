import { supabase, response, corsHeaders } from './lib/supabase.js';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const PRODUCTOS = ['MiCasita', 'Alma 18', 'Alma Loft 28', 'Alma 27', 'Alma 36 Refugio', 'Alma 36'];

function extraerContacto(mensajes) {
  const texto = (mensajes || []).filter(m => m.role === 'user').map(m => m.text).join(' ');
  const emailMatch = texto.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  const phoneMatch = texto.match(/(\+?54|0)?\s?\d{2,4}[\s.\-]?\d{6,8}/);
  const nameMatch  = texto.match(/(me llamo|mi nombre es|soy)\s+([a-zA-ZáéíóúÁÉÍÓÚñÑ ]{2,40})/i);
  return {
    email:    emailMatch ? emailMatch[0] : null,
    telefono: phoneMatch && phoneMatch[0].replace(/\D/g, '').length >= 8 ? phoneMatch[0].trim() : null,
    nombre:   nameMatch ? nameMatch[2].trim() : null,
  };
}

function extraerProducto(mensajes) {
  const texto = (mensajes || []).map(m => m.text).join(' ');
  return PRODUCTOS.find(p => texto.includes(p)) || null;
}

export async function handler(event) {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers: corsHeaders, body: '' };
  if (event.httpMethod !== 'POST') return response(405, { error: 'Método no permitido' });

  let body;
  try { body = JSON.parse(event.body || '{}'); } catch { return response(400, { error: 'JSON inválido' }); }

  const { session_id, mensajes, nombre, email, telefono, producto_interes } = body;

  if (!session_id || !UUID_RE.test(session_id)) return response(400, { error: 'session_id inválido' });
  if (!Array.isArray(mensajes) || mensajes.length > 300) return response(400, { error: 'mensajes inválido' });

  // Extraer datos de contacto del texto de los mensajes (fallback si el cliente no los captó)
  const extraidos = extraerContacto(mensajes);
  const productoExtraido = extraerProducto(mensajes);

  // Preferir lo que el cliente envía explícitamente; si no, usar lo extraído
  const datosContacto = {
    nombre:           nombre || extraidos.nombre || null,
    email:            email  || extraidos.email  || null,
    telefono:         telefono || extraidos.telefono || null,
    producto_interes: producto_interes || productoExtraido || null,
  };

  // Fetch existing para no pisar datos previos no nulos
  const { data: existing } = await supabase
    .from('conversaciones')
    .select('nombre, email, telefono, producto_interes')
    .eq('session_id', session_id)
    .maybeSingle();

  const upsertData = {
    session_id,
    mensajes,
    nombre:           datosContacto.nombre   || existing?.nombre   || null,
    email:            datosContacto.email    || existing?.email    || null,
    telefono:         datosContacto.telefono || existing?.telefono || null,
    producto_interes: datosContacto.producto_interes || existing?.producto_interes || null,
    updated_at:       new Date().toISOString(),
  };

  const { error } = await supabase
    .from('conversaciones')
    .upsert(upsertData, { onConflict: 'session_id' });

  if (error) return response(500, { error: error.message });
  return response(200, { ok: true });
}
