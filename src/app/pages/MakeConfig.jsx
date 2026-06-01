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
  const [webhooks, setWebhooks] = useState({ url: '' });
  const [saved, setSaved] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState('');

  useEffect(() => {
    const stored = localStorage.getItem(WEBHOOKS_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // migrar formato anterior (reels/posts/libre) al nuevo (url)
      if (!parsed.url && (parsed.reels || parsed.posts || parsed.libre)) {
        setWebhooks({ url: parsed.reels || parsed.posts || parsed.libre || '' });
      } else {
        setWebhooks({ url: parsed.url || '' });
      }
    }
  }, []);

  const handleSave = () => {
    localStorage.setItem(WEBHOOKS_KEY, JSON.stringify(webhooks));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleTest = async () => {
    setTesting(true); setTestResult('');
    try {
      const res = await fetch('/.netlify/functions/make-proxy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          payload: {
            tipo: 'test',
            caption: 'TEST desde AlmaMod — Ignorar',
            hashtags: '#almamod #test',
            timestamp: new Date().toISOString(),
          },
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || `Error ${res.status}`);
      setTestResult('✓ Webhook enviado correctamente');
    } catch (err) {
      setTestResult(`Error: ${err.message}`);
    } finally {
      setTesting(false);
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

        {/* Webhook URL */}
        <div style={S.card}>
          <h2 style={{ ...S.h2, color: C.gold, marginBottom: '8px' }}>URL del Webhook</h2>

          {/* Info arquitectura */}
          <div style={{ background: 'rgba(212,165,116,0.08)', border: '1px solid rgba(212,165,116,0.2)', borderRadius: '10px', padding: '14px 16px', marginBottom: '20px' }}>
            <p style={{ color: C.text, fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>
              🔒 La URL se gestiona desde Netlify (variable de entorno)
            </p>
            <p style={{ color: C.textMuted, fontSize: '0.82rem', lineHeight: 1.5, margin: 0 }}>
              La URL del webhook está guardada como <code style={{ color: C.gold }}>MAKE_WEBHOOK_URL</code> en Netlify.
              Para cambiarla: <strong style={{ color: C.text }}>Netlify → Site configuration → Environment variables → MAKE_WEBHOOK_URL</strong>.
              Después de guardar, Netlify hace un redeploy automático.
            </p>
          </div>

          <p style={{ color: C.textMuted, fontSize: '0.82rem', marginBottom: '16px' }}>
            Podés probar si el webhook activo está funcionando:
          </p>

          <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
            <button type="button" onClick={handleTest} disabled={testing}
              style={{ ...S.btnGold, fontSize: '0.85rem', padding: '10px 20px', opacity: testing ? 0.6 : 1 }}>
              {testing ? 'Enviando...' : '🔗 Probar conexión con Make'}
            </button>
          </div>

          {testResult && (
            <div style={{ ...(testResult.startsWith('✓') ? S.alertSuccess : S.alertError), fontSize: '0.85rem' }}>
              {testResult}
            </div>
          )}
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
