// "Status do personagem": linguagens como barras de RPG + radar do ritmo semanal.
import { C, r2, r3, fmt, card } from '../lib/svg.mjs';
import { px } from '../lib/font.mjs';

const DIAS = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB'];
const DIAS_LONGO = ['DOMINGO', 'SEGUNDA', 'TERÇA', 'QUARTA', 'QUINTA', 'SEXTA', 'SÁBADO'];

// garante contraste da cor da linguagem com o fundo escuro
function brighten(hex) {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex || '');
  if (!m) return C.purple;
  let [r, g, b] = [0, 2, 4].map((i) => parseInt(m[1].slice(i, i + 2), 16));
  const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  if (lum < 110) {
    const k = 110 / Math.max(lum, 1);
    const mix = (v) => Math.min(255, Math.round(v * Math.min(k, 2.2) + 40));
    [r, g, b] = [mix(r), mix(g), mix(b)];
  }
  return '#' + [r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('');
}

export function lab(d) {
  const W = 1000, H = 366;
  let b = '', css = '', defs = '';

  // ---------- linguagens ----------
  b += px('◆ ATRIBUTOS (LINGUAGENS)', 32, 28, { s: 2, fill: C.yellow, attrs: 'filter="url(#glow)"' });
  const langs = d.languages.slice(0, 6);
  const top = langs[0]?.pct || 1;
  const SEG = 18, SW = 14, SG = 3, RY0 = 66, RH = 44;
  css += `.seg{animation:seg .25s ease-out backwards}@keyframes seg{from{opacity:0;transform:scaleY(.2)}}
  .seg{transform-box:fill-box;transform-origin:center}`;
  langs.forEach((l, i) => {
    const y = RY0 + i * RH;
    const col = brighten(l.color);
    const name = l.name.toUpperCase().slice(0, 12);
    b += px(name, 32, y + 3, { s: 2, fill: C.white });
    const filled = Math.max(1, Math.round((l.pct / top) * SEG));
    const bx = 196;
    let segs = '';
    for (let k = 0; k < SEG; k++) {
      const x = bx + k * (SW + SG);
      if (k < filled) {
        segs += `<rect class="seg" x="${x}" y="${y}" width="${SW}" height="20" rx="2" fill="${col}" style="animation-delay:${r3(0.3 + i * 0.12 + k * 0.035)}s"/>`;
      } else {
        segs += `<rect x="${x + 0.5}" y="${y + 0.5}" width="${SW - 1}" height="19" rx="2" fill="none" stroke="${C.line}"/>`;
      }
    }
    b += `<g filter="url(#glow)">${segs}</g>`;
    const pctTxt = `${l.pct.toFixed(1).replace('.', ',')}%`;
    b += px(pctTxt, bx + SEG * (SW + SG) + 10, y + 3, { s: 2, fill: col });
  });
  if (!langs.length) b += px('SEM DADOS AINDA', 32, RY0, { s: 2, fill: C.dim });
  b += px('% DO CÓDIGO NOS REPOSITÓRIOS PRÓPRIOS (SEM FORKS)', 32, RY0 + 6 * RH + 6, { s: 1.4, fill: C.dim });

  // divisor
  b += `<line x1="640" x2="640" y1="24" y2="${H - 24}" stroke="${C.line}" stroke-dasharray="3 5"/>`;

  // ---------- radar semanal ----------
  b += px('◆ RITMO SEMANAL', 668, 28, { s: 2, fill: C.cyan, attrs: 'filter="url(#glow)"' });
  const cx = 815, cy = 180, R = 98;
  const wd = d.weekday;
  const mx = Math.max(1, ...wd);
  const ang = (i) => -Math.PI / 2 + (i * 2 * Math.PI) / 7;
  const P = (i, r) => [cx + Math.cos(ang(i)) * r, cy + Math.sin(ang(i)) * r];
  for (let k = 1; k <= 4; k++) {
    const pts = [...Array(7)].map((_, i) => P(i, (R * k) / 4).map(r2).join(',')).join(' ');
    b += `<polygon points="${pts}" fill="none" stroke="${C.line}" stroke-width="${k === 4 ? 1.5 : 1}"/>`;
  }
  for (let i = 0; i < 7; i++) {
    const [x, y] = P(i, R);
    b += `<line x1="${cx}" y1="${cy}" x2="${r2(x)}" y2="${r2(y)}" stroke="${C.line}"/>`;
    const [lx, ly] = P(i, R + 22);
    b += px(DIAS[i], lx, ly - 5, { s: 1.6, fill: wd[i] === mx ? C.yellow : C.dim, anchor: 'middle' });
  }
  const dp = wd.map((v, i) => P(i, 8 + (v / mx) * (R - 8)));
  css += `.radar{transform-box:view-box;transform-origin:${cx}px ${cy}px;animation:radar 1.4s cubic-bezier(.2,.9,.3,1.3) .4s backwards}
  @keyframes radar{from{transform:scale(0);opacity:0}}
  .rpulse{animation:rpulse 2.4s ease-in-out infinite}@keyframes rpulse{0%,100%{opacity:.25}50%{opacity:.5}}
  .sweep{transform-box:view-box;transform-origin:${cx}px ${cy}px;animation:spin 4s linear infinite}@keyframes spin{to{transform:rotate(360deg)}}`;
  defs += `<radialGradient id="sweepg" cx="${cx}" cy="${cy}" r="${R}" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="${C.cyan}" stop-opacity="0"/><stop offset="1" stop-color="${C.cyan}" stop-opacity=".35"/></radialGradient>`;
  // feixe de radar girando
  const a1 = 0, a2 = Math.PI / 5;
  b += `<path class="sweep" d="M${cx} ${cy}L${r2(cx + R * Math.cos(a1))} ${r2(cy + R * Math.sin(a1))}A${R} ${R} 0 0 1 ${r2(cx + R * Math.cos(a2))} ${r2(cy + R * Math.sin(a2))}Z" fill="url(#sweepg)"/>`;
  const poly = dp.map((p) => p.map(r2).join(',')).join(' ');
  b += `<g class="radar">
    <polygon class="rpulse" points="${poly}" fill="${C.pink}"/>
    <polygon points="${poly}" fill="none" stroke="${C.pink}" stroke-width="2.4" stroke-linejoin="round" filter="url(#glow)"/>
    ${dp.map(([x, y], i) => `<circle cx="${r2(x)}" cy="${r2(y)}" r="${wd[i] === mx ? 4.5 : 3}" fill="${wd[i] === mx ? C.yellow : C.white}"/>`).join('')}
  </g>`;
  const bestIdx = wd.indexOf(mx);
  b += px(`DIA MAIS PRODUTIVO: ${DIAS_LONGO[bestIdx]}`, cx, H - 50, { s: 1.6, fill: C.yellow, anchor: 'middle' });
  b += px(`${fmt(mx)} CONTRIBUIÇÕES NO ANO`, cx, H - 32, { s: 1.4, fill: C.dim, anchor: 'middle' });

  return card({ w: W, h: H, title: `Linguagens e ritmo semanal de ${d.login}`, body: b, defs, css });
}
