import { runPowerShell } from '../utils/executer.js';

// 2. DISM + SFC Repair
export async function runSystemRepair() {
  // Executa o DISM e depois o SFC em sequência
  await runPowerShell('DISM /Online /Cleanup-Image /RestoreHealth');
  await runPowerShell('sfc /scannow');
}

// 5. Limpeza Automática de Temp (Versão Ultra-Robusta)
export async function cleanTempFiles() {
  // Limpa o Temp do Usuário ativo
  await runPowerShell("Get-ChildItem -Path $env:TEMP -Force | ForEach-Object { Remove-Item -LiteralPath $_.FullName -Force -Recurse -ErrorAction SilentlyContinue }; exit 0");
  
  // Limpa o Temp do Sistema (Windows)
  await runPowerShell("Get-ChildItem -Path 'C:\\Windows\\Temp' -Force | ForEach-Object { Remove-Item -LiteralPath $_.FullName -Force -Recurse -ErrorAction SilentlyContinue }; exit 0");
}

// 6 & 12. Resetar Rede + Flush DNS
export async function resetNetwork() {
  await runPowerShell('ipconfig /flushdns');
  await runPowerShell('ipconfig /release');
  await runPowerShell('ipconfig /renew');
  await runPowerShell('netsh winsock reset');
  await runPowerShell('netsh int ip reset');
}

// 7. Gerar Relatório de Energia
export async function generateEnergyReport() {
  const outputPath = `${process.env.USERPROFILE}\\Desktop\\energy-report.html`;
  // Usamos aspas simples (') ao redor do caminho para não quebrar as aspas duplas do executor
  await runPowerShell(`powercfg /energy /duration 5 /output '${outputPath}'`);
}

// 8. Relatório de Bateria
export async function generateBatteryReport() {
  const outputPath = `${process.env.USERPROFILE}\\Desktop\\battery-report.html`;
  await runPowerShell(`powercfg /batteryreport /output '${outputPath}'`);
}

// 9. Limpar Windows Update (SoftwareDistribution) - Versão Nativa e Robusta
export async function cleanWindowsUpdate() {
  // Cmdlets nativos não quebram a execução se o serviço já estiver parado
  await runPowerShell('Stop-Service -Name wuauserv -Force -ErrorAction SilentlyContinue');
  await runPowerShell('Stop-Service -Name bits -Force -ErrorAction SilentlyContinue');
  await runPowerShell('Stop-Service -Name cryptsvc -Force -ErrorAction SilentlyContinue');
  await runPowerShell('Stop-Service -Name msiserver -Force -ErrorAction SilentlyContinue');
  
  // Limpa o conteúdo interno da pasta SoftwareDistribution de forma segura
  await runPowerShell('Get-ChildItem -Path "C:\\Windows\\SoftwareDistribution" -Force -ErrorAction SilentlyContinue | ForEach-Object { Remove-Item -LiteralPath $_.FullName -Force -Recurse -ErrorAction SilentlyContinue }; exit 0');
  
  // Reinicia os serviços necessários para o correto funcionamento do sistema
  await runPowerShell('Start-Service -Name msiserver -ErrorAction SilentlyContinue');
  await runPowerShell('Start-Service -Name cryptsvc -ErrorAction SilentlyContinue');
  await runPowerShell('Start-Service -Name bits -ErrorAction SilentlyContinue');
  await runPowerShell('Start-Service -Name wuauserv -ErrorAction SilentlyContinue');
}

// 10. Limpar Logs de Eventos do Windows (Libera espaço em disco)
export async function cleanEventLogs() {
  await runPowerShell('Get-EventLog -LogName * | ForEach-Object { Clear-EventLog -LogName $_.Log }');
}

// 11. Verificar Integridade do SSD
export async function checkDriveHealth() {
  // Retorna uma string formatada com o status de saúde dos discos
  return await runPowerShell('Get-PhysicalDisk | Select-Object DeviceId, FriendlyName, OperationalStatus, HealthStatus | Out-String');
}

// 13. Limpar Prefetch (Prevenção contra arquivos de paginação travados)
export async function cleanPrefetch() {
  await runPowerShell("Get-ChildItem -Path 'C:\\Windows\\Prefetch' -Force | ForEach-Object { Remove-Item -LiteralPath $_.FullName -Force -Recurse -ErrorAction SilentlyContinue }; exit 0");
}