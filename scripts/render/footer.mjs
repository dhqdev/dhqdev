// Rodapé "CONTINUE?" com contagem regressiva, UFO passando e grid neon.
import { C, rng, r2, r3, card } from '../lib/svg.mjs';
import { px, textD, measure, spriteD } from '../lib/font.mjs';
import { UFO, SHIP } from '../lib/sprites.mjs';

export function footer(cfg) {
  const W = 1000, H = 240, HZ = 168, CX = 500;
  const R = rng(77);
  let b = '', defs = '';
  let css = `.tw{animation:tw 3s ease-in-out infinite}@keyframes tw{0%,100%{opacity:.2}50%{opacity:1}}`;

  defs += `
  <linearGradient id="fsky" x1="0" y1="0" x2="0" y2="${HZ}" gradientUnits="userSpaceOnUse">
    <stop offset="0" stop-color="#06001a"/><stop offset="1" stop-color="#2a0848"/>
  </linearGradient>
  <linearGradient id="ftg" x1="0" y1="0" x2="0" y2="7" gradientUnits="userSpaceOnUse">
    <stop offset="0" stop-color="${C.yellow}"/><stop offset=".5" stop-color="${C.orange}"/><stop offset="1" stop-color="${C.pink}"/>
  </linearGradient>
  <clipPath id="fbelow"><rect y="${HZ}" width="${W}" height="${H - HZ}"/></clipPath>`;

  for (let i = 0; i < 60; i++) {
    const dur = 2 + R() * 4;
    b += `<circle class="tw" cx="${r2(R() * W)}" cy="${r2(R() * (HZ - 10))}" r="${r2(0.4 + R() * 1)}" fill="#fff" style="animation-duration:${r2(dur)}s;animation-delay:-${r2(R() * dur)}s"/>`;
  }

  // chão
  b += `<rect y="${HZ}" width="${W}" height="${H - HZ}" fill="#08001a"/>`;
  let grid = '';
  for (let i = -16; i <= 16; i++) grid += `<line x1="${CX + i * 18}" y1="${HZ}" x2="${CX + i * 110}" y2="${H}"/>`;
  const D = H - HZ + 6, ZF = 8, NL = 7, LT = 2.4;
  const off = (p) => (D * (1 / (ZF - (ZF - 1) * p) - 1 / ZF)) / (1 - 1 / ZF);
  let kf = '';
  for (let k = 0; k <= 10; k++) kf += `${k * 10}%{transform:translateY(${r2(off(k / 10))}px);opacity:${r2(Math.min(1, (k / 10) * 6))}}`;
  css += `.fl{animation:fl ${LT}s linear infinite}@keyframes fl{${kf}}`;
  for (let i = 0; i < NL; i++) grid += `<line class="fl" x1="-20" x2="${W + 20}" y1="${HZ}" y2="${HZ}" style="animation-delay:-${r3((i * LT) / NL)}s"/>`;
  b += `<g clip-path="url(#fbelow)" stroke="${C.cyan}" stroke-width="1.4" opacity=".7" filter="url(#glow)">${grid}</g>`;
  b += `<rect y="${HZ - 1}" width="${W}" height="2" fill="${C.cyan}" filter="url(#hglow)"/>`;

  // UFO cruzando
  const us = 2.4;
  css += `.ufo{animation:ufo 12s linear infinite}@keyframes ufo{0%{transform:translateX(-80px)}45%,100%{transform:translateX(${W + 40}px)}}`;
  b += `<g transform="translate(0 18)"><g class="ufo"><g filter="url(#glow)"><path transform="scale(${us})" fill="${C.pink}" d="${spriteD(UFO)}"/></g></g></g>`;

  // texto principal
  const msg = 'VALEU PELA VISITA!';
  b += px(msg, CX, 46, { s: 5, fill: 'url(#ftg)', anchor: 'middle', attrs: 'filter="url(#glow)"' });

  // CONTINUE? 9..0
  const label = 'CONTINUE? ';
  const lw = measure(label + '9') * 3;
  const lx = CX - lw / 2;
  b += px(label, lx, 102, { s: 3, fill: C.white });
  const dx = lx + measure(label) * 3 + 3;
  let digits = '';
  for (let k = 0; k < 10; k++) {
    const dgt = String(9 - k);
    const a = r3(k / 10), z = r3((k + 1) / 10);
    const anim = k === 0
      ? `<animate attributeName="opacity" dur="10s" repeatCount="indefinite" calcMode="discrete" keyTimes="0;${z}" values="1;0"/>`
      : k === 9
        ? `<animate attributeName="opacity" dur="10s" repeatCount="indefinite" calcMode="discrete" keyTimes="0;${a}" values="0;1"/>`
        : `<animate attributeName="opacity" dur="10s" repeatCount="indefinite" calcMode="discrete" keyTimes="0;${a};${z}" values="0;1;0"/>`;
    digits += `<path opacity="${k === 0 ? 1 : 0}" transform="translate(${r2(dx)} 102) scale(3)" fill="${C.yellow}" d="${textD(dgt)}">${anim}</path>`;
  }
  b += `<g filter="url(#glow)">${digits}</g>`;

  // chamada para ação sobre o chão
  const cta = '★ DEIXE UMA ESTRELA NOS REPOS ★';
  const cw = measure(cta) * 2;
  b += `<rect x="${CX - cw / 2 - 14}" y="${HZ + 22}" width="${cw + 28}" height="30" rx="6" fill="#08001a" stroke="${C.pink}" stroke-opacity=".6"/>`;
  b += px(cta, CX, HZ + 30, { s: 2, fill: C.pink, anchor: 'middle', attrs: 'class="blink"' });

  // naves nas laterais
  css += `.hov{animation:hov 2s ease-in-out infinite}@keyframes hov{50%{transform:translateY(-5px)}}`;
  b += `<g transform="translate(70 120)"><g class="hov"><g filter="url(#glow)"><path transform="scale(2.4)" fill="${C.cyan}" d="${spriteD(SHIP)}"/></g></g></g>`;
  b += `<g transform="translate(${W - 70 - 13 * 2.4} 120)"><g class="hov" style="animation-delay:-1s"><g filter="url(#glow)"><path transform="scale(2.4)" fill="${C.cyan}" d="${spriteD(SHIP)}"/></g></g></g>`;

  return card({ w: W, h: H, title: 'Valeu pela visita!', body: b, defs, css, bg: 'url(#fsky)', radius: 18 });
}
