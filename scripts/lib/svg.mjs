// Utilidades compartilhadas: paleta, RNG, formatação e moldura dos cards.

export const C = {
  bg0: '#07001a',
  bg: '#0d0221',
  panel: '#150734',
  panel2: '#1d0b45',
  line: '#2e1a5e',
  dim: '#6b5a9e',
  pink: '#ff2a6d',
  cyan: '#05d9e8',
  purple: '#b967ff',
  yellow: '#fffb96',
  orange: '#ff9e3d',
  green: '#39ff88',
  white: '#f8f7ff',
};

export function rng(seed = 1) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const r2 = (n) => Math.round(n * 100) / 100;
export const r3 = (n) => Math.round(n * 1000) / 1000;

export function fmt(n) {
  return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

export function esc(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' })[c]);
}

/** Filtros e padrões usados em vários cards */
export function commonDefs() {
  return `
  <filter id="glow" x="-30%" y="-60%" width="160%" height="220%">
    <feGaussianBlur stdDeviation="3" result="b"/>
    <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
  </filter>
  <filter id="glow2" x="-30%" y="-60%" width="160%" height="220%">
    <feGaussianBlur stdDeviation="6" result="b"/>
    <feMerge><feMergeNode in="b"/><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
  </filter>
  <filter id="dotglow" x="-300%" y="-300%" width="700%" height="700%">
    <feGaussianBlur stdDeviation="4" result="b"/>
    <feMerge><feMergeNode in="b"/><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
  </filter>
  <filter id="hglow" x="-5%" y="-900%" width="110%" height="1900%">
    <feGaussianBlur stdDeviation="4" result="b"/>
    <feMerge><feMergeNode in="b"/><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
  </filter>
  <pattern id="scan" width="4" height="4" patternUnits="userSpaceOnUse">
    <rect width="4" height="1.4" fill="#000" opacity=".28"/>
  </pattern>
  <radialGradient id="vig" cx="50%" cy="50%" r="75%">
    <stop offset="60%" stop-color="#000" stop-opacity="0"/>
    <stop offset="100%" stop-color="#000" stop-opacity=".55"/>
  </radialGradient>
  <linearGradient id="border" x1="0" y1="0" x2="1" y2="0">
    <stop offset="0" stop-color="${C.pink}"/>
    <stop offset=".5" stop-color="${C.purple}"/>
    <stop offset="1" stop-color="${C.cyan}"/>
  </linearGradient>`;
}

/** CSS base: respeita "reduzir movimento" do sistema */
export const BASE_CSS = `
  @media (prefers-reduced-motion: reduce){*{animation:none!important}.o{opacity:1!important}}
  .flick{animation:flick 6s steps(1) infinite}
  @keyframes flick{0%,100%{opacity:1}47%{opacity:.92}48%{opacity:1}83%{opacity:.95}84%{opacity:1}}
  .blink{animation:blink 1s steps(1) infinite}
  @keyframes blink{50%{opacity:0}}
`;

/**
 * Envolve o conteúdo num card arredondado com borda neon, scanlines e vinheta.
 */
export function card({ w, h, title, body, defs = '', css = '', bg = C.bg, radius = 16, scan = true }) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img" aria-label="${esc(title)}">
<title>${esc(title)}</title>
<defs>${commonDefs()}
  <clipPath id="cardclip"><rect x="1" y="1" width="${w - 2}" height="${h - 2}" rx="${radius}"/></clipPath>
  ${defs}
</defs>
<style>${BASE_CSS}${css}</style>
<g clip-path="url(#cardclip)">
  <rect width="${w}" height="${h}" fill="${bg}"/>
  ${body}
  ${scan ? `<rect width="${w}" height="${h}" fill="url(#scan)" pointer-events="none"/>
  <rect width="${w}" height="${h}" fill="url(#vig)" pointer-events="none"/>` : ''}
</g>
<rect x="1.5" y="1.5" width="${w - 3}" height="${h - 3}" rx="${radius}" fill="none" stroke="url(#border)" stroke-width="2" opacity=".9"/>
</svg>`;
}

/** Converte segundos num percentual do ciclo (para @keyframes) */
export const pct = (t, T) => `${r3(Math.min(100, Math.max(0, (t / T) * 100)))}%`;
