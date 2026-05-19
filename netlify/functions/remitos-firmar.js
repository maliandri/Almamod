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
  if (!user || !['superadmin', 'fabricacion'].includes(user.rol)) {
    return response(403, { error: 'Solo Fabricación puede firmar remitos' });
  }

  const { remito_id } = JSON.parse(event.body || '{}');
  if (!remito_id) return response(400, { error: 'remito_id es requerido' });

  // Verificar remito pendiente
  const { data: remito } = await supabase
    .from('remitos')
    .select(`
      *,
      obras(numero_obra, modelos(nombre)),
      remito_items(cantidad, partes(nombre, unidad))
    `)
    .eq('id', remito_id)
    .single();

  if (!remito) return response(404, { error: 'Remito no encontrado' });
  if (remito.estado !== 'pendiente') {
    return response(400, { error: 'Este remito ya fue firmado' });
  }

  // Firmar remito (el trigger actualiza el checklist automáticamente)
  const { error } = await supabase
    .from('remitos')
    .update({
      estado: 'firmado',
      firmado_por: user.id,
      fecha_firma: new Date().toISOString(),
    })
    .eq('id', remito_id);

  if (error) return response(500, { error: error.message });

  // Notificar a Depósito por email
  const { data: depositos } = await supabase
    .from('users')
    .select('email, nombre')
    .eq('rol', 'deposito')
    .eq('activo', true);

  if (depositos && depositos.length > 0) {
    const itemsList = remito.remito_items
      .map(i => `<li>${i.partes.nombre}: <strong>${i.cantidad} ${i.partes.unidad}</strong></li>`)
      .join('');

    for (const dep of depositos) {
      await resend.emails.send({
        from: process.env.RESEND_FROM,
        to: dep.email,
        subject: `Remito #${remito.numero} firmado - Obra #${remito.obras.numero_obra}`,
        html: `
          <div style="font-family:sans-serif;max-width:500px;margin:0 auto;padding:24px">
            <h2 style="color:#1a1a1a">Remito firmado por Fabricación</h2>
            <p>Hola <strong>${dep.nombre}</strong>,</p>
            <p>Fabricación firmó el remito <strong>#${remito.numero}</strong> de la obra <strong>#${remito.obras.numero_obra} · ${remito.obras.modelos.nombre}</strong>.</p>
            <p><strong>Materiales entregados:</strong></p>
            <ul>${itemsList}</ul>
            <p>El checklist de la obra fue actualizado automáticamente.</p>
            <hr style="border:none;border-top:1px solid #eee;margin:24px 0"/>
            <p style="color:#999;font-size:0.8rem">AlmaMod · Neuquén, Patagonia Argentina</p>
          </div>
        `,
      });
    }
  }

  return response(200, { message: 'Remito firmado y checklist actualizado' });
}
