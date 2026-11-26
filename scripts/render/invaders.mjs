// Substituto da cobrinha: o gráfico de contribuições vira uma onda de Space Invaders.
// Cada dia com contribuição é um invasor (mais commits = invasor mais forte) e a
// nave atira coluna por coluna até limpar a onda. Gerado com os dados reais.
import { C, r2, r3, fmt, card, pct } from '../lib/svg.mjs';
import { px, spriteD } from '../lib/font.mjs';
import { SPRITES, SHIP, UFO, BOOM } from '../lib/sprites.mjs';

const MESES = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ'];

export function invaders(d) {
  const W = 1000, H = 296;
  const weeks = d.lastYear.weeks;
  const NW = weeks.length;
  const P = 17, SS = 1.15;
  const GX = r2((W - NW * P) / 2), GY = 90;
  const SY = 232; // topo da nave
  const LMAX = SY - GY;
  const LEVEL = [null, { id: 's1', sp: 'squid', c: '#a77bff' }, { id: 's2', sp: 'crab', c: C.cyan }, { id: 's3', sp: 'octo', c: C.pink }, { id: 's3', sp: 'octo', c: C.yellow, boss: true }];

  let defs = '', css = '', b = '';

  // sprites com 2 quadros alternando (SMIL funciona dentro de <use>)
  const frames = (rows2, dur = '1.1s') =>
    `<path d="${spriteD(rows2[0])}"><animate attributeName="opacity" values="1;0" dur="${dur}" calcMode="discrete" repeatCount="indefinite"/></path>` +
    `<path d="${spriteD(rows2[1])}" opacity="0"><animate attributeName="opacity" values="0;1" dur="${dur}" calcMode="discrete" repeatCount="indefinite"/></path>`;
  defs += `<g id="s1" transform="scale(${SS})">${frames(SPRITES.squid)}</g>`;
  defs += `<g id="s2" transform="scale(${SS})">${frames(SPRITES.crab)}</g>`;
  defs += `<g id="s3" transform="scale(${SS})">${frames(SPRITES.octo)}</g>`;
  defs += `<path id="boom" transform="scale(${SS})" d="${spriteD(BOOM)}"/>`;
  defs += `<linearGradient id="beamg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff"/><stop offset="1" stop-color="${C.cyan}"/></linearGradient>`;

  // células
  const cells = [];
  weeks.forEach((w, i) =>
    w.forEach((day) => {
      const row = new Date(day.date + 'T12:00:00Z').getUTCDay();
      cells.push({ col: i, row, level: day.level, count: day.count, date: day.date });
    }),
  );
  const cxCol = (i) => GX + i * P + P / 2;
  const cyRow = (r) => GY + r * P + P / 2;

  // ---------- linha do tempo ----------
  const READY_END = 1.5;
  let t = READY_END + 0.1;
  const cols = [...new Set(cells.filter((c) => c.level > 0).map((c) => c.col))].sort((a, b) => a - b);
  const x0 = cols.length ? cxCol(cols[0]) : W / 2;
  const shipStops = [[0, x0]];
  const shots = [];
  const hits = new Map();
  let prevX = x0;
  for (const col of cols) {
    const alive = cells.filter((c) => c.col === col && c.level > 0);
    const x = cxCol(col);
    const mv = Math.max(0.05, Math.abs(x - prevX) / 650);
    shipStops.push([t, prevX]);
    t += mv;
    shipStops.push([t, x]);
    const fire = t + 0.03;
    const topRow = Math.min(...alive.map((c) => c.row));
    const targetY = GY + topRow * P + 1;
    const span = SY - targetY;
    const beamT = 0.15;
    shots.push({ x, fire, s: span / LMAX, end: fire + beamT + 0.06 });
    for (const c of alive) hits.set(c, fire + ((SY - cyRow(c.row)) / span) * beamT);
    t = fire + beamT + 0.08;
    prevX = x;
  }
  const clearT = t + 0.3;
  const respawn = clearT + 2.3;
  const T = r3(respawn + 1.3);
  shipStops.push([clearT, prevX], [respawn, prevX], [T, x0]);

  // ---------- HUD ----------
  const pad = (v, n) => String(Math.min(v, 10 ** n - 1)).padStart(n, '0');
  b += px('SCORE<1>', 40, 14, { s: 2, fill: C.cyan });
  b += px(pad(d.lastYear.total, 6), 40, 34, { s: 2, fill: C.white });
  b += px('HI-SCORE', W / 2, 14, { s: 2, fill: C.pink, anchor: 'middle' });
  b += px(pad(d.allTime.total, 6), W / 2, 34, { s: 2, fill: C.white, anchor: 'middle' });
  b += px('STREAK', W - 40, 14, { s: 2, fill: C.yellow, anchor: 'end' });
  b += px(`${pad(d.streak.current, 3)} DIAS`, W - 40, 34, { s: 2, fill: C.white, anchor: 'end' });

  // meses e dias da semana
  let lastM = -1;
  weeks.forEach((w, i) => {
    const m = Number(w[0].date.slice(5, 7)) - 1;
    if (lastM === -1) { lastM = m; return; }
    if (m !== lastM) {
      if (i < NW - 2) b += px(MESES[m], GX + i * P, GY - 14, { s: 1.4, fill: C.dim });
      lastM = m;
    }
  });
  [['SEG', 1], ['QUA', 3], ['SEX', 5]].forEach(([l, r]) => (b += px(l, GX - 6, cyRow(r) - 4, { s: 1.2, fill: C.dim, anchor: 'end' })));

  // UFO misterioso
  css += `.ufo{animation:ufo ${T}s linear infinite}@keyframes ufo{0%,22%{transform:translateX(-60px)}52%,100%{transform:translateX(${W + 60}px)}}`;
  b += `<g transform="translate(0 52)"><g class="ufo"><g filter="url(#glow)"><path transform="scale(2)" fill="${C.pink}" d="${spriteD(UFO)}"/></g></g></g>`;

  // ---------- invasores ----------
  css += `.bob{animation:bob 1.1s steps(1) infinite}@keyframes bob{50%{transform:translateY(2px)}}
  .ex{transform-box:fill-box;transform-origin:center;opacity:0}`;
  let inv = '', dots = '', booms = '', boss = '';
  let k = 0;
  for (const c of cells) {
    const x = GX + c.col * P, y = GY + c.row * P;
    if (!c.level) {
      dots += `<rect x="${r2(x + P / 2 - 1)}" y="${r2(y + P / 2 - 1)}" width="2" height="2"/>`;
      continue;
    }
    const L = LEVEL[c.level];
    const w = SPRITES[L.sp][0][0].length * SS, h = 8 * SS;
    const ox = r2(x + (P - w) / 2), oy = r2(y + (P - h) / 2);
    const hit = hits.get(c);
    const rs = respawn + c.col * 0.012;
    const id = k++;
    css += `@keyframes a${id}{${pct(hit, T)}{opacity:1}${pct(hit + 0.02, T)},${pct(rs, T)}{opacity:0}}`;
    css += `@keyframes e${id}{${pct(hit, T)}{opacity:0;transform:scale(.4)}${pct(hit + 0.02, T)}{opacity:1;transform:scale(1)}${pct(hit + 0.32, T)},100%{opacity:0;transform:scale(1.6)}}`;
    const el = `<use href="#${L.id}" x="${ox}" y="${oy}" fill="${L.c}" style="animation:a${id} ${T}s linear infinite"/>`;
    if (L.boss) boss += el; else inv += el;
    const bw = BOOM[0].length * SS, bh = BOOM.length * SS;
    booms += `<g transform="translate(${r2(x + (P - bw) / 2)} ${r2(y + (P - bh) / 2)})"><use class="ex" href="#boom" style="animation:e${id} ${T}s linear infinite"/></g>`;
  }
  b += `<g fill="${C.line}">${dots}</g>`;
  b += `<g class="bob">${inv}<g filter="url(#glow)">${boss}</g><g fill="${C.yellow}" filter="url(#glow)">${booms}</g></g>`;

  // ---------- laser ----------
  let bk = '';
  for (const s of shots) {
    const tr = (sc) => `transform:translateX(${r2(s.x)}px) scaleY(${r3(sc)})`;
    bk += `${pct(s.fire - 0.005, T)}{opacity:0;${tr(0)}}${pct(s.fire, T)}{opacity:1;${tr(0.02)}}${pct(s.fire + 0.15, T)}{opacity:1;${tr(s.s)}}${pct(s.end, T)}{opacity:0;${tr(s.s)}}`;
  }
  css += `.beam{opacity:0;transform-box:view-box;transform-origin:0px ${SY}px;animation:beam ${T}s linear infinite}@keyframes beam{${bk}}`;
  b += `<g class="beam"><rect x="-4" y="${GY}" width="8" height="${LMAX}" fill="${C.cyan}" opacity=".35" filter="url(#glow)"/><rect x="-1.5" y="${GY}" width="3" height="${LMAX}" fill="url(#beamg)"/></g>`;

  // ---------- nave ----------
  let sk = '';
  let lastP = '';
  for (const [st, x] of shipStops) {
    const p = pct(st, T);
    if (p === lastP) continue;
    sk += `${p}{transform:translateX(${r2(x)}px)}`;
    lastP = p;
  }
  css += `.ship{animation:ship ${T}s linear infinite}@keyframes ship{${sk}}`;
  const shw = SHIP[0].length * 2;
  b += `<g class="ship" style="transform:translateX(${r2(x0)}px)"><g filter="url(#glow)"><path transform="translate(${-shw / 2} ${SY}) scale(2)" fill="${C.green}" d="${spriteD(SHIP)}"/></g></g>`;

  // chão e rodapé
  b += `<rect x="20" y="${SY + 22}" width="${W - 40}" height="2" fill="${C.green}" opacity=".8"/>`;
  b += px('♥♥♥', 40, SY + 34, { s: 2, fill: C.pink });
  b += px('CADA INVASOR = 1 DIA COM CONTRIBUIÇÕES', W / 2, SY + 37, { s: 1.4, fill: C.dim, anchor: 'middle' });
  b += px(`@${d.login.toUpperCase()}`, W - 40, SY + 34, { s: 2, fill: C.green, anchor: 'end' });

  // mensagens
  const msg = (text, sub, a, z, color) => {
    const tw = text.length * 6 * 4, sw = sub ? sub.length * 6 * 2 : 0;
    const bw = Math.max(tw, sw) + 40;
    const id = `m${a}`.replace('.', '_');
    css += `@keyframes ${id}{0%,${pct(a, T)}{opacity:0}${pct(a + 0.05, T)},${pct(z, T)}{opacity:1}${pct(z + 0.05, T)},100%{opacity:0}}`;
    return `<g style="animation:${id} ${T}s steps(1) infinite;opacity:0">
      <rect x="${r2(W / 2 - bw / 2)}" y="${GY + 22}" width="${bw}" height="${sub ? 76 : 54}" rx="8" fill="${C.bg}" stroke="${color}" stroke-width="2" opacity=".95"/>
      ${px(text, W / 2, GY + 36, { s: 4, fill: color, anchor: 'middle', attrs: 'filter="url(#glow)"' })}
      ${sub ? px(sub, W / 2, GY + 78, { s: 2, fill: C.white, anchor: 'middle' }) : ''}
    </g>`;
  };
  const year = (d.lastDate || d.generatedAt).slice(0, 4);
  b += msg('PLAYER 1 READY!', '', 0.15, READY_END - 0.15, C.yellow);
  b += msg(`WAVE ${year} CLEAR!`, `+${fmt(d.lastYear.total)} PONTOS`, clearT, respawn - 0.15, C.green);

  return card({ w: W, h: H, title: `Space Invaders com as contribuições de ${d.login}`, body: b, defs, css });
}
