#!/usr/bin/env node
// Builds the organization profile artwork (profile/assets/*.svg) from the
// ZIU AI brand tokens: the palette, typography and glass wordmark used on the
// website (src/assets/styles.css and src/logo3d.mjs in the website repository).
//
// Every piece is written in a dark and a light variant. profile/README.md
// picks one with <picture> and prefers-color-scheme.
//
// Usage:  node tools/build-profile-assets.mjs
// To change wording, edit the CONTENT section, re-run, and commit the SVGs.
// No dependencies. Node 18 or newer.

import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const OUT = join(dirname(fileURLToPath(import.meta.url)), '..', 'profile', 'assets');

// ------------------------------------------------------------------ tokens

const RUBY = '#C52D3E';
const DEEP = '#8F1423';
const SERIF = "'Instrument Serif', 'Iowan Old Style', Georgia, 'Times New Roman', serif";
const SANS = "'Inter Tight', Inter, ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif";

const W = 1200;
const LEFT = 64;
const RIGHT = W - LEFT;
const NBSP = ' ';

// Colors with alpha are [color, opacity] pairs so they are written as
// separate attributes, which every SVG renderer understands.
const THEMES = {
  dark: {
    bg: ['#101010', '#1B1B1C'],
    fg: '#F7F5F2',
    muted: ['#F7F5F2', 0.68],
    line: ['#F7F5F2', 0.14],
    lineStrong: ['#F7F5F2', 0.3],
    num: '#B9BCC2',
    glass: '#F7F5F2',
    pane: [0.053, 0.035],
    depth: 0.05,
    pool: 0.22,
    band: ['#e3f8ff', 0.13],
    glint: 0.35,
    clear: [[0, '#e4f8ff', 0.34], [0.18, '#c3e8f8', 0.08], [0.4, '#e9fbff', 0.12], [0.43, '#fff', 0.6], [0.46, '#d3f3ff', 0.12], [0.7, '#a6cada', 0.06], [0.92, '#badce8', 0.22], [1, '#f4fcff', 0.55]],
    rim: [[0, '#fff'], [0.3, '#bcdce9', 0.45], [0.49, '#fff', 0.92], [0.58, '#e9f6ff', 0.1], [0.87, '#9ac3d5', 0.3], [1, '#fff', 0.85]],
  },
  light: {
    bg: ['#F7F5F2', '#EFECE7'],
    fg: '#101010',
    muted: ['#57534E', 1],
    line: ['#101010', 0.12],
    lineStrong: ['#101010', 0.24],
    num: DEEP,
    glass: '#101010',
    pane: [0.046, 0.028],
    depth: 0.035,
    pool: 0.16,
    band: ['#fff', 0.45],
    glint: 0.9,
    clear: [[0, '#101010', 0.1], [0.18, '#101010', 0.03], [0.4, '#fff', 0.35], [0.43, '#fff', 0.9], [0.46, '#101010', 0.04], [0.7, '#101010', 0.03], [0.92, '#101010', 0.08], [1, '#fff', 0.6]],
    rim: [[0, '#101010', 0.75], [0.3, '#101010', 0.35], [0.49, '#fff', 0.95], [0.58, '#101010', 0.25], [0.87, '#101010', 0.35], [1, '#101010', 0.7]],
  },
};

const RUBY_GLASS = [[0, '#ffb1c5', 0.55], [0.3, RUBY, 0.62], [0.49, '#ffe7ef', 0.4], [0.52, '#ff8aa6', 0.7], [0.72, RUBY, 0.8], [0.92, DEEP, 0.92], [1, '#ffb1c5', 0.9]];
const RUBY_RIM = [[0, '#fff'], [0.3, '#ffb1c5', 0.5], [0.49, '#fff', 0.9], [0.6, '#ff8aa6', 0.25], [0.87, DEEP, 0.6], [1, '#ffd2dc', 0.9]];
const SHINE = [[0, '#fff', 0], [0.42, '#d9f6ff', 0.04], [0.5, '#fff', 0.75], [0.54, '#fff', 0.12], [1, '#fff', 0]];

// The wordmark: [outline, ruby glass?]. Same outlines as the website logo.
const LETTERS = [
  ['M0 0H145V29L43 150H145V180H0V151L102 30H0Z', true],
  ['M205 0H237V180H205Z', false],
  ['M300 0H333V112C333 140 346 151 372 151S411 140 411 112V0H444V113C444 160 418 183 372 183S300 160 300 113Z', true],
  ['M556 180L625 0H645L714 180H694L674 126H596L576 180ZM603 108H667L635 23Z', false],
  ['M778 0H797V180H778Z', true],
];
const MARK_W = 797;

// The glass wall: [x as a fraction of the width, top inset as a fraction of the height, pane width].
const WALL = [[0.04, 0.15, 52], [0.12, 0.07, 44], [0.21, 0.11, 52], [0.3, 0.03, 44], [0.37, 0.14, 52], [0.47, 0.06, 44], [0.56, 0.09, 44], [0.65, 0.12, 52], [0.74, 0.04, 44], [0.84, 0.1, 52]];

// ----------------------------------------------------------------- content

const HEADER = {
  eyebrow: 'Engineering & Technology',
  tagline: 'Advise. Build. Run.',
  lines: ['Building intelligent solutions', 'through engineering excellence.'],
  rail: ['Code Quality', 'Security First', 'AI & Automation', 'CI/CD Ready'],
  railRight: 'GitHub Organization',
};

const PRINCIPLES = {
  eyebrow: 'Principles',
  title: 'Our engineering principles',
  intro: 'Every project and contribution should follow these principles.',
  items: [
    ['Code Quality', ['Clean, readable, maintainable', 'and reusable code.']],
    ['Security First', ['Protect source code, credentials,', 'customer data and infrastructure.']],
    ['Scalability', ['Solutions that grow with', 'business requirements.']],
    ['Reliability', ['Thoroughly tested and', 'stable software.']],
    ['Collaboration', ['Teamwork, documentation and', 'constructive code reviews.']],
    ['Continuous Improvement', ['Better processes, tools and', 'engineering standards.']],
  ],
};

const TEAMS = {
  eyebrow: 'Teams',
  title: 'Technology & engineering teams',
  intro: 'Our engineering organization works across the following areas.',
  items: [
    ['Frontend Engineering', 'Web applications, UI/UX and frontend architecture'],
    ['Backend Engineering', 'APIs, databases, business logic and integrations'],
    ['AI / ML Engineering', 'AI applications, LLM integrations, model evaluation and intelligent workflows'],
    ['Automation Engineering', 'Workflow automation, RPA and process optimization'],
    ['QA Engineering', 'Functional testing, automation testing and quality assurance'],
    ['DevOps Engineering', 'CI/CD, cloud infrastructure, deployment and monitoring'],
    ['Technical Management', 'Architecture, code quality and engineering governance'],
  ],
};

const PIPELINE = {
  eyebrow: 'Workflow',
  title: 'How we ship',
  intro: 'From task to release, every change follows the same path.',
  steps: ['Task', 'Branch', 'Implement', 'Test', 'Commit', 'Pull Request', 'Review', 'Merge', 'Release'],
  loopFrom: 6, // Review
  loopTo: 2, // Implement
  note: 'Review loops back to implementation until approved and all CI checks pass.',
};

const STANDARDS = {
  eyebrow: 'Standards',
  title: 'Development standards',
  intro: 'The rules every contributor follows. Open a section to read it.',
};

const FOOTER = {
  title: ['Let’s build better', 'technology together.'],
  rail: ['Engineering Excellence', 'Innovation', 'Reliability'],
  railRight: '© 2026 ZIU AI LLP',
};

// ----------------------------------------------------------------- helpers

const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
const num = n => String(Math.round(n * 100) / 100);
const fill = ([c, o]) => `fill="${c}"${o === 1 ? '' : ` fill-opacity="${o}"`}`;
const stroke = ([c, o]) => `stroke="${c}"${o === 1 ? '' : ` stroke-opacity="${o}"`}`;
const stops = list => list.map(([o, c, a = 1]) => `<stop offset="${o}" stop-color="${c}"${a === 1 ? '' : ` stop-opacity="${a}"`}/>`).join('');
const anchorAttr = a => (a ? ` text-anchor="${a}"` : '');

// Tracked uppercase label (Inter Tight 600). `inner` is trusted markup.
const label = (t, x, y, inner, { anchor, color, size = 14 } = {}) =>
  `<text x="${x}" y="${y}"${anchorAttr(anchor)} font-family="${SANS}" font-size="${size}" font-weight="600" letter-spacing="2" ${color ? `fill="${color}"` : fill(t.muted)}>${inner}</text>`;

// A row of uppercase labels separated by ruby dots.
const dotted = parts => parts.map(p => esc(p.toUpperCase())).join(`<tspan fill="${RUBY}">${NBSP}·${NBSP}</tspan>`);

// Display line (Instrument Serif).
const display = (t, x, y, s, { size = 40, anchor } = {}) =>
  `<text x="${x}" y="${y}"${anchorAttr(anchor)} font-family="${SERIF}" font-size="${size}" letter-spacing="-0.4" fill="${t.fg}">${esc(s)}</text>`;

// Body copy (Inter Tight).
const copy = (t, x, y, s, { size = 17, anchor } = {}) =>
  `<text x="${x}" y="${y}"${anchorAttr(anchor)} font-family="${SANS}" font-size="${size}" ${fill(t.muted)}>${esc(s)}</text>`;

// The site's section marker: a short ruby rule and a tracked label.
const eyebrow = (t, x, y, s) =>
  `<rect x="${x}" y="${y - 6}" width="28" height="2" fill="${RUBY}"/>` + label(t, x + 42, y, esc(s.toUpperCase()));

const rule = (t, x, y, w, strong = false) =>
  `<rect x="${x}" y="${y}" width="${w}" height="1" ${fill(strong ? t.lineStrong : t.line)}/>`;

const frame = (t, h) =>
  `<rect x="0.5" y="0.5" width="${W - 1}" height="${h - 1}" rx="2" fill="url(#bg)" ${stroke(t.line)}/>`;

// Eyebrow, serif title and intro line shared by the content cards.
const heading = (t, { eyebrow: e, title, intro }) =>
  eyebrow(t, LEFT, 84, e) + display(t, LEFT, 136, title) + copy(t, LEFT, 168, intro);

function wall(t, h, { animate = false } = {}) {
  const panes = WALL.map(([fx, fy, w], i) => {
    const y = fy * h;
    const motion = animate ? ` class="pane" style="animation-delay:${num(-i * 1.3)}s"` : '';
    return `<rect${motion} x="${num(fx * W)}" y="${num(y)}" width="${w}" height="${num(h - 2 * y)}" rx="1" fill="${t.glass}" fill-opacity="${w === 52 ? t.pane[0] : t.pane[1]}" ${stroke(t.line)}/>`;
  });
  return `<g aria-hidden="true">${panes.join('')}</g>`;
}

function wordmarkDefs(t) {
  return [
    ...LETTERS.map(([d], i) => `<path id="L${i}" d="${d}" fill-rule="evenodd"/>`),
    `<clipPath id="letters">${LETTERS.map((_, i) => `<use href="#L${i}"/>`).join('')}</clipPath>`,
    `<linearGradient id="clear" x1="0" y1="0" x2=".75" y2="1">${stops(t.clear)}</linearGradient>`,
    `<linearGradient id="ruby" x1="0" y1="0" x2=".2" y2="1">${stops(RUBY_GLASS)}</linearGradient>`,
    `<linearGradient id="rim" x1="0" y1="0" x2=".6" y2="1">${stops(t.rim)}</linearGradient>`,
    `<linearGradient id="rim-ruby" x1="0" y1="0" x2=".6" y2="1">${stops(RUBY_RIM)}</linearGradient>`,
    `<linearGradient id="shine">${stops(SHINE)}</linearGradient>`,
    `<radialGradient id="pool">${stops([[0, '#f23565', t.pool], [1, '#f23565', 0]])}</radialGradient>`,
  ].join('\n    ');
}

// The extruded glass wordmark, drawn the same way as the website logo:
// back face, stacked side layers, contrast outline, front face, inner rim,
// then reflections clipped to the letters.
function wordmark(t, x, y, scale) {
  const letter = ([, ruby], i) => {
    const use = attrs => `<use href="#L${i}" ${attrs}/>`;
    const rim = ruby ? 'rim-ruby' : 'rim';
    const back = ruby ? `fill="${DEEP}" fill-opacity="0.55"` : `fill="${t.glass}" fill-opacity="0.12"`;
    const side = ruby ? `fill="${DEEP}" fill-opacity="0.22"` : `fill="${t.glass}" fill-opacity="${t.depth}"`;
    const layers = Array.from({ length: 14 }, (_, j) => 14 - j)
      .map(n => use(`transform="translate(${n} ${num(n * 1.16)})" ${side}`))
      .join('');
    return [
      '<g>',
      use(`transform="translate(15 17.4)" ${back} stroke="url(#${rim})" stroke-width="1" opacity=".8"`),
      layers,
      use(`fill="${t.glass}" fill-opacity=".035" stroke="${t.glass}" stroke-opacity=".35" stroke-width="2"`),
      use(`fill="url(#${ruby ? 'ruby' : 'clear'})" stroke="url(#${rim})" stroke-width="2" stroke-linejoin="round"`),
      use(`transform="translate(2 2)" fill="none" stroke="url(#${rim})" stroke-width=".65" opacity=".65"`),
      '</g>',
    ].join('');
  };
  return `<g transform="translate(${x} ${y}) scale(${scale})" aria-hidden="true">
    <ellipse class="pool" cx="410" cy="212" rx="430" ry="26" fill="url(#pool)"/>
    ${LETTERS.map(letter).join('\n    ')}
    <g clip-path="url(#letters)">
      <path d="M-50 152L850 15V29L-50 166Z" ${fill(t.band)}/>
      <path d="M-50 169L850 32" stroke="#fff" stroke-width=".7" opacity="${t.glint}"/>
      <g transform="skewX(-22)"><rect class="shine" x="-300" y="-60" width="230" height="320" fill="url(#shine)"/></g>
    </g>
  </g>`;
}

const CSS = {
  wordmark:
    '.shine{animation:shine 7s ease-in-out infinite}@keyframes shine{0%,18%{transform:translateX(0)}72%,100%{transform:translateX(1320px)}}' +
    '.pool{animation:pool 6s ease-in-out infinite}@keyframes pool{0%,100%{opacity:.7}50%{opacity:1}}',
  wall: '.pane{animation:pane 11s ease-in-out infinite}@keyframes pane{0%,100%{opacity:1}50%{opacity:.4}}',
  dot: '.dot{opacity:0;animation:dot 9s cubic-bezier(.65,0,.35,1) infinite}@keyframes dot{0%{transform:translateX(0);opacity:0}7%,93%{opacity:1}100%{transform:translateX(1008px);opacity:0}}',
  seg: '.seg{animation:seg 9s cubic-bezier(.65,0,.35,1) infinite alternate}@keyframes seg{from{transform:translateX(0)}to{transform:translateX(1144px)}}',
};

function svg(t, h, title, { defs = '', css = '', body, background = true }) {
  const style = css ? `\n  <style>${css}@media (prefers-reduced-motion:reduce){*{animation:none!important}}</style>` : '';
  const bg = background ? `<linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">${stops([[0, t.bg[0]], [1, t.bg[1]]])}</linearGradient>` : '';
  const allDefs = bg || defs ? `\n  <defs>\n    ${[bg, defs].filter(Boolean).join('\n    ')}\n  </defs>` : '';
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${h}" viewBox="0 0 ${W} ${h}" role="img" aria-label="${esc(title)}">${allDefs}${style}
  ${body}
</svg>
`;
}

// ------------------------------------------------------------------ pieces

function header(t) {
  const h = 440;
  const c = HEADER;
  const body = [
    frame(t, h),
    wall(t, h, { animate: true }),
    eyebrow(t, LEFT, 92, c.eyebrow),
    wordmark(t, LEFT, 132, 0.74),
    display(t, RIGHT, 204, c.tagline, { size: 42, anchor: 'end' }),
    ...c.lines.map((s, i) => copy(t, RIGHT, 238 + i * 24, s, { anchor: 'end' })),
    rule(t, LEFT, 356, RIGHT - LEFT),
    label(t, LEFT, 390, dotted(c.rail)),
    label(t, RIGHT, 390, esc(c.railRight.toUpperCase()), { anchor: 'end' }),
  ].join('\n  ');
  return svg(t, h, `ZIU AI. ${c.eyebrow}. ${c.tagline} ${c.lines.join(' ')}`, { defs: wordmarkDefs(t), css: CSS.wordmark + CSS.wall, body });
}

function divider(t) {
  const body = [
    `<rect x="0" y="11" width="${W}" height="1" ${fill(t.line)}/>`,
    `<rect class="seg" x="0" y="10.5" width="56" height="2" fill="${RUBY}"/>`,
  ].join('\n  ');
  return svg(t, 24, 'Divider', { css: CSS.seg, body, background: false });
}

function principles(t) {
  const c = PRINCIPLES;
  const gap = 32;
  const colW = (RIGHT - LEFT - 2 * gap) / 3;
  const top = 212;
  const rowH = 170;
  const cells = c.items.map(([title, lines], i) => {
    const x = LEFT + (i % 3) * (colW + gap);
    const y = top + Math.floor(i / 3) * rowH;
    return [
      rule(t, x, y, colW, true),
      `<rect x="${x}" y="${y - 0.5}" width="28" height="2" fill="${RUBY}"/>`,
      label(t, x, y + 36, String(i + 1).padStart(2, '0'), { color: t.num }),
      display(t, x, y + 76, title, { size: 27 }),
      ...lines.map((s, j) => copy(t, x, y + 106 + j * 24, s, { size: 16.5 })),
    ].join('');
  });
  const h = top + 2 * rowH + 16;
  const body = [frame(t, h), heading(t, c), ...cells].join('\n  ');
  return svg(t, h, `${c.title}: ${c.items.map(([s]) => s).join(', ')}`, { body });
}

function teams(t) {
  const c = TEAMS;
  const top = 206;
  const rowH = 60;
  const rows = c.items.map(([name, what], i) => {
    const y = top + i * rowH;
    return [
      rule(t, LEFT, y, RIGHT - LEFT, i === 0),
      label(t, LEFT, y + 37, String(i + 1).padStart(2, '0'), { color: t.num }),
      display(t, LEFT + 64, y + 39, name, { size: 24 }),
      copy(t, 448, y + 37, what, { size: 16 }),
    ].join('');
  });
  const bottom = top + c.items.length * rowH;
  const h = bottom + 40;
  const body = [
    frame(t, h),
    heading(t, c),
    ...rows,
    `<rect x="${LEFT}" y="${top - 0.5}" width="28" height="2" fill="${RUBY}"/>`,
    rule(t, LEFT, bottom, RIGHT - LEFT),
  ].join('\n  ');
  return svg(t, h, `${c.title}: ${c.items.map(([s]) => s).join(', ')}`, { body });
}

function pipeline(t) {
  const c = PIPELINE;
  const h = 412;
  const x0 = 96;
  const x1 = W - 96;
  const step = (x1 - x0) / (c.steps.length - 1);
  const lineY = 266;
  const at = i => x0 + i * step;
  const last = c.steps.length - 1;
  const nodes = c.steps.map((s, i) => {
    const x = at(i);
    const r = i === last ? 5.5 : 3.5;
    return [
      `<rect x="${num(x - r)}" y="${num(lineY - r)}" width="${r * 2}" height="${r * 2}" fill="${i === last ? RUBY : t.fg}"/>`,
      label(t, x, lineY + 34, String(i + 1).padStart(2, '0'), { anchor: 'middle', color: t.num, size: 13 }),
      label(t, x, lineY + 56, esc(s.toUpperCase()), { anchor: 'middle', color: t.fg, size: 13 }),
    ].join('');
  });
  const from = at(c.loopFrom);
  const to = at(c.loopTo);
  const loop = [
    `<path d="M${from} ${lineY - 12}C${from} ${lineY - 70} ${to} ${lineY - 70} ${to} ${lineY - 12}" fill="none" ${stroke(t.lineStrong)} stroke-width="1.5" stroke-dasharray="3 5"/>`,
    `<path d="M${to - 5} ${lineY - 19}L${to} ${lineY - 11}L${to + 5} ${lineY - 19}" fill="none" ${stroke(t.lineStrong)} stroke-width="1.5"/>`,
  ].join('');
  const body = [
    frame(t, h),
    heading(t, c),
    loop,
    `<rect x="${x0}" y="${lineY - 0.5}" width="${x1 - x0}" height="1" ${fill(t.lineStrong)}/>`,
    `<circle class="dot" cx="${x0}" cy="${lineY}" r="4" fill="${RUBY}"/>`,
    ...nodes,
    copy(t, LEFT, 372, c.note, { size: 16 }),
  ].join('\n  ');
  return svg(t, h, `${c.title}: ${c.steps.join(', ')}. ${c.note}`, { css: CSS.dot, body });
}

function standards(t) {
  const h = 208;
  const body = [frame(t, h), wall(t, h), heading(t, STANDARDS)].join('\n  ');
  return svg(t, h, `${STANDARDS.title}. ${STANDARDS.intro}`, { body });
}

function footer(t) {
  const h = 300;
  const c = FOOTER;
  const scale = 0.45;
  const body = [
    frame(t, h),
    wall(t, h),
    ...c.title.map((s, i) => display(t, LEFT, 124 + i * 50, s, { size: 44 })),
    wordmark(t, RIGHT - Math.round(MARK_W * scale) - 8, 92, scale),
    rule(t, LEFT, 232, RIGHT - LEFT),
    label(t, LEFT, 266, dotted(c.rail)),
    label(t, RIGHT, 266, esc(c.railRight.toUpperCase()), { anchor: 'end' }),
  ].join('\n  ');
  return svg(t, h, `${c.title.join(' ')} ${c.rail.join('. ')}.`, { defs: wordmarkDefs(t), css: CSS.wordmark, body });
}

// ------------------------------------------------------------------- build

const PIECES = { header, divider, principles, teams, pipeline, standards, footer };

mkdirSync(OUT, { recursive: true });
for (const [theme, t] of Object.entries(THEMES)) {
  for (const [name, build] of Object.entries(PIECES)) {
    const file = `${name}-${theme}.svg`;
    const out = build(t);
    writeFileSync(join(OUT, file), out);
    console.log(`${file.padEnd(24)} ${(out.length / 1024).toFixed(1)} KB`);
  }
}
