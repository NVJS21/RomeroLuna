document.addEventListener('DOMContentLoaded', () => {
  // ─── Inject Bootstrap Icons (if not already loaded) ─────────────────────────
  if (!document.querySelector('link[href*="bootstrap-icons"]')) {
    const biLink = document.createElement('link');
    biLink.rel = 'stylesheet';
    biLink.href = 'https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css';
    document.head.appendChild(biLink);
  }

  // ─── Logo path ─────────────────────────────────────────────────────────────
  const LOGO_PATH = 'assets/romeroluna logo.png';

  // ─── HTML Structure ────────────────────────────────────────────────────────
  const widgetHTML = `
    <div id="chatbot-widget">
      <div id="chatbot-popup">
        <div id="chatbot-header">
          <div class="cb-header-bot">
            <img src="${LOGO_PATH}" alt="Romero Luna" class="cb-bot-avatar">
            <div class="cb-header-info">
              <span>Asistente Romero Luna</span>
              <small><i class="bi bi-circle-fill" style="font-size:6px; color:#66a307;"></i> En línea</small>
            </div>
          </div>
          <div class="cb-header-actions">
            <button id="chatbot-filter-btn" title="Preferencias de viaje"><i class="bi bi-sliders2"></i></button>
            <button id="chatbot-close" aria-label="Cerrar chat"><i class="bi bi-x-lg"></i></button>
          </div>
        </div>

        <!-- Profiling Form -->
        <div id="chatbot-form-container">
          <h3><i class="bi bi-hand-thumbs-up-fill" style="color:#66a307"></i> ¡Hola! Cuéntanos sobre tu viaje:</h3>
          <form id="chatbot-form">
            <div class="chatbot-form-group">
              <label>Rango de edad</label>
              <select id="cb-age">
                <option value="">Selecciona...</option>
                <option value="18-25">18-25 años</option>
                <option value="26-35">26-35 años</option>
                <option value="36-50">36-50 años</option>
                <option value="50+">Más de 50 años</option>
              </select>
            </div>
            <div class="chatbot-form-group">
              <label>Tipo de turismo</label>
              <select id="cb-type" required>
                <option value="">Selecciona...</option>
                <option value="Familiar">Familiar</option>
                <option value="Cultural">Cultural</option>
                <option value="Relax">Relax</option>
                <option value="Romántico">Romántico</option>
                <option value="Festivo">Festivo</option>
                <option value="Negocios">Negocios</option>
                <option value="Gastronómico">Gastronómico</option>
                <option value="Naturaleza">Naturaleza</option>
              </select>
            </div>
            <div class="chatbot-form-group">
              <label>Viajeros</label>
              <input type="number" id="cb-travelers" min="1" max="15" placeholder="Ej: 2" required>
            </div>
            <div class="chatbot-form-group">
              <label>Intereses o necesidades (Opcional)</label>
              <input type="text" id="cb-interests" placeholder="Ej: cerca del centro, mascotas, parking...">
            </div>
            <button type="submit" id="chatbot-start-btn">
              <i class="bi bi-chat-dots-fill"></i> Comenzar chat
            </button>
          </form>
        </div>

        <!-- Chat Interface -->
        <div id="chatbot-chat-container" style="display: flex;">
          <div id="cb-messages-wrapper">
             <div class="cb-watermark">
                <img src="${LOGO_PATH}" alt="Romero Luna Logo">
             </div>
             <div id="chatbot-messages">
                <!-- Starter Phrases -->
                <div id="chatbot-starter-container">
                  <p class="cb-starter-title">Preguntas frecuentes:</p>
                  <div class="cb-starter-pills">
                    <button class="cb-starter-btn">Dime buenos sitios para comer paella</button>
                    <button class="cb-starter-btn">¿Qué excursiones puedo hacer si tengo coche?</button>
                    <button class="cb-starter-btn">¿Cómo puedo llegar al museo Picasso?</button>
                  </div>
                </div>
             </div>
          </div>
          <div id="chatbot-input-area">
            <input type="text" id="chatbot-input" placeholder="Escribe tu mensaje..." autocomplete="off">
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

  // ─── Toggle Popup ────────────────────────────────────────────────────────────
  triggerBtn.addEventListener('click', () => {
    const isVisible = popup.style.display === 'flex';
    popup.style.display = isVisible ? 'none' : 'flex';

    // Show initial welcome if not already added
    if (!isVisible && !isWelcomeAdded) {
      addBotMessage('¡Hola! 👋 Soy tu asistente en Romero Luna. ¿En qué puedo ayudarte hoy?');
      isWelcomeAdded = true;
    }
  });

  closeBtn.addEventListener('click', () => {
    popup.style.display = 'none';
  });

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
      travelers: document.getElementById('cb-travelers').value,
      interests: document.getElementById('cb-interests').value,
    };
    formContainer.style.display = 'none';
    chatContainer.style.display = 'flex';
    addBotMessage('¡Genial! 😊 Ya tengo tus preferencias. ¿En qué puedo ayudarte? ¿Buscas apartamento o te cuento qué ver por la zona?');
  });

  // ─── Markdown → HTML parser (lightweight) ───────────────────────────────────
  function parseMarkdown(text) {
    // Escape HTML first
    let html = text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    // Bold **text** or __text__
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/__(.*?)__/g, '<strong>$1</strong>');

    // Italic *text* or _text_
    html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
    html = html.replace(/_(.*?)_/g, '<em>$1</em>');

    // Headings ### and ##
    html = html.replace(/^### (.+)$/gm, '<h4>$1</h4>');
    html = html.replace(/^## (.+)$/gm, '<h3>$1</h3>');

    // Unordered lists: - item or * item
    html = html.replace(/^[\-\*] (.+)$/gm, '<li>$1</li>');
    html = html.replace(/(<li>[\s\S]*?<\/li>)(\s*(?=<li>|$))/g, (m) => {
      return m;
    });
    // Wrap consecutive <li> in <ul>
    html = html.replace(/((<li>.*?<\/li>\s*)+)/g, '<ul>$1</ul>');

    // Ordered lists: 1. item
    html = html.replace(/^\d+\. (.+)$/gm, '<oli>$1</oli>');
    html = html.replace(/((<oli>.*?<\/oli>\s*)+)/g, (m) => {
      return '<ol>' + m.replace(/<oli>/g, '<li>').replace(/<\/oli>/g, '</li>') + '</ol>';
    });

    // Paragraphs: split by blank lines
    const blocks = html.split(/\n{2,}/);
    html = blocks.map(block => {
      block = block.trim();
      if (!block) return '';
      if (/^<(ul|ol|h[2-4])/.test(block)) return block;
      // Inline line breaks within a paragraph
      block = block.replace(/\n/g, '<br>');
      return '<p>' + block + '</p>';
    }).join('');

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
    label.textContent = 'Asistente';

    const bubble = document.createElement('div');
    bubble.className = 'chatbot-message bot';
    bubble.innerHTML = parseMarkdown(text);

    wrap.appendChild(label);
    wrap.appendChild(bubble);
    row.appendChild(avatar);
    row.appendChild(wrap);
    messagesDiv.appendChild(row);
    scrollToBottom();
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
    label.textContent = 'Tú';

    const bubble = document.createElement('div');
    bubble.className = 'chatbot-message user';
    bubble.textContent = text;

    wrap.appendChild(label);
    wrap.appendChild(bubble);
    row.appendChild(wrap);
    row.appendChild(avatar);
    messagesDiv.appendChild(row);
    scrollToBottom();
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
    scrollToBottom();
  }

  function hideTyping() {
    const row = document.getElementById('cb-typing-row');
    if (row) row.remove();
  }

  function scrollToBottom() {
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
  }

  // ─── Typewriter animation ──────────────────────────────────────────────────
  function typewriterEffect(container, htmlContent, onComplete) {
    // We animate character by character over the plain text, but render final HTML.
    // Strategy: progressively reveal the final parsed HTML by slicing the raw text
    // and re-parsing at each step, but that is expensive. Instead we render the
    // full HTML immediately into a hidden clone, then animate the text nodes.
    container.innerHTML = htmlContent;
    container.classList.add('streaming');

    // Collect all text nodes
    const allTextNodes = [];
    const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT);
    let node;
    while ((node = walker.nextNode())) {
      allTextNodes.push({ node, original: node.textContent });
      node.textContent = '';
    }

    let nodeIdx = 0;
    let charIdx = 0;
    const speed = 14; // ms per character
    let lastTime = 0;

    function tick(timestamp) {
      if (timestamp - lastTime < speed) {
        requestAnimationFrame(tick);
        return;
      }
      lastTime = timestamp;

      if (nodeIdx >= allTextNodes.length) {
        container.classList.remove('streaming');
        if (onComplete) onComplete();
        scrollToBottom();
        return;
      }

      const current = allTextNodes[nodeIdx];
      current.node.textContent = current.original.slice(0, charIdx + 1);
      charIdx++;
      scrollToBottom();

      if (charIdx >= current.original.length) {
        nodeIdx++;
        charIdx = 0;
      }
      requestAnimationFrame(tick);
    }

    requestAnimationFrame(tick);
  }

  // ─── Send Message ──────────────────────────────────────────────────────────
  const sendMessage = async (presetText = null) => {
    // If presetText is an event object (from click listener), ignore it and use input value
    const text = (typeof presetText === 'string') ? presetText : inputField.value.trim();
    if (!text) return;

    // Only clear input if we are NOT using a preset button
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
        const errData = await response.json().catch(() => ({}));
        console.error('Server error:', errData);
        addBotMessage('⚠️ Ha habido un problema en el servidor. Inténtalo de nuevo en un momento.');
        return;
      }

      const data = await response.json();
      if (data.message) {
        // Create the row + bubble, then animate the text
        const row = document.createElement('div');
        row.className = 'cb-message-row bot';

        const avatar = document.createElement('img');
        avatar.src = LOGO_PATH; avatar.alt = 'Bot'; avatar.className = 'cb-avatar';

        const wrap = document.createElement('div'); wrap.className = 'cb-message-wrap';
        const label = document.createElement('div'); label.className = 'cb-sender-label'; label.textContent = 'Asistente';
        const bubble = document.createElement('div'); bubble.className = 'chatbot-message bot streaming';

        wrap.appendChild(label); wrap.appendChild(bubble);
        row.appendChild(avatar); row.appendChild(wrap);
        messagesDiv.appendChild(row);
        scrollToBottom();

        typewriterEffect(bubble, parseMarkdown(data.message), () => {
          chatHistory.push({ role: 'assistant', content: data.message });
          inputField.disabled = false;
          sendBtn.disabled = false;
          inputField.focus();
        });
        // Don't re-enable inputs here — done inside typewriter callback
        return;

      } else {
        addBotMessage('⚠️ Respuesta inesperada del servidor. Inténtalo de nuevo.');
      }

    } catch (error) {
      hideTyping();
      console.error('Chatbot error:', error);
      addBotMessage('❌ Error de conexión. Asegúrate de que el servidor está activo (iniciar_chatbot.bat).');
    }

    inputField.disabled = false;
    sendBtn.disabled = false;
    inputField.focus();
  };

  sendBtn.addEventListener('click', sendMessage);
  inputField.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) sendMessage();
  });

  // ─── Starter Phrases Interaction ───────────────────────────────────────────
  document.querySelectorAll('.cb-starter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const text = btn.textContent;
      sendMessage(text);
      // Hide starters after first use
      if (starterContainer) starterContainer.style.display = 'none';
    });
  });
});
