import { supabase, corsHeaders, getUserFromToken, getAuthUser } from './lib/supabase.js';
import { jsPDF } from 'jspdf';
import { LOGO_PNG_BASE64 } from './lib/logo.js';

export async function handler(event) {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: corsHeaders, body: '' };
  }
  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, headers: corsHeaders, body: 'Método no permitido' };
  }

  const token = getUserFromToken(event.headers.authorization);
  if (!token) return { statusCode: 401, headers: corsHeaders, body: 'No autorizado' };

  const user = await getAuthUser(token);
  if (!user || !['superadmin', 'dueno'].includes(user.rol)) {
    return { statusCode: 403, headers: corsHeaders, body: 'Sin permisos' };
  }

  const id = event.queryStringParameters?.id;
  if (!id) return { statusCode: 400, headers: corsHeaders, body: 'id requerido' };

  const { data: presupuesto } = await supabase
    .from('presupuestos')
    .select('*, modelos(nombre, superficie)')
    .eq('id', id)
    .single();
  if (!presupuesto) return { statusCode: 404, headers: corsHeaders, body: 'Presupuesto no encontrado' };

  const { data: items } = await supabase
    .from('presupuesto_items')
    .select('*')
    .eq('presupuesto_id', id)
    .order('orden', { ascending: true });

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageW = 210;
  const margin = 15;
  let y = margin;

  // Fondo blanco + texto negro
  doc.setFillColor(255, 255, 255);
  doc.rect(0, 0, pageW, 297, 'F');
  doc.setTextColor(0, 0, 0);

  // Logo centrado
  const logoW = 70;
  const logoH = logoW * (234 / 1042);
  doc.addImage(LOGO_PNG_BASE64, 'PNG', (pageW - logoW) / 2, y, logoW, logoH);
  y += logoH + 8;

  // Título + número + fecha
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(`Presupuesto #${String(presupuesto.numero).padStart(3, '0')}`, pageW / 2, y, { align: 'center' });
  y += 6;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`Fecha: ${new Date(presupuesto.created_at).toLocaleDateString('es-AR')}`, pageW / 2, y, { align: 'center' });
  y += 10;

  doc.setDrawColor(212, 165, 116);
  doc.setLineWidth(0.5);
  doc.line(margin, y, pageW - margin, y);
  y += 10;

  // Datos del modelo
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  const titulo = presupuesto.modelos?.nombre || presupuesto.modelo_nombre;
  doc.text(`${titulo}${presupuesto.modelos?.superficie ? ` (${presupuesto.modelos.superficie}m²)` : ''}`, margin, y);
  y += 7;

  if (presupuesto.modelo_descripcion) {
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    const lines = doc.splitTextToSize(presupuesto.modelo_descripcion, pageW - margin * 2);
    doc.text(lines, margin, y);
    y += lines.length * 4.5 + 2;
  }

  // Datos del cliente
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  if (presupuesto.cliente_nombre) { doc.text(`Cliente: ${presupuesto.cliente_nombre}`, margin, y); y += 5; }
  if (presupuesto.cliente_contacto) { doc.text(`Contacto: ${presupuesto.cliente_contacto}`, margin, y); y += 5; }
  if (presupuesto.cliente_direccion) { doc.text(`Dirección: ${presupuesto.cliente_direccion}`, margin, y); y += 5; }

  y += 6;

  // Características incluidas
  if (items && items.length) {
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('Características incluidas', margin, y);
    y += 7;

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    for (const item of items) {
      const lines = doc.splitTextToSize(item.descripcion, pageW - margin * 2 - 6);
      if (y + lines.length * 5 > 270) {
        doc.addPage();
        doc.setFillColor(255, 255, 255);
        doc.rect(0, 0, pageW, 297, 'F');
        doc.setTextColor(0, 0, 0);
        y = margin;
      }
      doc.text('•', margin, y);
      doc.text(lines, margin + 5, y);
      y += lines.length * 5;
    }
    y += 5;
  }

  // Precio total
  if (y > 260) { doc.addPage(); doc.setFillColor(255, 255, 255); doc.rect(0, 0, pageW, 297, 'F'); doc.setTextColor(0, 0, 0); y = margin; }
  doc.setDrawColor(212, 165, 116);
  doc.setLineWidth(0.5);
  doc.line(margin + 90, y, pageW - margin, y);
  y += 8;

  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text('PRECIO TOTAL:', margin + 90, y);
  doc.text(money(presupuesto.precio_total), pageW - margin, y, { align: 'right' });

  // Notas
  if (presupuesto.notas) {
    y += 14;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('Notas:', margin, y);
    y += 5;
    doc.setFont('helvetica', 'normal');
    const lines = doc.splitTextToSize(presupuesto.notas, pageW - margin * 2);
    doc.text(lines, margin, y);
  }

  // Footer
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(120, 120, 120);
  doc.text('AlmaMod · C. la Caña de Azúcar 18, Neuquén, Patagonia Argentina · almamod.com.ar', pageW / 2, 290, { align: 'center' });

  const pdfBuffer = Buffer.from(doc.output('arraybuffer'));

  return {
    statusCode: 200,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="almamod-presupuesto-${presupuesto.numero}.pdf"`,
    },
    body: pdfBuffer.toString('base64'),
    isBase64Encoded: true,
  };
}

function money(v) {
  return `$${Number(v || 0).toLocaleString('es-AR', { maximumFractionDigits: 0 })}`;
}
