import { Resend } from 'resend';
import { createClient } from '@supabase/supabase-js';

const resend = new Resend(process.env.RESEND_API_KEY);
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

export const handler = async (event) => {
  try {
    const data = JSON.parse(event.body);

    const { userName, userEmail, userPhone, interestedProduct } = data;

    console.log('📝 Nuevo lead recibido:', { userName, userEmail, userPhone, interestedProduct });

    // Guardar en Supabase
    const { error: dbError } = await supabase.from('leads').insert([
      {
        nombre: userName || '',
        email: userEmail || '',
        telefono: userPhone || '',
        producto_interes: interestedProduct || ''
      }
    ]);

    if (dbError) {
      console.error('❌ Error guardando en Supabase:', dbError);
      return { 
        statusCode: 500, 
        body: JSON.stringify({ success: false, error: 'Database error' }) 
      };
    }

    console.log('✅ Lead guardado en Supabase correctamente');

    // Intentar enviar email (no fallar si esto falla)
    console.log('📧 Intentando enviar email...', {
      from: process.env.RESEND_FROM,
      to: process.env.RESEND_TO,
      hasApiKey: !!process.env.RESEND_API_KEY
    });
    try {
      const emailResult = await resend.emails.send({
        from: process.env.RESEND_FROM,
        to: process.env.RESEND_TO,
        subject: `🏠 Nuevo contacto de ${userName || 'un cliente'} - ${interestedProduct ? interestedProduct : 'AlmaMod'}`,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="UTF-8">
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #4C01F9 0%, #7B3FF2 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center; }
              .header h1 { margin: 0; font-size: 24px; }
              .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
              .info-row { background: white; padding: 15px; margin: 10px 0; border-radius: 5px; border-left: 4px solid #4C01F9; }
              .label { color: #666; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 5px; }
              .value { color: #333; font-size: 16px; font-weight: 500; }
              .footer { text-align: center; padding: 20px; color: #999; font-size: 12px; }
              .badge { display: inline-block; background: #4C01F9; color: white; padding: 5px 15px; border-radius: 20px; font-size: 12px; margin-top: 10px; }
              .product-badge { display: inline-block; background: #28a745; color: white; padding: 8px 20px; border-radius: 20px; font-size: 14px; font-weight: 600; margin-top: 10px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>📬 Nuevo Lead desde Almita</h1>
                <div class="badge">Chatbot AlmaMod</div>
                ${interestedProduct ? `<div class="product-badge">🏠 Interesado en: ${interestedProduct}</div>` : ''}
              </div>
              <div class="content">
                <p style="font-size: 16px; color: #666; margin-bottom: 20px;">
                  Un cliente ha solicitado ser contactado a través del chatbot de AlmaMod.
                </p>

                ${interestedProduct ? `
                <div class="info-row" style="border-left: 4px solid #28a745;">
                  <div class="label">🏡 Producto de Interés</div>
                  <div class="value" style="color: #28a745; font-weight: 700; font-size: 18px;">${interestedProduct}</div>
                </div>
                ` : ''}

                <div class="info-row">
                  <div class="label">👤 Nombre Completo</div>
                  <div class="value">${userName || 'No proporcionado'}</div>
                </div>

                <div class="info-row">
                  <div class="label">📧 Correo Electrónico</div>
                  <div class="value">${userEmail || 'No proporcionado'}</div>
                </div>

                <div class="info-row">
                  <div class="label">📱 Teléfono</div>
                  <div class="value">${userPhone || 'No proporcionado'}</div>
                </div>

                <div style="margin-top: 30px; padding: 15px; background: #fff3cd; border-left: 4px solid #ffc107; border-radius: 5px;">
                  <strong>⏰ Acción requerida:</strong> Contactar al cliente lo antes posible ${interestedProduct ? `y enviarle la ficha técnica del <strong>${interestedProduct}</strong>` : 'para capitalizar el interés'}.
                </div>
              </div>
              <div class="footer">
                <p>Este email fue enviado automáticamente desde almamod.com.ar</p>
                <p>© ${new Date().getFullYear()} AlmaMod - Construcción Modular</p>
              </div>
            </div>
          </body>
          </html>
        `
      });

      console.log('✅ Email enviado correctamente:', JSON.stringify(emailResult));
    } catch (emailError) {
      console.error('❌ Error enviando email (pero lead guardado):', JSON.stringify(emailError), emailError?.message);
      // No retornar error porque el lead SÍ se guardó
    }

    return { 
      statusCode: 200, 
      body: JSON.stringify({ success: true }) 
    };

  } catch (error) {
    console.error('❌ Error general en saveLead.js:', error);
    return { 
      statusCode: 500, 
      body: JSON.stringify({ success: false, error: error.message }) 
    };
  }
};