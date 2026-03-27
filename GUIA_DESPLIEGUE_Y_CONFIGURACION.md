# 🚀 Guía de Despliegue y Configuración: Chatbot Romero Luna

Este documento contiene las instrucciones necesarias para que el administrador/jefe pueda poner en producción el chatbot y realizar el cambio de proveedor de Inteligencia Artificial (de Groq a OpenAI/ChatGPT).

---

## 🛠️ 1. Cambio de IA: De Groq a OpenAI (ChatGPT)

Si desea dejar de usar Groq y pasar a usar **ChatGPT (OpenAI)**, siga estos pasos:

### Paso A: Obtener la API Key
1. Vaya a [OpenAI Platform](https://platform.openai.com/).
2. Cree una nueva **Secret Key**.

### Paso B: Configurar el archivo `.env`
Abra el archivo `chatbot-backend/.env` y realice los siguientes cambios:
1. Elimine o comente la línea de `GROQ_API_KEY`.
2. Añada su clave de OpenAI:
   ```env
   OPENAI_API_KEY=tu_clave_api_aqui
   PORT=(Puerto del servidor)
   ```

### Paso C: Implementación en el código
El servidor está preparado para ambos. Si decide usar **Node.js** (recomendado para producción), el archivo `server.js` ya contiene comentarios marcados como `NOTA PARA MODIFICACIÓN FUTURA A CHATGPT`. Solo debe descomentar la sección de OpenAI y comentar la de Groq.

---

## 🌐 2. Despliegue en Producción (Render.com)

Para que el chatbot funcione en la web real sin depender de su ordenador personal, el backend debe estar subido a un servidor 24/7. Recomendamos **Render.com** por ser gratuito y sencillo.

### Pasos para el despliegue:
1. **Crear cuenta:** Regístrese en [Render.com](https://render.com/) y conecte su cuenta de GitHub.
2. **Nuevo Web Service:** Pulse en "New +" > "Web Service".
3. **Seleccionar Repositorio:** Elija el repositorio `RomeroLuna`.
4. **Configuración:**
   - **Root Directory:** `chatbot-backend`
   - **Runtime:** `Node` (o `Python` si prefiere seguir con el script actual).
   - **Build Command:** `npm install`
   - **Start Command:** `node server.js`
5. **Variables de Entorno (CRÍTICO):** 
   Vaya a la pestaña "Env Vars" en Render y añada:
   - `OPENAI_API_KEY` = (Su clave de OpenAI)
   - `PORT` = (Puerto del servidor)


---

## 🔗 3. Conectar la Web con el nuevo Servidor

Una vez que Render termine de desplegar, le dará una URL pública (ejemplo: `https://chatbot-romeroluna.onrender.com`).

Para terminar la conexión:
1. Abra el archivo `js/chatbot.js` en su proyecto.
2. Localice la línea 89:
   ```javascript
   const apiUrl = 'http://localhost:3000/api/chat'; 
   ```
3. Sustituya `http://localhost:3000/api/chat` por su nueva URL de Render:
   ```javascript
   const apiUrl = 'https://chatbot-romeroluna.onrender.com/api/chat';
   ```
4. Guarde y suba este cambio a GitHub/Netlify.

---

## 🔒 4. Seguridad
- **IMPORTANTE:** Nunca suba el archivo `.env` real a GitHub. El proyecto ya incluye un `.gitignore` que protege este archivo. Las claves siempre deben configurarse directamente en el panel de control de Render/Netlify.
- El servidor tiene activado **CORS**, lo que significa que solo aceptará peticiones de su dominio oficial si así lo configura en `server.js`.

---
*Documentación generada para la administración de Apartamentos Romero Luna.*
