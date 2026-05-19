// Paleta compartida del panel interno — misma que el sitio público
export const C = {
  bgPage:    '#0f172a',
  bgCard:    'rgba(255,255,255,0.04)',
  bgCardHov: 'rgba(255,255,255,0.07)',
  bgInput:   'rgba(255,255,255,0.06)',
  gold:      '#d4a574',
  goldDim:   'rgba(212,165,116,0.15)',
  goldBorder:'rgba(212,165,116,0.25)',
  border:    'rgba(212,165,116,0.15)',
  text:      '#e2e8f0',
  textSub:   '#cbd5e1',
  textMuted: '#94a3b8',
  green:     '#10b981',
  greenDim:  'rgba(16,185,129,0.12)',
  red:       '#fca5a5',
  redDim:    'rgba(239,68,68,0.1)',
  yellow:    '#fbbf24',
  yellowDim: 'rgba(251,191,36,0.12)',
  blue:      '#667eea',
  blueDim:   'rgba(102,126,234,0.12)',
};

export const S = {
  page: {
    padding: '28px 32px',
    maxWidth: '1100px',
  },
  card: {
    background: C.bgCard,
    border: `1px solid ${C.border}`,
    borderRadius: '12px',
    padding: '24px',
  },
  cardSm: {
    background: C.bgCard,
    border: `1px solid ${C.border}`,
    borderRadius: '10px',
    padding: '16px 20px',
  },
  h1: {
    color: C.gold,
    fontSize: '1.6rem',
    fontWeight: 700,
    margin: '0 0 24px 0',
  },
  h2: {
    color: C.text,
    fontSize: '1rem',
    fontWeight: 600,
    margin: '0 0 16px 0',
  },
  label: {
    display: 'block',
    color: C.textSub,
    fontSize: '0.82rem',
    fontWeight: 500,
    marginBottom: '6px',
    letterSpacing: '0.02em',
  },
  input: {
    width: '100%',
    background: C.bgInput,
    border: `1px solid ${C.goldBorder}`,
    borderRadius: '8px',
    padding: '10px 14px',
    color: C.text,
    fontSize: '0.9rem',
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'border-color 0.2s',
  },
  select: {
    background: '#1a1a2e',
    border: `1px solid ${C.goldBorder}`,
    borderRadius: '8px',
    padding: '10px 14px',
    color: C.text,
    fontSize: '0.9rem',
    outline: 'none',
    boxSizing: 'border-box',
    cursor: 'pointer',
  },
  btnGold: {
    background: 'linear-gradient(135deg, #d4a574 0%, #8b6f47 100%)',
    border: 'none',
    borderRadius: '8px',
    padding: '10px 20px',
    color: '#1a1a2e',
    fontWeight: 700,
    fontSize: '0.9rem',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    whiteSpace: 'nowrap',
  },
  btnGhost: {
    background: 'transparent',
    border: `1px solid ${C.goldBorder}`,
    borderRadius: '8px',
    padding: '9px 18px',
    color: C.gold,
    fontWeight: 600,
    fontSize: '0.85rem',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  btnDanger: {
    background: 'rgba(239,68,68,0.12)',
    border: '1px solid rgba(239,68,68,0.3)',
    borderRadius: '8px',
    padding: '9px 18px',
    color: '#fca5a5',
    fontWeight: 600,
    fontSize: '0.85rem',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  alertError: {
    background: C.redDim,
    border: '1px solid rgba(239,68,68,0.3)',
    color: C.red,
    borderRadius: '8px',
    padding: '10px 14px',
    fontSize: '0.85rem',
  },
  alertSuccess: {
    background: C.greenDim,
    border: '1px solid rgba(16,185,129,0.3)',
    color: C.green,
    borderRadius: '8px',
    padding: '10px 14px',
    fontSize: '0.85rem',
  },
  divider: {
    borderTop: `1px solid ${C.border}`,
    margin: '16px 0',
  },
};

export const ROL_STYLE = {
  superadmin:  { background: 'rgba(239,68,68,0.15)',   color: '#ef4444' },
  dueno:       { background: 'rgba(212,165,116,0.15)', color: '#d4a574' },
  deposito:    { background: 'rgba(102,126,234,0.15)', color: '#667eea' },
  fabricacion: { background: 'rgba(16,185,129,0.15)',  color: '#10b981' },
  cliente:     { background: 'rgba(148,163,184,0.15)', color: '#94a3b8' },
};

export const ROL_LABEL = {
  superadmin:  'Super Admin',
  dueno:       'Dueño',
  deposito:    'Depósito',
  fabricacion: 'Fabricación',
  cliente:     'Cliente',
};

export const ESTADO_STYLE = {
  activa:     { background: 'rgba(16,185,129,0.15)',  color: '#10b981', border: 'rgba(16,185,129,0.3)' },
  finalizada: { background: 'rgba(148,163,184,0.12)', color: '#94a3b8', border: 'rgba(148,163,184,0.3)' },
  cancelada:  { background: 'rgba(239,68,68,0.12)',   color: '#fca5a5', border: 'rgba(239,68,68,0.3)' },
};

export const ETAPA_STYLE = {
  pendiente: { background: 'rgba(148,163,184,0.2)' },
  cargada:   { background: '#f59e0b' },
  firmada:   { background: '#10b981' },
};

export function Badge({ text, style }) {
  return (
    <span style={{
      display: 'inline-block',
      padding: '3px 10px',
      borderRadius: '20px',
      fontSize: '0.72rem',
      fontWeight: 700,
      letterSpacing: '0.04em',
      ...style,
    }}>
      {text}
    </span>
  );
}

export function inputFocus(e) { e.target.style.borderColor = '#d4a574'; }
export function inputBlur(e)  { e.target.style.borderColor = 'rgba(212,165,116,0.25)'; }
