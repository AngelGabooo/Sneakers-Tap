@echo off
title Instalador Sneakers Print Server
color 0A

echo ========================================
echo   Instalador Sneakers Print Server
echo ========================================
echo.

:: Verificar Node.js
node --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js NO esta instalado.
    echo.
    echo 1. Ve a: https://nodejs.org
    echo 2. Descarga la version LTS
    echo 3. Instalala (siguiente, siguiente, siguiente...)
    echo 4. Reinicia esta PC
    echo 5. Ejecuta este archivo otra vez
    echo.
    pause
    exit /b 1
)

echo [OK] Node.js detectado.
echo.
echo Instalando dependencias (esto tarda 30 segundos)...
echo.

call npm install

if errorlevel 1 (
    echo.
    echo [ERROR] Fallo la instalacion.
    echo Verifica que tengas internet.
    pause
    exit /b 1
)

echo.
echo ========================================
echo   [OK] INSTALACION COMPLETADA
echo ========================================
echo.
echo Ahora ejecuta "start.bat" para arrancar el servidor.
echo.
pause