import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../hooks/useAuth';
import AppLayout from '../components/AppLayout';
import { C, S, inputFocus, inputBlur } from '../styles';

const BACKEND = '/.netlify/functions';
const CL      = 'https://res.cloudinary.com/dlshym1te';
const PRESET  = 'almamod_cms';
const CLOUD   = 'dlshym1te';

const SLIDE_EMPTY = { titulo:'', pretitulo:'', subtitulo:'', align:'center', badge:'', imagen_public_id:'', video_public_id:'', media_type:'image', orden:99 };

const SECCIONES = [
  { id:'home_about',    label:'Sección "Sobre nosotros"', icon:'🏠', campos:['badge','titulo','descripcion','imagen_url'], cta:true },
  { id:'home_ventajas', label:'Sección "Ventajas"',       icon:'⚡', campos:['badge','titulo'] },
  { id:'home_modulos',  label:'Sección "Módulos"',         icon:'🏗️', campos:['badge','titulo'] },
  { id:'home_usos',     label:'Sección "¿Para quién?"',   icon:'👥', campos:['badge','titulo'] },
  { id:'home_showroom', label:'Sección "Showroom"',        icon:'📍', campos:['badge','titulo','descripcion','imagen_url'], cta:true },
  { id:'home_cta',      label:'Sección CTA final',         icon:'📣', campos:['titulo','subtitulo'] },
];

function thumbUrl(pid) {
  if (!pid) return null;
  if (pid.startsWith('http')) {
    const m = pid.match(/\/upload\/(?:v\d+\/)?(.+?)(?:\?.*)?$/);
    return m ? `${CL}/image/upload/w_200,h_120,c_fill,q_60,f_auto/${m[1]}` : pid;
  }
  return `${CL}/image/upload/w_200,h_120,c_fill,q_60,f_auto/${pid}`;
}

async function uploadToCloud(file, folder) {
  const isVideo = file.type.startsWith('video/');
  const fd = new FormData();
  fd.append('file', file);
  fd.append('upload_preset', PRESET);
  fd.append('folder', folder);
  const res  = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD}/${isVideo?'video':'image'}/upload`, { method:'POST', body:fd });
  const data = await res.json();
  if (data.error) throw new Error(data.error.message);
  return data.secure_url;
}

// ── Uploader de imagen/video ──────────────────────────────────────────────
function MediaUploader({ url, onUploaded, folder, label }) {
  const ref = useRef();
  const [uploading, setUploading] = useState(false);

  const handle = async e => {
    const f = e.target.files?.[0]; if (!f) return;
    setUploading(true);
    try { const u = await uploadToCloud(f, folder); onUploaded(u); }
    catch(err) { alert(err.message); }
    finally { setUploading(false); e.target.value=''; }
  };

  return (
    <div style={{ marginBottom:'16px' }}>
      {label && <label style={S.label}>{label}</label>}
      <div style={{ display:'flex', gap:'10px', alignItems:'flex-start' }}>
        <div onClick={() => !uploading && ref.current?.click()}
          style={{ width:'130px', height:'78px', borderRadius:'8px', overflow:'hidden', border:`2px dashed ${C.goldBorder}`, background:'rgba(255,255,255,0.04)', cursor:uploading?'wait':'pointer', flexShrink:0, position:'relative', display:'flex', alignItems:'center', justifyContent:'center' }}>
          {url && <img src={thumbUrl(url)} alt="" style={{ width:'100%', height:'100%', objectFit:'cover', position:'absolute', inset:0 }} />}
          <div style={{ position:'absolute', inset:0, background:url?'rgba(0,0,0,0.45)':'transparent', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:'3px' }}>
            <span style={{ fontSize:'1.3rem' }}>{uploading?'⏳':url?'✏️':'+'}</span>
            <span style={{ color:'#fff', fontSize:'0.62rem', fontWeight:600 }}>{uploading?'Subiendo...':url?'Cambiar':'Subir imagen'}</span>
          </div>
        </div>
        {url && <p style={{ color:C.textMuted, fontSize:'0.7rem', wordBreak:'break-all', alignSelf:'center', flex:1 }}>{url.split('/').pop()}</p>}
        <input ref={ref} type="file" accept="image/*,video/*" style={{ display:'none' }} onChange={handle} />
      </div>
    </div>
  );
}

// ── Editor de sección ─────────────────────────────────────────────────────
function SeccionEditor({ def, data, token, onSaved }) {
  const [form, setForm]     = useState(data || {});
  const [saving, setSaving] = useState(false);
  const [ok, setOk]         = useState(false);

  useEffect(() => { setForm(data || {}); }, [data]);

  const guardar = async () => {
    setSaving(true);
    try {
      const res = await fetch(`${BACKEND}/site-content`, {
        method:'POST',
        headers:{ Authorization:`Bearer ${token}`, 'Content-Type':'application/json' },
        body: JSON.stringify({ seccion: def.id, ...form }),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      setOk(true); setTimeout(()=>setOk(false), 2500);
      onSaved();
    } catch(e) { alert(e.message); }
    finally { setSaving(false); }
  };

  return (
    <div style={{ ...S.card, marginBottom:'12px' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'16px' }}>
        <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
          <span style={{ fontSize:'1.2rem' }}>{def.icon}</span>
          <span style={{ color:C.text, fontWeight:700, fontSize:'0.9rem' }}>{def.label}</span>
        </div>
        <button onClick={guardar} disabled={saving}
          style={{ ...S.btnGold, padding:'6px 18px', background: ok ? 'rgba(16,185,129,0.15)' : undefined, color: ok ? '#10b981' : undefined, border: ok ? '1px solid rgba(16,185,129,0.4)' : 'none' }}>
          {ok ? '✓ Guardado' : saving ? 'Guardando...' : 'Guardar'}
        </button>
      </div>

      <div style={{ display:'flex', flexDirection:'column', gap:'12px' }}>
        {def.campos.includes('badge') && (
          <div>
            <label style={S.label}>Etiqueta pequeña (sobre el título)</label>
            <input value={form.badge||''} onChange={e=>setForm(p=>({...p,badge:e.target.value}))} placeholder="Ej: Nuestra tecnología" style={S.input} onFocus={inputFocus} onBlur={inputBlur} />
          </div>
        )}
        {def.campos.includes('titulo') && (
          <div>
            <label style={S.label}>Título principal</label>
            <input value={form.titulo||''} onChange={e=>setForm(p=>({...p,titulo:e.target.value}))} placeholder="Título de la sección" style={S.input} onFocus={inputFocus} onBlur={inputBlur} />
          </div>
        )}
        {def.campos.includes('subtitulo') && (
          <div>
            <label style={S.label}>Subtítulo</label>
            <input value={form.subtitulo||''} onChange={e=>setForm(p=>({...p,subtitulo:e.target.value}))} placeholder="Subtítulo" style={S.input} onFocus={inputFocus} onBlur={inputBlur} />
          </div>
        )}
        {def.campos.includes('descripcion') && (
          <div>
            <label style={S.label}>Descripción / Texto</label>
            <textarea value={form.descripcion||''} onChange={e=>setForm(p=>({...p,descripcion:e.target.value}))} rows={4}
              style={{ ...S.input, resize:'vertical', fontFamily:'inherit', lineHeight:1.6, minHeight:'90px' }}
              onFocus={inputFocus} onBlur={inputBlur} />
          </div>
        )}
        {def.campos.includes('imagen_url') && (
          <MediaUploader
            label="Imagen de la sección"
            url={form.imagen_url}
            folder="almamod/sitio"
            onUploaded={url => setForm(p=>({...p, imagen_url:url}))}
          />
        )}
        {def.cta && (
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px' }}>
            <div>
              <label style={S.label}>Texto del botón CTA</label>
              <input value={form.cta_texto||''} onChange={e=>setForm(p=>({...p,cta_texto:e.target.value}))} placeholder="Ej: Ver módulos" style={S.input} onFocus={inputFocus} onBlur={inputBlur} />
            </div>
            <div>
              <label style={S.label}>URL del botón CTA</label>
              <input value={form.cta_url||''} onChange={e=>setForm(p=>({...p,cta_url:e.target.value}))} placeholder="/tiendaalma" style={S.input} onFocus={inputFocus} onBlur={inputBlur} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Página principal ──────────────────────────────────────────────────────
export default function SitioContenido() {
  const { token } = useAuth();
  const [slides, setSlides]     = useState([]);
  const [sections, setSections] = useState({});
  const [editing, setEditing]   = useState(null);
  const [saving, setSaving]     = useState(false);
  const [slideError, setSlideError] = useState('');
  const [loading, setLoading]   = useState(true);
  const [tab, setTab]           = useState('hero');
  const fileRef = useRef();

  const cargar = useCallback(async () => {
    const [r1, r2] = await Promise.all([
      fetch(`${BACKEND}/site-content`).then(r=>r.json()),
      fetch(`${BACKEND}/site-content?tipo=sections`).then(r=>r.json()),
    ]);
    setSlides(r1.slides || []);
    setSections(r2.sections || {});
    setLoading(false);
  }, []);

  useEffect(() => { cargar(); }, [cargar]);

  const guardarSlide = async () => {
    if (!editing?.titulo) { setSlideError('El título es obligatorio'); return; }
    setSaving(true); setSlideError('');
    try {
      const res = await fetch(`${BACKEND}/site-content`, {
        method: editing.id ? 'PUT' : 'POST',
        headers:{ Authorization:`Bearer ${token}`, 'Content-Type':'application/json' },
        body: JSON.stringify(editing),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error);
      setEditing(null); cargar();
    } catch(err) { setSlideError(err.message); }
    finally { setSaving(false); }
  };

  const patchSlide = async (id, fields) => {
    await fetch(`${BACKEND}/site-content`, { method:'PUT', headers:{ Authorization:`Bearer ${token}`, 'Content-Type':'application/json' }, body:JSON.stringify({ id, ...fields }) });
    cargar();
  };

  const eliminarSlide = async id => {
    if (!confirm('¿Eliminar este slide?')) return;
    await fetch(`${BACKEND}/site-content?id=${id}`, { method:'DELETE', headers:{ Authorization:`Bearer ${token}` } });
    cargar();
  };

  const handleMediaUpload = async e => {
    const f = e.target.files?.[0]; if (!f) return;
    try {
      const url = await uploadToCloud(f, 'almamod/hero');
      const isVideo = f.type.startsWith('video/');
      setEditing(p => ({ ...p, [isVideo?'video_public_id':'imagen_public_id']: url, media_type: isVideo?'video':'image' }));
    } catch(err) { alert(err.message); }
    finally { e.target.value=''; }
  };

  const sorted = [...slides].sort((a,b) => a.orden - b.orden);

  const tabStyle = active => ({
    padding:'10px 18px', background:'none', border:'none',
    borderBottom: active ? `2px solid ${C.gold}` : '2px solid transparent',
    color: active ? C.gold : C.textMuted, fontWeight: active ? 700 : 400,
    fontSize:'0.85rem', cursor:'pointer', marginBottom:'-1px',
  });

  return (
    <AppLayout>
      <div style={{ maxWidth:'900px' }}>
        <h1 style={{ ...S.h1, marginBottom:'4px' }}>Contenido del sitio Next.js</h1>
        <p style={{ color:C.textMuted, fontSize:'0.82rem', marginBottom:'24px' }}>
          Editá los textos, imágenes y videos del sitio web nuevo.
        </p>

        {/* Tabs */}
        <div style={{ display:'flex', gap:'4px', borderBottom:`1px solid ${C.border}`, marginBottom:'24px' }}>
          <button style={tabStyle(tab==='hero')}   onClick={()=>setTab('hero')}>🎠 Carrusel principal</button>
          <button style={tabStyle(tab==='diseno')} onClick={()=>setTab('diseno')}>🎨 Diseño del sitio</button>
        </div>

        {/* ── CARRUSEL ── */}
        {tab === 'hero' && (
          <>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'16px' }}>
              <p style={{ color:C.textMuted, fontSize:'0.82rem' }}>Slides del hero. Subí imagen o video y editá los textos.</p>
              <button onClick={() => setEditing({ ...SLIDE_EMPTY, orden: slides.length + 1 })} style={{ ...S.btnGold }}>
                + Nuevo slide
              </button>
            </div>

            {loading ? <p style={{ color:C.textMuted }}>Cargando...</p> : (
              <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
                {sorted.map((s, i) => (
                  <div key={s.id} style={{ ...S.card, display:'flex', gap:'14px', alignItems:'center', padding:'14px 16px', opacity:s.activo?1:0.5 }}>
                    <div style={{ width:'80px', height:'52px', borderRadius:'7px', overflow:'hidden', background:'rgba(255,255,255,0.04)', flexShrink:0 }}>
                      {s.media_type==='video' && s.video_public_id
                        ? <video src={`${CL}/video/upload/w_160/${s.video_public_id}`} style={{ width:'100%', height:'100%', objectFit:'cover' }} muted />
                        : s.imagen_public_id
                          ? <img src={thumbUrl(s.imagen_public_id)} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                          : <div style={{ width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center', color:C.textMuted }}>🖼️</div>
                      }
                    </div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ display:'flex', gap:'6px', alignItems:'center', marginBottom:'2px' }}>
                        <span style={{ background:C.goldDim, color:C.gold, fontSize:'0.65rem', fontWeight:700, padding:'1px 6px', borderRadius:'4px' }}>#{s.orden}</span>
                        <span style={{ color:C.text, fontWeight:700 }}>{s.titulo}</span>
                        {s.media_type==='video' && <span style={{ background:'rgba(139,92,246,0.15)', color:'#a78bfa', fontSize:'0.6rem', padding:'1px 6px', borderRadius:'4px' }}>VIDEO</span>}
                      </div>
                      {s.subtitulo && <p style={{ color:C.textMuted, fontSize:'0.72rem', margin:0, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{s.subtitulo}</p>}
                    </div>
                    <div style={{ display:'flex', gap:'5px', flexShrink:0 }}>
                      <button onClick={()=>patchSlide(s.id,{orden:s.orden-1})} disabled={i===0} style={{ ...S.btnGhost, padding:'4px 8px', opacity:i===0?0.3:1 }}>↑</button>
                      <button onClick={()=>patchSlide(s.id,{orden:s.orden+1})} disabled={i===sorted.length-1} style={{ ...S.btnGhost, padding:'4px 8px', opacity:i===sorted.length-1?0.3:1 }}>↓</button>
                      <button onClick={()=>patchSlide(s.id,{activo:!s.activo})}
                        style={{ ...S.btnGhost, padding:'4px 10px', color:s.activo?'#10b981':C.textMuted, fontSize:'0.72rem', fontWeight:600 }}>
                        {s.activo?'● Visible':'○ Oculto'}
                      </button>
                      <button onClick={()=>setEditing({...s})} style={{ ...S.btnGhost, padding:'4px 10px', color:C.gold, fontSize:'0.78rem' }}>Editar</button>
                      <button onClick={()=>eliminarSlide(s.id)} style={{ ...S.btnGhost, padding:'4px 8px', color:'#ef4444' }}>🗑️</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* ── DISEÑO ── */}
        {tab === 'diseno' && (
          <>
            <p style={{ color:C.textMuted, fontSize:'0.82rem', marginBottom:'20px' }}>
              Editá los textos e imágenes de cada sección. Los cambios se ven en el sitio automáticamente.
            </p>
            {loading ? <p style={{ color:C.textMuted }}>Cargando...</p> : (
              SECCIONES.map(def => (
                <SeccionEditor key={def.id} def={def} data={sections[def.id]} token={token} onSaved={cargar} />
              ))
            )}
          </>
        )}
      </div>

      {/* ── Modal slide ── */}
      {editing && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.85)', zIndex:50, display:'flex', alignItems:'flex-start', justifyContent:'center', padding:'20px 16px', overflowY:'auto' }}
          onClick={e => e.target===e.currentTarget && setEditing(null)}>
          <div style={{ ...S.card, background:'#1a2035', width:'100%', maxWidth:'560px', marginTop:'20px' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px' }}>
              <h2 style={{ ...S.h2, margin:0, color:C.gold }}>{editing.id ? 'Editar slide' : 'Nuevo slide'}</h2>
              <button onClick={()=>setEditing(null)} style={{ background:'none', border:'none', color:C.textMuted, fontSize:'1.4rem', cursor:'pointer' }}>×</button>
            </div>

            {/* Media upload */}
            <div style={{ marginBottom:'16px' }}>
              <label style={S.label}>Imagen o video de fondo</label>
              <div style={{ display:'flex', gap:'10px', alignItems:'center' }}>
                <div onClick={()=>fileRef.current?.click()}
                  style={{ width:'140px', height:'84px', borderRadius:'8px', overflow:'hidden', border:`2px dashed ${C.goldBorder}`, background:'rgba(255,255,255,0.04)', cursor:'pointer', flexShrink:0, position:'relative', display:'flex', alignItems:'center', justifyContent:'center' }}>
                  {(editing.imagen_public_id||editing.video_public_id) ? (
                    editing.media_type==='video'
                      ? <video src={`${CL}/video/upload/w_280/${editing.video_public_id}`} style={{ width:'100%', height:'100%', objectFit:'cover' }} muted />
                      : <img src={thumbUrl(editing.imagen_public_id)} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                  ) : null}
                  <div style={{ position:'absolute', inset:0, background:'rgba(0,0,0,0.4)', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:'3px' }}>
                    <span style={{ fontSize:'1.3rem' }}>📁</span>
                    <span style={{ color:'#fff', fontSize:'0.62rem', fontWeight:600 }}>Subir imagen / video</span>
                  </div>
                </div>
                {editing.media_type==='video' && editing.video_public_id && <span style={{ color:'#10b981', fontSize:'0.78rem' }}>🎥 Video cargado</span>}
                {editing.media_type==='image' && editing.imagen_public_id && <span style={{ color:'#10b981', fontSize:'0.78rem' }}>🖼️ Imagen cargada</span>}
              </div>
              <input ref={fileRef} type="file" accept="image/*,video/*" style={{ display:'none' }} onChange={handleMediaUpload} />
            </div>

            <div style={{ display:'flex', flexDirection:'column', gap:'12px' }}>
              <div><label style={S.label}>Pre-título</label>
                <input value={editing.pretitulo||''} onChange={e=>setEditing(p=>({...p,pretitulo:e.target.value}))} style={S.input} onFocus={inputFocus} onBlur={inputBlur} /></div>
              <div><label style={S.label}>Título *</label>
                <input value={editing.titulo||''} onChange={e=>setEditing(p=>({...p,titulo:e.target.value}))} style={S.input} onFocus={inputFocus} onBlur={inputBlur} /></div>
              <div><label style={S.label}>Subtítulo</label>
                <textarea value={editing.subtitulo||''} onChange={e=>setEditing(p=>({...p,subtitulo:e.target.value}))} rows={2} style={{ ...S.input, resize:'vertical', fontFamily:'inherit' }} onFocus={inputFocus} onBlur={inputBlur} /></div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 60px', gap:'10px' }}>
                <div><label style={S.label}>Alineación</label>
                  <select value={editing.align||'center'} onChange={e=>setEditing(p=>({...p,align:e.target.value}))} style={S.select}>
                    <option value="left">Izquierda</option>
                    <option value="center">Centrado</option>
                  </select></div>
                <div><label style={S.label}>Badge</label>
                  <input value={editing.badge||''} onChange={e=>setEditing(p=>({...p,badge:e.target.value}))} style={S.input} onFocus={inputFocus} onBlur={inputBlur} /></div>
                <div><label style={S.label}>Orden</label>
                  <input type="number" value={editing.orden||1} onChange={e=>setEditing(p=>({...p,orden:Number(e.target.value)}))} style={S.input} onFocus={inputFocus} onBlur={inputBlur} /></div>
              </div>
            </div>

            {slideError && <div style={{ ...S.alertError, marginTop:'12px' }}>{slideError}</div>}

            <div style={{ display:'flex', gap:'10px', marginTop:'20px' }}>
              <button onClick={guardarSlide} disabled={saving} style={{ ...S.btnGold, flex:1, opacity:saving?0.6:1 }}>
                {saving ? 'Guardando...' : 'Guardar slide'}
              </button>
              <button onClick={()=>setEditing(null)} style={S.btnGhost}>Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
