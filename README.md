# Seguros Maraver — Web Corporativa

Landing page de captación con asistente IA integrado para Seguros Maraver.

## Stack

- HTML5 semántico + CSS3 personalizado + JavaScript vanilla
- Sin frameworks ni dependencias de build
- Listo para desplegar en Vercel directamente desde GitHub

---

## Estructura del proyecto

```
seguros-maraver/
├── index.html          ← Página principal
├── css/
│   └── styles.css      ← Todos los estilos
├── js/
│   └── main.js         ← Lógica del chatbot, nav, FAQ, GHL
├── assets/
│   ├── favicon.svg     ← Favicon
│   └── og-image.jpg    ← Imagen Open Graph (añadir manualmente)
├── vercel.json         ← Configuración de Vercel (headers, caché)
└── README.md
```

---

## Configuración antes de publicar

### 1. Webhook de GoHighLevel

Abre `js/main.js` y busca esta línea:

```js
GHL_WEBHOOK_URL: 'TU_WEBHOOK_GHL_AQUI',
```

Reemplázala con la URL real de tu webhook en GHL. El payload que recibirás contiene:

```json
{
  "name": "Nombre del lead",
  "phone": "600 000 000",
  "email": "email@ejemplo.com",
  "source": "chatbot-web-maraver",
  "profile": "Soy particular | Tengo familia a cargo | ...",
  "timestamp": "2025-03-16T10:30:00.000Z"
}
```

### 2. Datos de contacto reales

En `index.html`, busca y reemplaza:
- `900 000 000` → tu teléfono real
- `hola@segurosmaraver.es` → tu email real
- La dirección en el pie de página si procede

### 3. Imagen Open Graph

Añade una imagen `assets/og-image.jpg` (1200×630px) para que el enlace se vea bien al compartir en redes sociales.

### 4. Dominio personalizado

En Vercel, ve a **Settings → Domains** y añade tu dominio (`segurosmaraver.es`).

---

## Despliegue en Vercel

### Opción A — Desde GitHub (recomendada)

1. Sube este repositorio a GitHub
2. Ve a [vercel.com](https://vercel.com) → **Add New Project**
3. Importa el repositorio
4. Vercel detecta automáticamente que es un sitio estático
5. Haz click en **Deploy**

Cada vez que hagas un `git push` a `main`, Vercel desplegará automáticamente.

### Opción B — Con Vercel CLI

```bash
npm i -g vercel
cd seguros-maraver
vercel
```

---

## Personalización frecuente

| Qué cambiar | Dónde |
|---|---|
| Colores de marca | `css/styles.css` → variables `:root` |
| Textos de la web | `index.html` → secciones correspondientes |
| Comportamiento del chatbot | `js/main.js` → `SYSTEM_PROMPT` |
| Quick replies del chat | `js/main.js` → función `handleUserMessage` |
| Estadísticas (23 años, 2400 clientes...) | `index.html` → secciones hero y testimonios |
| Testimonios | `index.html` → sección `#testimonios` |

---

## KPIs a monitorizar

Conecta Google Analytics 4 o Plausible y mide:

- **Tasa de activación del chat** — % de visitantes que inician conversación
- **Tasa de completación** — % que llegan al formulario de lead
- **Tasa de conversión lead → sesión** — dentro del pipeline de GHL
- **Tiempo en página** — indicador de engagement con el contenido

---

## Soporte

Desarrollado como parte de la estrategia digital de Seguros Maraver.
