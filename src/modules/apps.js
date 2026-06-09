import * as p from '@clack/prompts';
import { runPowerShell } from '../utils/executer.js';
import { addLog } from '../utils/logger.js';

// Lista de ID's oficiais do repositório do Winget
const availableApps = [
  { value: 'OpenJS.NodeJS.LTS', label: '💻 Node.js LTS (Ambiente Dev)' },
  { value: 'Git.Git', label: '💻 Git (Controle de Versão)' },
  { value: 'Microsoft.VisualStudioCode', label: '💻 VS Code (Editor de Código)' },
  { value: 'Docker.DockerDesktop', label: '💻 Docker Desktop (Containers)' },
  { value: 'Valve.Steam', label: '🎮 Steam (Jogos)' },
  { value: 'Discord.Discord', label: '🎮 Discord (Comunicação)' },
  { value: 'OBSProject.OBSStudio', label: '🎥 OBS Studio (Gravação/Stream)' },
  { value: '7zip.7zip', label: '🛠️ 7-Zip (Compactador de arquivos)' },
];

export async function installApps() {
  const selectedApps = await p.multiselect({
    message: 'Selecione os programas que deseja instalar (Espaço para selecionar, Enter para confirmar):',
    options: availableApps,
    required: true,
  });

  // Se o usuário apertar Ctrl+C ou cancelar
  if (p.isCancel(selectedApps)) {
    return false;
  }

  // Loop para instalar cada um dos apps selecionados
  for (const appId of selectedApps) {
    const appName = availableApps.find(a => a.value === appId).label;
    const s = p.spinner();
    
    s.start(`Instalando ${appName}...`);

    try {
      // --silent: Instala em segundo plano sem abrir telas de assistente
      // --accept-source-agreements e --accept-package-agreements: Aceita os termos automaticamente
      await runPowerShell(`winget install --id ${appId} --silent --accept-source-agreements --accept-package-agreements`);
      s.stop(`✔️ ${appName} instalado com sucesso!`);
      addLog(`SUCESSO: Instalação do programa ${appName} (ID: ${appId})`); // <-- ADICIONADO
    } catch (error) {
      s.stop(`❌ Falha ao instalar ${appName}.`);
      // Opcional: descomente a linha abaixo se quiser ver o log de erro do winget
      addLog(`ERRO: Falha ao instalar o programa ${appName} (ID: ${appId}). Detalhes: ${error}`); // <-- ADICIONADO
      console.error(error);
    }
  }
}