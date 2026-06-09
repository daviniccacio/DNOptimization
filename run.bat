@echo off
title DNOptimization - Inicializador
setlocal enabledelayedexpansion

:: Forçar execução como Administrador
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo [!] Solicitando privilegios de Administrador...
    powershell -Command "Start-Process '%~f0' -Verb RunAs"
    exit /b
)

cd /d "%~dp0"
cls

:: Verificar se o Node.js está instalado
node -v >nul 2>&1
if %errorLevel% neq 0 (
    echo [-] Node.js nao detectado no sistema.
    echo [+] Instalando Node.js via Winget de forma silenciosa...
    winget install --id OpenJS.NodeJS --silent --accept-source-agreements --accept-package-agreements
    
    if %errorLevel% neq 0 (
        echo [X] Erro ao instalar o Node.js via Winget. Verifique a conexao com a internet.
        pause
        exit /b
    )
    echo [+] Node.js instalado com sucesso. 
    echo [!] Por favor, feche esta janela e execute o 'run.bat' novamente para atualizar o ambiente.
    pause
    exit /b
)

:: Verificar se a pasta node_modules existe, se não, instala as dependências
if not exist "node_modules\" (
    echo [+] Instalando dependencias do projeto (Clack Prompts)...
    call npm install --silent
)

:: Executar a aplicação
echo [+] Iniciando DNOptimization...
node src/index.js

pause