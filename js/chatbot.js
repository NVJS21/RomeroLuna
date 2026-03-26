document.addEventListener('DOMContentLoaded', () => {
  // Inject HTML structure into the body
  const widgetHTML = `
    <div id="chatbot-widget">
      <!-- Chatbot Popup -->
      <div id="chatbot-popup">
        <div id="chatbot-header">
          <span>Asistente Virtual Romero Luna</span>
          <button id="chatbot-close">&times;</button>
        </div>
        
        <!-- Profiling Form -->
        <div id="chatbot-form-container">
          <h3>¡Hola! Para ayudarte mejor, cuéntame un poco sobre tu viaje:</h3>
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
            <button type="submit" id="chatbot-start-btn">Comenzar chat</button>
          </form>
        </div>

        <!-- Chat Interface -->
        <div id="chatbot-chat-container">
          <div id="chatbot-messages">
            <!-- Messages will appear here -->
          </div>
          <div id="chatbot-input-area">
            <input type="text" id="chatbot-input" placeholder="Escribe tu mensaje..." autocomplete="off">
            <button id="chatbot-send-btn">&#10148;</button>
          </div>
        </div>
      </div>

      <!-- Floating Button -->
      <button id="chatbot-trigger">
        💬
      </button>
    </div>
  `;

  document.body.insertAdjacentHTML('beforeend', widgetHTML);

  // Variables
  const triggerBtn = document.getElementById('chatbot-trigger');
  const popup = document.getElementById('chatbot-popup');
  const closeBtn = document.getElementById('chatbot-close');
  const formContainer = document.getElementById('chatbot-form-container');
  const chatContainer = document.getElementById('chatbot-chat-container');
  const profileForm = document.getElementById('chatbot-form');
  const messagesDiv = document.getElementById('chatbot-messages');
  const inputField = document.getElementById('chatbot-input');
  const sendBtn = document.getElementById('chatbot-send-btn');

  let userProfile = null;
  let chatHistory = [];
  
  // En producción, debería ser la URL del servidor backend desplegado
  // Ejemplo: const apiUrl = 'https://mi-backend.com/api/chat';
  const apiUrl = 'http://localhost:3000/api/chat'; 

  // Toggle Popup
  triggerBtn.addEventListener('click', () => {
    popup.style.display = popup.style.display === 'flex' ? 'none' : 'flex';
  });

  closeBtn.addEventListener('click', () => {
    popup.style.display = 'none';
  });

  // Handle Form Submission
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

    // Start Chat
    addMessage('bot', '¡Gracias! 😊 He guardado tus preferencias. ¿En qué puedo ayudarte hoy? ¿Buscas información sobre algún apartamento en concreto o recomendaciones de la ciudad?');
  });

  // Handle Chat Sending
  const sendMessage = async () => {
    const text = inputField.value.trim();
    if (!text) return;

    addMessage('user', text);
    inputField.value = '';
    
    // Add to history
    chatHistory.push({ role: 'user', content: text });

    // Show loading
    const loadingId = 'loading-' + Date.now();
    addLoading(loadingId);
    
    inputField.disabled = true;
    sendBtn.disabled = true;

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: chatHistory, userProfile })
      });

      const data = await response.json();
      removeLoading(loadingId);

      if (data.message) {
        addMessage('bot', data.message);
        chatHistory.push({ role: 'assistant', content: data.message });
      } else {
        addMessage('bot', 'Error del servidor. Es probable que la API Key de Groq haya caducado (Revisa iniciar_chatbot.bat).');
      }
    } catch (error) {
      console.error('Error in chatbot:', error);
      removeLoading(loadingId);
      addMessage('bot', 'Error de conexión. Asegúrate de ejecutar "iniciar_chatbot.bat" antes de probar el chat.');
    } finally {
      inputField.disabled = false;
      sendBtn.disabled = false;
      inputField.focus();
    }
  };

  sendBtn.addEventListener('click', sendMessage);
  inputField.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMessage();
  });

  // UI Helpers
  function addMessage(sender, text) {
    const msg = document.createElement('div');
    msg.classList.add('chatbot-message', sender);
    // Para simplificar la inyección de saltos de línea y formateo basico
    msg.innerHTML = text.replace(/\\n/g, '<br>').replace(/\\*\\*(.*?)\\*\\*/g, '<strong>$1</strong>');
    messagesDiv.appendChild(msg);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
  }

  function addLoading(id) {
    const msg = document.createElement('div');
    msg.classList.add('chatbot-loading');
    msg.id = id;
    msg.textContent = 'Escribiendo...';
    messagesDiv.appendChild(msg);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
  }

  function removeLoading(id) {
    const el = document.getElementById(id);
    if (el) el.remove();
  }
});
