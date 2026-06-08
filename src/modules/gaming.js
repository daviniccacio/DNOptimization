import { runPowerShell } from '../utils/executer.js';

// Tweak 1: Ativar Plano de Desempenho Máximo (Ultimate Performance)
export const ultimatePowerTweak = {
  name: 'Ativar Plano de Energia: Desempenho Máximo (Reduz Latência de Hardware)',
  
  async apply() {
    // Libera o ID oculto do plano de Desempenho Máximo do Windows 11
    await runPowerShell('powercfg -duplicatescheme e9a42b02-d5df-448d-aa00-03f14749eb61');
    // Define ele como o plano ativo no sistema
    await runPowerShell('powercfg -setactive e9a42b02-d5df-448d-aa00-03f14749eb61');
  },
  
  async revert() {
    // Retorna o sistema para o plano "Equilibrado" (Padrão do Windows)
    await runPowerShell('powercfg -setactive 381b4222-f694-41f0-9685-ff5bb260df2e');
  }
};

// Tweak 2: Desativar Xbox Game Bar e DVR de Fundo (Evita engasgos e consumo de RAM/CPU)
export const xboxDvrTweak = {
  name: 'Desativar Xbox Game Bar e DVR (Gravação de Tela em Segundo Plano)',
  
  async apply() {
    // Desativa a gravação em segundo plano no registro
    await runPowerShell("if (!(Test-Path 'HKCU:\\System\\GameConfigStore')) { New-Item -Path 'HKCU:\\System\\GameConfigStore' -Force }; Set-ItemProperty -Path 'HKCU:\\System\\GameConfigStore' -Name 'GameDVR_Enabled' -Value 0");
    await runPowerShell("if (!(Test-Path 'HKCU:\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\GameDVR')) { New-Item -Path 'HKCU:\\SOFTWARE\\Microsoft\\Windows\CurrentVersion\\GameDVR' -Force }; Set-ItemProperty -Path 'HKCU:\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\GameDVR' -Name 'AppCaptureEnabled' -Value 0");
  },
  
  async revert() {
    // Reativa os recursos padrões do Xbox no Windows
    await runPowerShell("Set-ItemProperty -Path 'HKCU:\\System\\GameConfigStore' -Name 'GameDVR_Enabled' -Value 1");
    await runPowerShell("Set-ItemProperty -Path 'HKCU:\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\GameDVR' -Name 'AppCaptureEnabled' -Value 1");
  }
};