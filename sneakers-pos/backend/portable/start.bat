@echo off
title Sneakers Print Server - NO CERRAR
color 0A

echo ========================================
echo   Sneakers Print Server
echo ========================================
echo.
echo Arrancando servidor en http://localhost:3001
echo.
echo IMPORTANTE: NO CIERRES esta ventana mientras
echo uses el POS. Puedes minimizarla.
echo.
echo Presiona Ctrl+C para detener el servidor.
echo.

cd /d "%~dp0"
node index.js

echo.
echo ========================================
echo   Servidor detenido
echo ========================================
pause