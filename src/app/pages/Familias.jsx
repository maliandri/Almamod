import { useState, useEffect, useRef } from 'react';
import * as XLSX from 'xlsx';
import { useAuth } from '../hooks/useAuth';
import { api } from '../lib/api';
import AppLayout from '../components/AppLayout';
import { C, S, inputFocus, inputBlur } from '../styles';

const COLORES = ['#d4a574','#667eea','#10b981','#f59e0b','#ef4444','#8b5cf6','#06b6d4','#f97316','#ec4899','#84cc16'];

function SubAdd({ onAdd }) {
  const [v, setV] = useState('');
  const add = () => { if (!v.trim()) return; onAdd(v.trim()); setV(''); };
  return (
    <input value={v} onChange={e => setV(e.target.value)} onKeyDown={e => e.key === 'Enter' && add()}
      placeholder="+ subfamilia (Enter)"
      style={{ ...S.input, padding: '2px 8px', fontSize: '0.72rem', width: '150px' }}
      onFocus={inputFocus} onBlur={inputBlur} />
  );
}

function FamiliaRow({ familia, subfamilias = [], onUpdate, onDelete, onAddSub, onDeleteSub, canWrite }) {
  const [editando, setEditando] = useState(false);
  const [form, setForm] = useState({ nombre: familia.nombre, color: familia.color });
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!form.nombre.trim()) return;
    setLoading(true);
    try {
      await onUpdate({ id: familia.id, ...form });
      setEditando(false);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setForm({ nombre: familia.nombre, color: familia.color });
    setEditando(false);
  };

  if (editando) {
    return (
      <div style={{ ...S.card, padding: '14px 16px', marginBottom: '8px' }}>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          <input
            value={form.nombre}
            onChange={e => setForm(p => ({ ...p, nombre: e.target.value }))}
            onKeyDown={e => { if (e.key === 'Enter') handleSave(); if (e.key === 'Escape') handleCancel(); }}
            style={{ ...S.input, maxWidth: '260px' }}
            onFocus={inputFocus} onBlur={inputBlur}
            autoFocus
          />
          <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
            {COLORES.map(c => (
              <button key={c} onClick={() => setForm(p => ({ ...p, color: c }))}
                style={{ width: '22px', height: '22px', borderRadius: '50%', background: c, border: form.color === c ? `2px solid white` : '2px solid transparent', cursor: 'pointer', outline: 'none' }} />
            ))}
          </div>
          <button onClick={handleSave} disabled={loading} style={{ ...S.btnGold, padding: '6px 14px', fontSize: '0.82rem' }}>
            {loading ? '...' : 'Guardar'}
          </button>
          <button onClick={handleCancel} style={{ ...S.btnGhost, padding: '6px 14px', fontSize: '0.82rem' }}>Cancelar</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ borderBottom: `1px solid ${C.border}` }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 16px', background: 'transparent' }}>
        <span style={{ width: '14px', height: '14px', borderRadius: '50%', background: familia.color, flexShrink: 0 }} />
        <span style={{ flex: 1, color: C.text, fontSize: '0.9rem', fontWeight: 500 }}>{familia.nombre}</span>
        <span style={{ background: `${familia.color}20`, color: familia.color, fontSize: '0.7rem', fontWeight: 700, padding: '2px 8px', borderRadius: '10px' }}>
          {familia.nombre}
        </span>
        <button onClick={() => setEditando(true)}
          style={{ background: C.goldDim, border: 'none', borderRadius: '6px', padding: '4px 10px', color: C.gold, cursor: 'pointer', fontSize: '0.78rem' }}>
          ✏️ Editar
        </button>
        {onDelete && (
          <button onClick={() => onDelete(familia.id)}
            style={{ background: C.redDim, border: 'none', borderRadius: '6px', padding: '4px 10px', color: C.red, cursor: 'pointer', fontSize: '0.78rem' }}>
            Eliminar
          </button>
        )}
      </div>

      {/* Subfamilias */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', padding: '0 16px 10px 42px' }}>
        <span style={{ color: C.textMuted, fontSize: '0.7rem', letterSpacing: '0.04em' }}>SUBFAMILIAS:</span>
        {subfamilias.map(s => (
          <span key={s.id} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: `${familia.color}15`, color: C.textSub, fontSize: '0.72rem', padding: '2px 4px 2px 9px', borderRadius: '10px', border: `1px solid ${familia.color}30` }}>
            {s.nombre}
            {canWrite && onDeleteSub && (
              <button onClick={() => onDeleteSub(s.id)} title="Eliminar subfamilia"
                style={{ background: 'none', border: 'none', color: C.red, cursor: 'pointer', fontSize: '0.85rem', lineHeight: 1, padding: '0 3px' }}>×</button>
            )}
          </span>
        ))}
        {subfamilias.length === 0 && <span style={{ color: C.textMuted, fontSize: '0.72rem', fontStyle: 'italic' }}>sin subfamilias</span>}
        {canWrite && onAddSub && <SubAdd onAdd={(nombre) => onAddSub(familia.id, nombre)} />}
      </div>
    </div>
  );
}

export default function Familias() {
  const { token, user } = useAuth();
  const [familias, setFamilias] = useState([]);
  const [subfamilias, setSubfamilias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [nuevaNombre, setNuevaNombre] = useState('');
  const [nuevoColor, setNuevoColor] = useState(COLORES[0]);
  const [saving, setSaving] = useState(false);
  const [importando, setImportando] = useState(false);
  const [msg, setMsg] = useState('');
  const fileRef = useRef();

  const canWrite = ['superadmin', 'dueno', 'deposito'].includes(user?.rol);

  const cargar = () => {
    setLoading(true);
    Promise.all([api.familias.list(token), api.subfamilias.list(token)])
      .then(([f, s]) => { setFamilias(f.familias || []); setSubfamilias(s.subfamilias || []); })
      .finally(() => setLoading(false));
  };

  const handleAddSub = async (familia_id, nombre) => {
    try {
      await api.subfamilias.create(token, { familia_id, nombre });
      cargar();
    } catch (e) { setMsg(`Error: ${e.message}`); }
  };

  const handleDeleteSub = async (id) => {
    await api.subfamilias.delete(token, id);
    cargar();
  };

  useEffect(() => { cargar(); }, [token]);

  const handleCreate = async () => {
    if (!nuevaNombre.trim()) return;
    setSaving(true);
    try {
      await api.familias.create(token, { nombre: nuevaNombre.trim(), color: nuevoColor });
      setNuevaNombre('');
      setNuevoColor(COLORES[0]);
      setMsg('✓ Familia creada');
      cargar();
      setTimeout(() => setMsg(''), 2500);
    } catch (e) {
      setMsg(`Error: ${e.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async (data) => {
    await api.familias.update(token, data);
    cargar();
  };

  const handleExcel = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImportando(true); setMsg('');
    try {
      const buf = await file.arrayBuffer();
      const wb  = XLSX.read(buf);
      const ws  = wb.Sheets[wb.SheetNames[0]];
      // Leer como arrays crudos — independiente del nombre de columna
      const raw = XLSX.utils.sheet_to_json(ws, { header: 1 });
      const filas = raw.filter(r => Array.isArray(r) && String(r[0] || '').trim());
      // Saltar primera fila si es encabezado (contiene "nombre", "familia", "name"...)
      const palabrasHeader = ['nombre', 'familia', 'name', 'family', 'color'];
      const inicio = filas.length > 0 && palabrasHeader.some(w => String(filas[0][0] || '').toLowerCase().includes(w)) ? 1 : 0;
      let ok = 0;
      for (let i = inicio; i < filas.length; i++) {
        const nombre = String(filas[i][0] || '').trim();
        if (!nombre) continue;
        const colorCelda = String(filas[i][1] || '').trim();
        const colorFinal = /^#[0-9a-fA-F]{6}$/.test(colorCelda) ? colorCelda : COLORES[ok % COLORES.length];
        await api.familias.create(token, { nombre, color: colorFinal }).catch(() => null);
        ok++;
      }
      setMsg(ok > 0 ? `✓ ${ok} familia${ok !== 1 ? 's' : ''} importada${ok !== 1 ? 's' : ''}` : '⚠️ No se encontraron familias en el archivo');
      cargar();
      setTimeout(() => setMsg(''), 3000);
    } catch (err) {
      setMsg(`Error: ${err.message}`);
    } finally {
      setImportando(false);
      e.target.value = '';
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar esta familia? Las partes asociadas quedarán sin familia.')) return;
    await api.familias.delete(token, id);
    cargar();
  };

  return (
    <AppLayout>
      <div style={{ padding: '28px 32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px', flexWrap: 'wrap', gap: '10px' }}>
          <h1 style={{ ...S.h1, margin: 0 }}>🏷️ Familias de Componentes</h1>
          {canWrite && (
            <>
              <input ref={fileRef} type="file" accept=".xlsx,.xls,.csv" onChange={handleExcel} style={{ display: 'none' }} />
              <button onClick={() => fileRef.current?.click()} disabled={importando} style={{ ...S.btnGhost, fontSize: '0.85rem' }}>
                {importando ? 'Importando...' : '📊 Importar Excel'}
              </button>
            </>
          )}
        </div>
        <p style={{ color: C.textMuted, fontSize: '0.88rem', marginBottom: '24px' }}>
          Agrupá los componentes por tipo para identificarlos más fácilmente en el catálogo y el BOM.
          {canWrite && <span> El Excel debe tener columna <code style={{ background: 'rgba(255,255,255,0.08)', padding: '1px 5px', borderRadius: '4px' }}>nombre</code> y opcionalmente <code style={{ background: 'rgba(255,255,255,0.08)', padding: '1px 5px', borderRadius: '4px' }}>color</code>.</span>}
        </p>

        {canWrite && (
          <div style={{ ...S.card, marginBottom: '24px' }}>
            <h2 style={{ ...S.h2, marginBottom: '14px' }}>Nueva familia</h2>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
              <input
                value={nuevaNombre}
                onChange={e => setNuevaNombre(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleCreate()}
                placeholder="Nombre (ej: Paneles, Tornillería, Tirantes...)"
                style={{ ...S.input, maxWidth: '320px' }}
                onFocus={inputFocus} onBlur={inputBlur}
              />
              <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
                {COLORES.map(c => (
                  <button key={c} onClick={() => setNuevoColor(c)}
                    style={{ width: '24px', height: '24px', borderRadius: '50%', background: c, border: nuevoColor === c ? '2px solid white' : '2px solid transparent', cursor: 'pointer', outline: 'none', transition: 'transform 0.1s', transform: nuevoColor === c ? 'scale(1.25)' : 'scale(1)' }} />
                ))}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ background: `${nuevoColor}20`, color: nuevoColor, fontSize: '0.78rem', fontWeight: 700, padding: '3px 10px', borderRadius: '10px' }}>
                  {nuevaNombre || 'Vista previa'}
                </span>
                <button onClick={handleCreate} disabled={saving || !nuevaNombre.trim()} style={{ ...S.btnGold, opacity: (saving || !nuevaNombre.trim()) ? 0.5 : 1 }}>
                  {saving ? 'Creando...' : '+ Crear'}
                </button>
              </div>
            </div>
            {msg && <div style={{ ...S.alertSuccess, marginTop: '12px' }}>{msg}</div>}
          </div>
        )}

        <div style={{ ...S.card, padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '12px 16px', background: 'rgba(212,165,116,0.06)', borderBottom: `1px solid ${C.border}` }}>
            <span style={{ color: C.textMuted, fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.05em' }}>
              {familias.length} FAMILIA{familias.length !== 1 ? 'S' : ''}
            </span>
          </div>
          {loading ? (
            <div style={{ padding: '40px', textAlign: 'center', color: C.textMuted }}>Cargando...</div>
          ) : familias.length === 0 ? (
            <div style={{ padding: '48px', textAlign: 'center', color: C.textMuted }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>🏷️</div>
              <p>No hay familias creadas todavía</p>
            </div>
          ) : familias.map(f => (
            <FamiliaRow key={f.id} familia={f}
              subfamilias={subfamilias.filter(s => String(s.familia_id) === String(f.id))}
              onUpdate={handleUpdate}
              onDelete={canWrite ? handleDelete : undefined}
              onAddSub={handleAddSub}
              onDeleteSub={handleDeleteSub}
              canWrite={canWrite} />
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
