// Neon Coast — the editor. Wires the controls to the poster renderer:
// presets, layouts, grades, story text, per-panel crop, photo upload,
// undo/redo and PNG export in the three post sizes.

import { PHOTOS, PHOTO_BY_ID, GRADES, LAYOUTS, PRESETS, PRESET_BY_ID, freshPanel, freshState } from './photos.js';
import { drawPoster, layoutRects } from './cover.js';

const $ = (id) => document.getElementById(id);
const canvas = $('stage');
const params = new URLSearchParams(location.search);

let state = freshState(params.get('preset') || 'sunset-duo');
if (params.get('layout')) state.layout = params.get('layout');
if (params.get('grade')) state.grade = params.get('grade');
if (params.get('title')) state.title = params.get('title');
if (params.get('shot') === 'poster') document.body.classList.add('shot-poster');

let selected = 4; // the CENTER panel of the collage is selected first
let exportSize = { w: 1080, h: 1080 };
const images = new Map();
const customPhotos = [];
let customCount = 0;

const undoStack = [];
const redoStack = [];

function snapshot() {
  return JSON.parse(JSON.stringify(state));
}
function pushHistory() {
  undoStack.push(snapshot());
  if (undoStack.length > 50) undoStack.shift();
  redoStack.length = 0;
  syncUndoButtons();
}
function undo() {
  if (!undoStack.length) return;
  redoStack.push(snapshot());
  state = undoStack.pop();
  syncAll();
  syncUndoButtons();
}
function redo() {
  if (!redoStack.length) return;
  undoStack.push(snapshot());
  state = redoStack.pop();
  syncAll();
  syncUndoButtons();
}
function syncUndoButtons() {
  $('btn-undo').disabled = !undoStack.length;
  $('btn-redo').disabled = !redoStack.length;
}

function render() {
  drawPoster(canvas, state, images, selected);
}

function renderAndMarkReady() {
  render();
  window.__neonReady = true;
  document.title = 'Neon Coast — ready';
}

function applyPreset(presetId) {
  pushHistory();
  const keep = { quote: state.quote, quoteSource: state.quoteSource, credit: state.credit, volume: state.volume, ribbon: state.ribbon, stars: state.stars, showTags: state.showTags, showQuote: state.showQuote, showFurniture: state.showFurniture };
  state = freshState(presetId);
  Object.assign(state, keep);
  selected = state.layout === 'collage9' ? 4 : 0;
  syncAll();
}

function syncAll() {
  syncPresetButtons();
  syncLayoutButtons();
  syncGradeButtons();
  $('title-input').value = state.title;
  $('tagline-input').value = state.tagline;
  $('quote-input').value = state.quote;
  $('quote-source-input').value = state.quoteSource;
  $('credit-input').value = state.credit;
  $('volume-input').value = state.volume;
  $('ribbon-input').value = state.ribbon;
  $('stars-input').value = state.stars;
  $('stars-value').textContent = '★'.repeat(state.stars);
  $('toggle-tags').checked = state.showTags;
  $('toggle-quote').checked = state.showQuote;
  $('toggle-furniture').checked = state.showFurniture;
  syncPanelFields();
  render();
}

function buttonGroup(el, items, currentId, onPick) {
  el.innerHTML = '';
  for (const item of items) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'pick' + (item.id === currentId ? ' active' : '');
    b.textContent = item.name;
    b.dataset.pick = item.id;
    b.addEventListener('click', () => onPick(item.id));
    el.appendChild(b);
  }
}
function syncPresetButtons() {
  buttonGroup($('preset-list'), PRESETS, state.preset, (id) => { applyPreset(id); });
}
function syncLayoutButtons() {
  buttonGroup($('layout-list'), LAYOUTS, state.layout, (id) => { pushHistory(); state.layout = id; selected = Math.min(selected, layoutRects(id).length - 1); syncLayoutButtons(); syncPanelFields(); render(); });
}
function syncGradeButtons() {
  buttonGroup($('grade-list'), GRADES, state.grade, (id) => { pushHistory(); state.grade = id; syncGradeButtons(); render(); });
}

function syncPanelFields() {
  const panel = state.panels[selected];
  const count = layoutRects(state.layout).length;
  $('panel-label').textContent = panel ? `Panel ${selected + 1} of ${count}` : 'No panel';
  if (!panel) return;
  $('panel-place').value = panel.place;
  $('panel-time').value = panel.time;
  $('panel-hook').value = panel.hook;
  $('panel-zoom').value = panel.zoom;
  $('panel-x').value = panel.x;
  $('panel-y').value = panel.y;
}

function trackEdit(el, apply) {
  // Snapshot the state once, on the first input of an editing gesture,
  // so undo restores the state from BEFORE the edit began.
  let editing = false;
  el.addEventListener('input', (e) => {
    if (!editing) { pushHistory(); editing = true; }
    apply(e);
  });
  el.addEventListener('change', () => { editing = false; });
  el.addEventListener('blur', () => { editing = false; });
}
function bindText(id, key) {
  trackEdit($(id), (e) => {
    state[key] = e.target.value;
    render();
  });
}
function bindPanelText(id, key) {
  trackEdit($(id), (e) => {
    const panel = state.panels[selected];
    if (!panel) return;
    panel[key] = e.target.value;
    render();
  });
}
function bindPanelRange(id, key) {
  trackEdit($(id), (e) => {
    const panel = state.panels[selected];
    if (!panel) return;
    panel[key] = parseFloat(e.target.value);
    render();
  });
}

function buildPhotoStrip() {
  const strip = $('photo-strip');
  strip.innerHTML = '';
  const all = [...PHOTOS, ...customPhotos];
  for (const photo of all) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'thumb';
    b.title = `${photo.place} — ${photo.time}`;
    b.dataset.photo = photo.id;
    const img = document.createElement('img');
    img.src = photo.file;
    img.alt = photo.place;
    img.loading = 'lazy';
    b.appendChild(img);
    const cap = document.createElement('span');
    cap.textContent = photo.place;
    b.appendChild(cap);
    b.addEventListener('click', () => assignPhoto(photo.id));
    strip.appendChild(b);
  }
  markActiveThumb();
}
function markActiveThumb() {
  const panel = state.panels[selected];
  document.querySelectorAll('#photo-strip .thumb').forEach((t) => {
    t.classList.toggle('active', !!panel && t.dataset.photo === panel.photo);
  });
}
function assignPhoto(photoId) {
  const panel = state.panels[selected];
  if (!panel) return;
  pushHistory();
  const photo = PHOTO_BY_ID[photoId] || customPhotos.find((p) => p.id === photoId);
  if (!photo) return;
  panel.photo = photo.id;
  panel.place = photo.place;
  panel.time = photo.time;
  panel.hook = photo.hook;
  panel.zoom = 1;
  panel.x = 0;
  panel.y = 0;
  syncPanelFields();
  markActiveThumb();
  render();
}

function pickPanelAt(clientX, clientY) {
  const box = canvas.getBoundingClientRect();
  const x = ((clientX - box.left) / box.width) * canvas.width;
  const y = ((clientY - box.top) / box.height) * canvas.height;
  const rects = layoutRects(state.layout);
  for (let i = rects.length - 1; i >= 0; i--) {
    const r = rects[i];
    if (x >= r.x * canvas.width && x <= (r.x + r.w) * canvas.width && y >= r.y * canvas.height && y <= (r.y + r.h) * canvas.height) {
      selected = i;
      syncPanelFields();
      markActiveThumb();
      render();
      return;
    }
  }
}

function setCanvasSize(w, h) {
  exportSize = { w, h };
  canvas.width = w;
  canvas.height = h;
  $('size-label').textContent = `${w} × ${h}`;
  render();
}

async function exportPNG(w, h) {
  const prevW = canvas.width;
  const prevH = canvas.height;
  canvas.width = w;
  canvas.height = h;
  drawPoster(canvas, state, images, -1);
  const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const stamp = state.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  a.href = url;
  a.download = `neon-coast-${stamp}-${w}x${h}.png`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 5000);
  canvas.width = prevW;
  canvas.height = prevH;
  render();
  const status = $('export-status');
  status.textContent = `Exported ${w} × ${h} PNG (${Math.round(blob.size / 1024)} KiB)`;
  window.__lastExport = { w, h, bytes: blob.size, name: a.download };
  return blob.size;
}

function loadImages() {
  const jobs = PHOTOS.map((photo) => new Promise((resolve) => {
    const img = new Image();
    img.onload = () => { images.set(photo.id, img); resolve(); };
    img.onerror = () => resolve();
    img.src = photo.file;
  }));
  return Promise.all(jobs);
}

function bindUI() {
  bindText('title-input', 'title');
  bindText('tagline-input', 'tagline');
  bindText('quote-input', 'quote');
  bindText('quote-source-input', 'quoteSource');
  bindText('credit-input', 'credit');
  bindText('volume-input', 'volume');
  bindText('ribbon-input', 'ribbon');
  trackEdit($('stars-input'), (e) => {
    state.stars = parseInt(e.target.value, 10);
    $('stars-value').textContent = '★'.repeat(state.stars);
    render();
  });
  $('toggle-tags').addEventListener('change', (e) => { pushHistory(); state.showTags = e.target.checked; render(); });
  $('toggle-quote').addEventListener('change', (e) => { pushHistory(); state.showQuote = e.target.checked; render(); });
  $('toggle-furniture').addEventListener('change', (e) => { pushHistory(); state.showFurniture = e.target.checked; render(); });
  bindPanelText('panel-place', 'place');
  bindPanelText('panel-time', 'time');
  bindPanelText('panel-hook', 'hook');
  bindPanelRange('panel-zoom', 'zoom');
  bindPanelRange('panel-x', 'x');
  bindPanelRange('panel-y', 'y');
  $('btn-undo').addEventListener('click', undo);
  $('btn-redo').addEventListener('click', redo);
  canvas.addEventListener('click', (e) => pickPanelAt(e.clientX, e.clientY));
  $('btn-upload').addEventListener('click', () => $('upload-input').click());
  $('upload-input').addEventListener('change', (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        customCount += 1;
        const id = `custom-${customCount}`;
        images.set(id, img);
        customPhotos.push({ id, file: reader.result, place: 'YOUR PHOTO', time: 'JUST NOW', hook: 'SHOT ON YOUR CAMERA' });
        buildPhotoStrip();
        assignPhoto(id);
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  });
  $('btn-export-1080').addEventListener('click', () => exportPNG(1080, 1080));
  $('btn-export-1350').addEventListener('click', () => exportPNG(1080, 1350));
  $('btn-export-1920').addEventListener('click', () => exportPNG(1920, 1080));
  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
      e.preventDefault();
      if (e.shiftKey) redo();
      else undo();
    }
  });
}

async function init() {
  bindUI();
  buildPhotoStrip();
  syncAll();
  const sizeParam = params.get('size');
  if (sizeParam === '1350') setCanvasSize(1080, 1350);
  else if (sizeParam === '1920') setCanvasSize(1920, 1080);
  else setCanvasSize(1080, 1080);
  try {
    await Promise.race([
      Promise.all([document.fonts.load('100px Anton'), document.fonts.load('40px Pacifico'), loadImages()]),
      new Promise((resolve) => setTimeout(resolve, 4000)),
    ]);
  } catch (err) {
    await loadImages();
  }
  renderAndMarkReady();
}

window.__neonCoast = { get state() { return state; }, render, exportPNG, applyPreset, setCanvasSize };
init();
