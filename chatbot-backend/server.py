import http.server
import socketserver
import json
import urllib.request
import os
import logging

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

GROQ_API_KEY = env_vars.get('GROQ_API_KEY', 'AQUI_VA_TU_API_KEY')
GROQ_MODEL = env_vars.get('GROQ_MODEL', 'llama3-70b-8192')
PORT = int(env_vars.get('PORT', 3000))

# 2. Leer prompt.js para reutilizar el mismo prompt
try:
    with open('prompt.js', 'r', encoding='utf-8') as f:
        content = f.read()
        start = content.find('`') + 1
        end = content.rfind('`')
        SYSTEM_PROMPT = content[start:end]
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
                post_data = self.rfile.read(content_length)
                data = json.loads(post_data)
                
                messages = data.get('messages', [])
                userProfile = data.get('userProfile', None)
                
                profileContext = ""
                if userProfile:
                    profileContext = "[DATOS DEL USUARIO - FORMULARIO DE INICIO]\n"
                    if userProfile.get('age'): profileContext += f"- Edad: {userProfile['age']}\n"
                    if userProfile.get('tourismType'): profileContext += f"- Tipo de turismo: {userProfile['tourismType']}\n"
                    if userProfile.get('interests'): profileContext += f"- Intereses: {userProfile['interests']}\n"
                    if userProfile.get('travelers'): profileContext += f"- Viajeros: {userProfile['travelers']}\n"
                    profileContext += "\nINSTRUCCIÓN EXTRA: Usa obligatoriamente esta información para personalizar tus respuestas.\n"

                api_messages = [{"role": "system", "content": SYSTEM_PROMPT}]
                if profileContext:
                    api_messages.append({"role": "system", "content": profileContext})
                
                api_messages += messages
                
                req_data = json.dumps({
                    "model": GROQ_MODEL,
                    "messages": api_messages,
                    "temperature": 0.7,
                    "max_tokens": 1000
                }).encode('utf-8')
                
                req = urllib.request.Request(
                    "https://api.groq.com/openai/v1/chat/completions",
                    data=req_data,
                    headers={
                        "Authorization": f"Bearer {GROQ_API_KEY}",
                        "Content-Type": "application/json",
                        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
                    }
                )
                
                try:
                    import ssl
                    context = ssl._create_unverified_context()
                    with urllib.request.urlopen(req, context=context) as response:
                        resp_data = json.loads(response.read().decode('utf-8'))
                        bot_message = resp_data['choices'][0]['message']['content']
                        
                        self.send_response(200)
                        self.send_header('Access-Control-Allow-Origin', '*')
                        self.send_header('Content-Type', 'application/json')
                        self.end_headers()
                        self.wfile.write(json.dumps({"message": bot_message}).encode('utf-8'))
                except Exception as e:
                    import traceback
                    error_msg = traceback.format_exc()
                    logging.error("Error Groq API: " + error_msg)
                    try:
                        error_msg += " | " + e.read().decode()
                    except: pass
                    self.send_response(500)
                    self.send_header('Access-Control-Allow-Origin', '*')
                    self.send_header('Content-Type', 'application/json')
                    self.end_headers()
                    self.wfile.write(json.dumps({"error": "Error interno", "details": error_msg}).encode('utf-8'))
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
            except: pass

socketserver.TCPServer.allow_reuse_address = True
try:
    with socketserver.TCPServer(("", PORT), ChatbotHandler) as httpd:
        print(f"Servidor Python de Pruebas corriendo en http://localhost:{PORT}")
        httpd.serve_forever()
except Exception as e:
    print(f"Error al iniciar: {e}")
