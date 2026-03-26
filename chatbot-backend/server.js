const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { Groq } = require('groq-sdk');
const { systemPrompt } = require('./prompt');

const app = express();
const port = process.env.PORT || 3000;

// Configuración de CORS
// IMPORTANTE: En producción puedes especificar los dominios permitidos 
// ej: app.use(cors({ origin: 'https://midominio.com' }))
app.use(cors());
app.use(express.json());

// Inicializar el cliente de Groq.
// NOTA PARA MODIFICACIÓN FUTURA A CHATGPT (OPENAI):
// 1. Instalar openai: npm install openai
// 2. Importar: const { OpenAI } = require('openai');
// 3. Inicializar: const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

// Endpoint principal para el chatbot
app.post('/api/chat', async (req, res) => {
  try {
    const { messages, userProfile } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Faltan los mensajes o su formato es incorrecto.' });
    }

    // Construir el contexto basado en el formulario de perfilado
    let profileContext = '';
    if (userProfile) {
      profileContext = `[DATOS DEL USUARIO - FORMULARIO DE INICIO]\n`;
      if (userProfile.age) profileContext += `- Edad o rango: ${userProfile.age}\n`;
      if (userProfile.tourismType) profileContext += `- Tipo de turismo: ${userProfile.tourismType}\n`;
      if (userProfile.interests) profileContext += `- Intereses en la zona: ${userProfile.interests}\n`;
      if (userProfile.travelers) profileContext += `- Número de viajeros: ${userProfile.travelers}\n`;
      if (userProfile.budget) profileContext += `- Presupuesto orientativo: ${userProfile.budget}\n`;
      if (userProfile.specialNeeds) profileContext += `- Necesidades especiales: ${userProfile.specialNeeds}\n`;
      profileContext += `\nINSTRUCCIÓN EXTRA: Usa obligatoriamente esta información para personalizar tus respuestas, ofrecer recomendaciones alineadas a este perfil y guiar la conversación de forma personalizada.\n`;
    }

    // Preparar los mensajes del sistema incluyendo el System Prompt base y el perfil del usuario
    const apiMessages = [
      { role: 'system', content: systemPrompt },
      { role: 'system', content: profileContext },
      ...messages
    ];

    // NOTA PARA MODIFICACIÓN FUTURA A CHATGPT (OPENAI):
    // const completion = await openai.chat.completions.create({
    //   model: 'gpt-4o', // Puedes cambiar el modelo aquí
    //   messages: apiMessages,
    //   temperature: 0.7,
    // });
    
    // Llamada a la API de Groq
    const completion = await groq.chat.completions.create({
      messages: apiMessages,
      model: process.env.GROQ_MODEL || 'llama3-70b-8192',
      temperature: 0.7,
      max_tokens: 1000,
    });

    const botResponse = completion.choices[0]?.message?.content || 'Lo siento, no he podido procesar tu solicitud adecuadamente. ¿Puedes intentarlo de nuevo?';
    
    res.json({ message: botResponse });

  } catch (error) {
    console.error('Error al comunicarse con la API de IA:', error);
    res.status(500).json({ error: 'Ha ocurrido un error al procesar tu solicitud en el servidor.' });
  }
});

app.listen(port, () => {
  console.log(`Servidor de Chatbot iniciado en http://localhost:${port}`);
  console.log(`Endpoint disponible en POST http://localhost:${port}/api/chat`);
});
