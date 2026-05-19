import { supabase, response, corsHeaders, getUserFromToken, getAuthUser } from './lib/supabase.js';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function handler(event) {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: corsHeaders, body: '' };
  }
  if (event.httpMethod !== 'POST') {
    return response(405, { error: 'Método no permitido' });
  }

  const token = getUserFromToken(event.headers.authorization);
  if (!token) return response(401, { error: 'No autorizado' });

  const user = await getAuthUser(token);
  if (!user || !['superadmin', 'dueno', 'deposito'].includes(user.rol)) {
    return response(403, { error: 'Sin permisos para invitar usuarios' });
  }

  const { email, rol, obra_id } = JSON.parse(event.body || '{}');

  if (!email || !rol) {
    return response(400, { error: 'Email y rol son requeridos' });
  }

  const rolesPermitidos = ['dueno', 'deposito', 'fabricacion', 'cliente'];
  if (!rolesPermitidos.includes(rol)) {
    return response(400, { error: 'Rol inválido' });
  }

  // Verificar que no exista una invitación pendiente para este email
  const { data: existente } = await supabase
    .from('invitaciones')
    .select('id')
    .eq('email', email)
    .is('usado_en', null)
    .gt('expires_at', new Date().toISOString())
    .single();

  if (existente) {
    return response(409, { error: 'Ya existe una invitación pendiente para este email' });
  }

  // Crear invitación
  const { data: invitacion, error } = await supabase
    .from('invitaciones')
    .insert({ email, rol, obra_id: obra_id || null, creado_por: user.id })
    .select()
    .single();

  if (error) return response(500, { error: error.message });

  const siteUrl = process.env.URL || 'https://almamod.com.ar';
  const linkRegistro = `${siteUrl}/app/registro?token=${invitacion.token}`;

  const rolesLabel = {
    dueno: 'Dueño',
    deposito: 'Depósito',
    fabricacion: 'Fabricación',
    cliente: 'Cliente',
  };

  await resend.emails.send({
    from: process.env.RESEND_FROM,
    to: email,
    subject: 'Invitación a AlmaMod - Sistema de Gestión de Obras',
    html: `
      <div style="font-family:sans-serif;max-width:500px;margin:0 auto;padding:24px">
        <h2 style="color:#1a1a1a">Fuiste invitado a AlmaMod</h2>
        <p>Hola, te invitamos a unirte al sistema de gestión de obras de <strong>AlmaMod</strong> como <strong>${rolesLabel[rol]}</strong>.</p>
        <p>Hacé click en el siguiente botón para completar tu registro:</p>
        <a href="${linkRegistro}"
           style="display:inline-block;background:#2563eb;color:white;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:bold;margin:16px 0">
          Completar registro
        </a>
        <p style="color:#666;font-size:0.85rem">Este link expira en 7 días.</p>
        <hr style="border:none;border-top:1px solid #eee;margin:24px 0"/>
        <p style="color:#999;font-size:0.8rem">AlmaMod · Neuquén, Patagonia Argentina</p>
      </div>
    `,
  });

  return response(201, { message: 'Invitación enviada', invitacion_id: invitacion.id });
}
