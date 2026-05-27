import { useState, useEffect, useRef } from 'react';
import * as XLSX from 'xlsx';
import { useAuth } from '../hooks/useAuth';
import { api } from '../lib/api';
import AppLayout from '../components/AppLayout';
import { C, S, inputFocus, inputBlur } from '../styles';

const COLORES = ['#d4a574','#667eea','#10b981','#f59e0b','#ef4444','#8b5cf6','#06b6d4','#f97316','#ec4899','#84cc16'];

function FamiliaRow({ familia, onUpdate, onDelete }) {
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
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 16px', borderBottom: `1px solid ${C.border}`, background: 'transparent' }}>
      <span style={{ width: '14px', height: '14px', borderRadius: '50%', background: familia.color, flexShrink: 0 }} />
      <span style={{ flex: 1, color: C.text, fontSize: '0.9rem', fontWeight: 500 }}>{familia.nombre}</span>
      <span style={{ background: `${familia.color}20`, color: familia.color, fontSize: '0.7rem', fontWeight: 700, padding: '2px 8px', borderRadius: '10px' }}>
        {familia.nombre}
      </span>
      <button onClick={() => setEditando(true)}
        style={{ background: C.goldDim, border: 'none', borderRadius: '6px', padding: '4px 10px', color: C.gold, cursor: 'pointer', fontSize: '0.78rem' }}>
        ✏️ Editar
      </button>
      <button onClick={() => onDelete(familia.id)}
        style={{ background: C.redDim, border: 'none', borderRadius: '6px', padding: '4px 10px', color: C.red, cursor: 'pointer', fontSize: '0.78rem' }}>
        Eliminar
      </button>
    </div>
  );
}

export default function Familias() {
  const { token, user } = useAuth();
  const [familias, setFamilias] = useState([]);
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
    api.familias.list(token).then(d => setFamilias(d.familias || [])).finally(() => setLoading(false));
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
      const rows = XLSX.utils.sheet_to_json(ws);
      let ok = 0;
      for (const row of rows) {
        const nombre = String(row.nombre || row.Nombre || row.NOMBRE || '').trim();
        if (!nombre) continue;
        const color = String(row.color || row.Color || '').trim();
        const colorFinal = COLORES.includes(color) ? color : COLORES[ok % COLORES.length];
        await api.familias.create(token, { nombre, color: colorFinal }).catch(() => null);
        ok++;
      }
      setMsg(`✓ ${ok} familia${ok !== 1 ? 's' : ''} importada${ok !== 1 ? 's' : ''}`);
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
            <FamiliaRow key={f.id} familia={f} onUpdate={handleUpdate} onDelete={canWrite ? handleDelete : undefined} />
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
