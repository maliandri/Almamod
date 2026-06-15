import { useState, useEffect, useRef } from 'react';
import * as XLSX from 'xlsx';
import { useAuth } from '../hooks/useAuth';
import { api } from '../lib/api';
import AppLayout from '../components/AppLayout';
import { C, S, inputFocus, inputBlur } from '../styles';
import { calcularCostoModelo } from '../lib/costos';

const COLORES = ['#667eea','#d4a574','#10b981','#f59e0b','#ef4444','#8b5cf6','#06b6d4','#f97316'];

// Fila del panel de resumen
function ResumenRow({ label, value, strong }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px', padding: '6px 0', borderBottom: `1px solid ${C.border}` }}>
      <span style={{ color: C.textMuted, fontSize: '0.82rem' }}>{label}</span>
      <span style={{ color: strong ? C.text : C.textSub, fontSize: '0.85rem', fontWeight: strong ? 700 : 500 }}>{value}</span>
    </div>
  );
}

export default function BOM() {
  const { token, user } = useAuth();
  const [modelos, setModelos] = useState([]);
  const [modeloId, setModeloId] = useState('');
  const [etapas, setEtapas] = useState([]);
  const [bom, setBom] = useState([]);
  const [todasPartes, setTodasPartes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [importMsg, setImportMsg] = useState('');
  const [nuevaEtapa, setNuevaEtapa] = useState('');
  const [addingParte, setAddingParte] = useState(null); // etapa_id
  const [parteSearch, setParteSearch] = useState('');
  const [addingLoading, setAddingLoading] = useState(false);
  const fileRef = useRef();

  const [config, setConfig] = useState({ valor_hora: 0, pct_indirectos: 0, pct_margen: 0, costo_m2_ref: 0 });

  const canWrite = ['superadmin', 'dueno', 'deposito'].includes(user?.rol);
  const canEditConfig = ['superadmin', 'dueno'].includes(user?.rol);

  useEffect(() => {
    api.modelos.list(token).then(d => setModelos(d.modelos || []));
    api.partes.list(token).then(d => setTodasPartes(d.partes || []));
    api.configCostos.get(token).then(d => { if (d.config) setConfig(d.config); }).catch(() => {});
  }, [token]);

  useEffect(() => {
    if (!modeloId) return;
    setLoading(true);
    Promise.all([
      api.etapasProduccion.list(token, modeloId),
      api.bom.list(token, modeloId),
    ]).then(([e, b]) => {
      setEtapas(e.etapas || []);
      setBom(b.partes || []);
    }).finally(() => setLoading(false));
  }, [modeloId]);

  const agregarEtapa = async () => {
    if (!nuevaEtapa.trim()) return;
    const color = COLORES[etapas.length % COLORES.length];
    const { etapa } = await api.etapasProduccion.create(token, { modelo_id: Number(modeloId), nombre: nuevaEtapa, orden: etapas.length + 1, color });
    setEtapas(prev => [...prev, etapa]);
    setNuevaEtapa('');
  };

  const eliminarEtapa = async (id) => {
    await api.etapasProduccion.delete(token, id);
    setEtapas(prev => prev.filter(e => e.id !== id));
    setBom(prev => prev.filter(b => b.etapas_produccion?.id !== id));
  };

  const moverEtapa = async (id, dir) => {
    const sorted = [...etapas].sort((a, b) => a.orden - b.orden);
    const idx = sorted.findIndex(e => e.id === id);
    const swapIdx = dir === 'up' ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= sorted.length) return;
    const a = sorted[idx];
    const b = sorted[swapIdx];
    await Promise.all([
      api.etapasProduccion.update(token, { id: a.id, orden: b.orden }),
      api.etapasProduccion.update(token, { id: b.id, orden: a.orden }),
    ]);
    setEtapas(prev => prev.map(e => {
      if (e.id === a.id) return { ...e, orden: b.orden };
      if (e.id === b.id) return { ...e, orden: a.orden };
      return e;
    }));
  };

  const agregarParte = async (parte, etapa_id) => {
    if (addingLoading) return;
    setAddingLoading(true);
    try {
      await api.bom.save(token, { modelo_id: Number(modeloId), parte_id: parte.id, cantidad_necesaria: 1, etapa_produccion_id: etapa_id });
      const { partes } = await api.bom.list(token, modeloId);
      setBom(partes || []);
      setAddingParte(null);
      setParteSearch('');
    } catch (err) {
      setImportMsg(`Error al agregar parte: ${err.message}`);
    } finally {
      setAddingLoading(false);
    }
  };

  const actualizarCantidad = async (id, cantidad) => {
    await api.bom.update(token, { id, cantidad_necesaria: Number(cantidad) });
  };

  const eliminarDeBOM = async (id) => {
    await api.bom.delete(token, id);
    setBom(prev => prev.filter(b => b.id !== id));
  };

  const vaciarBOM = async () => {
    if (!bom.length) return;
    if (!window.confirm(`¿Eliminar las ${bom.length} partes del BOM de este modelo? No se puede deshacer.`)) return;
    try {
      await api.bom.clear(token, modeloId);
      setBom([]);
      setImportMsg('✓ BOM vaciado');
    } catch (err) {
      setImportMsg(`Error al vaciar BOM: ${err.message}`);
    }
  };

  const handleExcel = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !modeloId) return;
    setImportMsg('');
    try {
      const buf = await file.arrayBuffer();
      const wb  = XLSX.read(buf);
      const ws  = wb.Sheets[wb.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(ws);
      const items = [];
      for (const row of rows) {
        const codigo = String(row.codigo || row.Codigo || '').trim();
        const parte  = todasPartes.find(p => p.codigo === codigo);
        if (!parte) continue;
        items.push({ parte_id: parte.id, cantidad_necesaria: Number(row.cantidad || row.Cantidad || 1) });
      }
      if (items.length) {
        await api.bom.save(token, { modelo_id: Number(modeloId), bulk: true, items });
        const { partes } = await api.bom.list(token, modeloId);
        setBom(partes || []);
        setImportMsg(`✓ ${items.length} partes importadas al BOM`);
      }
    } catch (err) {
      setImportMsg(`Error: ${err.message}`);
    } finally { e.target.value = ''; }
  };

  const partesFiltradas = todasPartes.filter(p =>
    (!parteSearch || p.nombre.toLowerCase().includes(parteSearch.toLowerCase()) || p.codigo.toLowerCase().includes(parteSearch.toLowerCase())) &&
    !bom.some(b => b.partes?.id === p.id)
  );

  const bomPorEtapa = (etapa_id) => bom.filter(b => b.etapas_produccion?.id === etapa_id);
  const bomSinEtapa = bom.filter(b => !b.etapas_produccion);

  const fmt = (n) => '$' + Math.round(Number(n) || 0).toLocaleString('es-AR');
  const modeloSel = modelos.find(m => String(m.id) === String(modeloId));

  // Edición en vivo de etapas (horas / estado / monto estimado)
  const setEtapaLocal = (id, patch) => setEtapas(prev => prev.map(e => e.id === id ? { ...e, ...patch } : e));
  const persistEtapa  = (id, patch) => api.etapasProduccion.update(token, { id, ...patch }).catch(err => setImportMsg(`Error al guardar etapa: ${err.message}`));

  // Cantidad de parte en vivo (recalcula sin recargar; persiste onBlur con actualizarCantidad)
  const setCantidadLocal = (id, v) => setBom(prev => prev.map(b => b.id === id ? { ...b, cantidad_necesaria: v } : b));

  // Parámetros de costo (config_costos)
  const setCfgLocal   = (patch) => setConfig(prev => ({ ...prev, ...patch }));
  const persistConfig = (next)  => api.configCostos.update(token, next).catch(err => setImportMsg(`Error al guardar parámetros: ${err.message}`));

  // Cálculo en vivo
  const partesPorEtapa = {};
  for (const b of bom) {
    const k = b.etapas_produccion?.id ?? '__sin_etapa__';
    (partesPorEtapa[k] ||= []).push(b);
  }
  const etapasCalculo = [...etapas].sort((a, b) => a.orden - b.orden);
  if (bomSinEtapa.length) etapasCalculo.push({ id: '__sin_etapa__', nombre: 'Sin etapa asignada', estado: 'detallado', horas_estimadas: 0 });
  const costo = calcularCostoModelo({ modelo: modeloSel, etapas: etapasCalculo, partesPorEtapa, config });
  const subtotalEtapa = (id) => costo.porEtapa.find(e => e.id === id)?.subtotal || 0;

  return (
    <AppLayout>
      <div style={{ padding: '28px 32px' }}>
        <h1 style={{ ...S.h1, margin: '0 0 24px 0' }}>📋 BOM — Lista de Materiales</h1>

        {/* Selector de modelo */}
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap' }}>
          <select value={modeloId} onChange={e => setModeloId(e.target.value)} style={{ ...S.select, minWidth: '220px' }}>
            <option value="">Seleccioná un modelo</option>
            {modelos.map(m => <option key={m.id} value={m.id}>{m.nombre}</option>)}
          </select>
          {modeloId && canWrite && (
            <>
              <input ref={fileRef} type="file" accept=".xlsx,.xls,.csv" onChange={handleExcel} style={{ display: 'none' }} />
              <button onClick={() => fileRef.current?.click()} style={{ ...S.btnGhost, fontSize: '0.85rem' }}>📊 Importar Excel</button>
              {bom.length > 0 && (
                <button onClick={vaciarBOM} style={{ ...S.btnDanger, fontSize: '0.85rem' }}>🗑 Vaciar BOM</button>
              )}
            </>
          )}
          {modeloId && (etapas.length > 0 || bom.length > 0) && (
            <span style={{ marginLeft: 'auto', color: C.textMuted, fontSize: '0.85rem' }}>
              Precio de venta: <strong style={{ color: C.gold }}>{fmt(costo.precio_venta)}</strong>
            </span>
          )}
        </div>

        {importMsg && <div style={{ ...S.alertSuccess, marginBottom: '16px' }}>{importMsg}</div>}

        {/* Parámetros de costeo (edita solo dueño/superadmin) */}
        {modeloId && (
          <div style={{ ...S.cardSm, display: 'flex', gap: '18px', alignItems: 'flex-end', flexWrap: 'wrap', marginBottom: '20px' }}>
            <div>
              <label style={{ ...S.label, marginBottom: '4px' }}>Valor hora (ARS)</label>
              <input type="number" min="0" step="100" value={config.valor_hora ?? 0} disabled={!canEditConfig}
                onChange={e => setCfgLocal({ valor_hora: e.target.value })}
                onBlur={() => canEditConfig && persistConfig(config)}
                style={{ ...S.input, width: '120px', opacity: canEditConfig ? 1 : 0.6 }} onFocus={inputFocus} />
            </div>
            <div>
              <label style={{ ...S.label, marginBottom: '4px' }}>Indirectos (%)</label>
              <input type="number" min="0" step="1" value={Math.round((config.pct_indirectos ?? 0) * 1000) / 10} disabled={!canEditConfig}
                onChange={e => setCfgLocal({ pct_indirectos: (Number(e.target.value) || 0) / 100 })}
                onBlur={() => canEditConfig && persistConfig(config)}
                style={{ ...S.input, width: '90px', opacity: canEditConfig ? 1 : 0.6 }} onFocus={inputFocus} />
            </div>
            <div>
              <label style={{ ...S.label, marginBottom: '4px' }}>Margen (%)</label>
              <input type="number" min="0" step="1" value={Math.round((config.pct_margen ?? 0) * 1000) / 10} disabled={!canEditConfig}
                onChange={e => setCfgLocal({ pct_margen: (Number(e.target.value) || 0) / 100 })}
                onBlur={() => canEditConfig && persistConfig(config)}
                style={{ ...S.input, width: '90px', opacity: canEditConfig ? 1 : 0.6 }} onFocus={inputFocus} />
            </div>
            <div>
              <label style={{ ...S.label, marginBottom: '4px' }}>Costo/m² ref. (ARS)</label>
              <input type="number" min="0" step="1000" value={config.costo_m2_ref ?? 0} disabled={!canEditConfig}
                onChange={e => setCfgLocal({ costo_m2_ref: e.target.value })}
                onBlur={() => canEditConfig && persistConfig(config)}
                style={{ ...S.input, width: '130px', opacity: canEditConfig ? 1 : 0.6 }} onFocus={inputFocus} />
            </div>
            {!canEditConfig && <span style={{ color: C.textMuted, fontSize: '0.74rem', alignSelf: 'center' }}>Solo dueño/admin edita estos parámetros</span>}
          </div>
        )}

        {!modeloId && (
          <div style={{ textAlign: 'center', padding: '64px', color: C.textMuted }}>
            <div style={{ fontSize: '3rem', marginBottom: '12px' }}>📋</div>
            <p>Seleccioná un modelo para ver o editar su lista de materiales</p>
          </div>
        )}

        {modeloId && loading && (
          <div style={{ textAlign: 'center', padding: '48px', color: C.textMuted }}>Cargando...</div>
        )}

        {modeloId && !loading && (
          <>
            {/* Agregar etapa */}
            {canWrite && (
              <div style={{ display: 'flex', gap: '10px', marginBottom: '24px', alignItems: 'center' }}>
                <input
                  value={nuevaEtapa}
                  onChange={e => setNuevaEtapa(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && agregarEtapa()}
                  placeholder="Nueva etapa de producción (ej: Estructura)..."
                  style={{ ...S.input, maxWidth: '360px' }}
                  onFocus={inputFocus} onBlur={inputBlur}
                />
                <button onClick={agregarEtapa} style={S.btnGold}>+ Etapa</button>
              </div>
            )}

            {/* Etapas con sus partes */}
            {[...[...etapas].sort((a, b) => a.orden - b.orden), { id: null, nombre: 'Sin etapa asignada', color: '#94a3b8' }].map((etapa, etapaIdx, arr) => {
              const items = etapa.id ? bomPorEtapa(etapa.id) : bomSinEtapa;
              if (!etapa.id && items.length === 0) return null;
              const etapasReales = arr.filter(e => e.id);
              const posicion = etapa.id ? etapasReales.findIndex(e => e.id === etapa.id) : -1;
              return (
                <div key={etapa.id || 'none'} style={{ ...S.card, padding: 0, marginBottom: '16px', overflow: 'hidden' }}>
                  {/* Header etapa */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: `${etapa.color}18`, borderBottom: `1px solid ${etapa.color}30`, borderLeft: `4px solid ${etapa.color}` }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      {etapa.id && (
                        <span style={{ background: `${etapa.color}30`, color: etapa.color, fontWeight: 700, fontSize: '0.75rem', width: '22px', height: '22px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          {posicion + 1}
                        </span>
                      )}
                      <span style={{ color: etapa.color, fontWeight: 700, fontSize: '0.9rem' }}>{etapa.nombre}</span>
                    </div>
                    <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                      <span style={{ color: C.textMuted, fontSize: '0.75rem' }}>{items.length} parte{items.length !== 1 ? 's' : ''}</span>
                      {canWrite && etapa.id && (
                        <>
                          <button onClick={() => moverEtapa(etapa.id, 'up')} disabled={posicion === 0}
                            style={{ background: 'rgba(255,255,255,0.06)', border: 'none', borderRadius: '4px', padding: '2px 7px', color: posicion === 0 ? C.textMuted : C.textSub, cursor: posicion === 0 ? 'default' : 'pointer', fontSize: '0.8rem', opacity: posicion === 0 ? 0.3 : 1 }}>
                            ↑
                          </button>
                          <button onClick={() => moverEtapa(etapa.id, 'down')} disabled={posicion === etapasReales.length - 1}
                            style={{ background: 'rgba(255,255,255,0.06)', border: 'none', borderRadius: '4px', padding: '2px 7px', color: posicion === etapasReales.length - 1 ? C.textMuted : C.textSub, cursor: posicion === etapasReales.length - 1 ? 'default' : 'pointer', fontSize: '0.8rem', opacity: posicion === etapasReales.length - 1 ? 0.3 : 1 }}>
                            ↓
                          </button>
                          <button onClick={() => eliminarEtapa(etapa.id)}
                            style={{ background: 'rgba(239,68,68,0.1)', border: 'none', borderRadius: '4px', padding: '2px 8px', color: '#ef4444', cursor: 'pointer', fontSize: '0.75rem' }}>
                            Eliminar
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Banda de costeo de la etapa */}
                  <div style={{ display: 'flex', gap: '14px', alignItems: 'center', flexWrap: 'wrap', padding: '8px 16px', borderBottom: `1px solid ${C.border}`, background: 'rgba(255,255,255,0.02)' }}>
                    {etapa.id ? (
                      <>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', color: C.textMuted, fontSize: '0.78rem' }}>
                          Estado:
                          {canWrite ? (
                            <select value={etapa.estado || 'detallado'}
                              onChange={e => { const v = e.target.value; setEtapaLocal(etapa.id, { estado: v }); persistEtapa(etapa.id, { estado: v }); }}
                              style={{ ...S.select, padding: '4px 8px', fontSize: '0.78rem' }}>
                              <option value="detallado">Detallado</option>
                              <option value="estimado">Estimado</option>
                            </select>
                          ) : <strong style={{ color: C.textSub }}>{etapa.estado || 'detallado'}</strong>}
                        </label>

                        {(etapa.estado || 'detallado') === 'detallado' ? (
                          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', color: C.textMuted, fontSize: '0.78rem' }}>
                            Horas MO:
                            {canWrite ? (
                              <input type="number" min="0" step="0.5" value={etapa.horas_estimadas ?? 0}
                                onChange={e => setEtapaLocal(etapa.id, { horas_estimadas: e.target.value })}
                                onBlur={e => persistEtapa(etapa.id, { horas_estimadas: Number(e.target.value) || 0 })}
                                style={{ ...S.input, width: '70px', padding: '4px 8px', fontSize: '0.78rem' }} onFocus={inputFocus} />
                            ) : <strong style={{ color: C.textSub }}>{etapa.horas_estimadas ?? 0} h</strong>}
                          </label>
                        ) : (
                          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', color: C.textMuted, fontSize: '0.78rem' }}>
                            Monto estimado:
                            {canWrite ? (
                              <>
                                <input type="number" min="0" step="1000" value={etapa.monto_estimado ?? 0}
                                  onChange={e => setEtapaLocal(etapa.id, { monto_estimado: e.target.value })}
                                  onBlur={e => persistEtapa(etapa.id, { monto_estimado: Number(e.target.value) || 0 })}
                                  style={{ ...S.input, width: '120px', padding: '4px 8px', fontSize: '0.78rem' }} onFocus={inputFocus} />
                                <button type="button"
                                  onClick={() => { const v = Math.round((modeloSel?.superficie || 0) * (Number(config.costo_m2_ref) || 0)); setEtapaLocal(etapa.id, { monto_estimado: v }); persistEtapa(etapa.id, { monto_estimado: v }); }}
                                  style={{ ...S.btnGhost, padding: '4px 10px', fontSize: '0.72rem' }}>Sugerir</button>
                              </>
                            ) : <strong style={{ color: C.textSub }}>{fmt(etapa.monto_estimado)}</strong>}
                          </label>
                        )}
                      </>
                    ) : (
                      <span style={{ color: C.textMuted, fontSize: '0.78rem' }}>Partes sin etapa (cuentan como materiales)</span>
                    )}

                    <span style={{ marginLeft: 'auto', color: C.textSub, fontSize: '0.8rem' }}>
                      Subtotal: <strong style={{ color: C.gold }}>{fmt(etapa.id ? subtotalEtapa(etapa.id) : subtotalEtapa('__sin_etapa__'))}</strong>
                    </span>
                  </div>

                  {/* Partes de la etapa */}
                  <div style={{ overflowX: 'auto' }}>
                  {items.map((item, i) => (
                    <div key={item.id} style={{ display: 'grid', gridTemplateColumns: '90px 1fr 80px 80px 80px', gap: '0', padding: '10px 16px', borderBottom: `1px solid ${C.border}`, alignItems: 'center', background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)', minWidth: '420px' }}>
                      <div style={{ color: C.gold, fontFamily: 'monospace', fontSize: '0.78rem' }}>{item.partes?.codigo}</div>
                      <div style={{ color: C.text, fontSize: '0.88rem' }}>
                        {item.partes?.nombre}
                        {item.partes?.familias && <span style={{ background: `${item.partes.familias.color}22`, color: item.partes.familias.color, fontSize: '0.68rem', fontWeight: 700, padding: '1px 6px', borderRadius: '10px', marginLeft: '6px', verticalAlign: 'middle' }}>{item.partes.familias.nombre}</span>}
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <input type="number" min="0.01" step="0.01" value={item.cantidad_necesaria}
                          onChange={e => setCantidadLocal(item.id, e.target.value)}
                          onBlur={e => actualizarCantidad(item.id, e.target.value)}
                          style={{ ...S.input, width: '60px', padding: '4px 8px', textAlign: 'center', fontSize: '0.85rem' }}
                          onFocus={inputFocus}
                        />
                      </div>
                      <div style={{ color: C.textMuted, fontSize: '0.8rem', textAlign: 'center' }}>{item.partes?.unidad}</div>
                      <div style={{ textAlign: 'right' }}>
                        {canWrite && (
                          <button onClick={() => eliminarDeBOM(item.id)}
                            style={{ background: 'rgba(239,68,68,0.1)', border: 'none', borderRadius: '6px', padding: '4px 8px', color: '#ef4444', cursor: 'pointer', fontSize: '0.75rem' }}>
                            ×
                          </button>
                        )}
                      </div>
                    </div>
                  ))}

                  </div>{/* fin overflowX */}

                  {/* Agregar parte a esta etapa */}
                  {canWrite && etapa.id && (
                    addingParte === etapa.id ? (
                      <div style={{ padding: '10px 16px', borderTop: `1px solid ${C.border}` }}>
                        <input
                          autoFocus
                          value={parteSearch}
                          onChange={e => setParteSearch(e.target.value)}
                          placeholder="Buscar parte por código o nombre..."
                          style={{ ...S.input, marginBottom: '8px' }}
                          onFocus={inputFocus} onBlur={inputBlur}
                        />
                        <div style={{ maxHeight: '160px', overflowY: 'auto' }}>
                          {partesFiltradas.slice(0, 20).map(p => (
                            <button key={p.id}
                              onMouseDown={e => e.preventDefault()}
                              onClick={() => agregarParte(p, etapa.id)}
                              disabled={addingLoading}
                              style={{ display: 'flex', width: '100%', padding: '6px 10px', background: 'transparent', border: 'none', borderBottom: `1px solid ${C.border}`, color: C.textSub, cursor: addingLoading ? 'wait' : 'pointer', textAlign: 'left', fontSize: '0.85rem', gap: '8px', opacity: addingLoading ? 0.6 : 1, alignItems: 'center' }}
                              onMouseEnter={e => { if (!addingLoading) e.currentTarget.style.background = C.goldDim; }}
                              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                            >
                              <span style={{ color: C.gold, fontFamily: 'monospace', fontSize: '0.78rem', minWidth: '80px' }}>{p.codigo}</span>
                              <span style={{ flex: 1 }}>{p.nombre}</span>
                              {p.familias && <span style={{ background: `${p.familias.color}22`, color: p.familias.color, fontSize: '0.68rem', fontWeight: 700, padding: '1px 7px', borderRadius: '10px', flexShrink: 0 }}>{p.familias.nombre}</span>}
                            </button>
                          ))}
                          {partesFiltradas.length === 0 && <div style={{ color: C.textMuted, fontSize: '0.85rem', padding: '8px' }}>Sin resultados</div>}
                        </div>
                        <button onClick={() => { setAddingParte(null); setParteSearch(''); }} style={{ ...S.btnGhost, marginTop: '8px', fontSize: '0.8rem', padding: '6px 12px' }}>Cancelar</button>
                      </div>
                    ) : (
                      <button onClick={() => setAddingParte(etapa.id)}
                        style={{ display: 'block', width: '100%', padding: '8px', background: 'transparent', border: 'none', borderTop: `1px dashed ${C.border}`, color: C.textMuted, cursor: 'pointer', fontSize: '0.82rem', transition: 'all 0.15s' }}
                        onMouseEnter={e => { e.currentTarget.style.background = C.goldDim; e.currentTarget.style.color = C.gold; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = C.textMuted; }}
                      >
                        + Agregar parte a esta etapa
                      </button>
                    )
                  )}
                </div>
              );
            })}

            {etapas.length === 0 && bom.length === 0 && (
              <div style={{ textAlign: 'center', padding: '48px', color: C.textMuted }}>
                <p>Creá etapas de producción y luego agregá partes a cada una</p>
              </div>
            )}

            {/* Resumen de costo — recalcula en vivo */}
            {(etapas.length > 0 || bom.length > 0) && (
              <div style={{ ...S.card, marginTop: '16px', border: `1px solid ${C.goldBorder}`, background: '#1a2035' }}>
                <h2 style={{ ...S.h2, marginBottom: '14px' }}>💰 Resumen de costo{modeloSel ? ` — ${modeloSel.nombre}` : ''}</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0 18px' }}>
                  <ResumenRow label="Materiales" value={fmt(costo.materiales)} />
                  <ResumenRow label="Mano de obra" value={fmt(costo.mano_obra)} />
                  <ResumenRow label="Estimado (etapas)" value={fmt(costo.estimado)} />
                  <ResumenRow label="Subtotal directo" value={fmt(costo.subtotal_directo)} strong />
                  <ResumenRow label={`Indirectos (${Math.round((config.pct_indirectos || 0) * 100)}%)`} value={fmt(costo.indirectos)} />
                  <ResumenRow label={`Margen (${Math.round((config.pct_margen || 0) * 100)}%)`} value={fmt(costo.margen)} />
                  <ResumenRow label="Costo / m²" value={modeloSel?.superficie ? fmt(costo.costo_m2) : '—'} />
                </div>
                <div style={{ marginTop: '14px', paddingTop: '14px', borderTop: `1px solid ${C.goldBorder}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                  <span style={{ color: C.textSub, fontSize: '0.95rem', fontWeight: 600 }}>Precio de venta</span>
                  <span style={{ color: C.gold, fontSize: '1.5rem', fontWeight: 800 }}>{fmt(costo.precio_venta)}</span>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </AppLayout>
  );
}
