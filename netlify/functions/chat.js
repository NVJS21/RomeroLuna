const { systemPrompt } = require('./prompt');

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_MODEL = process.env.OPENAI_MODEL;

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type': 'application/json',
};

const SHEET_1_URL = 'https://docs.google.com/spreadsheets/d/1M6IoNfzbTuxi_i9ydF9OhdMOsG2ZaPbc6nORxwWjazw/export?format=csv';
const SHEET_2_URL = 'https://docs.google.com/spreadsheets/d/1qQlEnTWQh8bGtdcxfK_aQxqCEqd_SoaTrATslGzzxSU/export?format=csv';

exports.handler = async (event) => {
  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: CORS_HEADERS, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers: CORS_HEADERS, body: JSON.stringify({ error: 'Método no permitido.' }) };
  }

  try {
    const { messages, userProfile } = JSON.parse(event.body || '{}');

    if (!messages || !Array.isArray(messages)) {
      return {
        statusCode: 400,
        headers: CORS_HEADERS,
        body: JSON.stringify({ error: 'Faltan los mensajes o su formato es incorrecto.' }),
      };
    }

    // Build user profile context
    let profileContext = '';
    if (userProfile) {
      profileContext = '[DATOS DEL USUARIO - FORMULARIO DE INICIO]\n';
      if (userProfile.age)          profileContext += `- Edad o rango: ${userProfile.age}\n`;
      if (userProfile.tourismType)  profileContext += `- Tipo de turismo: ${userProfile.tourismType}\n`;
      if (userProfile.interests)    profileContext += `- Intereses en la zona: ${userProfile.interests}\n`;
      if (userProfile.travelers)    profileContext += `- Número de viajeros: ${userProfile.travelers}\n`;
      profileContext += '\nINSTRUCCIÓN EXTRA: Usa obligatoriamente esta información para personalizar tus respuestas.\n';
    }

    // Fetch Google Sheets data for dynamic knowledge base
    let dynamicKnowledge = '\n\n--- DATOS DE LUGARES, RESTAURANTES Y EXCURSIONES RECOMENDADOS (ACTUALIZADO) ---\n\n';
    try {
      const [res1, res2] = await Promise.all([
        fetch(SHEET_1_URL),
        fetch(SHEET_2_URL)
      ]);
      if (res1.ok && res2.ok) {
        const csv1 = await res1.text();
        const csv2 = await res2.text();
        dynamicKnowledge += 'HOJA 1 (Lugares y excursiones):\n' + csv1 + '\n\n';
        dynamicKnowledge += 'HOJA 2 (Restaurantes, Tapas y Desayunos):\n' + csv2 + '\n\n';
      } else {
        console.error('Error fetching one of the sheets by HTTP status.');
      }
    } catch (e) {
      console.error('Network error fetching Google Sheets:', e);
    }

    const apiMessages = [
      { role: 'system', content: systemPrompt + dynamicKnowledge },
      ...(profileContext ? [{ role: 'system', content: profileContext }] : []),
      ...messages,
    ];

    // Call OpenAI REST directly (no SDK needed — avoids bundling issues)
    const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: OPENAI_MODEL,
        messages: apiMessages,
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    if (!openaiRes.ok) {
      const errText = await openaiRes.text();
      console.error('OpenAI error:', errText);
      return {
        statusCode: 502,
        headers: CORS_HEADERS,
        body: JSON.stringify({ error: 'Error al conectar con el servicio de IA.' }),
      };
    }

    const data = await openaiRes.json();
    const botResponse = data.choices?.[0]?.message?.content
      || 'Lo siento, no he podido procesar tu solicitud. ¿Puedes intentarlo de nuevo?';

    return {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: JSON.stringify({ message: botResponse }),
    };

  } catch (error) {
    console.error('Function error:', error);
    return {
      statusCode: 500,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: 'Ha ocurrido un error interno en el servidor.' }),
    };
  }
};
