import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

const logHistory = [];

/**
 * Adiciona uma linha de mensagem ao log com o horário atual.
 * @param {string} message 
 */
export function addLog(message) {
  const time = new Date().toLocaleTimeString('pt-BR');
  logHistory.push(`[${time}] ${message}`);
}

/**
 * Grava o histórico acumulado na pasta Documentos do usuário.
 * @returns {string|null} Caminho do arquivo salvo ou null se falhar.
 */
export function saveLogToFile() {
  if (logHistory.length === 0) return null;

  const now = new Date();
  const day = String(now.getDate()).padStart(2, '0');
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const year = now.getFullYear();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');

  // Formato seguro para nome de arquivo no Windows: DD-MM-YYYY_HH-mm-ss
  const dateStr = `${day}-${month}-${year}_${hours}-${minutes}-${seconds}`;
  const fileName = `DNOptimization ${dateStr}.txt`;
  
  const documentsPath = join(process.env.USERPROFILE, 'Documents');
  const fullPath = join(documentsPath, fileName);

  const content = [
    `==================================================`,
    `       DNOptimization - LOG DE OPERAÇÕES`,
    `       Data: ${day}/${month}/${year} - ${hours}:${minutes}:${seconds}`,
    `==================================================`,
    '',
    ...logHistory
  ].join('\n');

  try {
    mkdirSync(documentsPath, { recursive: true });
    writeFileSync(fullPath, content, 'utf-8');
    return fullPath;
  } catch (error) {
    console.error('Erro ao salvar o arquivo de log:', error);
    return null;
  }
}