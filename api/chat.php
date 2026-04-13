<?php
// Permitir CORS
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["error" => "Método no permitido."]);
    exit();
}

// ==============================================================================
// CONFIGURACIÓN: Reemplazar 'TU_API_KEY_AQUI' con la clave real de OpenAI.
// ==============================================================================
$OPENAI_API_KEY = "TU_API_KEY_AQUI"; 

// Si tienes la clave en una variable de entorno en tu servidor Arsys,
// descomenta la siguiente línea y borra la de arriba:
// $OPENAI_API_KEY = getenv('OPENAI_API_KEY') ?: "TU_API_KEY_AQUI";

$OPENAI_MODEL = "gpt-4o-mini"; // Cambia este modelo según prefieras (ej: "gpt-4o")

// Enlaces a los documentos base de conocimiento
$DOC_PROMPTS = 'https://docs.google.com/document/d/1zrdemMNFUr_lDvUyUMtbbU-NKSceebeZ3HqASA4DtOA/export?format=txt';
$DOC_SOHO = 'https://docs.google.com/document/d/1neF99GgDqwbVo6h8DLWc8OYwfSDGlimKstFaYlFfJAs/export?format=txt';
$DOC_HISTORICO = 'https://docs.google.com/document/d/1vBfbAixcM8XwBdnH9wiqd5vkaEY80sqLqVy7EVyXeQE/export?format=txt';
$DOC_COMUN = 'https://docs.google.com/document/d/100wAMPfAh9rrJhZAF6StT8EQZnYEGYq0M23fzvk6Lk8/export?format=txt';
$SHEET_1_URL = 'https://docs.google.com/spreadsheets/d/1M6IoNfzbTuxi_i9ydF9OhdMOsG2ZaPbc6nORxwWjazw/export?format=csv';
$SHEET_2_URL = 'https://docs.google.com/spreadsheets/d/1qQlEnTWQh8bGtdcxfK_aQxqCEqd_SoaTrATslGzzxSU/export?format=csv';

// Función para hacer GETs en paralelo en PHP usando cURL multi
function fetchUrls($urls) {
    if (!function_exists('curl_multi_init')) {
        // Fallback lento si no hay curl_multi
        $results = [];
        foreach ($urls as $url) {
            $results[] = file_get_contents($url) ?: '';
        }
        return $results;
    }

    $mh = curl_multi_init();
    $curl_array = array();
    foreach($urls as $i => $url) {
        $curl_array[$i] = curl_init($url);
        curl_setopt($curl_array[$i], CURLOPT_RETURNTRANSFER, true);
        curl_setopt($curl_array[$i], CURLOPT_FOLLOWLOCATION, true);
        curl_setopt($curl_array[$i], CURLOPT_SSL_VERIFYPEER, false);
        curl_multi_add_handle($mh, $curl_array[$i]);
    }
    
    $running = null;
    do {
        curl_multi_exec($mh, $running);
        curl_multi_select($mh);
    } while($running > 0);
    
    $res = array();
    foreach($urls as $i => $url) {
        $res[$i] = curl_multi_getcontent($curl_array[$i]);
        curl_multi_remove_handle($mh, $curl_array[$i]);
    }
    curl_multi_close($mh);
    return $res;
}

try {
    $inputJSON = file_get_contents('php://input');
    $input = json_decode($inputJSON, true);

    $messages = isset($input['messages']) ? $input['messages'] : null;
    $userProfile = isset($input['userProfile']) ? $input['userProfile'] : null;

    if (!$messages || !is_array($messages)) {
        http_response_code(400);
        echo json_encode(["error" => "Faltan los mensajes o su formato es incorrecto."]);
        exit();
    }

    // Build user profile context
    $profileContext = '';
    if ($userProfile) {
        $profileContext = "[DATOS DEL USUARIO - FORMULARIO DE INICIO]\n";
        if (!empty($userProfile['age']))          $profileContext .= "- Edad o rango: {$userProfile['age']}\n";
        if (!empty($userProfile['tourismType']))  $profileContext .= "- Tipo de turismo: {$userProfile['tourismType']}\n";
        if (!empty($userProfile['location']))     $profileContext .= "- Ubicación del apartamento de interés: {$userProfile['location']}\n";
        if (!empty($userProfile['interests']))    $profileContext .= "- Intereses en la zona: {$userProfile['interests']}\n";
        if (!empty($userProfile['travelers']))    $profileContext .= "- Número de viajeros: {$userProfile['travelers']}\n";
        
        $profileContext .= "\nINSTRUCCIÓN EXTRA DE PRIORIZACIÓN: Usa obligatoriamente esta información para personalizar tus respuestas.\n";
        $profileContext .= "\nREGLA ESTRICTA 1: CUANDO EL USUARIO PIDA RECOMENDACIONES DE LUGARES O RESTAURANTES, DEBES RECOMENDAR *ÚNICA Y EXCLUSIVAMENTE* LOS LOCALES QUE TIENEN UN \"5\" EN LA COLUMNA DE \"Recomendación Anfitrion en su categoría\". ES UNA REGLA MUY ESTRICTA. NO MENCIONES LOCALES CON UNA VALORACIÓN INFERIOR A 5 JAMÁS, A MENOS QUE EL USUARIO PREGUNTE ESPECÍFICAMENTE POR UN LOCAL EN CONCRETO, O NO HAYA NINGUNO CON 5 EN ESA CATEGORÍA.\n";
        $profileContext .= "\nREGLA ESTRICTA 2: Devuelve SIEMPRE los enlaces utilizando formato MarkDown para que sean clicables. Ejemplo: [Nombre del Sitio](https://link.com) \n";
    }

    // Fetch dynamic knowledge base
    $urlsToFetch = [$DOC_PROMPTS, $DOC_SOHO, $DOC_HISTORICO, $DOC_COMUN, $SHEET_1_URL, $SHEET_2_URL];
    $texts = fetchUrls($urlsToFetch);

    $dynamicKnowledge = "";
    $dynamicKnowledge .= $texts[0] . "\n\n";
    $dynamicKnowledge .= "--- KNOWLEDGE BASE APARTAMENTO ROMERO LUNA TEATRO SOHO ---\n" . $texts[1] . "\n\n";
    $dynamicKnowledge .= "--- KNOWLEDGE BASE APARTAMENTOS ROMERO LUNA CENTRO HISTORICO ---\n" . $texts[2] . "\n\n";
    $dynamicKnowledge .= "--- KNOWLEDGE BASE APARTAMENTOS ROMERO LUNA INFORMACION COMUN ---\n" . $texts[3] . "\n\n";
    $dynamicKnowledge .= "--- DATOS DE LUGARES, RESTAURANTES Y EXCURSIONES RECOMENDADOS (ACTUALIZADO) ---\n\n";
    $dynamicKnowledge .= "HOJA 1 (Lugares y excursiones):\n" . $texts[4] . "\n\n";
    $dynamicKnowledge .= "HOJA 2 (Restaurantes, Tapas y Desayunos):\n" . $texts[5] . "\n\n";

    $apiMessages = [
        ["role" => "system", "content" => $dynamicKnowledge]
    ];
    if ($profileContext) {
        $apiMessages[] = ["role" => "system", "content" => $profileContext];
    }
    foreach ($messages as $msg) {
        $apiMessages[] = $msg;
    }

    // OpenAI API Call
    $ch = curl_init('https://api.openai.com/v1/chat/completions');
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Content-Type: application/json',
        'Authorization: Bearer ' . $OPENAI_API_KEY
    ]);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode([
        "model" => $OPENAI_MODEL,
        "messages" => $apiMessages,
        "temperature" => 0.7,
        "max_tokens" => 1000
    ]));

    $openaiResponse = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    if ($httpCode !== 200) {
        http_response_code(502);
        echo json_encode(["error" => "Error al conectar con el servicio de IA.", "details" => json_decode($openaiResponse)]);
        exit();
    }

    $data = json_decode($openaiResponse, true);
    $botResponse = isset($data['choices'][0]['message']['content']) ? $data['choices'][0]['message']['content'] : 'Lo siento, no he podido procesar tu solicitud.';

    echo json_encode(["message" => $botResponse]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["error" => "Ha ocurrido un error interno en el servidor."]);
}
