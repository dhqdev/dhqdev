#!/usr/bin/env node
// Gera os SVGs animados do perfil.
//
//   node scripts/generate.mjs                 -> busca dados reais (GraphQL) e gera os cards dinâmicos em ./dist
//   node scripts/generate.mjs --static        -> regera os SVGs estáticos (banner, stack, rodapé) em ./assets
//   node scripts/generate.mjs --mock          -> cards dinâmicos com dados fictícios (para testar o visual)
//   node scripts/generate.mjs --data x.json   -> cards dinâmicos a partir de um JSON salvo
//
// Variáveis: GITHUB_TOKEN (ou PROFILE_TOKEN) e GH_USER (padrão: login do profile.config.mjs)
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import cfg from './profile.config.mjs';
import { reportMissing } from './lib/font.mjs';
import { fetchData, enrich, mockData } from './lib/data.mjs';
import { banner } from './render/banner.mjs';
import { stack } from './render/stack.mjs';
import { footer } from './render/footer.mjs';
import { neofetch } from './render/neofetch.mjs';
import { stats } from './render/stats.mjs';
import { lab } from './render/lab.mjs';
import { invaders } from './render/invaders.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const opt = (k, d) => {
  const i = args.indexOf(k);
  return i >= 0 ? args[i + 1] : d;
};

function write(dir, name, content) {
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, name), content);
  console.log(`  ✓ ${path.relative(ROOT, path.join(dir, name)) || name} (${(content.length / 1024).toFixed(1)} KB)`);
}

async function main() {
  if (args.includes('--static')) {
    const out = path.resolve(ROOT, opt('--out', 'assets'));
    console.log('▶ SVGs estáticos');
    write(out, 'banner.svg', banner(cfg));
    write(out, 'stack.svg', stack(cfg));
    write(out, 'footer.svg', footer(cfg));
    reportMissing();
    return;
  }

  const out = path.resolve(ROOT, opt('--out', 'dist'));
  const login = process.env.GH_USER || cfg.login;
  let raw;
  if (args.includes('--mock')) raw = mockData(login);
  else if (opt('--data')) raw = JSON.parse(fs.readFileSync(opt('--data'), 'utf8'));
  else {
    console.log(`▶ Buscando dados de @${login}...`);
    raw = await fetchData(login, process.env.PROFILE_TOKEN || process.env.GITHUB_TOKEN);
  }
  const d = enrich(raw, { excludeLanguages: cfg.excludeLanguages || [] });
  console.log(`  ${d.lastYear.total} contribuições no último ano • streak ${d.streak.current} (recorde ${d.streak.longest}) • ${d.languages.length} linguagens`);

  console.log('▶ SVGs dinâmicos');
  write(out, 'neofetch.svg', neofetch(d, cfg));
  write(out, 'stats.svg', stats(d));
  write(out, 'lab.svg', lab(d));
  write(out, 'invaders.svg', invaders(d));
  write(out, 'data.json', JSON.stringify({ ...raw, allTime: { ...raw.allTime, days: undefined } }, null, 2));
  reportMissing();
}

main().catch((e) => {
  console.error('✗', e.message || e);
  process.exit(1);
});
