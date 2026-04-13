document.addEventListener('DOMContentLoaded', () => {
  // ─── Inject Bootstrap Icons (if not already loaded) ─────────────────────────
  if (!document.querySelector('link[href*="bootstrap-icons"]')) {
    const biLink = document.createElement('link');
    biLink.rel = 'stylesheet';
    biLink.href = 'https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css';
    document.head.appendChild(biLink);
  }

  // ─── Inject Emoji-JS for WhatsApp-like emojis (Apple Emojis) ────────────────
  let emojiConvertor = null;
  if (!document.querySelector('script[src*="emoji.min.js"]')) {
    const emojiStyle = document.createElement('style');
    emojiStyle.textContent = '.emoji { height: 1.3em; width: 1.3em; vertical-align: -0.2em; display: inline-block; margin: 0 0.1em; }';
    document.head.appendChild(emojiStyle);

    const emojiScript = document.createElement('script');
    emojiScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/emoji-js/3.8.0/emoji.min.js';
    emojiScript.onload = () => {
      emojiConvertor = new EmojiConvertor();
      emojiConvertor.replace_mode = 'img';
      emojiConvertor.img_set = 'apple';
      emojiConvertor.use_sheet = false;
      emojiConvertor.img_sets.apple.path = 'https://unpkg.com/emoji-datasource-apple@15.0.1/img/apple/64/';
      emojiConvertor.img_sets.apple.ext = '.png';
    };
    document.head.appendChild(emojiScript);
  }

  // ─── Inject Marked.js for perfect Markdown parsing ─────────
  if (!document.querySelector('script[src*="marked.min.js"]')) {
    const markedScript = document.createElement('script');
    markedScript.src = 'https://cdn.jsdelivr.net/npm/marked/marked.min.js';
    document.head.appendChild(markedScript);
  }

  // ─── Logo path & i18n ──────────────────────────────────────────────────────
  const LOGO_PATH = 'assets/romeroluna logo.png';
  const isEn = document.documentElement.lang.startsWith('en') || window.location.pathname.includes('/en/');

  const t = {
    botName: isEn ? 'Romero Luna Assistant' : 'Asistente Romero Luna',
    online: isEn ? 'Online' : 'En línea',
    welcomeSub: isEn ? 'Hi! Tell us about your trip:' : '¡Hola! Cuéntanos sobre tu viaje:',
    ageLabel: isEn ? 'Age range' : 'Rango de edad',
    selectOpt: isEn ? 'Select...' : 'Selecciona...',
    age1: isEn ? '18-25 years' : '18-25 años',
    age2: isEn ? '26-35 years' : '26-35 años',
    age3: isEn ? '36-50 years' : '36-50 años',
    age4: isEn ? 'Over 50 years' : 'Más de 50 años',
    typeLabel: isEn ? 'Tourism type' : 'Tipo de turismo',
    typeFamiliar: isEn ? 'Family' : 'Familiar',
    typeCultural: isEn ? 'Cultural' : 'Cultural',
    typeRelax: 'Relax',
    typeRomantico: isEn ? 'Romantic' : 'Romántico',
    typeFestivo: isEn ? 'Party' : 'Festivo',
    typeNegocios: isEn ? 'Business' : 'Negocios',
    typeGastro: isEn ? 'Gastronomic' : 'Gastronómico',
    typeNaturaleza: isEn ? 'Nature' : 'Naturaleza',
    locationLabel: isEn ? 'Preferred Location (Optional)' : 'Ubicación de interés (Opcional)',
    travelersLabel: isEn ? 'Travelers' : 'Viajeros',
    travelersPh: isEn ? 'Eg: 2' : 'Ej: 2',
    interestsLabel: isEn ? 'Interests or needs (Optional)' : 'Intereses o necesidades (Opcional)',
    interestsPh: isEn ? 'Eg: near center, pets, parking...' : 'Ej: cerca del centro, mascotas, parking...',
    startChat: isEn ? 'Start chat' : 'Comenzar chat',
    starter1: isEn ? 'Recommend me some good local food' : 'Dime buenos sitios para comer paella',
    starter2: isEn ? 'What excursions can I do by car?' : '¿Qué excursiones puedo hacer si tengo coche?',
    starter3: isEn ? 'How do I get to Picasso Museum?' : '¿Cómo puedo llegar al museo Picasso?',
    placeholder: isEn ? 'Type your message...' : 'Escribe tu mensaje...',
    helloPrompt: isEn ? 'Hi! 👋 I am your Romero Luna assistant. How can I help you today?' : '¡Hola! 👋 Soy tu asistente en Romero Luna. ¿En qué puedo ayudarte hoy?',
    preferencesSet: isEn ? 'Great! 😊 I have your preferences. How can I help you? Are you looking for an apartment or what to see around?' : '¡Genial! 😊 Ya tengo tus preferencias. ¿En qué puedo ayudarte? ¿Buscas apartamento o te cuento qué ver por la zona?',
    you: isEn ? 'You' : 'Tú',
    errServer: isEn ? '⚠️ There was a problem. Try again in a moment.' : '⚠️ Ha habido un problema en el servidor. Inténtalo de nuevo en un momento.',
    errInvalid: isEn ? '⚠️ Unexpected server response. Try again.' : '⚠️ Respuesta inesperada del servidor. Inténtalo de nuevo.',
    errConn: isEn ? '❌ Connection error. Please try again.' : '❌ Error de conexión. Asegúrate de que el servidor está activo.',
  };

  // ─── HTML Structure ────────────────────────────────────────────────────────
  const widgetHTML = `
    <div id="chatbot-widget">
      <div id="chatbot-popup">
        <div id="chatbot-header">
          <div class="cb-header-bot">
            <img src="${LOGO_PATH}" alt="Romero Luna" class="cb-bot-avatar">
            <div class="cb-header-info">
              <span>${t.botName}</span>
              <small><i class="bi bi-circle-fill" style="font-size:6px; color:#66a307;"></i> ${t.online}</small>
            </div>
          </div>
          <div class="cb-header-actions">
            <button id="chatbot-filter-btn" title="Preferencias de viaje"><i class="bi bi-sliders2"></i></button>
            <button id="chatbot-close" aria-label="Cerrar chat"><i class="bi bi-x-lg"></i></button>
          </div>
        </div>

        <!-- Profiling Form -->
        <div id="chatbot-form-container">
          <h3><i class="bi bi-hand-thumbs-up-fill" style="color:#66a307"></i> ${t.welcomeSub}</h3>
          <form id="chatbot-form">
            <div class="chatbot-form-group">
              <label>${t.ageLabel}</label>
              <select id="cb-age">
                <option value="">${t.selectOpt}</option>
                <option value="18-25">${t.age1}</option>
                <option value="26-35">${t.age2}</option>
                <option value="36-50">${t.age3}</option>
                <option value="50+">${t.age4}</option>
              </select>
            </div>
            <div class="chatbot-form-group">
              <label>${t.typeLabel}</label>
              <select id="cb-type" required>
                <option value="">${t.selectOpt}</option>
                <option value="Familiar">${t.typeFamiliar}</option>
                <option value="Cultural">${t.typeCultural}</option>
                <option value="Relax">${t.typeRelax}</option>
                <option value="Romántico">${t.typeRomantico}</option>
                <option value="Festivo">${t.typeFestivo}</option>
                <option value="Negocios">${t.typeNegocios}</option>
                <option value="Gastronómico">${t.typeGastro}</option>
                <option value="Naturaleza">${t.typeNaturaleza}</option>
              </select>
            </div>
            <div class="chatbot-form-group">
              <label>${t.locationLabel}</label>
              <select id="cb-location">
                <option value="">${t.selectOpt}</option>
                <option value="Centro Histórico">Centro Histórico</option>
                <option value="Teatro Soho">Teatro Soho</option>
              </select>
            </div>
            <div class="chatbot-form-group">
              <label>${t.travelersLabel}</label>
              <input type="number" id="cb-travelers" min="1" max="15" placeholder="${t.travelersPh}" required>
            </div>
            <div class="chatbot-form-group">
              <label>${t.interestsLabel}</label>
              <input type="text" id="cb-interests" placeholder="${t.interestsPh}">
            </div>
            <button type="submit" id="chatbot-start-btn">
              <i class="bi bi-chat-dots-fill"></i> ${t.startChat}
            </button>
          </form>
        </div>

        <!-- Chat Interface -->
        <div id="chatbot-chat-container" style="display: flex;">
          <div id="cb-messages-wrapper">
             <div class="cb-watermark">
                <img src="${LOGO_PATH}" alt="Romero Luna Logo">
             </div>
             <div id="chatbot-messages"></div>
          </div>
          <!-- Starter Phrases (Persistent) -->
          <div id="chatbot-starter-container">
            <div class="cb-starter-pills">
              <button class="cb-starter-btn">${t.starter1}</button>
              <button class="cb-starter-btn">${t.starter2}</button>
              <button class="cb-starter-btn">${t.starter3}</button>
            </div>
          </div>
          <div id="chatbot-input-area">
            <input type="text" id="chatbot-input" placeholder="${t.placeholder}" autocomplete="off">
            <button id="chatbot-send-btn" aria-label="Enviar">
              <i class="bi bi-send-fill"></i>
            </button>
          </div>
        </div>
      </div>

      <!-- Floating Trigger -->
      <button id="chatbot-trigger" aria-label="Abrir chat">
        <img src="${LOGO_PATH}" alt="Romero Luna Chat">
      </button>
    </div>
  `;

  document.body.insertAdjacentHTML('beforeend', widgetHTML);

  // ─── DOM References ─────────────────────────────────────────────────────────
  const triggerBtn = document.getElementById('chatbot-trigger');
  const popup = document.getElementById('chatbot-popup');
  const closeBtn = document.getElementById('chatbot-close');
  const formContainer = document.getElementById('chatbot-form-container');
  const chatContainer = document.getElementById('chatbot-chat-container');
  const profileForm = document.getElementById('chatbot-form');
  const messagesDiv = document.getElementById('chatbot-messages');
  const inputField = document.getElementById('chatbot-input');
  const sendBtn = document.getElementById('chatbot-send-btn');
  const filterBtn = document.getElementById('chatbot-filter-btn');
  const starterContainer = document.getElementById('chatbot-starter-container');

  let userProfile = null;
  let chatHistory = [];
  const apiUrl = '/.netlify/functions/chat';
  let isWelcomeAdded = false;

  // ─── Auto-Scroll Logic ─────────────────────────────────────────
  let isUserScrolling = false;
  messagesDiv.addEventListener('scroll', () => {
    // If user scrolls up by more than 10px from the bottom, mark as 'user is scrolling manually'
    const atBottom = messagesDiv.scrollHeight - messagesDiv.scrollTop <= messagesDiv.clientHeight + 10;
    isUserScrolling = !atBottom;
  });

  function scrollToBottom(force = false) {
    if (force || !isUserScrolling) {
      messagesDiv.scrollTop = messagesDiv.scrollHeight;
    }
  }

  // ─── Toggle Popup ────────────────────────────────────────────────────────────
  triggerBtn.addEventListener('click', () => {
    const isVisible = popup.style.display === 'flex';
    if (!isVisible) {
      popup.style.display = 'flex';
      history.pushState(null, null, '#chatbot'); // Update URL for QR tracking
      
      // Show initial welcome if not already added
      if (!isWelcomeAdded) {
        addBotMessage(t.helloPrompt);
        isWelcomeAdded = true;
      }
    } else {
      popup.style.display = 'none';
      if (window.location.hash === '#chatbot') {
        history.pushState(null, null, ' '); // Remove hash
      }
    }
  });

  closeBtn.addEventListener('click', () => {
    popup.style.display = 'none';
    if (window.location.hash === '#chatbot') {
      history.pushState(null, null, ' ');
    }
  });

  // Open automatically if from QR code
  if (window.location.hash === '#chatbot') {
    setTimeout(() => {
      if (popup.style.display !== 'flex') triggerBtn.click();
    }, 300);
  }

  // Toggle filter form
  filterBtn.addEventListener('click', () => {
    const formVisible = formContainer.style.display === 'block';
    formContainer.style.display = formVisible ? 'none' : 'block';
  });

  // ─── Form Submission ─────────────────────────────────────────────────────────
  profileForm.addEventListener('submit', (e) => {
    e.preventDefault();
    userProfile = {
      age: document.getElementById('cb-age').value,
      tourismType: document.getElementById('cb-type').value,
      location: document.getElementById('cb-location').value,
      travelers: document.getElementById('cb-travelers').value,
      interests: document.getElementById('cb-interests').value,
    };
    formContainer.style.display = 'none';
    chatContainer.style.display = 'flex';
    addBotMessage(t.preferencesSet);
  });

  // ─── Markdown → HTML parser (lightweight + Marked.js) ─────────────────────
  function parseMarkdown(text) {
    let html = text;
    if (typeof marked !== 'undefined') {
      // Configuration to open links in new tab
      const renderer = new marked.Renderer();
      const linkRenderer = renderer.link;
      renderer.link = (href, title, text) => {
        const localLink = linkRenderer.call(renderer, href, title, text);
        return localLink.replace('<a ', '<a target="_blank" rel="noopener" ');
      };
      
      html = marked.parse(text, { renderer, breaks: true });
    } else {
      // Fallback
      html = text.replace(/\n/g, '<br>');
    }

    // Convert Unicode emojis to Apple Emojis (WhatsApp style)
    if (emojiConvertor) {
      html = emojiConvertor.replace_unified(html);
    }
    return html;
  }

  // ─── Add Bot Message ─────────────────────────────────────────────────────────
  function addBotMessage(text) {
    const row = document.createElement('div');
    row.className = 'cb-message-row bot';

    const avatar = document.createElement('img');
    avatar.src = LOGO_PATH;
    avatar.alt = 'Bot';
    avatar.className = 'cb-avatar';

    const wrap = document.createElement('div');
    wrap.className = 'cb-message-wrap';

    const label = document.createElement('div');
    label.className = 'cb-sender-label';
    label.textContent = t.botName;

    const bubble = document.createElement('div');
    bubble.className = 'chatbot-message bot';
    bubble.innerHTML = parseMarkdown(text);

    wrap.appendChild(label);
    wrap.appendChild(bubble);
    row.appendChild(avatar);
    row.appendChild(wrap);
    messagesDiv.appendChild(row);
    scrollToBottom(true);
    return bubble;
  }

  // ─── Add User Message ────────────────────────────────────────────────────────
  function addUserMessage(text) {
    const row = document.createElement('div');
    row.className = 'cb-message-row user';

    const avatar = document.createElement('div');
    avatar.className = 'cb-avatar user-avatar';
    avatar.innerHTML = '<i class="bi bi-person-fill"></i>';

    const wrap = document.createElement('div');
    wrap.className = 'cb-message-wrap';

    const label = document.createElement('div');
    label.className = 'cb-sender-label';
    label.textContent = t.you;

    const bubble = document.createElement('div');
    bubble.className = 'chatbot-message user';
    bubble.textContent = text;

    wrap.appendChild(label);
    wrap.appendChild(bubble);
    row.appendChild(wrap);
    row.appendChild(avatar);
    messagesDiv.appendChild(row);
    scrollToBottom(true);
  }

  // ─── Typing indicator ────────────────────────────────────────────────────────
  function showTyping() {
    const row = document.createElement('div');
    row.className = 'cb-message-row bot';
    row.id = 'cb-typing-row';

    const avatar = document.createElement('img');
    avatar.src = LOGO_PATH;
    avatar.alt = 'Bot';
    avatar.className = 'cb-avatar';

    const typing = document.createElement('div');
    typing.className = 'cb-typing';
    typing.innerHTML = '<span></span><span></span><span></span>';

    row.appendChild(avatar);
    row.appendChild(typing);
    messagesDiv.appendChild(row);
    scrollToBottom(true);
  }

  function hideTyping() {
    const row = document.getElementById('cb-typing-row');
    if (row) row.remove();
  }

  // ─── Typewriter animation ──────────────────────────────────────────────────
  function typewriterEffect(container, rawMarkdown, onComplete) {
    container.classList.add('streaming');
    let charIdx = 0;
    const speed = 14; 
    let lastTime = 0;

    function tick(timestamp) {
      if (timestamp - lastTime < speed) {
        requestAnimationFrame(tick);
        return;
      }
      lastTime = timestamp;

      if (charIdx > rawMarkdown.length) {
        container.classList.remove('streaming');
        if (onComplete) onComplete();
        scrollToBottom(false); // Only scroll if user is not manually scrolling
        return;
      }

      container.innerHTML = parseMarkdown(rawMarkdown.slice(0, charIdx));
      charIdx++;
      scrollToBottom(false);

      requestAnimationFrame(tick);
    }

    requestAnimationFrame(tick);
  }

  // ─── Send Message ──────────────────────────────────────────────────────────
  const sendMessage = async (presetText = null) => {
    const text = (typeof presetText === 'string') ? presetText : inputField.value.trim();
    if (!text) return;

    if (typeof presetText !== 'string') {
      inputField.value = '';
    }
    
    addUserMessage(text);
    chatHistory.push({ role: 'user', content: text });

    inputField.disabled = true;
    sendBtn.disabled = true;

    showTyping();

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: chatHistory, userProfile, stream: false })
      });

      hideTyping();

      if (!response.ok) {
        addBotMessage(t.errServer);
        return;
      }

      const data = await response.json();
      if (data.message) {
        const row = document.createElement('div');
        row.className = 'cb-message-row bot';

        const avatar = document.createElement('img');
        avatar.src = LOGO_PATH; avatar.alt = 'Bot'; avatar.className = 'cb-avatar';

        const wrap = document.createElement('div'); wrap.className = 'cb-message-wrap';
        const label = document.createElement('div'); label.className = 'cb-sender-label'; label.textContent = t.botName;
        const bubble = document.createElement('div'); bubble.className = 'chatbot-message bot streaming';

        wrap.appendChild(label); wrap.appendChild(bubble);
        row.appendChild(avatar); row.appendChild(wrap);
        messagesDiv.appendChild(row);
        scrollToBottom(true); // force jump to start of bot response

        typewriterEffect(bubble, data.message, () => {
          chatHistory.push({ role: 'assistant', content: data.message });
          inputField.disabled = false;
          sendBtn.disabled = false;
          inputField.focus();
        });
        return;

      } else {
        addBotMessage(t.errInvalid);
      }

    } catch (error) {
      hideTyping();
      addBotMessage(t.errConn);
    }

    inputField.disabled = false;
    sendBtn.disabled = false;
    inputField.focus();
  };

  sendBtn.addEventListener('click', sendMessage);
  inputField.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) sendMessage();
  });

  document.querySelectorAll('.cb-starter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const text = btn.textContent;
      sendMessage(text);
    });
  });
});
