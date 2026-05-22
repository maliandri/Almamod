import { useState, useEffect } from 'react';
import AppLayout from '../components/AppLayout';
import { C, S, inputFocus, inputBlur } from '../styles';

const WEBHOOKS_KEY = 'almamod_make_webhooks';

const PASOS = [
  {
    num: 1,
    titulo: 'Crear cuenta en Make.com',
    desc: 'Ingresá a make.com y creá una cuenta gratuita (hasta 1.000 operaciones/mes).',
    link: 'https://make.com',
  },
  {
    num: 2,
    titulo: 'Crear un nuevo Scenario',
    desc: 'Hacé clic en "Create a new scenario". El primer módulo tiene que ser un Webhook → Custom Webhook.',
  },
  {
    num: 3,
    titulo: 'Copiar la URL del Webhook',
    desc: 'Make te da una URL como "https://hook.eu1.make.com/xxxxx". Copiala y pegala abajo en el campo correspondiente.',
  },
  {
    num: 4,
    titulo: 'Agregar módulo de Instagram/Facebook',
    desc: 'Después del Webhook, agregá el módulo "Facebook Pages → Create a Post" o "Instagram for Business → Create a Photo Post". Conectá tu cuenta.',
  },
  {
    num: 5,
    titulo: 'Mapear los campos',
    desc: 'En el módulo de Instagram/Facebook mapea: Message = {{caption}} + "\\n\\n" + {{hashtags}}, Photo URL = {{imagen_url}}. Para Facebook también podés mapear el Link.',
  },
  {
    num: 6,
    titulo: 'Activar el Scenario',
    desc: 'Hacé clic en el toggle "Scheduling" y elegí "Immediately as data arrives". Guardá y activá.',
  },
  {
    num: 7,
    titulo: 'Probar desde el panel',
    desc: 'Volvé al panel de AlmaMod, generá una publicación de prueba y hacé clic en "Publicar en Make". Verificá que llegue a Instagram/Facebook.',
  },
];

export default function MakeConfig() {
  const [webhooks, setWebhooks] = useState({ reels: '', posts: '', libre: '' });
  const [saved, setSaved] = useState(false);
  const [testing, setTesting] = useState('');
  const [testResult, setTestResult] = useState('');

  useEffect(() => {
    const stored = localStorage.getItem(WEBHOOKS_KEY);
    if (stored) setWebhooks(JSON.parse(stored));
  }, []);

  const handleSave = () => {
    localStorage.setItem(WEBHOOKS_KEY, JSON.stringify(webhooks));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleTest = async (tipo) => {
    const url = webhooks[tipo === 'reels' ? 'reels' : tipo === 'posts' ? 'posts' : 'libre'];
    if (!url) { setTestResult('Primero ingresá la URL del webhook'); return; }
    setTesting(tipo); setTestResult('');
    try {
      await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tipo,
          caption: 'TEST desde AlmaMod — Ignorar',
          hashtags: '#almamod #test',
          cta: 'Test de conexión',
          imagen_url: '',
          timestamp: new Date().toISOString(),
        }),
      });
      setTestResult(`✓ Webhook de ${tipo} enviado correctamente`);
    } catch (err) {
      setTestResult(`Error: ${err.message}`);
    } finally {
      setTesting('');
    }
  };

  return (
    <AppLayout>
      <div style={{ padding: '28px 32px', maxWidth: '760px' }}>
        <h1 style={{ ...S.h1, marginBottom: '8px' }}>⚙️ Configurar Make.com</h1>
        <p style={{ color: C.textMuted, fontSize: '0.88rem', marginBottom: '32px' }}>
          Conectá el panel con Make para publicar automáticamente en Instagram y Facebook.
        </p>

        {/* Pasos */}
        <div style={{ ...S.card, marginBottom: '28px' }}>
          <h2 style={{ ...S.h2, color: C.gold, marginBottom: '20px' }}>Pasos de configuración</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {PASOS.map(p => (
              <div key={p.num} style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: C.goldDim, border: `1px solid ${C.goldBorder}`, color: C.gold, fontWeight: 700, fontSize: '0.82rem', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '1px' }}>
                  {p.num}
                </div>
                <div>
                  <div style={{ color: C.text, fontWeight: 600, fontSize: '0.9rem', marginBottom: '3px' }}>{p.titulo}</div>
                  <div style={{ color: C.textMuted, fontSize: '0.82rem', lineHeight: 1.5 }}>{p.desc}</div>
                  {p.link && (
                    <a href={p.link} target="_blank" rel="noopener noreferrer"
                      style={{ color: C.gold, fontSize: '0.8rem', textDecoration: 'none', display: 'inline-block', marginTop: '4px' }}>
                      {p.link} →
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Webhook URLs */}
        <div style={S.card}>
          <h2 style={{ ...S.h2, color: C.gold, marginBottom: '20px' }}>URLs de Webhooks</h2>
          <p style={{ color: C.textMuted, fontSize: '0.82rem', marginBottom: '20px' }}>
            Podés tener un webhook distinto por tipo de contenido, o usar el mismo para todo.
          </p>

          {[
            { key: 'reels', label: '🎬 Webhook para Reels', tipo: 'reels' },
            { key: 'posts', label: '📱 Webhook para Publicaciones', tipo: 'posts' },
            { key: 'libre', label: '✍️ Webhook para Publicación libre', tipo: 'libre' },
          ].map(({ key, label, tipo }) => (
            <div key={key} style={{ marginBottom: '18px' }}>
              <label style={S.label}>{label}</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  value={webhooks[key]}
                  onChange={e => setWebhooks(p => ({ ...p, [key]: e.target.value }))}
                  placeholder="https://hook.eu1.make.com/..."
                  style={{ ...S.input, flex: 1, fontSize: '0.85rem' }}
                  onFocus={inputFocus} onBlur={inputBlur}
                />
                <button type="button" onClick={() => handleTest(tipo)} disabled={!!testing}
                  style={{ ...S.btnGhost, fontSize: '0.8rem', padding: '8px 12px', opacity: testing ? 0.6 : 1, whiteSpace: 'nowrap' }}>
                  {testing === tipo ? 'Enviando...' : 'Probar'}
                </button>
              </div>
            </div>
          ))}

          {testResult && (
            <div style={{ ...testResult.startsWith('✓') ? S.alertSuccess : S.alertError, marginBottom: '16px', fontSize: '0.85rem' }}>
              {testResult}
            </div>
          )}

          <button onClick={handleSave} style={{ ...S.btnGold, padding: '10px 24px' }}>
            {saved ? '✓ Guardado' : 'Guardar webhooks'}
          </button>

          <p style={{ color: C.textMuted, fontSize: '0.75rem', marginTop: '12px' }}>
            Las URLs se guardan en este navegador. Si accedés desde otro dispositivo tenés que volver a configurarlas.
          </p>
        </div>

        {/* Payload reference */}
        <div style={{ ...S.card, marginTop: '16px' }}>
          <h2 style={{ ...S.h2, marginBottom: '12px' }}>Campos del payload que recibe Make</h2>
          <div style={{ background: 'rgba(0,0,0,0.3)', borderRadius: '8px', padding: '14px', fontFamily: 'monospace', fontSize: '0.78rem', color: C.textSub, lineHeight: 1.7 }}>
            {`{
  "tipo": "reel" | "post" | "libre",
  "caption": "Texto principal del post",
  "hashtags": "#almamod #casasmodulares ...",
  "cta": "Call to action",
  "imagen_url": "https://res.cloudinary.com/...",
  "hook": "Frase gancho (solo Reels)",
  "guion": "Guión del reel (solo Reels)",
  "redes": ["instagram", "facebook"],
  "timestamp": "2026-05-22T..."
}`}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
