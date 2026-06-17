import { useState } from 'react';
import { C, S, inputFocus, inputBlur } from '../styles';

// Campo de texto generado por IA, editable antes de publicar.
// El alto crece según el contenido y se puede ajustar a mano.
export default function CampoEditable({ label, value, onChange }) {
  const [copiado, setCopiado] = useState(false);
  const filas = Math.min(14, Math.max(2, String(value || '').split('\n').length));

  const copiar = () => {
    navigator.clipboard.writeText(value || '');
    setCopiado(true);
    setTimeout(() => setCopiado(false), 1500);
  };

  return (
    <div style={S.card}>
      <div style={{ color: C.gold, fontSize: '0.75rem', fontWeight: 700, marginBottom: '6px', letterSpacing: '0.04em' }}>{label}</div>
      <textarea
        value={value}
        onChange={e => onChange(e.target.value)}
        rows={filas}
        style={{ ...S.input, width: '100%', color: C.textSub, fontSize: '0.85rem', lineHeight: 1.6, resize: 'vertical', fontFamily: 'inherit', minHeight: '44px' }}
        onFocus={inputFocus} onBlur={inputBlur} />
      <button type="button" onClick={copiar}
        style={{ ...S.btnGhost, fontSize: '0.72rem', padding: '4px 10px', marginTop: '8px' }}>
        {copiado ? '✓ Copiado' : 'Copiar'}
      </button>
    </div>
  );
}
