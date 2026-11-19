// Wires the page: pick photos per panel, drag to reposition, type the lettering,
// pick a grade and a post size, export the cover as a PNG. A `?shot=` query sets
// up a fixed scene for a screenshot instead (./shots.js).
import { drawCover, GRADES, SIZES } from './cover.js';
import { runShot } from './shots.js';

const SAMPLES = ['pier', 'boulevard', 'sunset'];
const canvas = document.getElementById('cover');
const status = document.getElementById('status');
const titleInput = document.getElementById('title');
const subtitleInput = document.getElementById('subtitle');
const sizeSelect = document.getElementById('size');

const state = {
  photos: [null, null, null],
  zooms: [1, 1, 1],
  offsets: [{ x: 0, y: 0 }, { x: 0, y: 0 }, { x: 0, y: 0 }],
  title: 'Sunset Heist',
  subtitle: 'Vice City · 2026',
  grade: 'sunset',
  size: '1080x1080',
};
let layout = null;
let selected = 0;
let drag = null;

/** Loads an image from a URL, resolving to the image once it can be drawn. */
export function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}
const loadSample = (name) => loadImage(`samples/${name}.jpg`);

function applySize() {
  const [w, h] = SIZES[state.size];
  if (canvas.width && canvas.width !== w) {
    const sx = w / canvas.width, sy = h / canvas.height;
    state.offsets = state.offsets.map((o) => ({ x: o.x * sx, y: o.y * sy }));
  }
  canvas.width = w;
  canvas.height = h;
}

function redraw() {
  layout = drawCover(canvas, state);
  document.querySelectorAll('.panel-card').forEach((card, i) => {
    card.classList.toggle('selected', i === selected);
  });
}

function toCanvas(e) {
  const r = canvas.getBoundingClientRect();
  return {
    x: (e.clientX - r.left) * (canvas.width / r.width),
    y: (e.clientY - r.top) * (canvas.height / r.height),
  };
}
function panelAt(x, y) {
  if (!layout) return -1;
  return layout.panels.findIndex((p) => x >= p.x && x <= p.x + p.w && y >= p.y && y <= p.y + p.h);
}

canvas.addEventListener('pointerdown', (e) => {
  const p = toCanvas(e);
  const i = panelAt(p.x, p.y);
  if (i < 0) return;
  selected = i;
  drag = { x: p.x, y: p.y };
  canvas.setPointerCapture(e.pointerId);
  redraw();
});
canvas.addEventListener('pointermove', (e) => {
  if (!drag) return;
  const p = toCanvas(e);
  state.offsets[selected].x += p.x - drag.x;
  state.offsets[selected].y += p.y - drag.y;
  drag = { x: p.x, y: p.y };
  redraw();
});
canvas.addEventListener('pointerup', () => { drag = null; });
canvas.addEventListener('pointercancel', () => { drag = null; });

document.querySelectorAll('input[type=file][data-panel]').forEach((input) => {
  input.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const i = Number(e.target.dataset.panel);
    state.photos[i] = await loadImage(URL.createObjectURL(file));
    state.offsets[i] = { x: 0, y: 0 };
    state.zooms[i] = 1;
    selected = i;
    redraw();
  });
});
document.querySelectorAll('[data-sample]').forEach((btn) => {
  btn.addEventListener('click', async () => {
    const i = Number(btn.dataset.sample);
    state.photos[i] = await loadSample(SAMPLES[i]);
    state.offsets[i] = { x: 0, y: 0 };
    state.zooms[i] = 1;
    selected = i;
    redraw();
  });
});
document.querySelectorAll('input[type=range][data-zoom]').forEach((input) => {
  input.addEventListener('input', () => {
    const i = Number(input.dataset.zoom);
    state.zooms[i] = Number(input.value);
    selected = i;
    redraw();
  });
});

titleInput.addEventListener('input', () => { state.title = titleInput.value; redraw(); });
subtitleInput.addEventListener('input', () => { state.subtitle = subtitleInput.value; redraw(); });

document.querySelectorAll('[data-grade]').forEach((btn) => {
  btn.addEventListener('click', () => {
    state.grade = btn.dataset.grade;
    document.querySelectorAll('[data-grade]').forEach((b) => b.classList.toggle('active', b === btn));
    redraw();
  });
});
sizeSelect.addEventListener('change', (e) => {
  state.size = e.target.value;
  applySize();
  redraw();
});

document.getElementById('samples').addEventListener('click', async () => {
  for (let i = 0; i < 3; i++) {
    state.photos[i] = await loadSample(SAMPLES[i]);
    state.offsets[i] = { x: 0, y: 0 };
    state.zooms[i] = 1;
  }
  redraw();
  status.textContent = 'Samples loaded into all three panels.';
});

document.getElementById('export').addEventListener('click', () => {
  const [w, h] = SIZES[state.size];
  const off = document.createElement('canvas');
  off.width = w;
  off.height = h;
  drawCover(off, state);
  off.toBlob((blob) => {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `vice-cover-${w}x${h}.png`;
    a.click();
    status.textContent = `Saved vice-cover-${w}x${h}.png`;
  }, 'image/png');
});

const shot = new URLSearchParams(location.search).get('shot');
if (shot) {
  runShot(shot, new URLSearchParams(location.search), {
    loadSample,
    apply: async ({ photos, title, subtitle, grade, size }) => {
      if (photos) {
        for (let i = 0; i < 3; i++) {
          if (photos[i]) state.photos[i] = photos[i];
        }
      }
      if (title !== undefined) {
        state.title = title;
        titleInput.value = title;
      }
      if (subtitle !== undefined) {
        state.subtitle = subtitle;
        subtitleInput.value = subtitle;
      }
      if (grade && GRADES[grade]) {
        state.grade = grade;
        document.querySelectorAll('[data-grade]').forEach((b) => b.classList.toggle('active', b.dataset.grade === grade));
      }
      if (size && SIZES[size]) {
        state.size = size;
        sizeSelect.value = size;
        applySize();
      }
      redraw();
    },
  });
} else {
  applySize();
  redraw();
}
