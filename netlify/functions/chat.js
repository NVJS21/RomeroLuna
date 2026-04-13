const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_MODEL = process.env.OPENAI_MODEL;

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type': 'application/json',
};

const DOC_PROMPTS = 'https://docs.google.com/document/d/1zrdemMNFUr_lDvUyUMtbbU-NKSceebeZ3HqASA4DtOA/export?format=txt';
const DOC_SOHO = 'https://docs.google.com/document/d/1neF99GgDqwbVo6h8DLWc8OYwfSDGlimKstFaYlFfJAs/export?format=txt';
const DOC_HISTORICO = 'https://docs.google.com/document/d/1vBfbAixcM8XwBdnH9wiqd5vkaEY80sqLqVy7EVyXeQE/export?format=txt';
const DOC_COMUN = 'https://docs.google.com/document/d/100wAMPfAh9rrJhZAF6StT8EQZnYEGYq0M23fzvk6Lk8/export?format=txt';

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
      if (userProfile.location)     profileContext += `- Ubicación del apartamento de interés: ${userProfile.location}\n`;
      if (userProfile.interests)    profileContext += `- Intereses en la zona: ${userProfile.interests}\n`;
      if (userProfile.travelers)    profileContext += `- Número de viajeros: ${userProfile.travelers}\n`;
      
      profileContext += '\nINSTRUCCIÓN EXTRA DE PRIORIZACIÓN: Usa obligatoriamente esta información para personalizar tus respuestas.\n';
      profileContext += '\nREGLA ESTRICTA 1: CUANDO EL USUARIO PIDA RECOMENDACIONES DE LUGARES O RESTAURANTES, DEBES RECOMENDAR *ÚNICA Y EXCLUSIVAMENTE* LOS LOCALES QUE TIENEN UN "5" EN LA COLUMNA DE "Recomendación Anfitrion en su categoría". ES UNA REGLA MUY ESTRICTA. NO MENCIONES LOCALES CON UNA VALORACIÓN INFERIOR A 5 JAMÁS, A MENOS QUE EL USUARIO PREGUNTE ESPECÍFICAMENTE POR UN LOCAL EN CONCRETO, O NO HAYA NINGUNO CON 5 EN ESA CATEGORÍA.\n';
      profileContext += '\nREGLA ESTRICTA 2: Devuelve SIEMPRE los enlaces utilizando formato MarkDown para que sean clicables. Ejemplo: [Nombre del Sitio](https://link.com) \n';
    }

    // Fetch All Google Docs and Sheets data for dynamic knowledge base
    let dynamicKnowledge = '';
    try {
      const responses = await Promise.all([
        fetch(DOC_PROMPTS),
        fetch(DOC_SOHO),
        fetch(DOC_HISTORICO),
        fetch(DOC_COMUN),
        fetch(SHEET_1_URL),
        fetch(SHEET_2_URL)
      ]);
      
      const texts = await Promise.all(responses.map(r => r.ok ? r.text() : ''));
      
      dynamicKnowledge += texts[0] + '\n\n';
      dynamicKnowledge += '--- KNOWLEDGE BASE APARTAMENTO ROMERO LUNA TEATRO SOHO ---\n' + texts[1] + '\n\n';
      dynamicKnowledge += '--- KNOWLEDGE BASE APARTAMENTOS ROMERO LUNA CENTRO HISTORICO ---\n' + texts[2] + '\n\n';
      dynamicKnowledge += '--- KNOWLEDGE BASE APARTAMENTOS ROMERO LUNA INFORMACION COMUN ---\n' + texts[3] + '\n\n';
      dynamicKnowledge += '--- DATOS DE LUGARES, RESTAURANTES Y EXCURSIONES RECOMENDADOS (ACTUALIZADO) ---\n\n';
      dynamicKnowledge += 'HOJA 1 (Lugares y excursiones):\n' + texts[4] + '\n\n';
      dynamicKnowledge += 'HOJA 2 (Restaurantes, Tapas y Desayunos):\n' + texts[5] + '\n\n';

    } catch (e) {
      console.error('Network error fetching Google Data:', e);
    }

    const apiMessages = [
      { role: 'system', content: dynamicKnowledge },
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
