import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { QRCodeCanvas } from 'qrcode.react';
import { useAuth } from '../hooks/useAuth';
import { api } from '../lib/api';

// Página de impresión de etiquetas QR (una por código de componente).
// Permite filtrar por familia / subfamilia / todos y elegir 1 o varios (checkboxes).
export default function QrPrint() {
  const { token } = useAuth();
  const [params] = useSearchParams();
  const codigo = params.get('codigo');
  const [partes, setPartes] = useState([]);
  const [familias, setFamilias] = useState([]);
  const [subfamilias, setSubfamilias] = useState([]);
  const [familiaId, setFamiliaId] = useState('');
  const [subId, setSubId] = useState('');
  const [selected, setSelected] = useState(() => new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.partes.list(token), api.familias.list(token), api.subfamilias.list(token)])
      .then(([p, f, s]) => {
        setPartes(p.partes || []);
        setFamilias(f.familias || []);
        setSubfamilias(s.subfamilias || []);
      })
      .finally(() => setLoading(false));
  }, [token]);

  const base = useMemo(() => (codigo ? partes.filter(p => String(p.codigo) === codigo) : partes), [partes, codigo]);

  const filtradas = useMemo(() => {
    let arr = base;
    if (familiaId) arr = arr.filter(p => String(p.familia_id) === familiaId);
    if (subId)     arr = arr.filter(p => String(p.subfamilia_id) === subId);
    return [...arr].sort((a, b) => String(a.codigo).localeCompare(String(b.codigo)));
  }, [base, familiaId, subId]);

  // Al cambiar el filtro, seleccionar todo lo visible
  useEffect(() => { setSelected(new Set(filtradas.map(p => p.id))); }, [filtradas]);

  const subsDeFamilia = subfamilias.filter(s => String(s.familia_id) === String(familiaId));
  const toggle = (id) => setSelected(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const selCount = filtradas.filter(p => selected.has(p.id)).length;

  const ctrl = { padding: '7px 10px', borderRadius: '6px', border: '1px solid #ccc', background: '#fff', fontSize: '0.85rem' };

  return (
    <div style={{ background: '#fff', minHeight: '100vh', color: '#111' }}>
      <style>{`
        @media print {
          .no-print { display: none !important; }
          .qr-hidden { display: none !important; }
          @page { margin: 10mm; }
        }
        .qr-label { break-inside: avoid; page-break-inside: avoid; }
      `}</style>

      {/* Toolbar (no se imprime) */}
      <div className="no-print" style={{ position: 'sticky', top: 0, background: '#f3f4f6', borderBottom: '1px solid #ddd', padding: '12px 20px', display: 'flex', gap: '12px', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          <strong>Etiquetas QR</strong>
          {!codigo && (
            <>
              <select value={familiaId} onChange={e => { setFamiliaId(e.target.value); setSubId(''); }} style={ctrl}>
                <option value="">Todas las familias</option>
                {familias.map(f => <option key={f.id} value={String(f.id)}>{f.nombre}</option>)}
              </select>
              <select value={subId} onChange={e => setSubId(e.target.value)} style={{ ...ctrl, opacity: familiaId ? 1 : 0.5 }} disabled={!familiaId}>
                <option value="">Todas las subfamilias</option>
                {subsDeFamilia.map(s => <option key={s.id} value={String(s.id)}>{s.nombre}</option>)}
              </select>
              <button onClick={() => setSelected(new Set(filtradas.map(p => p.id)))} style={{ ...ctrl, cursor: 'pointer' }}>Todos</button>
              <button onClick={() => setSelected(new Set())} style={{ ...ctrl, cursor: 'pointer' }}>Ninguno</button>
            </>
          )}
          <span style={{ color: '#666', fontSize: '0.85rem' }}>{selCount} seleccionado{selCount !== 1 ? 's' : ''} de {filtradas.length}</span>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={() => window.close()} style={{ ...ctrl, cursor: 'pointer' }}>Cerrar</button>
          <button onClick={() => window.print()} disabled={selCount === 0} style={{ padding: '8px 16px', border: 'none', background: selCount ? '#111' : '#999', color: '#fff', borderRadius: '6px', cursor: selCount ? 'pointer' : 'default', fontWeight: 700 }}>🖨 Imprimir ({selCount})</button>
        </div>
      </div>

      {loading ? (
        <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>Cargando...</div>
      ) : filtradas.length === 0 ? (
        <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>No hay componentes para mostrar.</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', padding: '12px' }}>
          {filtradas.map(p => {
            const sel = selected.has(p.id);
            return (
              <div key={p.id} className={`qr-label ${sel ? '' : 'qr-hidden'}`} style={{ border: '1px dashed #bbb', borderRadius: '6px', padding: '8px 6px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', opacity: sel ? 1 : 0.4 }}>
                <label className="no-print" style={{ alignSelf: 'flex-start', fontSize: '0.7rem', color: '#444', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
                  <input type="checkbox" checked={sel} onChange={() => toggle(p.id)} /> imprimir
                </label>
                <QRCodeCanvas value={String(p.codigo)} size={108} />
                <div style={{ fontWeight: 800, fontSize: '0.88rem', fontFamily: 'monospace' }}>{p.codigo}</div>
                <div style={{ fontSize: '0.66rem', lineHeight: 1.1, maxHeight: '2.2em', overflow: 'hidden' }}>{p.nombre}</div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
