import http.server
import socketserver
import json
import urllib.request
import os
import logging
import ssl

logging.basicConfig(filename='backend_debug.log', level=logging.DEBUG, 
                    format='%(asctime)s %(levelname)s %(message)s')
logging.info('Server script started.')

# 1. Leer .env manualmente
env_vars = {}
try:
    with open('.env', 'r', encoding='utf-8') as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith('#'):
                parts = line.split('=', 1)
                if len(parts) == 2:
                    env_vars[parts[0].strip()] = parts[1].strip()
except Exception as e:
    print("No se pudo leer .env:", e)

OPENAI_API_KEY = env_vars.get('OPENAI_API_KEY', 'AQUI_VA_TU_API_KEY')
OPENAI_MODEL   = env_vars.get('OPENAI_MODEL', 'gpt-4o-mini')
PORT           = int(env_vars.get('PORT', 3000))

# 2. Leer prompt.js para reutilizar el mismo prompt
try:
    with open('prompt.js', 'r', encoding='utf-8') as f:
        content = f.read()
        start = content.find('`') + 1
        end   = content.rfind('`')
        if start > 0 and end > start:
            SYSTEM_PROMPT = content[start:end]
        else:
            SYSTEM_PROMPT = "Eres un asistente virtual de apartamentos turísticos."
except:
    SYSTEM_PROMPT = "Eres un asistente virtual de apartamentos turísticos."

class ChatbotHandler(http.server.SimpleHTTPRequestHandler):
    def log_message(self, format, *args):
        logging.info("%s - - [%s] %s" % (self.address_string(), self.log_date_time_string(), format%args))

    def do_OPTIONS(self):
        self.send_response(200, "ok")
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

    def do_POST(self):
        try:
            if self.path == '/api/chat':
                content_length = int(self.headers['Content-Length'])
                post_data      = self.rfile.read(content_length)
                data           = json.loads(post_data)

                messages    = data.get('messages', [])
                userProfile = data.get('userProfile', None)
                use_stream  = data.get('stream', True)   # default True

                profileContext = ""
                if userProfile:
                    profileContext = "[DATOS DEL USUARIO - FORMULARIO DE INICIO]\n"
                    if userProfile.get('age'):         profileContext += f"- Edad: {userProfile['age']}\n"
                    if userProfile.get('tourismType'): profileContext += f"- Tipo de turismo: {userProfile['tourismType']}\n"
                    if userProfile.get('interests'):   profileContext += f"- Intereses: {userProfile['interests']}\n"
                    if userProfile.get('travelers'):   profileContext += f"- Viajeros: {userProfile['travelers']}\n"
                    profileContext += "\nINSTRUCCIÓN EXTRA: Usa obligatoriamente esta información.\n"

                api_messages = [{"role": "system", "content": SYSTEM_PROMPT}]
                if profileContext:
                    api_messages.append({"role": "system", "content": profileContext})
                api_messages += messages

                req_payload = {
                    "model":       OPENAI_MODEL,
                    "messages":    api_messages,
                    "temperature": 0.7,
                    "max_tokens":  600,
                    "stream":      False,
                }

                req_data = json.dumps(req_payload).encode('utf-8')
                req = urllib.request.Request(
                    "https://api.openai.com/v1/chat/completions",
                    data=req_data,
                    headers={
                        "Authorization": f"Bearer {OPENAI_API_KEY}",
                        "Content-Type":  "application/json",
                        "User-Agent":    "RomeroLunaChatbot/2.0"
                    }
                )

                try:
                    ctx = ssl._create_unverified_context()
                    with urllib.request.urlopen(req, context=ctx) as response:
                        resp_data   = json.loads(response.read().decode('utf-8'))
                        bot_message = resp_data['choices'][0]['message']['content']

                        self.send_response(200)
                        self.send_header('Access-Control-Allow-Origin', '*')
                        self.send_header('Content-Type', 'application/json')
                        self.end_headers()
                        self.wfile.write(json.dumps({"message": bot_message}).encode('utf-8'))

                except Exception as e:
                    import traceback
                    error_msg = traceback.format_exc()
                    try:
                        if hasattr(e, 'read'):
                            body = e.read().decode('utf-8')
                            logging.error(f"OpenAI Error Body: {body}")
                            error_msg += f"\nBody: {body}"
                    except:
                        pass
                    logging.error("Error OpenAI API: " + error_msg)
                    try:
                        self.send_response(500)
                        self.send_header('Access-Control-Allow-Origin', '*')
                        self.send_header('Content-Type', 'application/json')
                        self.end_headers()
                        self.wfile.write(json.dumps({"error": "Error interno", "details": error_msg}).encode('utf-8'))
                    except:
                        pass
            else:
                self.send_response(404)
                self.end_headers()

        except Exception as top_e:
            import traceback
            error_msg = traceback.format_exc()
            logging.error("Server top-level error: " + error_msg)
            try:
                self.send_response(500)
                self.send_header('Access-Control-Allow-Origin', '*')
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({"error": "Error interno", "details": error_msg}).encode('utf-8'))
            except:
                pass

socketserver.TCPServer.allow_reuse_address = True
try:
    with socketserver.TCPServer(("", PORT), ChatbotHandler) as httpd:
        print(f"Servidor Chatbot Romero Luna corriendo en http://localhost:{PORT}")
        httpd.serve_forever()
except Exception as e:
    print(f"Error al iniciar: {e}")
