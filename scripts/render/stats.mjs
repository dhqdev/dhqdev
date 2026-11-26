// Placar de commits: números em "odômetro" girando + gráfico semanal tipo osciloscópio.
import { C, r2, r3, fmt, card } from '../lib/svg.mjs';
import { px, textD } from '../lib/font.mjs';

const MESES = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ'];
const dm = (iso) => (iso ? `${iso.slice(8, 10)}/${iso.slice(5, 7)}/${iso.slice(2, 4)}` : '—');

export function stats(d) {
  const W = 1000, H = 446;
  let b = '', css = '', defs = '';

  // tira de dígitos 0-9 duas vezes, empilhados (10 unidades por dígito)
  let strip = '';
  for (let k = 0; k < 20; k++) strip += textD(String(k % 10), 0, k * 10);
  defs += `<path id="strip" d="${strip}"/>
  <clipPath id="dwin"><rect x="-2" y="-3" width="34" height="42"/></clipPath>`;
  css += `.roll{animation:roll 2s cubic-bezier(.12,.8,.2,1) backwards}@keyframes roll{from{transform:translateY(0)}}`;

  const odometer = (value, x, y, color, delay0) => {
    const str = fmt(value);
    let out = '', cx = x, di = 0;
    for (const ch of str) {
      if (/\d/.test(ch)) {
        const fy = (10 + Number(ch)) * 50;
        const delay = r3(delay0 + di * 0.12);
        out += `<g transform="translate(${cx} ${y})" clip-path="url(#dwin)"><g class="roll" style="transform:translateY(-${fy}px);animation-delay:${delay}s"><use href="#strip" transform="scale(5)" fill="${color}"/></g></g>`;
        di++;
      } else {
        out += px(ch, cx, y, { s: 5, fill: color });
      }
      cx += 30;
    }
    return `<g filter="url(#glow)">${out}</g>`;
  };

  // cabeçalho
  b += px('◆ PLACAR DE COMMITS', 32, 28, { s: 3, fill: C.yellow, attrs: 'filter="url(#glow)"' });
  const upd = new Date(d.generatedAt);
  let when;
  try {
    when = new Intl.DateTimeFormat('pt-BR', { timeZone: 'America/Sao_Paulo', day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(upd).replace(',', '');
  } catch {
    when = upd.toISOString().slice(0, 16).replace('T', ' ');
  }
  b += px(`ATUALIZADO ${when}`, W - 32, 33, { s: 1.6, fill: C.dim, anchor: 'end' });

  // tiles
  const sinceYear = d.createdAt.slice(0, 4);
  const tiles = [
    { label: 'CONTRIBUIÇÕES', v: d.lastYear.total, sub: 'ÚLTIMOS 12 MESES', c: C.pink, icon: '★' },
    { label: 'COMMITS', v: d.lastYear.commits, sub: `${fmt(d.allTime.commits)} DESDE ${sinceYear}`, c: C.cyan, icon: '▶' },
    { label: 'STREAK ATUAL', v: d.streak.current, sub: d.streak.current ? 'DIAS SEGUIDOS' : 'BORA COMMITAR!', c: C.yellow, icon: '♥' },
    { label: 'MAIOR STREAK', v: d.streak.longest, sub: d.streak.longestStart ? `${dm(d.streak.longestStart)} → ${dm(d.streak.longestEnd)}` : '—', c: C.purple, icon: '◆' },
  ];
  const TW = 226, TH = 128, G = 14, X0 = (W - (4 * TW + 3 * G)) / 2, TY = 66;
  tiles.forEach((t, i) => {
    const x = X0 + i * (TW + G);
    b += `<rect x="${x}" y="${TY}" width="${TW}" height="${TH}" rx="10" fill="${C.panel}" stroke="${t.c}" stroke-opacity=".55" stroke-width="1.5"/>`;
    b += `<rect x="${x + 1}" y="${TY + 1}" width="${TW - 2}" height="3" rx="1.5" fill="${t.c}" opacity=".8"/>`;
    b += px(t.label, x + 16, TY + 18, { s: 2, fill: t.c });
    b += px(t.icon, x + TW - 16, TY + 18, { s: 2, fill: t.c, anchor: 'end', attrs: 'class="blink"' });
    b += odometer(t.v, x + 16, TY + 46, C.white, 0.2 + i * 0.25);
    b += px(t.sub, x + 16, TY + 102, { s: 1.6, fill: C.dim });
  });

  // ---------- gráfico semanal ----------
  b += px('◆ ATIVIDADE SEMANAL', 32, 216, { s: 2, fill: C.cyan });
  const weeks = d.lastYear.weeks;
  const vals = weeks.map((w) => w.reduce((s, x) => s + x.count, 0));
  const maxV = Math.max(1, ...vals);
  const L = 44, Rr = 956, Y0 = 372, CH = 118;
  const n = vals.length;
  const pts = vals.map((v, i) => [L + (i * (Rr - L)) / (n - 1), Y0 - (v / maxV) * CH]);
  // Catmull-Rom -> Bézier (sem ultrapassar a base)
  let dl = `M${r2(pts[0][0])} ${r2(pts[0][1])}`;
  for (let i = 0; i < n - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(n - 1, i + 2)];
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, Math.min(Y0, p1[1] + (p2[1] - p0[1]) / 6)];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, Math.min(Y0, p2[1] - (p3[1] - p1[1]) / 6)];
    dl += `C${r2(c1[0])} ${r2(c1[1])} ${r2(c2[0])} ${r2(c2[1])} ${r2(p2[0])} ${r2(p2[1])}`;
  }
  defs += `
  <linearGradient id="area" x1="0" y1="${Y0 - CH}" x2="0" y2="${Y0}" gradientUnits="userSpaceOnUse">
    <stop offset="0" stop-color="${C.pink}" stop-opacity=".45"/><stop offset="1" stop-color="${C.purple}" stop-opacity="0"/>
  </linearGradient>
  <linearGradient id="lineg" x1="${L}" x2="${Rr}" gradientUnits="userSpaceOnUse">
    <stop offset="0" stop-color="${C.purple}"/><stop offset=".5" stop-color="${C.pink}"/><stop offset="1" stop-color="${C.cyan}"/>
  </linearGradient>
  <linearGradient id="scang" x1="0" x2="1"><stop offset="0" stop-color="${C.cyan}" stop-opacity="0"/><stop offset="1" stop-color="${C.cyan}" stop-opacity=".35"/></linearGradient>
  <clipPath id="plot"><rect x="${L - 4}" y="${Y0 - CH - 14}" width="${Rr - L + 8}" height="${CH + 16}"/></clipPath>`;
  for (let k = 0; k <= 3; k++) {
    const gy = Y0 - (k * CH) / 3;
    b += `<line x1="${L}" x2="${Rr}" y1="${r2(gy)}" y2="${r2(gy)}" stroke="${C.line}" stroke-dasharray="${k ? '3 5' : '0'}"/>`;
  }
  css += `
  .draw{stroke-dasharray:1;animation:draw 2.4s ease-out .3s backwards}@keyframes draw{from{stroke-dashoffset:1}}
  .fade{animation:fade 1.2s ease-out 1.6s backwards}@keyframes fade{from{opacity:0}}
  .scanx{animation:scanx 5s linear infinite}@keyframes scanx{from{transform:translateX(0)}to{transform:translateX(${Rr - L}px)}}`;
  b += `<g clip-path="url(#plot)">
    <g class="scanx"><rect x="${L - 60}" y="${Y0 - CH - 14}" width="60" height="${CH + 14}" fill="url(#scang)"/><rect x="${L - 1.5}" y="${Y0 - CH - 14}" width="1.5" height="${CH + 14}" fill="${C.cyan}" opacity=".7"/></g>
    <path class="fade" d="${dl}L${Rr} ${Y0}L${L} ${Y0}Z" fill="url(#area)"/>
    <path class="draw" pathLength="1" d="${dl}" fill="none" stroke="url(#lineg)" stroke-width="2.6" stroke-linejoin="round" filter="url(#glow)"/>
  </g>`;
  // pico
  const pk = vals.indexOf(maxV);
  const [pxk, pyk] = pts[pk];
  const ptxt = `PICO: ${fmt(maxV)}`;
  const pw = ptxt.length * 6 * 1.6;
  // rótulo do pico: ao lado do ponto (lado com mais espaço), sem cobrir a linha
  const right = pxk + 12 + pw < Rr;
  const lblx = right ? pxk + 12 : pxk - 12 - pw;
  const lbly = Math.max(Y0 - CH - 10, pyk - 6);
  b += `<g class="fade"><line x1="${r2(pxk)}" x2="${r2(pxk)}" y1="${r2(pyk)}" y2="${Y0}" stroke="${C.yellow}" stroke-dasharray="2 3" opacity=".6"/>
    <circle cx="${r2(pxk)}" cy="${r2(pyk)}" r="4" fill="${C.yellow}" filter="url(#dotglow)"/>
    <rect x="${r2(lblx - 5)}" y="${r2(lbly - 4)}" width="${r2(pw + 10)}" height="19" rx="4" fill="${C.bg}" opacity=".85"/>
    ${px(ptxt, lblx, lbly, { s: 1.6, fill: C.yellow })}</g>`;
  // ponto correndo pela linha
  b += `<g class="fade"><circle r="4.5" fill="#fff" filter="url(#dotglow)"><animateMotion dur="8s" repeatCount="indefinite" path="${dl}"/></circle></g>`;
  // meses
  let lastM = -1;
  weeks.forEach((w, i) => {
    const m = Number(w[0].date.slice(5, 7)) - 1;
    if (m !== lastM && w[0].date.slice(8, 10) <= '07') {
      if (i < n - 2) b += px(MESES[m], pts[i][0], Y0 + 10, { s: 1.4, fill: C.dim });
      lastM = m;
    } else if (lastM === -1) lastM = m;
  });

  // rodapé com números extras
  const extra = `PRS ${fmt(d.lastYear.prs)}  •  ISSUES ${fmt(d.lastYear.issues)}  •  REVIEWS ${fmt(d.lastYear.reviews)}  •  MELHOR DIA ${dm(d.bestDay.date)} (${d.bestDay.count})  •  DIAS ATIVOS ${d.activeDays}`;
  b += px(extra, W / 2, 412, { s: 1.6, fill: C.purple, anchor: 'middle' });

  return card({ w: W, h: H, title: `Estatísticas de commits de ${d.login}`, body: b, defs, css });
}
