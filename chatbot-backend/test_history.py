import urllib.request
import json
import logging

req = urllib.request.Request(
    'http://127.0.0.1:3000/api/chat',
    data=json.dumps({
        "messages": [
            {"role": "user", "content": "quiero una recomendacion de un restaurante bueno y barato"}
        ],
        "userProfile": {
            "age": "18-25",
            "tourismType": "Gastronómico",
            "travelers": "2",
            "interests": ""
        }
    }).encode('utf-8'),
    headers={'Content-Type': 'application/json'}
)

response = urllib.request.urlopen(req)
print("STATUS:", response.status)
print("BODY:", response.read().decode())
