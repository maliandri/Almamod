import { useState, useEffect, useRef } from 'react';
import { jsPDF } from 'jspdf';
import { useAuth } from '../hooks/useAuth';
import { api } from '../lib/api';
import AppLayout from '../components/AppLayout';
import { C, S, inputFocus, inputBlur } from '../styles';

function generarPDF(remito, items) {
  const doc = new jsPDF();
  const fecha = new Date(remito.created_at || Date.now()).toLocaleDateString('es-AR');

  doc.setFontSize(16);
  doc.text('AlmaMod — Remito de entrega de insumos', 14, 18);
  doc.setFontSize(10);
  doc.text(`N° ${remito.numero ?? '-'}`, 14, 27);
  doc.text(`Fecha: ${fecha}`, 150, 27);
  if (remito.destino) doc.text(`Destino: ${remito.destino}`, 14, 33);
  if (remito.notas)   doc.text(`Notas: ${String(remito.notas).slice(0, 110)}`, 14, 39);

  let y = 50;
  doc.setFont(undefined, 'bold');
  doc.text('Código', 14, y);
  doc.text('Componente', 45, y);
  doc.text('Cant.', 150, y);
  doc.text('Unidad', 172, y);
  doc.setFont(undefined, 'normal');
  y += 2; doc.line(14, y, 196, y); y += 6;

  items.forEach(it => {
    doc.text(String(it.codigo || ''), 14, y);
    doc.text(String(it.nombre || '').slice(0, 60), 45, y);
    doc.text(String(it.cantidad), 150, y);
    doc.text(String(it.unidad || ''), 172, y);
    y += 7;
    if (y > 265) { doc.addPage(); y = 20; }
  });

  // Firma de recepción interna
  y = Math.max(y + 24, 255);
  doc.line(14, y, 92, y);   doc.setFontSize(9); doc.text('Recibí conforme (firma)', 14, y + 5);
  doc.line(110, y, 188, y); doc.text('Aclaración / fecha', 110, y + 5);

  doc.save(`remito-egreso-${remito.numero ?? ''}.pdf`);
}

export default function RemitoEgreso() {
  const { token } = useAuth();
  const [partes, setPartes] = useState([]);
  const [items, setItems] = useState([]);
  const [destino, setDestino] = useState('');
  const [recibidoPor, setRecibidoPor] = useState('');
  const [notas, setNotas] = useState('');
  const [codeInput, setCodeInput] = useState('');
  const [search, setSearch] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [recientes, setRecientes] = useState([]);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const codeRef = useRef();

  useEffect(() => {
    api.partes.list(token).then(d => setPartes(d.partes || []));
    cargarRecientes();
  }, [token]);

  const cargarRecientes = () => {
    api.remitosEgreso.list(token).then(d => setRecientes(d.remitos || [])).catch(() => {});
  };

  const addParte = (parte) => {
    setItems(prev => {
      const ix = prev.findIndex(i => i.parte_id === parte.id);
      if (ix >= 0) {
        const next = [...prev];
        next[ix] = { ...next[ix], cantidad: Number(next[ix].cantidad || 0) + 1 };
        return next;
      }
      return [...prev, { parte_id: parte.id, codigo: parte.codigo, nombre: parte.nombre, unidad: parte.unidad, cantidad: 1 }];
    });
  };

  const addByCodigo = (cod) => {
    const c = (cod || '').trim();
    if (!c) return;
    const parte = partes.find(p => String(p.codigo).toLowerCase() === c.toLowerCase());
    if (!parte) { setMsg(`⚠️ Código "${c}" no encontrado`); return; }
    addParte(parte);
    setMsg(`✓ ${parte.codigo} — ${parte.nombre}`);
  };

  const setCantidad = (parte_id, cantidad) => {
    setItems(prev => prev.map(i => i.parte_id === parte_id ? { ...i, cantidad } : i));
  };
  const quitar = (parte_id) => setItems(prev => prev.filter(i => i.parte_id !== parte_id));

  const partesFiltradas = partes.filter(p =>
    (!search || p.nombre.toLowerCase().includes(search.toLowerCase()) || String(p.codigo).toLowerCase().includes(search.toLowerCase())) &&
    !items.some(i => i.parte_id === p.id)
  );

  const guardar = async (estado) => {
    if (!items.length) { setMsg('⚠️ Agregá al menos un componente'); return; }
    setSaving(true); setMsg('');
    try {
      const { remito } = await api.remitosEgreso.create(token, {
        destino, notas, recibido_por: recibidoPor, estado,
        items: items.map(i => ({ parte_id: i.parte_id, cantidad: Number(i.cantidad) || 1 })),
      });
      if (estado === 'emitido') {
        generarPDF({ ...remito, destino, notas }, items);
      }
      setItems([]); setDestino(''); setRecibidoPor(''); setNotas('');
      setMsg(`✓ Remito N° ${remito.numero} ${estado === 'emitido' ? 'emitido' : 'guardado como borrador'}`);
      cargarRecientes();
    } catch (e) {
      setMsg(`Error: ${e.message}`);
    } finally {
      setSaving(false);
    }
  };

  const reimprimir = async (id) => {
    try {
      const { remito, items: its } = await api.remitosEgreso.get(token, id);
      generarPDF(remito, (its || []).map(it => ({
        codigo: it.partes?.codigo, nombre: it.partes?.nombre, unidad: it.partes?.unidad, cantidad: it.cantidad,
      })));
    } catch (e) { setMsg(`Error: ${e.message}`); }
  };

  const totalUnidades = items.reduce((s, i) => s + (Number(i.cantidad) || 0), 0);

  return (
    <AppLayout>
      <div style={{ padding: '28px 32px', maxWidth: '900px' }}>
        <h1 style={{ ...S.h1, margin: '0 0 6px 0' }}>📤 Remito de entrega de insumos</h1>
        <p style={{ color: C.textMuted, fontSize: '0.88rem', marginBottom: '24px' }}>
          Escaneá el QR con un lector (o escribí el código y Enter), poné la cantidad y emití el PDF para imprimir y firmar.
        </p>

        {msg && <div style={{ ...S.alertSuccess, marginBottom: '16px' }}>{msg}</div>}

        {/* Agregar por código / búsqueda */}
        <div style={{ ...S.card, marginBottom: '20px' }}>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
            <input
              ref={codeRef}
              value={codeInput}
              onChange={e => setCodeInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addByCodigo(codeInput); setCodeInput(''); } }}
              placeholder="📷 Escaneá el QR o escribí el código + Enter"
              autoFocus
              style={{ ...S.input, flex: 1, minWidth: '240px' }}
              onFocus={inputFocus} onBlur={inputBlur}
            />
            <div style={{ position: 'relative' }}>
              <button onClick={() => setShowSearch(s => !s)} style={{ ...S.btnGhost, fontSize: '0.85rem' }}>🔍 Buscar</button>
              {showSearch && (
                <div style={{ position: 'absolute', top: '110%', right: 0, zIndex: 10, width: '320px', ...S.card, padding: '10px', background: '#1a2035' }}>
                  <input
                    autoFocus value={search} onChange={e => setSearch(e.target.value)}
                    placeholder="Código o nombre..."
                    style={{ ...S.input, marginBottom: '8px' }} onFocus={inputFocus} onBlur={inputBlur}
                  />
                  <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                    {partesFiltradas.slice(0, 25).map(p => (
                      <button key={p.id} onMouseDown={e => e.preventDefault()}
                        onClick={() => { addParte(p); setSearch(''); }}
                        style={{ display: 'flex', width: '100%', gap: '8px', padding: '6px 8px', background: 'transparent', border: 'none', borderBottom: `1px solid ${C.border}`, color: C.textSub, cursor: 'pointer', textAlign: 'left', fontSize: '0.82rem', alignItems: 'center' }}>
                        <span style={{ color: C.gold, fontFamily: 'monospace', fontSize: '0.75rem', minWidth: '70px' }}>{p.codigo}</span>
                        <span style={{ flex: 1 }}>{p.nombre}</span>
                      </button>
                    ))}
                    {partesFiltradas.length === 0 && <div style={{ color: C.textMuted, fontSize: '0.82rem', padding: '8px' }}>Sin resultados</div>}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Ítems */}
        <div style={{ ...S.card, padding: 0, overflow: 'hidden', marginBottom: '20px' }}>
          <div style={{ padding: '10px 16px', background: 'rgba(212,165,116,0.06)', borderBottom: `1px solid ${C.border}`, display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: C.textMuted, fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.05em' }}>
              {items.length} ÍTEM{items.length !== 1 ? 'S' : ''}
            </span>
            {items.length > 0 && <span style={{ color: C.gold, fontSize: '0.78rem', fontWeight: 700 }}>{totalUnidades} unidades</span>}
          </div>
          {items.length === 0 ? (
            <div style={{ padding: '36px', textAlign: 'center', color: C.textMuted }}>Escaneá o agregá componentes para armar el remito</div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              {items.map((it, i) => (
                <div key={it.parte_id} style={{ display: 'grid', gridTemplateColumns: '100px 1fr 110px 70px 40px', gap: '8px', padding: '8px 16px', borderBottom: `1px solid ${C.border}`, alignItems: 'center', background: i % 2 ? 'rgba(255,255,255,0.01)' : 'transparent', minWidth: '460px' }}>
                  <span style={{ color: C.gold, fontFamily: 'monospace', fontSize: '0.8rem', fontWeight: 700 }}>{it.codigo}</span>
                  <span style={{ color: C.text, fontSize: '0.86rem' }}>{it.nombre}</span>
                  <input type="number" min="0.01" step="0.01" value={it.cantidad}
                    onChange={e => setCantidad(it.parte_id, e.target.value)}
                    style={{ ...S.input, padding: '4px 8px', textAlign: 'center', fontSize: '0.85rem' }} onFocus={inputFocus} />
                  <span style={{ color: C.textMuted, fontSize: '0.8rem', textAlign: 'center' }}>{it.unidad}</span>
                  <button onClick={() => quitar(it.parte_id)} style={{ background: C.redDim, border: 'none', borderRadius: '6px', padding: '4px 8px', color: C.red, cursor: 'pointer', fontSize: '0.75rem' }}>×</button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Datos del remito */}
        <div style={{ ...S.card, marginBottom: '20px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
            <div>
              <label style={S.label}>Destino (obra / sector / persona)</label>
              <input value={destino} onChange={e => setDestino(e.target.value)} placeholder="Ej: Obra Alma 36 — Planta" style={S.input} onFocus={inputFocus} onBlur={inputBlur} />
            </div>
            <div>
              <label style={S.label}>Recibe (aclaración)</label>
              <input value={recibidoPor} onChange={e => setRecibidoPor(e.target.value)} placeholder="Nombre de quien recibe" style={S.input} onFocus={inputFocus} onBlur={inputBlur} />
            </div>
          </div>
          <div style={{ marginTop: '14px' }}>
            <label style={S.label}>Notas</label>
            <input value={notas} onChange={e => setNotas(e.target.value)} placeholder="Opcional" style={S.input} onFocus={inputFocus} onBlur={inputBlur} />
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '32px' }}>
          <button onClick={() => guardar('emitido')} disabled={saving || !items.length} style={{ ...S.btnGold, opacity: (saving || !items.length) ? 0.5 : 1 }}>
            {saving ? 'Procesando...' : '📄 Emitir e imprimir PDF'}
          </button>
          <button onClick={() => guardar('borrador')} disabled={saving || !items.length} style={{ ...S.btnGhost, opacity: (saving || !items.length) ? 0.5 : 1 }}>
            Guardar borrador
          </button>
        </div>

        {/* Recientes */}
        {recientes.length > 0 && (
          <div style={{ ...S.card, padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '10px 16px', background: 'rgba(212,165,116,0.06)', borderBottom: `1px solid ${C.border}` }}>
              <span style={{ color: C.textMuted, fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.05em' }}>ÚLTIMOS REMITOS</span>
            </div>
            {recientes.map((r, i) => (
              <div key={r.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 16px', borderBottom: i < recientes.length - 1 ? `1px solid ${C.border}` : 'none' }}>
                <span style={{ color: C.gold, fontWeight: 700, fontSize: '0.85rem', minWidth: '48px' }}>N° {r.numero}</span>
                <span style={{ flex: 1, color: C.textSub, fontSize: '0.85rem' }}>{r.destino || <span style={{ color: C.textMuted }}>sin destino</span>}</span>
                <span style={{ background: r.estado === 'emitido' ? C.greenDim : 'rgba(148,163,184,0.12)', color: r.estado === 'emitido' ? C.green : C.textMuted, fontSize: '0.68rem', fontWeight: 700, padding: '2px 8px', borderRadius: '20px' }}>{r.estado}</span>
                <span style={{ color: C.textMuted, fontSize: '0.75rem' }}>{new Date(r.created_at).toLocaleDateString('es-AR')}</span>
                <button onClick={() => reimprimir(r.id)} style={{ ...S.btnGhost, padding: '4px 10px', fontSize: '0.75rem' }}>📄 PDF</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
