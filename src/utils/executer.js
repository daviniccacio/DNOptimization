// src/utils/executer.js
import { exec } from 'child_process';

export function runPowerShell(command) {
  return new Promise((resolve, reject) => {
    // Escapa aspas duplas internas para não quebrar o argumento -Command do PowerShell
    const escapedCommand = command.replace(/"/g, '\\"');
    
    exec(`powershell -NoProfile -ExecutionPolicy Bypass -Command "${escapedCommand}"`, (error, stdout, stderr) => {
      if (error) {
        reject(stderr || error.message);
      } else {
        resolve(stdout.trim());
      }
    });
  });
}