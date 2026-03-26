@echo off
title Servidor Chatbot Romero Luna
echo ===================================================
echo   Iniciando el servidor del Chatbot...
echo ===================================================
echo.
echo Por favor, NO cierres esta ventana mientras quieras
echo que el chatbot siga funcionando en la web.
echo.

cd "%~dp0chatbot-backend"
python server.py

echo.
pause
