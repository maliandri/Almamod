import { useRef } from 'react';
import { C } from '../styles';

const CLOUD = 'dlshym1te';
const thumb = n => `https://res.cloudinary.com/${CLOUD}/image/upload/w_140,h_105,c_fill,q_70,f_auto/${n}`;
const full  = n => `https://res.cloudinary.com/${CLOUD}/image/upload/w_1200,q_82,f_auto/${n}`;

const FOTOS = {
  'MiCasita': [
    'ALMAMOD_MICASITA_PORTADA.webp',
    'ALMAMOD_MICASITA_1.webp',
    'ALMAMOD_MICASITA_PLANIMETRIA.webp',
  ],
  'Alma 18': [
    'ALMAMOD_18_PORTADA.webp',
    'ALMAMOD_18_RENDER_EXTERIOR.webp',
    'ALMAMOD_18_NEGRO.webp',
    'ALMAMOD_18_GRIS_REVEAR.webp',
    'ALMAMOD_18_PLANIMETRÍA.webp',
    'ALMAMOD_18_PLANIMETRÍA_MOD.webp',
  ],
  'Alma 27': [
    'ALMAMOD_27_PORTADA.webp',
    'ALMAMOD_27_1.webp',
    'ALMAMOD_27_RENDER_EXTERIOR.webp',
    'ALMAMOD_27_NEGRO.webp',
    'ALMAMOD_27_GRIS_REVEAR.webp',
    'ALMAMOD_27_PLANIMETRÍA.webp',
  ],
  'Alma Loft 28': [
    'ALMAMOD_28_LOFT_PORTADA.webp',
    'ALMAMOD_28_LOFT_RENDER_EXTERIOR.webp',
    'ALMAMOD_28_LOFT_RENDER_INTERIOR.webp',
  ],
  'Alma 36': [
    'ALMAMOD_36_PORTADA.webp',
    'ALMAMOD_36_1.webp',
    'ALMAMOD_36_2.webp',
    'ALMAMOD_36_3.webp',
    'ALMAMOD_36_RENDER_EXT-INT.webp',
    'ALMAMOD_36_NEGRO.webp',
    'ALMAMOD_36_REVEAR.webp',
    'ALMAMOD_36_PLANIMETRIA.webp',
  ],
  'Alma 36 Refugio': [
    'ALMAMOD_36_REFUGIO_PORTADA.webp',
    'ALMAMOD_36_REFUGIO_PLANIMETRIA_2D.webp',
    'ALMAMOD_36_REFUGIO_PORTADA_dobleext1',
    'ALMAMOD_36_REFUGIO_PORTADA_dobleext2',
    'ALMAMOD_36_REFUGIO_PORTADA_dobleint1',
    'ALMAMOD_36_REFUGIO_PORTADA_dobleint2',
  ],
};

export default function SelectorImagenModelo({ modelo, selectedUrl, onSelectUrl, onUploadFile, uploading }) {
  const fileRef = useRef();
  const fotos = FOTOS[modelo] || [];

  return (
    <div>
      {fotos.length > 0 && (
        <>
          <div style={{ color: C.textMuted, fontSize: '0.75rem', marginBottom: '6px' }}>
            Fotos del modelo — clic para seleccionar
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px', marginBottom: '10px' }}>
            {fotos.map(nombre => {
              const url = full(nombre);
              const isSelected = selectedUrl === url;
              return (
                <div key={nombre}
                  onClick={() => onSelectUrl(url)}
                  style={{
                    borderRadius: '6px', overflow: 'hidden', cursor: 'pointer', position: 'relative',
                    border: isSelected ? `2px solid ${C.gold}` : '2px solid transparent',
                    transition: 'border 0.15s',
                  }}>
                  <img src={thumb(nombre)} alt=""
                    style={{ width: '100%', aspectRatio: '4/3', objectFit: 'cover', display: 'block' }} />
                  {isSelected && (
                    <div style={{
                      position: 'absolute', top: '4px', right: '4px',
                      background: C.gold, color: '#000', borderRadius: '50%',
                      width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '0.7rem', fontWeight: 700,
                    }}>✓</div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}

      <div onClick={() => fileRef.current?.click()}
        style={{
          border: `2px dashed ${C.goldBorder}`, borderRadius: '8px', padding: '10px',
          textAlign: 'center', cursor: 'pointer', background: C.goldDim,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
          position: 'relative', minHeight: fotos.length > 0 ? '48px' : '100px',
        }}>
        {selectedUrl && !fotos.map(n => full(n)).includes(selectedUrl)
          ? <img src={selectedUrl} alt="" style={{ maxHeight: '80px', maxWidth: '100%', borderRadius: '4px' }} />
          : <div style={{ color: C.textMuted, fontSize: '0.82rem' }}>
              {uploading ? 'Subiendo...' : fotos.length > 0 ? '📎 Subir imagen propia' : '📸 Subir imagen'}
            </div>
        }
        {uploading && (
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.gold }}>
            Subiendo...
          </div>
        )}
      </div>
      <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }}
        onChange={e => { if (e.target.files?.[0]) onUploadFile(e.target.files[0]); e.target.value = ''; }} />
    </div>
  );
}
