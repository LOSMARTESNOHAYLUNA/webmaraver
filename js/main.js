/* ═══════════════════════════════════════════
   SEGUROS MARAVER — Main JavaScript
   ═══════════════════════════════════════════

   CONFIGURACIÓN INICIAL:
   1. Reemplaza GHL_WEBHOOK_URL con tu webhook real de GoHighLevel
   2. El payload que llega a GHL incluye: nombre, teléfono, email,
      perfil del diagnóstico (conversación completa) y timestamp
   ═══════════════════════════════════════════ */

// ─── CONFIGURACIÓN ───────────────────────────────────────────
const CONFIG = {
  GHL_WEBHOOK_URL: 'TU_WEBHOOK_GHL_AQUI',   // ← CAMBIA ESTO
  CHAT_MODEL: 'claude-sonnet-4-20250514',
  MAX_TOKENS: 1000,
};

const SYSTEM_PROMPT = `Eres el asistente virtual de Seguros Maraver, una correduría especializada en atención muy cercana y personalizada con más de 20 años de experiencia. Tu misión es hacer un diagnóstico rápido y amable de la situación de cobertura del usuario y llevarle a reservar una revisión gratuita con un asesor humano de Maraver.

FLUJO DE CONVERSACIÓN:
1. Presentación: Una frase breve y cercana, y pregunta si es particular, autónomo/freelance o tiene una empresa.
2. Diagnóstico: Según el perfil, haz preguntas específicas de una en una (nunca todas juntas).
3. Detección de lagunas: Identifica 1-2 puntos débiles en su situación y coméntalos de forma constructiva y amigable.
4. Propuesta: Después de 5-7 intercambios naturales, propón la sesión de revisión gratuita con un asesor.
5. Cuando el usuario acepte la sesión o muestre interés claro, escribe exactamente "FORM_READY" al inicio de tu mensaje (seguido del texto que quieras mostrar).

PREGUNTAS CLAVE POR PERFIL:
- PARTICULARES: ¿Tiene personas a cargo? ¿Seguro de vida y qué cubre? ¿Hogar asegurado y por cuánto? ¿Salud privada?
- AUTÓNOMOS: ¿Tiene Responsabilidad Civil profesional? ¿Protección ante baja o enfermedad? ¿Material e instalaciones aseguradas?
- EMPRESAS: ¿RC empresarial? ¿Cobertura de empleados? ¿Protección de activos e instalaciones? ¿Vehículos de empresa?

ESTILO:
- Tono muy cercano, como un amigo que sabe de seguros. Nunca frío ni comercial.
- Respuestas cortas: máximo 2-3 oraciones.
- No prometas precios ni hagas comparativas concretas.
- Cuando detectes lagunas, menciónalas con naturalidad y empatía.
- Sé empático. Nunca presiones.`;

// ─── ESTADO DEL CHATBOT ───────────────────────────────────────
let chatHistory = [];
let msgCount = 0;

// ─── NAV SCROLL ───────────────────────────────────────────────
window.addEventListener('scroll', () => {
  document.getElementById('navbar')?.classList.toggle('scrolled', window.scrollY > 40);
});

// ─── MOBILE MENU ──────────────────────────────────────────────
function toggleMobileMenu() {
  const menu = document.getElementById('mobileMenu');
  if (!menu) return;
  menu.classList.toggle('open');
}

// Cerrar menú al hacer click en un enlace
document.addEventListener('DOMContentLoaded', () => {
  const mobileLinks = document.querySelectorAll('#mobileMenu a');
  mobileLinks.forEach(link => {
    link.addEventListener('click', () => {
      document.getElementById('mobileMenu')?.classList.remove('open');
    });
  });
});

// ─── FAQ ACCORDION ────────────────────────────────────────────
function toggleFAQ(el) {
  const item = el.parentElement;
  const wasOpen = item.classList.contains('open');
  document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));
  if (!wasOpen) item.classList.add('open');
}

// ─── UTILS ────────────────────────────────────────────────────
function getTime() {
  const n = new Date();
  return n.getHours().toString().padStart(2,'0') + ':' + n.getMinutes().toString().padStart(2,'0');
}

// ─── CHATBOT: RENDER ──────────────────────────────────────────
function addMessage(text, isBot) {
  const container = document.getElementById('cbMsgs');
  if (!container) return;

  const div = document.createElement('div');
  div.className = 'cb-msg ' + (isBot ? 'bot' : 'user');
  div.innerHTML = `
    <div class="cb-bbl">${text.replace(/\n/g, '<br>')}</div>
    <div class="cb-time">${getTime()}</div>
  `;
  container.appendChild(div);
  container.scrollTop = container.scrollHeight;
}

function showTyping() {
  const container = document.getElementById('cbMsgs');
  if (!container) return;

  const div = document.createElement('div');
  div.className = 'cb-msg bot';
  div.id = 'cbTyping';
  div.innerHTML = `
    <div class="cb-typing">
      <div class="cb-td"></div>
      <div class="cb-td"></div>
      <div class="cb-td"></div>
    </div>
  `;
  container.appendChild(div);
  container.scrollTop = container.scrollHeight;
}

function hideTyping() {
  document.getElementById('cbTyping')?.remove();
}

function setQuickReplies(options) {
  const qr = document.getElementById('cbQR');
  if (!qr) return;
  qr.innerHTML = '';
  options.forEach(opt => {
    const btn = document.createElement('button');
    btn.className = 'cb-qbtn';
    btn.textContent = opt;
    btn.addEventListener('click', () => {
      clearQuickReplies();
      handleUserMessage(opt);
    });
    qr.appendChild(btn);
  });
}

function clearQuickReplies() {
  const qr = document.getElementById('cbQR');
  if (qr) qr.innerHTML = '';
}

// ─── CHATBOT: API ─────────────────────────────────────────────
async function callAPI(userMessage) {
  chatHistory.push({ role: 'user', content: userMessage });
  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: CONFIG.CHAT_MODEL,
        max_tokens: CONFIG.MAX_TOKENS,
        system: SYSTEM_PROMPT,
        messages: chatHistory,
      }),
    });
    const data = await response.json();
    const reply = data.content[0].text;
    chatHistory.push({ role: 'assistant', content: reply });
    return reply;
  } catch (err) {
    console.error('API error:', err);
    return 'Lo siento, ha habido un problema de conexión. Por favor, inténtalo de nuevo.';
  }
}

// ─── CHATBOT: FLUJO ───────────────────────────────────────────
async function handleUserMessage(text) {
  addMessage(text, false);
  msgCount++;
  clearQuickReplies();
  const input = document.getElementById('cbInput');
  if (input) input.value = '';

  showTyping();
  const reply = await callAPI(text);
  hideTyping();

  if (reply.startsWith('FORM_READY')) {
    const clean = reply.replace('FORM_READY', '').trim();
    if (clean) addMessage(clean, true);
    setTimeout(() => {
      document.getElementById('cbOverlay')?.classList.remove('hidden');
    }, 600);
  } else {
    addMessage(reply, true);
    // Quick replies contextuales
    if (msgCount === 1) {
      setQuickReplies(['Soy particular', 'Soy autónomo', 'Tengo una empresa']);
    } else if (
      reply.toLowerCase().includes('sesión') ||
      reply.toLowerCase().includes('revisión') ||
      reply.toLowerCase().includes('asesor')
    ) {
      setQuickReplies(['Sí, me interesa', 'Cuéntame más primero', 'Quizás más adelante']);
    }
  }
}

function sendMsg() {
  const input = document.getElementById('cbInput');
  if (!input) return;
  const text = input.value.trim();
  if (text) handleUserMessage(text);
}

// ─── LEAD FORM ────────────────────────────────────────────────
function submitLead() {
  const name  = document.getElementById('fName')?.value.trim();
  const phone = document.getElementById('fPhone')?.value.trim();
  const email = document.getElementById('fEmail')?.value.trim();

  if (!name || !phone) {
    alert('Por favor, completa tu nombre y teléfono para continuar.');
    return;
  }

  const profile = chatHistory
    .filter(m => m.role === 'user')
    .map(m => m.content)
    .join(' | ');

  const payload = {
    name,
    phone,
    email: email || '',
    source: 'chatbot-web-maraver',
    profile,
    timestamp: new Date().toISOString(),
  };

  // Enviar a GHL webhook
  if (CONFIG.GHL_WEBHOOK_URL !== 'TU_WEBHOOK_GHL_AQUI') {
    fetch(CONFIG.GHL_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }).catch(err => console.warn('GHL webhook error:', err));
  } else {
    console.log('📋 GHL Lead payload (webhook no configurado):', payload);
  }

  // Mostrar pantalla de éxito
  const formContent = document.getElementById('cbFormContent');
  const successScreen = document.getElementById('cbSuccess');
  if (formContent) formContent.style.display = 'none';
  if (successScreen) successScreen.style.display = 'block';

  // Cerrar overlay y volver al chat
  setTimeout(() => {
    document.getElementById('cbOverlay')?.classList.add('hidden');
    if (formContent) formContent.style.display = 'block';
    if (successScreen) successScreen.style.display = 'none';
    // Limpiar formulario
    ['fName','fPhone','fEmail'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.value = '';
    });
    addMessage('¡Perfecto! El equipo de Maraver te contactará muy pronto. Si mientras tanto tienes alguna pregunta, aquí estoy. 😊', true);
  }, 3000);
}

// ─── SCROLL ANIMATIONS ────────────────────────────────────────
function initScrollAnimations() {
  if (!('IntersectionObserver' in window)) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.pain-item, .seg-card, .srv-card, .testi, .about-val').forEach((el, i) => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = `opacity .5s ease ${i * 0.07}s, transform .5s ease ${i * 0.07}s`;
    observer.observe(el);
  });
}

// ─── INIT ─────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
  // Enter key en el input del chat
  const cbInput = document.getElementById('cbInput');
  if (cbInput) {
    cbInput.addEventListener('keypress', e => {
      if (e.key === 'Enter') sendMsg();
    });
  }

  // Iniciar animaciones de scroll
  initScrollAnimations();

  // Arrancar el chatbot con mensaje de bienvenida
  showTyping();
  const greeting = await callAPI('Hola, me gustaría saber si estoy bien asegurado');
  hideTyping();
  addMessage(greeting, true);
  setQuickReplies(['Soy particular', 'Soy autónomo', 'Tengo una empresa']);
});
