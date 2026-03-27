# Documentación del Chatbot de Romero Luna

## Estructura del Proyecto

El sistema del chatbot está dividido en dos partes principales para garantizar la seguridad de la API Key:
1. **Frontend (`css/chatbot.css` y `js/chatbot.js`)**: El widget visual que se inyecta en la web.
2. **Backend (`chatbot-backend/`)**: Un servidor intermedio en Node.js que procesa el formulario, genera el contexto y llama de forma segura a la API de Groq usando el Prompt especializado.

---

## 1. Frontend - Incrustar en cualquier web

Para utilizar el widget en cualquier página HTML, asegúrate de incluir las siguientes etiquetas:

**En el `<head>`**:
```html
<link rel="stylesheet" href="css/chatbot.css" />
```

**Justo antes del cierre `</body>`**:
```html
<script src="js/chatbot.js"></script>
```

---

## 2. Backend - Iniciar el Servidor API

El backend es responsable de gestionar las peticiones a la API para no exponer las claves.

### Pasos para ejecutar localmente:
1. Abre tu terminal y navega a la carpeta del backend:
   ```bash
   cd "chatbot-backend"
   ```
2. Instala las dependencias:
   ```bash
   npm install
   ```
3. Configura las claves API:
   Abre el archivo `.env` en esa misma carpeta e introduce tu API Key:
   ```env
   GROQ_API_KEY=tu_api_key_aqui
   ```
4. Inicia el servidor:
   ```bash
   npm start
   ```

---

## 3. Seguridad y Buenas Prácticas (API KEY)

### ⚠️ ¿Por qué un Backend?
Nunca deben introducirse claves de APIs (como Groq, OpenAI o Anthropic) en el código Javascript del frontend (`chatbot.js`). Si se hiciera, cualquier usuario que visite la web podría ver la clave, robarla y consumirte todo el saldo o cuota.
El backend actúa como un muro, recibiendo el texto del usuario y realizando la petición internamente de forma segura.

### 📝 Archivo `.env`
- **Nunca envíes el archivo `.env` a un repositorio público (GitHub, GitLab, etc)**.
- El archivo `.env` ya ha sido excluido mediante buenas prácticas (asegúrate de que esté en un `.gitignore`).
- Usa como referencia el archivo `.env.example` que sí se puede compartir a tu equipo.

---

## 4. Sustituir Groq por OpenAI (ChatGPT) 

Si tu jefe desea sustituir Groq por ChatGPT en el futuro, es muy simple y el código ya viene preparado con comentarios indicándolo:
1. Navega a `chatbot-backend/` e instala la librería de OpenAI: 
   ```bash
   npm install openai
   ```
2. En `.env`, reemplaza `GROQ_API_KEY` por tu clave de OpenAI:
   ```env
   OPENAI_API_KEY=tu_clave_aqui
   ```
3. Mutea/comenta las líneas de código de `Groq` dentro de `server.js` y sigue los comentarios marcados como `NOTA PARA MODIFICACIÓN FUTURA A CHATGPT`. Sustituye la instanciación de Groq por OpenAI y adapta ligeramente el endpoint de la API.
