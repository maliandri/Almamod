# 🚀 CONFIGURACIÓN DE NETLIFY - ALMAMOD

## 📋 Pasos para Configurar Variables de Entorno en Netlify

### 1. Acceder al Dashboard de Netlify
1. Ir a [https://app.netlify.com](https://app.netlify.com)
2. Seleccionar el sitio **almamod**

### 2. Configurar Variable de Entorno para Gemini AI
1. En el menú lateral, ir a: **Site settings** → **Environment variables**
2. Click en **Add a variable**
3. Crear la siguiente variable:

```
Key:   GEMINI_API_KEY_SECRET
Value: AIzaSyAfC-incgf_ckw2jW21zpGvkNaPDkOIFo0
Scopes: ✅ Builds  ✅ Functions  ✅ Post Processing
```

4. Click en **Save**

---

## ✅ Verificación de Configuración

### Archivos Configurados Correctamente:

#### 1. **Netlify Function** → `netlify/functions/gemini-chat.js`
✅ Ya configurado correctamente para usar `process.env.GEMINI_API_KEY_SECRET`

```javascript
if (!process.env.GEMINI_API_KEY_SECRET) {
  throw new Error('Falta GEMINI_API_KEY_SECRET en Netlify');
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY_SECRET);
```

#### 2. **Frontend Helper** → `src/utils/geminiHelper.js`
✅ Ya configurado correctamente para llamar a la Netlify Function

```javascript
const response = await fetch('/.netlify/functions/gemini-chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ message: userMessage, history: formattedHistory })
});
```

#### 3. **Archivo .env**
✅ Limpiado - API key removida (ya no se usa del lado del cliente)

---

## 🔐 Seguridad

### ❌ ANTES (Inseguro):
- API key expuesta en `.env` con prefijo `VITE_`
- Visible en el bundle JavaScript del cliente
- Cualquiera podía ver la key en DevTools

### ✅ AHORA (Seguro):
- API key solo en variables de entorno de Netlify (servidor)
- No visible en el código del cliente
- Solo accesible desde la Netlify Function (backend)

---

## 🧪 Cómo Probar

### En Desarrollo Local:
1. Usar Netlify Dev para simular el entorno:
   ```bash
   npm install -g netlify-cli
   netlify dev
   ```

2. Configurar variable local en `.netlify` (si existe) o usar:
   ```bash
   netlify env:set GEMINI_API_KEY_SECRET "tu-api-key"
   ```

### En Producción:
1. Hacer deploy a Netlify
2. Abrir el chatbot "Almita" en el sitio
3. Enviar un mensaje
4. Si responde correctamente → ✅ Configuración exitosa

---

## 📊 Monitoreo

### Ver Logs de la Function en Netlify:
1. Dashboard → **Functions** → `gemini-chat`
2. Ver logs en tiempo real para debugging

### Errores Comunes:

#### Error: "Falta GEMINI_API_KEY_SECRET en Netlify"
**Solución**: Verificar que la variable esté configurada en Netlify Dashboard

#### Error: "Failed to fetch"
**Solución**: Verificar que la Netlify Function se haya desplegado correctamente

#### Error: "Invalid API key"
**Solución**: Verificar que la API key de Gemini sea válida

---

## 🔄 Despliegue

### Build Command:
```bash
npm run build
```

### Publish Directory:
```
dist
```

### Functions Directory:
```
netlify/functions
```

Estas configuraciones ya están en `netlify.toml`:

```toml
[functions]
  directory = "netlify/functions"
  node_bundler = "esbuild"

[build]
  command = "npm run build"
  publish = "dist"
```

---

## 📝 Notas Adicionales

- La API key debe mantenerse privada y no compartirse en repositorios públicos
- Si la key se compromete, regenerarla en Google AI Studio
- Las Netlify Functions tienen un límite de 125,000 invocaciones/mes en plan gratuito
- Cada request de Gemini consume tokens según el modelo usado (gemini-1.5-flash)

---

## 🆘 Soporte

Si hay problemas con la configuración:
1. Verificar logs en Netlify Dashboard
2. Revisar la consola del navegador (DevTools)
3. Probar en modo local con `netlify dev`
