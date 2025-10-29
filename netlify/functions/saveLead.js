import { Resend } from 'resend';
import { createClient } from '@supabase/supabase-js';

const resend = new Resend(process.env.RESEND_API_KEY);
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

export const handler = async (event) => {
  try {
    const data = JSON.parse(event.body);

    const { userName, userEmail, userPhone } = data;

    // Guardar en Supabase
    const { error: dbError } = await supabase.from('leads').insert([
      {
        nombre: userName || '',
        email: userEmail || '',
        telefono: userPhone || ''
      }
    ]);

    if (dbError) {
      console.error('❌ Error guardando en Supabase:', dbError);
      return { statusCode: 500, body: JSON.stringify({ success: false }) };
    }

    // Enviar email
    await resend.emails.send({
      from: process.env.RESEND_FROM,
      to: process.env.RESEND_TO,
      subject: "Nuevo lead desde el chatbot de AlmaMod",
      html: `
        <h2>Nuevo contacto desde el chatbot</h2>
        <p><strong>Nombre:</strong> ${userName}</p>
        <p><strong>Email:</strong> ${userEmail}</p>
        <p><strong>Teléfono:</strong> ${userPhone}</p>
      `
    });

    return { statusCode: 200, body: JSON.stringify({ success: true }) };

  } catch (error) {
    console.error('❌ Error en saveLead.js:', error);
    return { statusCode: 500, body: JSON.stringify({ success: false }) };
  }
};
