import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { QRCodeCanvas } from 'qrcode.react';
import { useAuth } from '../hooks/useAuth';
import { api } from '../lib/api';

// Página de impresión de etiquetas QR (una por código de componente).
// 4 columnas; el navegador pagina solo. Sin AppLayout: hoja blanca lista para imprimir.
export default function QrPrint() {
  const { token } = useAuth();
  const [params] = useSearchParams();
  const codigo = params.get('codigo');
  const [partes, setPartes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.partes.list(token)
      .then(d => {
        let arr = d.partes || [];
        if (codigo) arr = arr.filter(p => p.codigo === codigo);
        arr.sort((a, b) => String(a.codigo).localeCompare(String(b.codigo)));
        setPartes(arr);
      })
      .finally(() => setLoading(false));
  }, [token, codigo]);

  return (
    <div style={{ background: '#fff', minHeight: '100vh', color: '#111' }}>
      <style>{`
        @media print {
          .no-print { display: none !important; }
          @page { margin: 10mm; }
        }
        .qr-label { break-inside: avoid; page-break-inside: avoid; }
      `}</style>

      {/* Toolbar (no se imprime) */}
      <div className="no-print" style={{ position: 'sticky', top: 0, background: '#f3f4f6', borderBottom: '1px solid #ddd', padding: '12px 20px', display: 'flex', gap: '12px', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' }}>
        <div style={{ fontWeight: 700 }}>
          Etiquetas QR — {partes.length} componente{partes.length !== 1 ? 's' : ''}{codigo ? ` · ${codigo}` : ''}
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={() => window.close()} style={{ padding: '8px 16px', border: '1px solid #ccc', background: '#fff', borderRadius: '6px', cursor: 'pointer' }}>Cerrar</button>
          <button onClick={() => window.print()} style={{ padding: '8px 16px', border: 'none', background: '#111', color: '#fff', borderRadius: '6px', cursor: 'pointer', fontWeight: 700 }}>🖨 Imprimir</button>
        </div>
      </div>

      {loading ? (
        <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>Cargando...</div>
      ) : partes.length === 0 ? (
        <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>No hay componentes para imprimir.</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', padding: '12px' }}>
          {partes.map(p => (
            <div key={p.id} className="qr-label" style={{ border: '1px dashed #bbb', borderRadius: '6px', padding: '10px 6px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
              <QRCodeCanvas value={String(p.codigo)} size={112} />
              <div style={{ fontWeight: 800, fontSize: '0.9rem', fontFamily: 'monospace' }}>{p.codigo}</div>
              <div style={{ fontSize: '0.68rem', lineHeight: 1.1, maxHeight: '2.3em', overflow: 'hidden' }}>{p.nombre}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
