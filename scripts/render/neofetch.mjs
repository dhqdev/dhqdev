// Terminal estilo "neofetch": digita o comando e imprime a ficha do dev com
// dados reais (repos, commits, streak, linguagens) atualizados pela Action.
import { C, r3, fmt, card, pct } from '../lib/svg.mjs';
import { px, spriteD } from '../lib/font.mjs';
import { SPRITES } from '../lib/sprites.mjs';

function uptime(createdAt, now) {
  const a = new Date(createdAt), b = new Date(now);
  let m = (b.getUTCFullYear() - a.getUTCFullYear()) * 12 + (b.getUTCMonth() - a.getUTCMonth());
  if (b.getUTCDate() < a.getUTCDate()) m--;
  const y = Math.floor(m / 12), mm = m % 12;
  const parts = [];
  if (y) parts.push(`${y} ano${y > 1 ? 's' : ''}`);
  if (mm) parts.push(`${mm} ${mm > 1 ? 'meses' : 'mês'}`);
  return (parts.join(', ') || 'recém-chegado') + ' no GitHub';
}

export function neofetch(d, cfg) {
  const W = 1000, LH = 22, s = 2;
  const T = 20, CLEAR = 18.6;
  const top = 62, out0 = top + 32, X = 30, RX = 318;
  const langs = d.languages.slice(0, 3).map((l) => l.name.toLowerCase()).join(' • ') || '—';
  const fields = [
    ['Nome', cfg.fullName],
    ['Local', cfg.location],
    ['Host', d.company?.replace(/^@/, '') || cfg.company],
    ['Kernel', cfg.role],
    ['Uptime', uptime(d.createdAt, d.generatedAt)],
    ['Packages', `${d.publicRepos} repos públicos`],
    ['Shell', langs],
    ['Commits', `${fmt(d.lastYear.commits)} nos últimos 12 meses`],
    ['Contrib', `${fmt(d.lastYear.total)} no ano • ${fmt(d.allTime.total)} total`],
    ['Streak', `${d.streak.current} dia${d.streak.current === 1 ? '' : 's'} (recorde: ${d.streak.longest})`],
    ['Social', `${d.stars} ★ • ${d.followers} seguidores`],
    ['Foco', cfg.focus],
  ];
  const rows = 2 + fields.length + 1; // header, linha, campos, cores
  const finalY = out0 + rows * LH + 12;
  const H = finalY + 40;

  let b = '';
  let css = '';
  let n = 0;
  // cada elemento de saída aparece no seu tempo e some no "clear"
  const appear = (t, inner) => {
    const id = `o${n++}`;
    css += `@keyframes ${id}{0%,${pct(t, T)}{opacity:0;transform:translateX(-6px)}${pct(t + 0.08, T)},${pct(CLEAR, T)}{opacity:1;transform:none}${pct(CLEAR + 0.01, T)},100%{opacity:0}}`;
    return `<g class="o" style="animation:${id} ${T}s linear infinite;opacity:0">${inner}</g>`;
  };

  // barra de título
  b += `<rect width="${W}" height="40" fill="#1a0940"/><rect y="39" width="${W}" height="1" fill="${C.line}"/>`;
  [C.pink, C.yellow, C.cyan].forEach((c, i) => (b += `<circle cx="${24 + i * 20}" cy="20" r="6" fill="${c}"/>`));
  b += px(`${d.login}@github: ~`, W / 2, 15, { s: 1.6, fill: C.dim, anchor: 'middle' });

  // prompt + comando digitado
  const prompt = (y) =>
    px(d.login, X, y, { s, fill: C.green }) +
    px('@github', X + d.login.length * 12, y, { s, fill: C.white }) +
    px(':~$', X + (d.login.length + 7) * 12, y, { s, fill: C.cyan });
  const pw = (d.login.length + 11) * 12;
  b += prompt(top);
  const cmd = 'neofetch';
  const t0 = 0.6, ct = 0.1;
  const kt = [0], vals = [0];
  for (let j = 1; j <= cmd.length; j++) { kt.push(r3((t0 + j * ct) / T)); vals.push(j * 12); }
  kt.push(r3(CLEAR / T)); vals.push(0);
  const anim = (attr, vs) => `<animate attributeName="${attr}" dur="${T}s" repeatCount="indefinite" calcMode="discrete" keyTimes="${kt.join(';')}" values="${vs.join(';')}"/>`;
  b += `<defs><clipPath id="cmdclip"><rect x="${X + pw - 1}" y="${top - 4}" height="24" width="0">${anim('width', vals.map((v) => v + 1))}</rect></clipPath></defs>`;
  b += `<g clip-path="url(#cmdclip)">${px(cmd, X + pw, top, { s, fill: C.white })}</g>`;
  const outStart = t0 + cmd.length * ct + 0.35;
  css += `@keyframes c1w{0%,${pct(outStart, T)}{opacity:1}${pct(outStart + 0.01, T)},${pct(CLEAR, T)}{opacity:0}${pct(CLEAR + 0.01, T)},100%{opacity:1}}`;
  b += `<g style="animation:c1w ${T}s linear infinite"><rect class="blink" y="${top}" width="10" height="14" fill="${C.pink}" x="${X + pw + 2}">${anim('x', vals.map((v) => X + pw + v + 2))}</rect></g>`;

  // logo: invasor gigante + nome
  const inv = SPRITES.octo;
  const LS = 15;
  const lx = X + (RX - X - 30 - 12 * LS) / 2, ly = out0 + 8;
  b += `<defs><linearGradient id="lg" x1="0" y1="0" x2="0" y2="8" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="${C.cyan}"/><stop offset=".5" stop-color="${C.purple}"/><stop offset="1" stop-color="${C.pink}"/></linearGradient></defs>`;
  css += `.lbob{animation:lbob 1.2s steps(1) infinite}@keyframes lbob{50%{transform:translateY(-6px)}}`;
  const frame = (rows, vis) => `<path d="${spriteD(rows)}" opacity="${vis}"><animate attributeName="opacity" values="${vis};${1 - vis}" dur="1.2s" calcMode="discrete" repeatCount="indefinite"/></path>`;
  b += appear(outStart, `<g class="lbob"><g filter="url(#glow2)"><g transform="translate(${lx} ${ly}) scale(${LS})" fill="url(#lg)">${frame(inv[0], 1)}${frame(inv[1], 0)}</g></g></g>
    ${px(d.login.toUpperCase(), lx + 6 * LS, ly + 8 * LS + 30, { s: 4, fill: C.pink, anchor: 'middle', attrs: 'filter="url(#glow)"' })}
    ${px('ARCADE EDITION', lx + 6 * LS, ly + 8 * LS + 70, { s: 1.6, fill: C.dim, anchor: 'middle' })}`);

  // coluna de informações
  let t = outStart + 0.1;
  const step = 0.09;
  let y = out0;
  b += appear(t, px(d.login, RX, y, { s, fill: C.pink }) + px('@', RX + d.login.length * 12, y, { s, fill: C.white }) + px('github', RX + (d.login.length + 1) * 12, y, { s, fill: C.cyan }));
  y += LH; t += step;
  b += appear(t, px('─'.repeat(d.login.length + 7), RX, y, { s, fill: C.dim }));
  y += LH; t += step;
  const kw = Math.max(...fields.map(([k]) => k.length)) + 2;
  for (const [k, v] of fields) {
    b += appear(t, px(k + ':', RX, y, { s, fill: C.yellow }) + px(String(v), RX + kw * 12, y, { s, fill: C.white }));
    y += LH; t += step;
  }
  // blocos de cor
  const cols = [C.pink, C.orange, C.yellow, C.green, C.cyan, C.purple, C.white, C.dim];
  b += appear(t, cols.map((c, i) => `<rect x="${RX + i * 30}" y="${y + 2}" width="30" height="16" fill="${c}"/>`).join(''));
  t += step + 0.15;

  // prompt final com cursor
  b += appear(t, prompt(finalY) + `<rect class="blink" x="${X + pw + 2}" y="${finalY}" width="10" height="14" fill="${C.pink}"/>`);

  return card({ w: W, h: H, title: `neofetch de ${d.login}`, body: b, css });
}
