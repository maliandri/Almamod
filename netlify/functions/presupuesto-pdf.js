import { supabase, corsHeaders, getUserFromToken, getAuthUser } from './lib/supabase.js';
import { jsPDF } from 'jspdf';

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

  // Header
  doc.setFillColor(212, 165, 116);
  doc.rect(0, 0, pageW, 30, 'F');
  doc.setTextColor(26, 26, 46);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('ALMAMOD', margin, 13);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Presupuesto #${String(presupuesto.numero).padStart(3, '0')}`, margin, 21);
  doc.text(`Generado: ${new Date(presupuesto.created_at).toLocaleDateString('es-AR')}`, pageW - margin, 21, { align: 'right' });

  y = 40;
  doc.setTextColor(0, 0, 0);

  // Datos del modelo
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  const titulo = presupuesto.modelos?.nombre || presupuesto.modelo_nombre;
  doc.text(`${titulo}${presupuesto.modelos?.superficie ? ` (${presupuesto.modelos.superficie}m²)` : ''}`, margin, y);
  y += 7;

  if (presupuesto.modelo_descripcion) {
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(80, 80, 80);
    const lines = doc.splitTextToSize(presupuesto.modelo_descripcion, pageW - margin * 2);
    doc.text(lines, margin, y);
    y += lines.length * 4.5 + 2;
  }

  // Datos del cliente
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  if (presupuesto.cliente_nombre) { doc.text(`Cliente: ${presupuesto.cliente_nombre}`, margin, y); y += 5; }
  if (presupuesto.cliente_contacto) { doc.text(`Contacto: ${presupuesto.cliente_contacto}`, margin, y); y += 5; }
  if (presupuesto.cliente_direccion) { doc.text(`Dirección: ${presupuesto.cliente_direccion}`, margin, y); y += 5; }

  y += 5;

  // Tabla de items
  doc.setFillColor(243, 244, 246);
  doc.rect(margin, y, pageW - margin * 2, 8, 'F');
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('Descripción', margin + 2, y + 5.5);
  doc.text('Unidad', margin + 110, y + 5.5);
  doc.text('Cant.', margin + 135, y + 5.5);
  doc.text('Precio', margin + 180, y + 5.5, { align: 'right' });
  y += 10;

  doc.setFont('helvetica', 'normal');
  for (const item of items || []) {
    if (y > 270) {
      doc.addPage();
      y = margin;
    }
    const subtotal = Number(item.cantidad || 0) * Number(item.costo_unitario || 0);

    doc.setFontSize(8);
    doc.text(doc.splitTextToSize(item.descripcion, 100)[0], margin + 2, y);
    doc.text(item.unidad || '-', margin + 110, y);
    doc.text(String(item.cantidad), margin + 145, y, { align: 'right' });
    doc.text(money(subtotal), margin + 180, y, { align: 'right' });

    doc.setDrawColor(220, 220, 220);
    doc.line(margin, y + 2, pageW - margin, y + 2);
    y += 7;
  }

  // Totales
  y += 5;
  if (y > 260) { doc.addPage(); y = margin; }
  doc.setDrawColor(212, 165, 116);
  doc.setLineWidth(0.5);
  doc.line(margin + 100, y, pageW - margin, y);
  y += 7;

  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(26, 26, 46);
  doc.text('TOTAL:', margin + 130, y);
  doc.text(money(presupuesto.precio_total), pageW - margin, y, { align: 'right' });

  // Notas
  if (presupuesto.notas) {
    y += 12;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text('Notas:', margin, y);
    y += 5;
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(80, 80, 80);
    const lines = doc.splitTextToSize(presupuesto.notas, pageW - margin * 2);
    doc.text(lines, margin, y);
  }

  // Footer
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(150, 150, 150);
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
