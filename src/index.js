#!/usr/bin/env node
import { addLog, saveLogToFile } from "./utils/logger.js";
import { readFileSync } from "fs";
import * as p from "@clack/prompts";
import { ensureAdmin } from "./utils/admin.js";
import { installApps } from "./modules/apps.js";
import { telemetryTweak } from "./modules/system.js";
import { ultimatePowerTweak, xboxDvrTweak } from "./modules/gaming.js";
import * as maint from "./modules/maintenance.js";

const pkg = JSON.parse(
  readFileSync(new URL("../package.json", import.meta.url)),
);
const appVersion = pkg.version;

ensureAdmin();

async function main() {
  // O ciclo 'while' substitui a necessidade de chamar main() recursivamente
  while (true) {
    console.clear();

    // Definição das linhas do Banner
    const banner = [
      "┌────────────────────────────────────────────────────────┐",
      "│ ██████╗ ███╗   ██╗ ██████╗ ██████╗ ████████╗            │",
      "│ ██╔══██╗████╗  ██║██╔═══██╗██╔══██╗╚══██╔══╝            │",
      "│ ██║  ██║██╔██╗ ██║██║   ██║██████╔╝   ██║               │",
      "│ ██║  ██║██║╚██╗██║██║   ██║██╔═══╝    ██║               │",
      "│ ██████╔╝██║ ╚████║╚██████╔╝██║        ██║               │",
      "│ ╚══════╝ ╚═╝  ╚═══╝ ╚═════╝ ╚═╝        ╚═╝               │",
      "├────────────────────────────────────────────────────────┤",
      "│  SISTEMA DE OTIMIZAÇÃO E MANUTENÇÃO    │   Versão 1.2.1  │",
      "└────────────────────────────────────────────────────────┘",
    ];

    // Definição das cores RGB (Laranja para Roxo)
    const startColor = { r: 255, g: 100, b: 0 }; // Laranja
    const endColor = { r: 110, g: 30, b: 180 }; // Roxo vibrante

    const numRows = banner.length;

    for (let r = 0; r < numRows; r++) {
      const line = banner[r];
      const numCols = line.length;
      let coloredLine = "";

      for (let c = 0; c < numCols; c++) {
        // Fator de interpolação baseado na posição da linha e da coluna (Diagonal)
        const fractionRow = r / (numRows - 1 || 1);
        const fractionCol = c / (numCols - 1 || 1);
        const t = (fractionRow + fractionCol) / 2; // Média cria o efeito diagonal

        // Interpolação linear dos canais R, G e B
        const red = Math.round(startColor.r + (endColor.r - startColor.r) * t);
        const green = Math.round(
          startColor.g + (endColor.g - startColor.g) * t,
        );
        const blue = Math.round(startColor.b + (endColor.b - startColor.b) * t);

        // Código ANSI TrueColor para o texto: \x1b[38;2;R;G;Bm
        coloredLine += `\x1b[38;2;${red};${green};${blue}m${line[c]}`;
      }

      // Imprime a linha colorida e reseta a cor no final (\x1b[0m)
      console.log(coloredLine + "\x1b[0m");
    }

    console.log(); // Linha em branco para respiro
    p.intro("\x1b[33mIniciando o painel de controle...\x1b[0m");

    const category = await p.select({
      message: "O que você deseja fazer hoje?",
      options: [
        { value: "apps", label: "📦 Instalar Programas (Winget)" },
        { value: "optimize", label: "⚡ Aplicar Otimizações (Sistema/Jogos)" },
        { value: "maintenance", label: "🛠️ Manutenção e Diagnósticos" },
        { value: "revert", label: "🔄 Reverter Modificações" },
        { value: "exit", label: "❌ Sair" },
      ],
    });

    if (p.isCancel(category) || category === "exit") {
      const shoulderSave = await p.confirm({
        message:
          "Deseja salvar o log com as operações realizadas nesta sessão?",
        initialValue: true,
      });

      if (shoulderSave) {
        const savedPath = saveLogToFile();
        if (savedPath) {
          p.note(`Log salvo em: ${savedPath}`, "Histórico Gravado");
        } else {
          p.note(
            "Nenhuma ação foi registrada ou ocorreu um erro ao salvar.",
            "Aviso",
          );
        }
      }

      p.outro("Saindo do DNOptimization. Até mais!");
      process.exit(0);
    }

    // --- ROTA: APLICATIVOS ---
    if (category === "apps") {
      const result = await installApps();
      // Se foi cancelado, o 'continue' reinicia o ciclo instantaneamente
      if (result === false) continue;
    }

    // --- SUBMENU: OTIMIZAÇÕES ---
    if (category === "optimize") {
      const action = await p.select({
        message: "Escolha a otimização para aplicar:",
        options: [
          { value: "telemetry", label: telemetryTweak.name },
          { value: "power", label: ultimatePowerTweak.name },
          { value: "xbox", label: xboxDvrTweak.name },
          { value: "back", label: "🔙 Voltar ao menu principal" },
        ],
      });

      if (action === "back" || p.isCancel(action)) continue;

      const s = p.spinner();
      s.start("Aplicando modificação...");
      try {
        if (action === "telemetry") await telemetryTweak.apply();
        if (action === "power") await ultimatePowerTweak.apply();
        if (action === "xbox") await xboxDvrTweak.apply();
        s.stop("✔️ Otimização aplicada com sucesso!");
        addLog(`SUCESSO: Otimização aplicada -> ${action}`); // <-- ADICIONADO
      } catch (err) {
        s.stop("❌ Erro ao aplicar alteração.");
        addLog(`ERRO: Falha ao aplicar otimização -> ${action}. Erro: ${err}`); // <-- ADICIONADO
        console.error("\nDetalhes do erro:", err); // Adicionado para debug
      }
    }

    // --- SUBMENU: MANUTENÇÃO E DIAGNÓSTICOS ---
    if (category === "maintenance") {
      const action = await p.select({
        message: "Escolha uma ferramenta de manutenção:",
        options: [
          { value: "repair", label: "🔍 Reparo de Sistema (DISM + SFC)" },
          { value: "temp", label: "🧹 Limpar Arquivos Temporários (Temp)" },
          { value: "prefetch", label: "🗑️ Limpar Prefetch (Ganho Mínimo)" },
          { value: "network", label: "🌐 Resetar Rede e Cache DNS" },
          { value: "update", label: "🔄 Limpar Cache do Windows Update" },
          { value: "ssd", label: "💾 Verificar Integridade do SSD/HD" },
          {
            value: "energy",
            label: "🔋 Gerar Relatório de Energia (Desktop/Notebook)",
          },
          {
            value: "battery",
            label: "🔋 Gerar Relatório de Bateria (Notebook)",
          },
          { value: "back", label: "🔙 Voltar" },
        ],
      });

      if (action === "back" || p.isCancel(action)) continue;

      const s = p.spinner();
      s.start("Processando tarefa...");

      try {
        if (action === "repair") {
          s.message(
            "Executando DISM e SFC (Isso pode demorar alguns minutos)...",
          );
          await maint.runSystemRepair();
          s.stop("✔️ Reparo concluído! Arquivos corrompidos corrigidos.");
          addLog("SUCESSO: Executado Reparo de Sistema (DISM + SFC)"); // <-- ADICIONADO
        } else if (action === "temp") {
          await maint.cleanTempFiles();
          s.stop("✔️ Arquivos temporários apagados.");
          addLog("SUCESSO: Limpeza de arquivos temporários"); // <-- ADICIONADO
        } else if (action === "prefetch") {
          await maint.cleanPrefetch();
          s.stop("✔️ Cache Prefetch limpo.");
          addLog("SUCESSO: Limpeza do cache Prefetch"); // <-- ADICIONADO
        } else if (action === "network") {
          await maint.resetNetwork();
          s.stop("✔️ Rede resetada e DNS limpo com sucesso.");
          addLog("SUCESSO: Reset de parâmetros de rede e Flush DNS"); // <-- ADICIONADO
        } else if (action === "update") {
          s.message("Parando serviços e limpando SoftwareDistribution...");
          await maint.cleanWindowsUpdate();
          s.stop("✔️ Cache do Windows Update resetado.");
          addLog("SUCESSO: Limpeza do cache do Windows Update"); // <-- ADICIONADO
        } else if (action === "energy") {
          await maint.generateEnergyReport();
          s.stop("✔️ Relatório de energia salvo no seu Desktop.");
          addLog("SUCESSO: Relatório de energia gerado"); // <-- ADICIONADO
        } else if (action === "battery") {
          await maint.generateBatteryReport();
          s.stop("✔️ Relatório de bateria salvo no seu Desktop.");
          addLog("SUCESSO: Relatório de bateria gerado"); // <-- ADICIONADO
        } else if (action === "ssd") {
          const result = await maint.checkDriveHealth();
          s.stop("✔️ Verificação concluída:");
          console.log(`\n${result}`);
          addLog("SUCESSO: Verificação de integridade do SSD/HD concluída"); // <-- ADICIONADO
        }
      } catch (err) {
        s.stop("❌ Ocorreu um erro ao executar a tarefa.");
        console.error(err);
        addLog(
          `ERRO: Falha ao executar tarefa de manutenção -> ${action}. Erro: ${err}`,
        ); // <-- ADICIONADO
      }
    }

    // --- SUBMENU: REVERSÃO ---
    if (category === "revert") {
      const action = await p.select({
        message: "Escolha qual alteração deseja desfazer:",
        options: [
          { value: "telemetry", label: `Restaurar: ${telemetryTweak.name}` },
          { value: "power", label: `Restaurar: ${ultimatePowerTweak.name}` },
          { value: "xbox", label: `Restaurar: ${xboxDvrTweak.name}` },
          { value: "back", label: "🔙 Voltar ao menu principal" },
        ],
      });

      if (action === "back" || p.isCancel(action)) continue;

      const s = p.spinner();
      s.start("Revertendo modificação...");
      try {
        if (action === "telemetry") await telemetryTweak.revert();
        if (action === "power") await ultimatePowerTweak.revert();
        if (action === "xbox") await xboxDvrTweak.revert();
        s.stop("✔️ Configurações originais restauradas.");
        addLog(`SUCESSO: Reversão aplicada -> ${action}`); // <-- ADICIONADO
      } catch (err) {
        s.stop("❌ Erro ao reverter alteração.");
        console.error("\nDetalhes do erro:", err); // Adicionado para debug
        addLog(
          `ERRO: Falha ao reverter modificação -> ${action}. Erro: ${err}`,
        ); // <-- ADICIONADO
      }
    }

    // Aguarda 3 segundos antes de limpar o ecrã e mostrar o menu novamente
    p.outro("Etapa finalizada!");
    await new Promise((resolve) => setTimeout(resolve, 3000));
  }
}

main().catch(console.error);
