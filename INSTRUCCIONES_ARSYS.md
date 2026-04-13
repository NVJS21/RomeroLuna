# 🚀 Guía de Despliegue en Arsys (Romero Luna Chatbot)

Esta guía explica cómo subir el proyecto al servidor de Arsys de forma que el chatbot funcione exactamente igual que en Netlify.

---

## 📋 Requisitos del Servidor
Arsys (hosting compartido estándar) cumple todos estos requisitos:
- [x] PHP 7.4 o superior
- [x] Extensión cURL activada (estándar en Arsys)
- [x] Acceso a URLs externas desde PHP (para conectarse a Google Docs y OpenAI)

---

## ⚙️ Pasos de Configuración (IMPORTANTES)

### Paso 1: Añadir la API Key de OpenAI

Antes de subir los archivos, abre el archivo `api/chat.php` con un editor de texto (Notepad, VS Code) y busca esta línea:

```php
$OPENAI_API_KEY = "TU_API_KEY_AQUI";
```

Reemplaza `TU_API_KEY_AQUI` con la clave real de OpenAI. Ejemplo:

```php
$OPENAI_API_KEY = "sk-proj-xxxxxxxxxxxxxxxxxxxxxx";
```

> ⚠️ **IMPORTANTE**: Guarda el archivo. Sin este paso, el chatbot no funcionará.

---

### Paso 2: Subir archivos al servidor por FTP

Conecta con el FTP de Arsys (datos en el panel de control de Arsys) y sube **todo el contenido** de esta carpeta a la raíz del dominio (`public_html`, `www`, o similar).

La estructura de carpetas debe quedar así en el servidor:

```
public_html/
├── index.html
├── api/
│   └── chat.php          ← El backend del chatbot
├── js/
│   ├── chatbot.js
│   └── main.js
├── css/
│   └── chatbot.css
├── assets/
└── ... (resto de archivos)
```

---

### Paso 3: Verificar que funciona

1. Abre el dominio en el navegador.
2. Haz click en el botón verde del chatbot.
3. Escribe un mensaje de prueba como "Hola".
4. Si responde correctamente, ¡todo está funcionando!

---

## 🔎 Solución de Problemas

| Problema | Solución |
|---|---|
| El chatbot no responde | Verifica que la API Key está correctamente escrita en `api/chat.php` |
| Error 500 del servidor | Comprueba que el servidor tiene PHP 7.4+ y cURL activo (contacta soporte Arsys) |
| El chatbot responde pero sin recomendaciones | Los Google Docs públicos pueden estar caídos temporalmente, espera unos minutos |
| Los links no abren en pestaña nueva | Limpia la caché del navegador |

---

## 📞 Datos de Acceso Necesarios

Para completar la configuración necesitas:
- **API Key de OpenAI**: La tienes en [platform.openai.com/api-keys](https://platform.openai.com/api-keys)
- **Credenciales FTP de Arsys**: En panel de control de Arsys → Hosting → FTP

---

## ℹ️ Información Técnica

- El chatbot usa **auto-detección** de entorno. En Netlify usa las Functions; en cualquier otro servidor usa `api/chat.php`.
- La knowledge base se actualiza automáticamente desde Google Drive cada vez que un usuario hace una pregunta — no requiere mantenimiento.
- El modelo de IA configurado es `gpt-4o-mini`. Para cambiarlo, edita la línea `$OPENAI_MODEL` en `api/chat.php`.
