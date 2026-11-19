// Draws a multi-panel GTA-style poster cover: a hero photo panel, two smaller
// panels, a Vice City sunset/neon grade, and bold poster lettering. All art is
// drawn here in code, or comes from the user's own photos / the free samples.

export const GRADES = {
  sunset: { name: 'Sunset', top: 'rgba(255,120,60,0.55)', bottom: 'rgba(220,40,120,0.55)' },
  neon: { name: 'Neon Nights', top: 'rgba(0,220,255,0.5)', bottom: 'rgba(255,0,160,0.5)' },
  dusk: { name: 'Palm Dusk', top: 'rgba(120,60,220,0.5)', bottom: 'rgba(255,90,40,0.45)' },
};

export const SIZES = {
  '1080x1080': [1080, 1080],
  '1080x1350': [1080, 1350],
  '1920x1080': [1920, 1080],
};

/** Panel + title rectangles for a cover of w x h. Fractions keep the poster grid on any size. */
function layoutFor(w, h) {
  if (w / h <= 1.05) {
    // portrait / square: hero on top, two panels side by side, title band at the foot
    return {
      panels: [
        { x: 0.03 * w, y: 0.02 * h, w: 0.94 * w, h: 0.52 * h },
        { x: 0.03 * w, y: 0.56 * h, w: 0.46 * w, h: 0.24 * h },
        { x: 0.51 * w, y: 0.56 * h, w: 0.46 * w, h: 0.24 * h },
      ],
      title: { x: 0, y: 0.82 * h, w, h: 0.16 * h },
    };
  }
  // wide: hero on the left, two panels stacked on the right, title band at the foot
  return {
    panels: [
      { x: 0.02 * w, y: 0.03 * h, w: 0.60 * w, h: 0.72 * h },
      { x: 0.64 * w, y: 0.03 * h, w: 0.34 * w, h: 0.35 * h },
      { x: 0.64 * w, y: 0.40 * h, w: 0.34 * w, h: 0.35 * h },
    ],
    title: { x: 0, y: 0.78 * h, w, h: 0.19 * h },
  };
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

/** A code-drawn sunset city for a panel with no photo yet. */
function drawSunsetScene(ctx, p) {
  const g = ctx.createLinearGradient(0, p.y, 0, p.y + p.h);
  g.addColorStop(0, '#2b0f4d');
  g.addColorStop(0.45, '#c62e6e');
  g.addColorStop(0.75, '#ff6e3c');
  g.addColorStop(1, '#ffd682');
  ctx.fillStyle = g;
  ctx.fillRect(p.x, p.y, p.w, p.h);
  const sx = p.x + p.w * 0.5, sy = p.y + p.h * 0.62, sr = p.h * 0.16;
  ctx.fillStyle = '#ffecaa';
  ctx.beginPath();
  ctx.arc(sx, sy, sr, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#ff6e3c';
  for (let i = 0; i < 3; i++) {
    const yy = sy + sr * 0.15 + i * sr * 0.28;
    const hw = Math.sqrt(Math.max(0, sr * sr - (yy - sy) * (yy - sy)));
    ctx.fillRect(sx - hw, yy, hw * 2, sr * 0.09);
  }
  ctx.fillStyle = '#16061f';
  let bx = p.x;
  let seed = 11;
  const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  while (bx < p.x + p.w) {
    const bw = p.w * (0.12 + rnd() * 0.14);
    const bh = p.h * (0.12 + rnd() * 0.3);
    ctx.fillRect(bx, p.y + p.h - bh, bw, bh);
    bx += bw + p.w * 0.015;
  }
}

/** Draws one photo cover-fit into a panel, panned by `off` (canvas px) and zoomed. Returns the clamped offset. */
function drawPhoto(ctx, p, img, zoom, off) {
  const base = Math.max(p.w / img.naturalWidth, p.h / img.naturalHeight) * zoom;
  const pw = img.naturalWidth * base, ph = img.naturalHeight * base;
  const maxX = Math.max(0, (pw - p.w) / 2), maxY = Math.max(0, (ph - p.h) / 2);
  const ox = Math.max(-maxX, Math.min(maxX, off.x));
  const oy = Math.max(-maxY, Math.min(maxY, off.y));
  ctx.filter = 'saturate(1.3) contrast(1.08)';
  ctx.drawImage(img, p.x + (p.w - pw) / 2 + ox, p.y + (p.h - ph) / 2 + oy, pw, ph);
  ctx.filter = 'none';
  return { x: ox, y: oy };
}

/**
 * Draws the whole cover onto the canvas's 2D context at the canvas's own size.
 * `state`: { photos[3], zooms[3], offsets[3], title, subtitle, grade }.
 * Returns the layout (panel rects), for hit-testing in the editor.
 */
export function drawCover(canvas, state) {
  const ctx = canvas.getContext('2d');
  const { width: w, height: h } = canvas;
  const layout = layoutFor(w, h);
  const grade = GRADES[state.grade] || GRADES.sunset;

  ctx.fillStyle = '#160a24';
  ctx.fillRect(0, 0, w, h);

  layout.panels.forEach((p, i) => {
    ctx.save();
    roundRect(ctx, p.x, p.y, p.w, p.h, Math.max(4, w * 0.006));
    ctx.clip();
    ctx.fillStyle = '#241533';
    ctx.fillRect(p.x, p.y, p.w, p.h);
    const img = state.photos[i];
    if (img) {
      state.offsets[i] = drawPhoto(ctx, p, img, state.zooms[i], state.offsets[i]);
    } else {
      drawSunsetScene(ctx, p);
    }
    const g = ctx.createLinearGradient(0, p.y, 0, p.y + p.h);
    g.addColorStop(0, grade.top);
    g.addColorStop(1, grade.bottom);
    ctx.globalCompositeOperation = 'overlay';
    ctx.globalAlpha = 0.55;
    ctx.fillStyle = g;
    ctx.fillRect(p.x, p.y, p.w, p.h);
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';
    ctx.restore();
    roundRect(ctx, p.x, p.y, p.w, p.h, Math.max(4, w * 0.006));
    ctx.strokeStyle = 'rgba(255,255,255,0.9)';
    ctx.lineWidth = Math.max(2, w * 0.003);
    ctx.stroke();
  });

  // title band: legibility gradient, neon rule, bold poster title, subtitle
  const t = layout.title;
  const lg = ctx.createLinearGradient(0, t.y - h * 0.05, 0, h);
  lg.addColorStop(0, 'rgba(22,8,36,0)');
  lg.addColorStop(1, 'rgba(22,8,36,0.92)');
  ctx.fillStyle = lg;
  ctx.fillRect(0, t.y - h * 0.05, w, h - (t.y - h * 0.05));

  const rule = ctx.createLinearGradient(w * 0.06, 0, w * 0.94, 0);
  rule.addColorStop(0, '#ff7a18');
  rule.addColorStop(0.5, '#ff2e88');
  rule.addColorStop(1, '#00e5ff');
  ctx.fillStyle = rule;
  ctx.fillRect(w * 0.06, t.y + h * 0.008, w * 0.88, Math.max(2, h * 0.004));

  const title = (state.title || '').trim().toUpperCase();
  if (title) {
    let size = h * 0.085;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const setFont = (s) => {
      ctx.font = `900 ${s}px 'Arial Black', 'Archivo Black', Impact, 'Helvetica Neue', sans-serif`;
    };
    setFont(size);
    while (ctx.measureText(title).width > w * 0.92 && size > 12) {
      size -= 2;
      setFont(size);
    }
    const ty = t.y + t.h * 0.42;
    const tg = ctx.createLinearGradient(0, ty - size * 0.55, 0, ty + size * 0.55);
    tg.addColorStop(0, '#ffffff');
    tg.addColorStop(1, '#ffd76a');
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#1a0b2e';
    ctx.lineWidth = Math.max(2, size / 13);
    ctx.shadowColor = 'rgba(255,46,136,0.55)';
    ctx.shadowBlur = size * 0.18;
    ctx.strokeText(title, w / 2, ty);
    ctx.fillStyle = tg;
    ctx.fillText(title, w / 2, ty);
    ctx.shadowBlur = 0;
  }

  const sub = (state.subtitle || '').trim().toUpperCase();
  if (sub) {
    try { ctx.letterSpacing = `${Math.max(2, w * 0.004)}px`; } catch (e) { /* older canvas: no tracking */ }
    ctx.font = `600 ${Math.max(10, h * 0.024)}px system-ui, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#ffe9c9';
    ctx.fillText(sub, w / 2, t.y + t.h * 0.82);
    try { ctx.letterSpacing = '0px'; } catch (e) { /* older canvas: no tracking */ }
  }

  const v = ctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.42, w / 2, h / 2, Math.max(w, h) * 0.75);
  v.addColorStop(0, 'rgba(10,4,24,0)');
  v.addColorStop(1, 'rgba(10,4,24,0.30)');
  ctx.fillStyle = v;
  ctx.fillRect(0, 0, w, h);

  return layout;
}
