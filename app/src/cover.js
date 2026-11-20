// Neon Coast — the poster renderer. Draws the multi-panel cover onto a
// canvas at any post size, with the grade, the story captions and the
// press furniture. No network, no Rockstar material, all art original.

import { GRADE_BY_ID } from './photos.js';

const GAP = 0.014;
const INK = '#140a18';

function rect(x, y, w, h, rot = 0) {
  return { x, y, w, h, rot };
}

// Split a region into a cols x rows grid of rects (unit coordinates).
function gridRects(x, y, w, h, cols, rows, gap = GAP) {
  const out = [];
  const cw = (w - gap * (cols - 1)) / cols;
  const ch = (h - gap * (rows - 1)) / rows;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      out.push(rect(x + c * (cw + gap), y + r * (ch + gap), cw, ch));
    }
  }
  return out;
}

// Panel rectangles for each layout, in unit coordinates (0..1).
// Every layout except full-bleed lives in the top 72% of the poster: the
// bottom 28% is the title zone, so no caption tag ever fights the title.
export function layoutRects(layoutId) {
  let base;
  switch (layoutId) {
    case 'collage9': {
      // Nine panels, the duo in the CENTER panel, largest of all.
      const q = 0.25;
      base = [
        rect(0, 0, 0.5 - GAP, q - GAP),
        rect(0.5 + GAP, 0, 0.5 - GAP, q - GAP),
        rect(0, q + GAP, q - GAP, q - GAP),
        rect(0, 0.5 + GAP, q - GAP, q - GAP),
        rect(q + GAP, q + GAP, 0.5 - 2 * GAP, 0.5 - 2 * GAP),
        rect(0.75 + GAP, q + GAP, q - GAP, q - GAP),
        rect(0.75 + GAP, 0.5 + GAP, q - GAP, q - GAP),
        rect(0, 0.75 + GAP, 0.5 - GAP, q - GAP),
        rect(0.5 + GAP, 0.75 + GAP, 0.5 - GAP, q - GAP),
      ];
      break;
    }
    case 'hero-left':
      base = [rect(0, 0, 0.58 - GAP, 1), ...gridRects(0.58 + GAP, 0, 0.42 - GAP, 1, 2, 2)];
      break;
    case 'hero-top':
      base = [rect(0, 0, 1, 0.56 - GAP), ...gridRects(0, 0.56 + GAP, 1, 0.44 - GAP, 3, 1)];
      break;
    case 'grid4':
      base = gridRects(0, 0, 1, 1, 2, 2);
      break;
    case 'strip3':
      base = gridRects(0, 0, 1, 1, 3, 1);
      break;
    case 'tilted':
      base = [
        rect(0.03, 0.10, 0.46, 0.58, -0.10),
        rect(0.30, 0.06, 0.46, 0.58, 0.05),
        rect(0.55, 0.12, 0.42, 0.56, -0.03),
      ];
      break;
    case 'full-bleed':
      return [rect(0, 0, 1, 1)];
    default:
      base = gridRects(0, 0, 1, 1, 2, 2);
  }
  return base.map((r) => rect(r.x, r.y * 0.72, r.w, r.h * 0.72, r.rot));
}

// Cover-fit draw of one photo into a temp canvas, with the grade's filter
// and posterize. Returns the temp canvas, sized to the panel in pixels.
function gradedPanel(img, pw, ph, panel, grade) {
  const temp = document.createElement('canvas');
  temp.width = Math.max(2, Math.round(pw));
  temp.height = Math.max(2, Math.round(ph));
  const t = temp.getContext('2d');
  t.filter = grade.filter || 'none';
  const zoom = panel.zoom || 1;
  const s = Math.max(pw / img.naturalWidth, ph / img.naturalHeight) * zoom;
  const dw = img.naturalWidth * s;
  const dh = img.naturalHeight * s;
  const dx = (pw - dw) / 2 + (panel.x || 0) * pw * 0.2;
  const dy = (ph - dh) / 2 + (panel.y || 0) * ph * 0.2;
  t.drawImage(img, dx, dy, dw, dh);
  t.filter = 'none';
  if (grade.posterize > 0) {
    const data = t.getImageData(0, 0, temp.width, temp.height);
    const step = 255 / (grade.posterize - 1);
    const d = data.data;
    for (let i = 0; i < d.length; i += 4) {
      d[i] = Math.round(d[i] / step) * step;
      d[i + 1] = Math.round(d[i + 1] / step) * step;
      d[i + 2] = Math.round(d[i + 2] / step) * step;
    }
    t.putImageData(data, 0, 0);
  }
  return temp;
}

let halftoneTile = null;
function halftonePattern() {
  if (halftoneTile) return halftoneTile;
  const tile = document.createElement('canvas');
  tile.width = 9;
  tile.height = 9;
  const t = tile.getContext('2d');
  t.fillStyle = '#000';
  t.beginPath();
  t.arc(4.5, 4.5, 2.1, 0, Math.PI * 2);
  t.fill();
  halftoneTile = tile;
  return tile;
}

function pill(ctx, x, y, w, h, fill) {
  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, h / 2);
  ctx.fill();
}

function fitFont(ctx, text, startPx, family, maxWidth) {
  let px = startPx;
  ctx.font = `${px}px ${family}`;
  while (px > 12 && ctx.measureText(text).width > maxWidth) {
    px -= 4;
    ctx.font = `${px}px ${family}`;
  }
  return px;
}

function drawCaptionTag(ctx, panel, r, scale, top) {
  const pad = 10 * scale;
  const line1 = `${panel.place} · ${panel.time}`;
  const line2 = panel.hook;
  const font1 = Math.max(11 * scale, Math.min(20 * scale, r.w * 0.055));
  const font2 = Math.max(9 * scale, font1 * 0.72);
  ctx.font = `${font1}px Anton, 'Arial Narrow', sans-serif`;
  const w1 = ctx.measureText(line1).width;
  ctx.font = `${font2}px Anton, 'Arial Narrow', sans-serif`;
  const w2 = ctx.measureText(line2).width;
  const inner = Math.max(w1, w2) + pad * 2;
  const boxW = Math.min(inner, r.w - pad);
  const boxH = pad * 1.6 + font1 + font2 + 4 * scale;
  const bx = r.x + pad * 0.7;
  // Panels whose bottom sits under the title band get their tag at the top,
  // so the tag never fights the title or the credit line.
  const by = top ? r.y + pad * 0.7 : r.y + r.h - boxH - pad * 0.7;
  ctx.fillStyle = 'rgba(12,5,18,0.82)';
  ctx.beginPath();
  ctx.roundRect(bx, by, boxW, boxH, 6 * scale);
  ctx.fill();
  ctx.fillStyle = '#ffd76a';
  ctx.font = `${font1}px Anton, 'Arial Narrow', sans-serif`;
  ctx.textBaseline = 'alphabetic';
  ctx.fillText(line1, bx + pad, by + pad * 0.9 + font1, boxW - pad * 2);
  ctx.fillStyle = '#ffffff';
  ctx.font = `${font2}px Anton, 'Arial Narrow', sans-serif`;
  ctx.fillText(line2, bx + pad, by + pad * 0.9 + font1 + font2 + 3 * scale, boxW - pad * 2);
}

function drawBarcode(ctx, x, y, w, h) {
  ctx.fillStyle = '#fff';
  ctx.fillRect(x - 4, y - 4, w + 8, h + 8);
  const bars = [3, 1, 2, 1, 1, 3, 1, 2, 4, 1, 2, 1, 1, 2, 3, 1, 2, 1, 4, 1, 1, 2];
  let bx = x;
  ctx.fillStyle = '#111';
  for (const b of bars) {
    const bw = b * (w / 44);
    ctx.fillRect(bx, y, bw, h);
    bx += bw + w / 44;
    if (bx > x + w) break;
  }
}

export function drawPoster(canvas, state, images, selectedIndex = -1) {
  const ctx = canvas.getContext('2d');
  const W = canvas.width;
  const H = canvas.height;
  const scale = W / 1080;
  const grade = GRADE_BY_ID[state.grade] || GRADE_BY_ID.sunset;
  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = INK;
  ctx.fillRect(0, 0, W, H);

  const unitRects = layoutRects(state.layout);
  const rects = unitRects.map((r) => ({
    x: r.x * W, y: r.y * H, w: r.w * W, h: r.h * H, rot: r.rot,
  }));
  const panels = state.panels.slice(0, rects.length);

  // 1. Photos, graded per panel.
  rects.forEach((r, i) => {
    const panel = panels[i];
    if (!panel) return;
    const img = images.get(panel.photo);
    ctx.save();
    if (r.rot) {
      ctx.translate(r.x + r.w / 2, r.y + r.h / 2);
      ctx.rotate(r.rot);
      ctx.translate(-r.w / 2, -r.h / 2);
    } else {
      ctx.translate(r.x, r.y);
    }
    if (img && img.naturalWidth > 0) {
      const temp = gradedPanel(img, r.w, r.h, panel, grade);
      ctx.drawImage(temp, 0, 0, r.w, r.h);
    } else {
      const g = ctx.createLinearGradient(0, 0, r.w, r.h);
      g.addColorStop(0, '#ff5fa2');
      g.addColorStop(1, '#ff8a3d');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, r.w, r.h);
    }
    ctx.lineWidth = Math.max(2, 4 * scale);
    ctx.strokeStyle = '#fff';
    ctx.strokeRect(0, 0, r.w, r.h);
    ctx.restore();
  });

  // 2. Tint wash + halftone ink + vignette over the whole poster.
  if (grade.tint) {
    ctx.fillStyle = grade.tint;
    ctx.fillRect(0, 0, W, H);
  }
  if (grade.halftone > 0) {
    const pattern = ctx.createPattern(halftonePattern(), 'repeat');
    ctx.save();
    ctx.globalAlpha = grade.halftone;
    ctx.globalCompositeOperation = 'multiply';
    ctx.fillStyle = pattern;
    ctx.fillRect(0, 0, W, H);
    ctx.restore();
  }
  const vig = ctx.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.42, W / 2, H / 2, Math.max(W, H) * 0.75);
  vig.addColorStop(0, 'rgba(0,0,0,0)');
  vig.addColorStop(1, 'rgba(10,0,16,0.28)');
  ctx.fillStyle = vig;
  ctx.fillRect(0, 0, W, H);

  // 3. Title band: scrim, press quote, giant gradient title, tagline.
  // The band owns the bottom 28%: the panels above end at 72%.
  const bandH = H * 0.28;
  const bandY = H - bandH;
  const scrim = ctx.createLinearGradient(0, bandY, 0, H);
  scrim.addColorStop(0, 'rgba(12,4,18,0)');
  scrim.addColorStop(0.45, 'rgba(12,4,18,0.55)');
  scrim.addColorStop(1, 'rgba(12,4,18,0.88)');
  ctx.fillStyle = scrim;
  ctx.fillRect(0, bandY, W, bandH);

  const padX = W * 0.035;
  // Bottom-anchored title block, sized so it never rises above the title
  // zone: the quote, the giant title and the tagline all fit in 0.28H.
  const creditY = H - H * 0.012;
  const tagSize = Math.max(16, Math.min(W * 0.042, H * 0.05));
  const tagY = H - H * 0.045;
  const quoteSize = Math.max(13, Math.min(W * 0.024, H * 0.026));
  const titleCap = (tagY - tagSize * 0.55 - quoteSize * 2.1 - bandY) / 1.10;
  const titleSize = fitFont(ctx, state.title, Math.min(W * 0.135, titleCap), "Anton, 'Arial Narrow', sans-serif", W - padX * 2);
  const titleY = tagY - tagSize * 0.55 - titleSize * 0.10;
  if (state.showQuote && state.quote) {
    const stars = '★'.repeat(Math.max(1, Math.min(5, state.stars || 5)));
    const quoteY2 = titleY - titleSize * 1.02;
    const quoteY1 = quoteY2 - quoteSize * 1.05;
    ctx.textBaseline = 'alphabetic';
    ctx.font = `${quoteSize}px Anton, 'Arial Narrow', sans-serif`;
    ctx.fillStyle = '#ffd76a';
    ctx.fillText(`${stars}  ${state.quote}`, padX, quoteY1, W - padX * 2);
    ctx.fillStyle = '#ffffff';
    ctx.font = `${Math.max(11, quoteSize * 0.72)}px Anton, 'Arial Narrow', sans-serif`;
    ctx.fillText(`— ${state.quoteSource}`, padX, quoteY2, W - padX * 2);
  }
  const grad = ctx.createLinearGradient(padX, 0, W - padX, 0);
  grad.addColorStop(0, '#ff5fa2');
  grad.addColorStop(0.5, '#ffb347');
  grad.addColorStop(1, '#ffe259');
  ctx.font = `${titleSize}px Anton, 'Arial Narrow', sans-serif`;
  ctx.lineJoin = 'round';
  ctx.strokeStyle = '#1a0b1e';
  ctx.lineWidth = Math.max(3, titleSize * 0.07);
  ctx.strokeText(state.title, padX, titleY);
  ctx.fillStyle = grad;
  ctx.fillText(state.title, padX, titleY);

  ctx.font = `${tagSize}px Pacifico, cursive`;
  ctx.fillStyle = '#ffe9a8';
  ctx.fillText(state.tagline, padX, tagY, W - padX * 2);

  // 4. Furniture: WANTED pill, volume pill, ribbon, barcode, NC seal.
  if (state.showFurniture) {
    const pillH = Math.max(22, W * 0.038);
    ctx.font = `${Math.max(12, pillH * 0.44)}px Anton, 'Arial Narrow', sans-serif`;
    const wanted = `WANTED ${'★'.repeat(Math.max(1, Math.min(5, state.stars || 5)))}`;
    const ww = ctx.measureText(wanted).width + pillH * 1.1;
    pill(ctx, W - padX - ww, H * 0.028, ww, pillH, 'rgba(12,5,18,0.85)');
    ctx.fillStyle = '#ffd76a';
    ctx.fillText(wanted, W - padX - ww + pillH * 0.55, H * 0.028 + pillH * 0.68);
    const vw = ctx.measureText(state.volume).width + pillH * 1.1;
    pill(ctx, padX, H * 0.028, vw, pillH, 'rgba(12,5,18,0.85)');
    ctx.fillStyle = '#fff';
    ctx.fillText(state.volume, padX + pillH * 0.55, H * 0.028 + pillH * 0.68);

    const ribbonH = Math.max(20, W * 0.032);
    ctx.font = `${Math.max(11, ribbonH * 0.46)}px Anton, 'Arial Narrow', sans-serif`;
    const rw = ctx.measureText(state.ribbon).width + ribbonH * 1.2;
    const rx = W - padX - rw;
    const ry = H - ribbonH - H * 0.055;
    pill(ctx, rx, ry, rw, ribbonH, '#ff5fa2');
    ctx.fillStyle = '#fff';
    ctx.fillText(state.ribbon, rx + ribbonH * 0.6, ry + ribbonH * 0.68);

    const bw = W * 0.13;
    const bh = Math.max(14, H * 0.022);
    drawBarcode(ctx, W - padX - bw, H - bh - H * 0.018, bw, bh);
    const sealR = Math.max(14, W * 0.024);
    const sx = W - padX - bw - sealR * 2.6;
    const sy = H - sealR - H * 0.018;
    ctx.beginPath();
    ctx.arc(sx, sy, sealR, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(12,5,18,0.85)';
    ctx.fill();
    ctx.lineWidth = Math.max(2, sealR * 0.1);
    ctx.strokeStyle = '#ffd76a';
    ctx.stroke();
    ctx.fillStyle = '#ffd76a';
    ctx.font = `${sealR * 0.85}px Anton, 'Arial Narrow', sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText('NC', sx, sy + sealR * 0.32);
    ctx.textAlign = 'left';
  }

  // 5. Per-panel story captions, drawn last so they stay crisp on top of
  // the scrim and the ink.
  if (state.showTags) {
    rects.forEach((r, i) => {
      const panel = panels[i];
      if (!panel) return;
      const underBand = r.y + r.h > bandY + H * 0.02;
      ctx.save();
      if (r.rot) {
        ctx.translate(r.x + r.w / 2, r.y + r.h / 2);
        ctx.rotate(r.rot);
        ctx.translate(-r.w / 2, -r.h / 2);
      } else {
        ctx.translate(r.x, r.y);
      }
      drawCaptionTag(ctx, panel, { x: 0, y: 0, w: r.w, h: r.h }, scale, underBand);
      ctx.restore();
    });
  }

  // Credit line, tiny, bottom center.
  ctx.font = `${Math.max(10, W * 0.0145)}px Anton, 'Arial Narrow', sans-serif`;
  ctx.fillStyle = 'rgba(255,255,255,0.85)';
  ctx.textAlign = 'center';
  ctx.fillText(state.credit, W / 2, H - H * 0.012, W - padX * 2);
  ctx.textAlign = 'left';

  // 6. Selected panel outline (editor only).
  if (selectedIndex >= 0 && rects[selectedIndex]) {
    const r = rects[selectedIndex];
    ctx.save();
    ctx.setLineDash([12 * scale, 8 * scale]);
    ctx.lineWidth = Math.max(3, 5 * scale);
    ctx.strokeStyle = '#ffd76a';
    ctx.strokeRect(r.x + 2, r.y + 2, r.w - 4, r.h - 4);
    ctx.restore();
  }
}
