import { execSync } from 'child_process';

/**
 * Verifica se o script está rodando como Administrador.
 * Caso não esteja, tenta reiniciar o processo pedindo elevação (UAC).
 */
export function ensureAdmin() {
  try {
    // O comando 'net session' só responde com sucesso (código 0) se for Administrador
    execSync('net session', { stdio: 'ignore' });
    return true; 
  } catch (e) {
    console.log('⚠️ Permissão de Administrador necessária. Solicitando elevação...');

    const scriptPath = process.argv[1];
    
    // Comando PowerShell que reabre o Node chamando este mesmo script, mas com o verbo 'RunAs' (Admin)
    const command = `powershell -Command "Start-Process node -ArgumentList '\\"${scriptPath}\\"' -Verb RunAs"`;
    
    try {
      execSync(command, { stdio: 'inherit' });
      process.exit(0); // Fecha o processo atual (sem privilégios)
    } catch (err) {
      console.error('❌ Você recusou ou falhou ao obter permissões de administrador.');
      process.exit(1);
    }
  }
}