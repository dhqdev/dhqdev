// Banner principal: pôr do sol synthwave, montanhas, grid em perspectiva,
// nome com efeito glitch/cromado e frases sendo digitadas.
import { C, rng, r2, r3, card } from '../lib/svg.mjs';
import { px, textD, measure } from '../lib/font.mjs';

export function banner(cfg) {
  const W = 1000, H = 440, HZ = 310, CX = 500;
  const R = rng(2026);
  let css = '';
  let defs = '';
  let b = '';

  // ---------- céu ----------
  defs += `
  <linearGradient id="sky" x1="0" y1="0" x2="0" y2="${HZ}" gradientUnits="userSpaceOnUse">
    <stop offset="0" stop-color="#06001a"/><stop offset=".45" stop-color="#170638"/>
    <stop offset=".8" stop-color="#3d0c5e"/><stop offset="1" stop-color="#a3166b"/>
  </linearGradient>
  <linearGradient id="ground" x1="0" y1="${HZ}" x2="0" y2="${H}" gradientUnits="userSpaceOnUse">
    <stop offset="0" stop-color="#1c0640"/><stop offset="1" stop-color="#04000c"/>
  </linearGradient>
  <linearGradient id="sung" x1="0" y1="${HZ - 125}" x2="0" y2="${HZ}" gradientUnits="userSpaceOnUse">
    <stop offset="0" stop-color="${C.yellow}"/><stop offset=".5" stop-color="${C.orange}"/><stop offset="1" stop-color="${C.pink}"/>
  </linearGradient>
  <filter id="blur18" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="22"/></filter>
  <filter id="blur3"><feGaussianBlur stdDeviation="3"/></filter>
  <clipPath id="abovehz"><rect width="${W}" height="${HZ}"/></clipPath>
  <clipPath id="belowhz"><rect y="${HZ}" width="${W}" height="${H - HZ}"/></clipPath>
  <linearGradient id="shootg" x1="0" y1="0" x2="-110" y2="-34" gradientUnits="userSpaceOnUse">
    <stop offset="0" stop-color="#fff"/><stop offset="1" stop-color="#fff" stop-opacity="0"/>
  </linearGradient>`;

  b += `<rect width="${W}" height="${HZ}" fill="url(#sky)"/>`;

  // estrelas piscando
  css += `.tw{animation:tw 3s ease-in-out infinite}@keyframes tw{0%,100%{opacity:.2}50%{opacity:1}}`;
  const starCols = ['#ffffff', '#ffffff', '#ffffff', C.cyan, C.pink, C.yellow];
  for (let i = 0; i < 110; i++) {
    const x = R() * W, y = R() * (HZ - 30);
    const big = R() < 0.12;
    const r = big ? 1.4 + R() * 0.6 : 0.4 + R() * 0.8;
    const dur = 2 + R() * 4;
    b += `<circle class="tw" cx="${r2(x)}" cy="${r2(y)}" r="${r2(r)}" fill="${starCols[Math.floor(R() * starCols.length)]}" style="animation-duration:${r2(dur)}s;animation-delay:-${r2(R() * dur)}s"/>`;
  }

  // estrelas cadentes
  css += `.sh{animation:sh 9s linear infinite;opacity:0}
  @keyframes sh{0%{transform:translate(0,0);opacity:0}1%{opacity:1}7%{transform:translate(520px,160px);opacity:0}100%{transform:translate(520px,160px);opacity:0}}`;
  b += `<g transform="translate(120 30)"><g class="sh"><line x1="0" y1="0" x2="-110" y2="-34" stroke="url(#shootg)" stroke-width="2" stroke-linecap="round"/></g></g>`;
  b += `<g transform="translate(430 10)"><g class="sh" style="animation-delay:-4.6s;animation-duration:11s"><line x1="0" y1="0" x2="-110" y2="-34" stroke="url(#shootg)" stroke-width="1.6" stroke-linecap="round"/></g></g>`;

  // ---------- sol com listras animadas ----------
  const SR = 125, SCY = HZ;
  let bars = '';
  const NB = 7, BT = 4.2;
  for (let i = 0; i < NB; i++) {
    const begin = -r3((i * BT) / NB);
    bars += `<rect x="${CX - SR - 5}" width="${2 * SR + 10}" y="${SCY - 92}" height="1" fill="#000">
      <animate attributeName="y" values="${SCY - 92};${SCY - 2}" dur="${BT}s" begin="${begin}s" repeatCount="indefinite"/>
      <animate attributeName="height" values="1;11" dur="${BT}s" begin="${begin}s" repeatCount="indefinite"/>
    </rect>`;
  }
  defs += `<mask id="sunmask" maskUnits="userSpaceOnUse" x="0" y="0" width="${W}" height="${H}">
    <rect width="${W}" height="${H}" fill="#fff"/>${bars}</mask>`;
  css += `.sunglow{animation:pulse 5s ease-in-out infinite}@keyframes pulse{0%,100%{opacity:.55}50%{opacity:.8}}`;
  b += `<g clip-path="url(#abovehz)">
    <circle class="sunglow" cx="${CX}" cy="${SCY}" r="${SR + 40}" fill="${C.pink}" filter="url(#blur18)"/>
    <circle cx="${CX}" cy="${SCY}" r="${SR}" fill="url(#sung)" mask="url(#sunmask)"/>
  </g>`;

  // ---------- montanhas ----------
  const ridge = (from, to, n, scale, seed) => {
    const rr = rng(seed);
    const pts = [[from, HZ]];
    for (let i = 0; i <= n; i++) {
      const x = from + ((to - from) * i) / n;
      const t = Math.min(1, Math.abs(x - CX) / (W / 2));
      const hmax = (20 + 150 * t * t) * scale;
      const k = i % 2 === 0 ? 0.25 + rr() * 0.25 : 0.65 + rr() * 0.35;
      pts.push([x, HZ - hmax * k]);
    }
    pts.push([to, HZ]);
    return pts.map(([x, y]) => `${r2(x)},${r2(y)}`).join(' ');
  };
  b += `<polygon points="${ridge(-20, 395, 14, 1.15, 7)}" fill="#1b0840" stroke="${C.purple}" stroke-opacity=".55" stroke-width="1.4"/>`;
  b += `<polygon points="${ridge(605, 1020, 14, 1.15, 9)}" fill="#1b0840" stroke="${C.purple}" stroke-opacity=".55" stroke-width="1.4"/>`;
  b += `<polygon points="${ridge(-20, 330, 10, 0.8, 11)}" fill="#0d0326" stroke="${C.pink}" stroke-opacity=".85" stroke-width="1.6"/>`;
  b += `<polygon points="${ridge(670, 1020, 10, 0.8, 13)}" fill="#0d0326" stroke="${C.pink}" stroke-opacity=".85" stroke-width="1.6"/>`;

  // ---------- chão com grid em perspectiva ----------
  b += `<rect y="${HZ}" width="${W}" height="${H - HZ}" fill="url(#ground)"/>`;
  let grid = '';
  for (let i = -16; i <= 16; i++) {
    grid += `<line x1="${CX + i * 16}" y1="${HZ}" x2="${CX + i * 120}" y2="${H}"/>`;
  }
  const D = H - HZ + 6, ZF = 10, NL = 10, LT = 2.2;
  const off = (p) => (D * (1 / (ZF - (ZF - 1) * p) - 1 / ZF)) / (1 - 1 / ZF);
  let kf = '';
  for (let k = 0; k <= 10; k++) {
    const p = k / 10;
    kf += `${k * 10}%{transform:translateY(${r2(off(p))}px);opacity:${r2(Math.min(1, p * 6))}}`;
  }
  css += `.hl{animation:hl ${LT}s linear infinite}@keyframes hl{${kf}}`;
  for (let i = 0; i < NL; i++) {
    grid += `<line class="hl" x1="-20" x2="${W + 20}" y1="${HZ}" y2="${HZ}" style="animation-delay:-${r3((i * LT) / NL)}s"/>`;
  }
  b += `<g clip-path="url(#belowhz)" stroke="${C.pink}" stroke-width="1.6" opacity=".85" filter="url(#glow)">${grid}</g>`;
  b += `<rect y="${HZ - 1.5}" width="${W}" height="3" fill="#ff8fd0" filter="url(#hglow)"/><rect y="${HZ - 0.75}" width="${W}" height="1.5" fill="#ffd6f0"/>`;

  // ---------- HUD ----------
  b += px('1UP', 26, 22, { s: 2, fill: C.pink });
  b += px(cfg.login.toUpperCase(), 26 + 3 * 12 + 10, 22, { s: 2, fill: C.white });
  b += px('INSERT COIN', W - 26, 22, { s: 2, fill: C.yellow, anchor: 'end', attrs: 'class="blink"' });

  // ---------- título ----------
  const S = 9;
  const tw = measure(cfg.title) * S;
  const tx = r2((W - tw) / 2), ty = 62;
  const d = textD(cfg.title);
  defs += `
  <linearGradient id="tg" x1="0" y1="0" x2="0" y2="7" gradientUnits="userSpaceOnUse">
    <stop offset="0" stop-color="#ffffff"/><stop offset=".36" stop-color="#9ff6ff"/><stop offset=".48" stop-color="${C.cyan}"/>
    <stop offset=".5" stop-color="#3a0d6e"/><stop offset=".54" stop-color="${C.pink}"/><stop offset=".82" stop-color="${C.orange}"/>
    <stop offset="1" stop-color="${C.yellow}"/>
  </linearGradient>
  <linearGradient id="sweepg" x1="0" x2="1"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".5" stop-color="#fff" stop-opacity=".85"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
  <mask id="titlemask" maskUnits="userSpaceOnUse" x="0" y="0" width="${W}" height="${H}">
    <path transform="translate(${tx} ${ty}) scale(${S})" fill="#fff" d="${d}"/>
  </mask>
  <filter id="tglow" x="-10%" y="-40%" width="120%" height="180%"><feGaussianBlur stdDeviation="10"/></filter>`;
  const T = (x, y, extra) => `<path transform="translate(${r2(x)} ${r2(y)}) scale(${S})" d="${d}" ${extra}/>`;
  // brilho de fundo
  b += `<g filter="url(#tglow)" opacity=".55">${T(tx, ty, `fill="${C.pink}"`)}</g>`;
  // extrusão 3D
  const shades = ['#0b0221', '#160536', '#22084a', '#330c63'];
  shades.forEach((c, i) => {
    const k = (4 - i) * 1.7;
    b += T(tx + k, ty + k, `fill="${c}"`);
  });
  // camadas de glitch (RGB split)
  css += `
  .gA,.gB{opacity:0;mix-blend-mode:screen}
  .gA{animation:gA 5s steps(1) infinite}.gB{animation:gB 5s steps(1) infinite}
  @keyframes gA{0%,84%{opacity:0;transform:none}85%{opacity:.9;transform:translate(-7px,1px);clip-path:inset(8% 0 62% 0)}87%{transform:translate(6px,-2px);clip-path:inset(52% 0 22% 0)}89%{transform:translate(-4px,0);clip-path:inset(30% 0 45% 0)}91%{transform:translate(3px,2px);clip-path:inset(70% 0 5% 0)}93%,100%{opacity:0;transform:none}}
  @keyframes gB{0%,85%{opacity:0;transform:none}86%{opacity:.9;transform:translate(7px,-1px);clip-path:inset(40% 0 35% 0)}88%{transform:translate(-6px,2px);clip-path:inset(10% 0 70% 0)}90%{transform:translate(5px,0);clip-path:inset(60% 0 12% 0)}92%,100%{opacity:0;transform:none}}
  .tmain{animation:tj 5s steps(1) infinite}
  @keyframes tj{0%,85%,100%{transform:none}86%{transform:translateX(3px)}88%{transform:translateX(-2px)}90%{transform:none}}
  .sweep{animation:sweep 6s ease-in-out infinite}
  @keyframes sweep{0%,55%{transform:translateX(-200px)}80%,100%{transform:translateX(${W + 200}px)}}`;
  b += `<g class="tmain">${T(tx, ty, `fill="url(#tg)"`)}
    <g mask="url(#titlemask)"><rect class="sweep" x="0" y="${ty - 10}" width="90" height="${7 * S + 20}" fill="url(#sweepg)" transform="skewX(-20)"/></g>
  </g>`;
  b += `<g class="gA">${T(tx, ty, `fill="${C.cyan}"`)}</g>`;
  b += `<g class="gB">${T(tx, ty, `fill="${C.pink}"`)}</g>`;

  // ---------- frases digitadas ----------
  const s = 3, adv = 6 * s;
  const phrases = cfg.phrases.map((p) => p.toUpperCase());
  const maxW = Math.max(...phrases.map((p) => measure(p) * s));
  const total = 30 + maxW + 20;
  const x0 = r2(CX - total / 2), txs = x0 + 30, sy = 150;
  const ct = 0.055, hold = 2.0, dt = 0.025, gap = 0.45;
  const ev = []; // [t, largura]
  const windows = [];
  let t = 0.2;
  ev.push([0, 0]);
  for (const p of phrases) {
    const n = Array.from(p).length;
    const start = t;
    for (let j = 1; j <= n; j++) ev.push([t + j * ct, j * adv]);
    t += n * ct + hold;
    for (let j = 1; j <= n; j++) ev.push([t + j * dt, (n - j) * adv]);
    t += n * dt;
    windows.push([start, t]);
    t += gap;
  }
  const TT = t;
  // normaliza (keyTimes estritamente crescentes)
  const kt = [], vals = [];
  for (const [et, w] of ev) {
    const k = r3(et / TT);
    if (kt.length && k <= kt[kt.length - 1]) {
      vals[vals.length - 1] = w;
      continue;
    }
    kt.push(k);
    vals.push(w);
  }
  if (kt[0] !== 0) { kt.unshift(0); vals.unshift(0); }
  const anim = (attr, vs) => `<animate attributeName="${attr}" dur="${r3(TT)}s" repeatCount="indefinite" calcMode="discrete" keyTimes="${kt.join(';')}" values="${vs.join(';')}"/>`;
  defs += `<clipPath id="typeclip"><rect x="${txs - 1}" y="${sy - 4}" height="${7 * s + 8}" width="0">${anim('width', vals.map((v) => v + 1))}</rect></clipPath>`;

  b += px('▶', x0, sy, { s, fill: C.pink, attrs: 'filter="url(#glow)"' });
  let ph = '';
  phrases.forEach((p, i) => {
    const [a, z] = windows[i];
    const ka = r3(a / TT), kz = r3(z / TT);
    const op = ka <= 0
      ? `<animate attributeName="opacity" dur="${r3(TT)}s" repeatCount="indefinite" calcMode="discrete" keyTimes="0;${kz}" values="1;0"/>`
      : `<animate attributeName="opacity" dur="${r3(TT)}s" repeatCount="indefinite" calcMode="discrete" keyTimes="0;${ka};${kz}" values="0;1;0"/>`;
    ph += `<path opacity="${ka <= 0 ? 1 : 0}" transform="translate(${txs} ${sy}) scale(${s})" fill="${C.cyan}" d="${textD(p)}">${op}</path>`;
  });
  b += `<g clip-path="url(#typeclip)" filter="url(#glow)">${ph}</g>`;
  b += `<rect y="${sy}" width="${5 * s}" height="${7 * s}" fill="${C.pink}" x="${txs}">${anim('x', vals.map((v) => r2(txs + v + 3)))}</rect>`;

  return card({ w: W, h: H, title: `${cfg.title} — ${cfg.role}`, body: b, defs, css, bg: 'url(#sky)', radius: 18 });
}
