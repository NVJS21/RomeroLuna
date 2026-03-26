import urllib.request
import urllib.error
import json

req = urllib.request.Request(
    'http://127.0.0.1:3000/api/chat',
    data=json.dumps({"messages": [{"role":"user", "content":"hola"}]}).encode('utf-8'),
    headers={'Content-Type': 'application/json'}
)

try:
    response = urllib.request.urlopen(req)
    print("STATUS:", response.status)
    print("BODY:", response.read().decode())
except urllib.error.HTTPError as e:
    print("HTTPError:", e.code)
    print("BODY:", e.read().decode())
except Exception as e:
    print("ERROR:", str(e))
