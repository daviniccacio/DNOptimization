import { runPowerShell } from '../utils/executer.js';

export const telemetryTweak = {
  name: 'Desativar Telemetria da Microsoft (Serviços DiagTrack)',
  
  async apply() {
    // Para e desativa o serviço de rastreamento de diagnóstico
    await runPowerShell('Stop-Service -Name DiagTrack -Force');
    await runPowerShell('Set-Service -Name DiagTrack -StartupType Disabled');
  },
  
  async revert() {
    // Restaura o serviço para o padrão do Windows
    await runPowerShell('Set-Service -Name DiagTrack -StartupType Automatic');
    await runPowerShell('Start-Service -Name DiagTrack');
  }
};