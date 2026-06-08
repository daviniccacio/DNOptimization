import * as p from '@clack/prompts';
import { ensureAdmin } from './utils/admin.js';
import { installApps } from './modules/apps.js';
import { telemetryTweak } from './modules/system.js';
import { ultimatePowerTweak, xboxDvrTweak } from './modules/gaming.js';

// Força execução como administrador
ensureAdmin();

async function main() {
  console.clear();
  p.intro(`🚀 DNOptimization - Windows 11 Optimizer & Dev Setup`);

  const category = await p.select({
    message: 'O que você deseja fazer hoje?',
    options: [
      { value: 'apps', label: '📦 Instalar Programas (Winget)' },
      { value: 'optimize', label: '⚡ Aplicar Otimizações (Sistema/Jogos)' },
      { value: 'revert', label: '🔄 Reverter Modificações' },
      { value: 'exit', label: '❌ Sair' },
    ],
  });

  if (p.isCancel(category) || category === 'exit') {
    p.outro('Saindo do DNOptimization. Até mais!');
    process.exit(0);
  }

  if (category === 'apps') {
    await installApps();
  }

  // --- MENU DE OTIMIZAÇÕES ---
  if (category === 'optimize') {
    const action = await p.select({
      message: 'Escolha a otimização para aplicar:',
      options: [
        { value: 'telemetry', label: telemetryTweak.name },
        { value: 'power', label: ultimatePowerTweak.name },
        { value: 'xbox', label: xboxDvrTweak.name },
        { value: 'back', label: '🔙 Voltar ao menu principal' }
      ]
    });

    if (action === 'back' || p.isCancel(action)) return main();

    const s = p.spinner();
    s.start('Aplicando modificação...');
    
    try {
      if (action === 'telemetry') await telemetryTweak.apply();
      if (action === 'power') await ultimatePowerTweak.apply();
      if (action === 'xbox') await xboxDvrTweak.apply();
      s.stop('✔️ Otimização aplicada com sucesso!');
    } catch (err) {
      s.stop('❌ Erro ao aplicar alteração.');
      console.error(err);
    }
  }

  // --- MENU DE REVERSÃO ---
  if (category === 'revert') {
    const action = await p.select({
      message: 'Escolha qual alteração deseja desfazer:',
      options: [
        { value: 'telemetry', label: `Restaurar: ${telemetryTweak.name}` },
        { value: 'power', label: `Restaurar: ${ultimatePowerTweak.name}` },
        { value: 'xbox', label: `Restaurar: ${xboxDvrTweak.name}` },
        { value: 'back', label: '🔙 Voltar ao menu principal' }
      ]
    });

    if (action === 'back' || p.isCancel(action)) return main();

    const s = p.spinner();
    s.start('Revertendo modificação...');
    
    try {
      if (action === 'telemetry') await telemetryTweak.revert();
      if (action === 'power') await ultimatePowerTweak.revert();
      if (action === 'xbox') await xboxDvrTweak.revert();
      s.stop('✔️ Configurações originais restauradas.');
    } catch (err) {
      s.stop('❌ Erro ao reverter alteração.');
      console.error(err);
    }
  }

  p.outro('Etapa finalizada!');
  setTimeout(main, 2000);
}

main().catch(console.error);