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
  if (!user || !['superadmin', 'dueno', 'deposito'].includes(user.rol)) {
    return { statusCode: 403, headers: corsHeaders, body: 'Sin permisos' };
  }

  const obra_id = event.queryStringParameters?.obra_id;
  if (!obra_id) return { statusCode: 400, headers: corsHeaders, body: 'obra_id requerido' };

  // Obtener datos de la obra
  const { data: obra } = await supabase
    .from('obras')
    .select(`
      numero_obra, direccion, fecha_inicio,
      modelos(nombre, superficie),
      cliente:users!obras_cliente_id_fkey(nombre, email, telefono, direccion)
    `)
    .eq('id', obra_id)
    .single();

  if (!obra) return { statusCode: 404, headers: corsHeaders, body: 'Obra no encontrada' };

  // Obtener checklist con partes
  const { data: checklist } = await supabase
    .from('obra_checklist')
    .select(`
      cantidad_requerida, cantidad_entregada, completado,
      partes(codigo, nombre, unidad, descripcion)
    `)
    .eq('obra_id', obra_id)
    .order('completado');

  // Generar PDF
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageW = 210;
  const margin = 15;
  let y = margin;

  // Header
  doc.setFillColor(37, 99, 235);
  doc.rect(0, 0, pageW, 30, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('ALMAMOD', margin, 13);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Lista de Materiales por Obra', margin, 21);
  doc.text(`Generado: ${new Date().toLocaleDateString('es-AR')}`, pageW - margin, 21, { align: 'right' });

  y = 40;
  doc.setTextColor(0, 0, 0);

  // Info obra
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text(`Obra #${obra.numero_obra} · ${obra.modelos.nombre} (${obra.modelos.superficie})`, margin, y);
  y += 7;

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(80, 80, 80);
  if (obra.direccion) { doc.text(`Dirección obra: ${obra.direccion}`, margin, y); y += 5; }
  if (obra.fecha_inicio) { doc.text(`Fecha inicio: ${new Date(obra.fecha_inicio).toLocaleDateString('es-AR')}`, margin, y); y += 5; }
  doc.text(`Cliente: ${obra.cliente.nombre} · ${obra.cliente.email}`, margin, y); y += 5;
  if (obra.cliente.telefono) { doc.text(`Tel: ${obra.cliente.telefono}`, margin, y); y += 5; }

  y += 5;

  // Tabla de materiales
  doc.setTextColor(0, 0, 0);
  doc.setFillColor(243, 244, 246);
  doc.rect(margin, y, pageW - margin * 2, 8, 'F');
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('Código', margin + 2, y + 5.5);
  doc.text('Material', margin + 22, y + 5.5);
  doc.text('Unidad', margin + 110, y + 5.5);
  doc.text('Requerido', margin + 130, y + 5.5);
  doc.text('Entregado', margin + 152, y + 5.5);
  doc.text('Estado', margin + 174, y + 5.5);
  y += 10;

  doc.setFont('helvetica', 'normal');
  for (const item of checklist || []) {
    if (y > 270) {
      doc.addPage();
      y = margin;
    }

    const estadoColor = item.completado ? [34, 197, 94] : [239, 68, 68];
    const estadoText = item.completado ? '✓ OK' : 'Pendiente';

    doc.setFontSize(8);
    doc.text(item.partes.codigo, margin + 2, y);
    doc.text(doc.splitTextToSize(item.partes.nombre, 84)[0], margin + 22, y);
    doc.text(item.partes.unidad, margin + 110, y);
    doc.text(String(item.cantidad_requerida), margin + 138, y, { align: 'right' });
    doc.text(String(item.cantidad_entregada), margin + 160, y, { align: 'right' });
    doc.setTextColor(...estadoColor);
    doc.text(estadoText, margin + 174, y);
    doc.setTextColor(0, 0, 0);

    doc.setDrawColor(220, 220, 220);
    doc.line(margin, y + 2, pageW - margin, y + 2);
    y += 7;
  }

  // Resumen
  y += 5;
  const total = checklist?.length || 0;
  const completados = checklist?.filter(c => c.completado).length || 0;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text(`Total materiales: ${total}   Completados: ${completados}   Pendientes: ${total - completados}`, margin, y);

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
      'Content-Disposition': `attachment; filename="almamod-obra-${obra.numero_obra}.pdf"`,
    },
    body: pdfBuffer.toString('base64'),
    isBase64Encoded: true,
  };
}
