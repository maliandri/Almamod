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
  if (!user || !['superadmin', 'dueno'].includes(user.rol)) {
    return response(403, { error: 'Solo el Dueño puede firmar etapas' });
  }

  const { etapa_obra_id, confirmado } = JSON.parse(event.body || '{}');

  if (!etapa_obra_id || !confirmado) {
    return response(400, { error: 'etapa_obra_id y confirmado son requeridos' });
  }

  // Verificar etapa
  const { data: etapa } = await supabase
    .from('etapas_obra')
    .select(`
      *,
      obras(
        numero_obra,
        cliente_id,
        direccion,
        modelos(nombre),
        cliente:users!obras_cliente_id_fkey(id, nombre, email)
      )
    `)
    .eq('id', etapa_obra_id)
    .single();

  if (!etapa) return response(404, { error: 'Etapa no encontrada' });
  if (etapa.estado !== 'cargada') {
    return response(400, { error: 'La etapa debe estar cargada por Fabricación antes de firmarse' });
  }

  // Firmar etapa
  const { error: updateError } = await supabase
    .from('etapas_obra')
    .update({
      estado: 'firmada',
      fecha_firma: new Date().toISOString(),
      firmada_por: user.id,
    })
    .eq('id', etapa_obra_id);

  if (updateError) return response(500, { error: updateError.message });

  // Registrar notificación
  await supabase.from('notificaciones').insert({
    tipo: 'etapa_firmada',
    destinatario_id: etapa.obras.cliente.id,
    obra_id: etapa.obra_id,
    etapa_obra_id,
  });

  // Enviar email al cliente
  const obra = etapa.obras;
  const cliente = obra.cliente;

  const siteUrl = process.env.URL || 'https://almamod.com.ar';

  await resend.emails.send({
    from: process.env.RESEND_FROM,
    to: cliente.email,
    subject: `Avance aprobado - Obra #${obra.numero_obra} · ${obra.modelos.nombre}`,
    html: `
      <div style="font-family:sans-serif;max-width:500px;margin:0 auto;padding:24px">
        <h2 style="color:#1a1a1a">Nuevo avance aprobado en tu obra</h2>
        <p>Hola <strong>${cliente.nombre}</strong>,</p>
        <p>El Dueño aprobó la etapa <strong>${etapa.numero} - ${etapa.nombre}</strong> de tu obra:</p>
        <ul>
          <li><strong>Obra:</strong> #${obra.numero_obra}</li>
          <li><strong>Modelo:</strong> ${obra.modelos.nombre}</li>
          ${obra.direccion ? `<li><strong>Dirección:</strong> ${obra.direccion}</li>` : ''}
        </ul>
        <a href="${siteUrl}/app/mis-obras"
           style="display:inline-block;background:#2563eb;color:white;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:bold;margin:16px 0">
          Ver mi obra
        </a>
        <hr style="border:none;border-top:1px solid #eee;margin:24px 0"/>
        <p style="color:#999;font-size:0.8rem">AlmaMod · Neuquén, Patagonia Argentina</p>
      </div>
    `,
  });

  return response(200, { message: 'Etapa firmada y cliente notificado' });
}
