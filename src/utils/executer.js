// Helper para executar os comandos PowerShell

import { exec } from 'child_process';

/**
 * Executa um comando no PowerShell de forma assíncrona
 * @param {string} command - O comando ou script PowerShell
 */
export function runPowerShell(command) {
  return new Promise((resolve, reject) => {
    // Força a execução usando o PowerShell e ignorando a política de execução temporariamente
    exec(`powershell -NoProfile -ExecutionPolicy Bypass -Command "${command}"`, (error, stdout, stderr) => {
      if (error) {
        reject(stderr || error.message);
      } else {
        resolve(stdout.trim());
      }
    });
  });
}