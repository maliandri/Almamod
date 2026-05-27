import { useState, useEffect, useRef } from 'react';
import * as XLSX from 'xlsx';
import { useAuth } from '../hooks/useAuth';
import { api } from '../lib/api';
import AppLayout from '../components/AppLayout';
import { C, S, inputFocus, inputBlur } from '../styles';

const EMPTY = { codigo: '', nombre: '', descripcion: '', unidad: 'unidad', costo: '', stock_actual: '', stock_minimo: '' };

function StockBadge({ actual, minimo }) {
  const num = Number(actual || 0);
  const min = Number(minimo || 0);
  const ok = num > min;
  const low = num > 0 && num <= min;
  const out = num === 0;
  const style = out ? { background: 'rgba(239,68,68,0.15)', color: '#ef4444' }
              : low ? { background: 'rgba(251,191,36,0.15)', color: '#fbbf24' }
              : { background: 'rgba(16,185,129,0.15)', color: '#10b981' };
  return (
    <span style={{ ...style, padding: '2px 8px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 700 }}>
      {num}
    </span>
  );
}

function ModalParte({ parte, onClose, onSave }) {
  const [form, setForm] = useState(parte || EMPTY);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const f = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSave = async () => {
    if (!form.codigo || !form.nombre) { setError('Código y nombre son requeridos'); return; }
    setLoading(true); setError('');
    try { await onSave(form); onClose(); }
    catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
      <div style={{ ...S.card, width: '100%', maxWidth: '480px', maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ ...S.h2, margin: 0, color: C.gold }}>{parte ? 'Editar parte' : 'Nueva parte'}</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: C.textMuted, fontSize: '1.4rem', cursor: 'pointer' }}>×</button>
        </div>
        {[['codigo','Código *','text'],['nombre','Nombre *','text'],['descripcion','Descripción','text'],['unidad','Unidad','text']].map(([k, label]) => (
          <div key={k} style={{ marginBottom: '14px' }}>
            <label style={S.label}>{label}</label>
            <input value={form[k]} onChange={e => f(k, e.target.value)} style={S.input} onFocus={inputFocus} onBlur={inputBlur} />
          </div>
        ))}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '20px' }}>
          {[['costo','Costo $'],['stock_actual','Stock actual'],['stock_minimo','Stock mínimo']].map(([k, label]) => (
            <div key={k}>
              <label style={S.label}>{label}</label>
              <input type="number" min="0" value={form[k]} onChange={e => f(k, e.target.value)} style={S.input} onFocus={inputFocus} onBlur={inputBlur} />
            </div>
          ))}
        </div>
        {error && <div style={{ ...S.alertError, marginBottom: '12px' }}>{error}</div>}
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={onClose} style={{ ...S.btnGhost, flex: 1 }}>Cancelar</button>
          <button onClick={handleSave} disabled={loading} style={{ ...S.btnGold, flex: 1, opacity: loading ? 0.6 : 1 }}>
            {loading ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </div>
    </div>
  );
}

function ModalStock({ parte, onClose, onSave }) {
  const [form, setForm] = useState({ tipo: 'ingreso', cantidad: '', notas: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const TIPOS = [
    { v: 'ingreso', label: '📦 Ingreso', color: C.green },
    { v: 'egreso',  label: '📤 Egreso',  color: '#f59e0b' },
    { v: 'ajuste',  label: '✏️ Ajuste',  color: C.blue },
  ];

  const handleSave = async () => {
    if (!form.cantidad) { setError('Cantidad requerida'); return; }
    setLoading(true); setError('');
    try { await onSave({ parte_id: parte.id, ...form, cantidad: Number(form.cantidad) }); onClose(); }
    catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
      <div style={{ ...S.card, width: '100%', maxWidth: '380px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2 style={{ ...S.h2, margin: 0, color: C.gold }}>Movimiento de stock</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: C.textMuted, fontSize: '1.4rem', cursor: 'pointer' }}>×</button>
        </div>
        <div style={{ color: C.textSub, fontSize: '0.9rem', marginBottom: '16px' }}>
          <strong style={{ color: C.gold }}>{parte.nombre}</strong> · Stock actual: <strong>{parte.stock_actual}</strong>
        </div>
        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
          {TIPOS.map(t => (
            <button key={t.v} onClick={() => setForm(p => ({ ...p, tipo: t.v }))}
              style={{ flex: 1, padding: '8px', border: `1px solid ${form.tipo === t.v ? t.color : C.border}`, borderRadius: '8px', background: form.tipo === t.v ? `${t.color}20` : 'transparent', color: form.tipo === t.v ? t.color : C.textMuted, cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600, transition: 'all 0.15s' }}>
              {t.label}
            </button>
          ))}
        </div>
        <div style={{ marginBottom: '12px' }}>
          <label style={S.label}>{form.tipo === 'ajuste' ? 'Nuevo stock total' : 'Cantidad'}</label>
          <input type="number" min="0" value={form.cantidad} onChange={e => setForm(p => ({ ...p, cantidad: e.target.value }))} style={S.input} onFocus={inputFocus} onBlur={inputBlur} autoFocus />
        </div>
        <div style={{ marginBottom: '16px' }}>
          <label style={S.label}>Notas</label>
          <input value={form.notas} onChange={e => setForm(p => ({ ...p, notas: e.target.value }))} placeholder="Proveedor, factura..." style={S.input} onFocus={inputFocus} onBlur={inputBlur} />
        </div>
        {error && <div style={{ ...S.alertError, marginBottom: '12px' }}>{error}</div>}
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={onClose} style={{ ...S.btnGhost, flex: 1 }}>Cancelar</button>
          <button onClick={handleSave} disabled={loading} style={{ ...S.btnGold, flex: 1, opacity: loading ? 0.6 : 1 }}>
            {loading ? 'Registrando...' : 'Registrar'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Partes() {
  const { token, user } = useAuth();
  const [partes, setPartes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [modalParte, setModalParte] = useState(null); // null | 'nueva' | parte
  const [modalStock, setModalStock] = useState(null);
  const [importando, setImportando] = useState(false);
  const [importMsg, setImportMsg] = useState('');
  const fileRef = useRef();

  const canWrite = ['superadmin', 'dueno', 'deposito'].includes(user?.rol);

  const cargar = () => {
    setLoading(true);
    api.partes.list(token).then(d => setPartes(d.partes || [])).finally(() => setLoading(false));
  };

  useEffect(() => { cargar(); }, [token]);

  const handleSaveParte = async (form) => {
    if (form.id) await api.partes.update(token, form);
    else         await api.partes.create(token, form);
    cargar();
  };

  const handleStock = async (data) => {
    await api.stock.registrar(token, data);
    cargar();
  };

  const handleExcel = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImportando(true); setImportMsg('');
    try {
      const buf = await file.arrayBuffer();
      const wb  = XLSX.read(buf);
      const ws  = wb.Sheets[wb.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(ws);
      let ok = 0;
      for (const row of rows) {
        const codigo = String(row.codigo || row.Codigo || row.CODIGO || '').trim();
        const nombre = String(row.nombre || row.Nombre || row.NOMBRE || '').trim();
        if (!codigo || !nombre) continue;
        await api.partes.create(token, {
          codigo, nombre,
          descripcion: row.descripcion || row.Descripcion || '',
          unidad: row.unidad || row.Unidad || 'unidad',
          costo: Number(row.costo || row.Costo || 0),
          stock_actual: Number(row.stock_actual || row.Stock || 0),
          stock_minimo: Number(row.stock_minimo || row.StockMinimo || 0),
        }).catch(() => null);
        ok++;
      }
      setImportMsg(`✓ ${ok} partes importadas`);
      cargar();
    } catch (err) {
      setImportMsg(`Error: ${err.message}`);
    } finally {
      setImportando(false);
      e.target.value = '';
    }
  };

  const filtradas = partes.filter(p =>
    !busqueda || p.nombre.toLowerCase().includes(busqueda.toLowerCase()) || p.codigo.toLowerCase().includes(busqueda.toLowerCase())
  );

  const sinStock = partes.filter(p => Number(p.stock_actual) === 0).length;
  const stockBajo = partes.filter(p => Number(p.stock_actual) > 0 && Number(p.stock_actual) <= Number(p.stock_minimo)).length;

  return (
    <AppLayout>
      <div style={{ padding: '28px 32px' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
          <h1 style={{ ...S.h1, margin: 0 }}>⚙️ Componentes</h1>
          {canWrite && (
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <input ref={fileRef} type="file" accept=".xlsx,.xls,.csv" onChange={handleExcel} style={{ display: 'none' }} />
              <button onClick={() => fileRef.current?.click()} disabled={importando} style={{ ...S.btnGhost, fontSize: '0.85rem' }}>
                {importando ? 'Importando...' : '📊 Excel'}
              </button>
              <button onClick={() => setModalParte('nueva')} style={S.btnGold}>+ Nueva parte</button>
            </div>
          )}
        </div>

        {/* Alertas de stock */}
        {(sinStock > 0 || stockBajo > 0) && (
          <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
            {sinStock > 0 && <div style={{ ...S.alertError, flex: 1 }}>🔴 {sinStock} parte{sinStock > 1 ? 's' : ''} sin stock</div>}
            {stockBajo > 0 && <div style={{ background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.3)', color: '#fbbf24', borderRadius: '8px', padding: '10px 14px', fontSize: '0.85rem', flex: 1 }}>
              🟡 {stockBajo} parte{stockBajo > 1 ? 's' : ''} con stock bajo el mínimo
            </div>}
          </div>
        )}

        {importMsg && <div style={{ ...S.alertSuccess, marginBottom: '16px' }}>{importMsg}</div>}

        {/* Búsqueda */}
        <div style={{ marginBottom: '16px' }}>
          <input
            placeholder="🔍 Buscar por código o nombre..."
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
            style={{ ...S.input, maxWidth: '400px' }}
            onFocus={inputFocus} onBlur={inputBlur}
          />
        </div>

        {/* Tabla */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '48px', color: C.textMuted }}>Cargando...</div>
        ) : (
          <div style={{ ...S.card, padding: 0, overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto' }}>
            {/* Header tabla */}
            <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr 80px 80px 80px 80px 110px', gap: '0', padding: '10px 16px', background: 'rgba(212,165,116,0.06)', borderBottom: `1px solid ${C.border}`, minWidth: '640px' }}>
              {['Código','Nombre','Unidad','Costo','Stock','Mínimo',''].map((h, i) => (
                <div key={i} style={{ color: C.textMuted, fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.05em', textAlign: i >= 3 ? 'center' : 'left' }}>{h}</div>
              ))}
            </div>

            {filtradas.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: C.textMuted }}>
                {busqueda ? 'Sin resultados' : 'No hay partes cargadas'}
              </div>
            ) : filtradas.map((p, i) => (
              <div key={p.id} style={{ display: 'grid', gridTemplateColumns: '100px 1fr 80px 80px 80px 80px 110px', gap: '0', padding: '10px 16px', borderBottom: i < filtradas.length - 1 ? `1px solid ${C.border}` : 'none', alignItems: 'center', background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)', transition: 'background 0.15s', minWidth: '640px' }}>
                <div style={{ color: C.gold, fontFamily: 'monospace', fontSize: '0.8rem', fontWeight: 700 }}>{p.codigo}</div>
                <div>
                  <div style={{ color: C.text, fontSize: '0.88rem', fontWeight: 500 }}>{p.nombre}</div>
                  {p.descripcion && <div style={{ color: C.textMuted, fontSize: '0.75rem' }}>{p.descripcion}</div>}
                </div>
                <div style={{ color: C.textMuted, fontSize: '0.8rem', textAlign: 'center' }}>{p.unidad}</div>
                <div style={{ color: C.textSub, fontSize: '0.85rem', textAlign: 'center' }}>${Number(p.costo || 0).toLocaleString('es-AR')}</div>
                <div style={{ textAlign: 'center' }}><StockBadge actual={p.stock_actual} minimo={p.stock_minimo} /></div>
                <div style={{ color: C.textMuted, fontSize: '0.8rem', textAlign: 'center' }}>{p.stock_minimo}</div>
                <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                  {canWrite && (
                    <>
                      <button onClick={() => setModalStock(p)} title="Movimiento de stock"
                        style={{ background: C.greenDim, border: 'none', borderRadius: '6px', padding: '4px 8px', color: C.green, cursor: 'pointer', fontSize: '0.8rem', fontWeight: 700 }}>
                        ±
                      </button>
                      <button onClick={() => setModalParte(p)} title="Editar"
                        style={{ background: C.goldDim, border: 'none', borderRadius: '6px', padding: '4px 8px', color: C.gold, cursor: 'pointer', fontSize: '0.8rem' }}>
                        ✏️
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
            </div>{/* fin overflowX */}
          </div>
        )}

        <div style={{ marginTop: '12px', color: C.textMuted, fontSize: '0.8rem' }}>
          {filtradas.length} de {partes.length} partes
        </div>
      </div>

      {modalParte && (
        <ModalParte
          parte={modalParte === 'nueva' ? null : modalParte}
          onClose={() => setModalParte(null)}
          onSave={handleSaveParte}
        />
      )}
      {modalStock && (
        <ModalStock
          parte={modalStock}
          onClose={() => setModalStock(null)}
          onSave={handleStock}
        />
      )}
    </AppLayout>
  );
}
