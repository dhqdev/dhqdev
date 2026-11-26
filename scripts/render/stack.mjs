// Tela de "SELECT YOUR STACK" no estilo jogo de luta: um cursor percorre as
// tecnologias e o painel ao lado mostra a "ficha" de cada uma.
import { C, r3, card } from '../lib/svg.mjs';
import { px } from '../lib/font.mjs';

export function stack(cfg) {
  const W = 1000, H = 372;
  const items = cfg.stack.slice(0, 15);
  const n = items.length;
  const COLS = 5, TW = 110, TH = 78, G = 10, X0 = 32, Y0 = 92;
  const STEP = 1.8, T = r3(n * STEP);
  let b = '';
  let css = `
  .flash{animation:flash ${STEP}s linear infinite}
  @keyframes flash{0%{opacity:.5}18%,100%{opacity:0}}
  .breath{animation:breath 1.8s ease-in-out infinite}
  @keyframes breath{0%,100%{opacity:.55}50%{opacity:1}}
  .bob{animation:bob .6s steps(1) infinite}
  @keyframes bob{50%{transform:translateY(-3px)}}`;

  const win = (i) => {
    const a = r3(i / n), z = r3((i + 1) / n);
    if (i === 0) return { init: 1, anim: `<animate attributeName="opacity" dur="${T}s" repeatCount="indefinite" calcMode="discrete" keyTimes="0;${z}" values="1;0"/>` };
    if (i === n - 1) return { init: 0, anim: `<animate attributeName="opacity" dur="${T}s" repeatCount="indefinite" calcMode="discrete" keyTimes="0;${a}" values="0;1"/>` };
    return { init: 0, anim: `<animate attributeName="opacity" dur="${T}s" repeatCount="indefinite" calcMode="discrete" keyTimes="0;${a};${z}" values="0;1;0"/>` };
  };

  // cabeçalho
  b += px('SELECT YOUR STACK', X0, 30, { s: 4, fill: C.yellow, attrs: 'filter="url(#glow)"' });
  b += px('ESCOLHA SEU LUTADOR', X0 + 17 * 24 + 16, 44, { s: 2, fill: C.dim });
  b += px('CRÉDITOS: ∞', W - 32, 28, { s: 2, fill: C.pink, anchor: 'end' });
  b += px('MODO: DEMO', W - 32, 48, { s: 2, fill: C.dim, anchor: 'end', attrs: 'class="blink"' });

  // grade de tiles
  const pos = [];
  items.forEach((it, i) => {
    const cx = X0 + (i % COLS) * (TW + G), cy = Y0 + Math.floor(i / COLS) * (TH + G);
    pos.push([cx, cy]);
    const w = win(i);
    b += `<g>
      <rect x="${cx}" y="${cy}" width="${TW}" height="${TH}" rx="8" fill="${C.panel}" stroke="${it.color}" stroke-opacity=".45" stroke-width="1.5"/>
      <rect x="${cx}" y="${cy}" width="${TW}" height="${TH}" rx="8" fill="${it.color}" opacity="${w.init ? 0.2 : 0}">${w.anim.replace('values="1;0"', 'values=".2;0"').replace('values="0;1;0"', 'values="0;.2;0"').replace('values="0;1"', 'values="0;.2"')}</rect>
      ${px(it.tag, cx + TW / 2, cy + 13, { s: 5, fill: it.color, anchor: 'middle' })}
      ${px(it.name, cx + TW / 2, cy + 58, { s: 1.5, fill: C.white, anchor: 'middle', attrs: 'opacity=".85"' })}
    </g>`;
  });

  // cursor do jogador 1
  const vals = pos.map(([x, y]) => `${x} ${y}`).join(';');
  const kts = pos.map((_, i) => r3(i / n)).join(';');
  b += `<g transform="translate(${pos[0][0]} ${pos[0][1]})">
    <animateTransform attributeName="transform" type="translate" dur="${T}s" repeatCount="indefinite" calcMode="discrete" keyTimes="${kts}" values="${vals}"/>
    <g class="breath">
      <rect x="-4" y="-4" width="${TW + 8}" height="${TH + 8}" rx="11" fill="none" stroke="${C.yellow}" stroke-width="3" filter="url(#glow)"/>
    </g>
    <g class="bob">
      <rect x="-8" y="-16" width="30" height="18" rx="3" fill="${C.pink}"/>
      ${px('1P', -2, -12, { s: 1.6, fill: C.white })}
    </g>
  </g>`;

  // painel de detalhes
  const PX = 650, PY = Y0, PW = 318, PH = 3 * TH + 2 * G;
  const pcx = PX + PW / 2;
  b += `<rect x="${PX}" y="${PY}" width="${PW}" height="${PH}" rx="12" fill="${C.panel}" stroke="${C.cyan}" stroke-opacity=".6" stroke-width="1.5"/>`;
  b += px('PLAYER 1', PX + 16, PY + 14, { s: 2, fill: C.pink });
  b += px('LV.∞', PX + PW - 16, PY + 14, { s: 2, fill: C.dim, anchor: 'end' });
  items.forEach((it, i) => {
    const w = win(i);
    b += `<g opacity="${w.init}">${w.anim}
      <g class="breath">${px(it.tag, pcx, PY + 46, { s: 11, fill: it.color, anchor: 'middle', attrs: 'filter="url(#glow2)"' })}</g>
      ${px(it.name, pcx, PY + 140, { s: 3, fill: C.white, anchor: 'middle' })}
      ${px('CLASSE', pcx, PY + 176, { s: 1.5, fill: C.dim, anchor: 'middle' })}
      ${px(it.cls, pcx, PY + 190, { s: 2, fill: C.cyan, anchor: 'middle' })}
      ${px(it.quote, pcx, PY + 222, { s: 2, fill: C.yellow, anchor: 'middle' })}
    </g>`;
  });
  b += `<rect class="flash" x="${PX}" y="${PY}" width="${PW}" height="${PH}" rx="12" fill="#fff" opacity="0"/>`;

  return card({ w: W, h: H, title: 'Stack: ' + items.map((i) => i.name).join(', '), body: b, css });
}
