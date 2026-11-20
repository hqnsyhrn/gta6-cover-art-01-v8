// Neon Coast — photo catalogue, grades, layouts and presets.
// Every photo was made with an image model in this session: fictional
// people, golden-hour light, no real person, no Rockstar material.

export const PHOTOS = [
  { id: 'hero-duo', file: 'photos/hero-duo.jpg', place: 'SUNSET DUO', time: '7:44 PM', hook: 'TWO OUTLAWS. ONE SUNSET.' },
  { id: 'marina', file: 'photos/marina.jpg', place: 'MARINA DEL SOL', time: '7:40 PM', hook: 'NO WITNESSES' },
  { id: 'street', file: 'photos/street.jpg', place: 'OCEAN DRIVE', time: '6:42 PM', hook: 'LOOKING FOR TROUBLE' },
  { id: 'chase', file: 'photos/chase.jpg', place: 'COASTAL HIGHWAY', time: '7:12 PM', hook: 'FULL THROTTLE' },
  { id: 'rooftop', file: 'photos/rooftop.jpg', place: 'ROOFTOP 9', time: '7:58 PM', hook: 'BIG MONEY' },
  { id: 'pier', file: 'photos/pier.jpg', place: 'PIER 26', time: '6:05 PM', hook: 'GONE FISHING' },
  { id: 'diner', file: 'photos/diner.jpg', place: 'PALM BOULEVARD', time: '7:20 PM', hook: 'LIGHTS OUT' },
  { id: 'beach', file: 'photos/beach.jpg', place: 'TOWER 2', time: '6:10 PM', hook: 'LAST SWIM' },
  { id: 'palms', file: 'photos/palms.jpg', place: 'SUNSET PARK', time: '7:31 PM', hook: 'GOLDEN HOUR' },
  { id: 'skyline', file: 'photos/skyline.jpg', place: 'SUNSET HEIGHTS', time: '7:47 PM', hook: 'THE CITY GLOWS' },
  { id: 'boardwalk', file: 'photos/boardwalk.jpg', place: 'BOARDWALK', time: '6:58 PM', hook: 'EVERY LIGHT ON' },
  { id: 'boat', file: 'photos/boat.jpg', place: 'GOLDEN WAKE', time: '7:05 PM', hook: 'OUTRUN THE SUN' },
  { id: 'hotel', file: 'photos/hotel.jpg', place: 'THE PALMS HOTEL', time: '6:33 PM', hook: 'CHECK IN, NEVER LEAVE' },
  { id: 'gas', file: 'photos/gas.jpg', place: 'ROUTE 9 GAS', time: '7:26 PM', hook: 'LAST TANK BEFORE DAWN' },
  { id: 'bridge', file: 'photos/bridge.jpg', place: 'CAUSEWAY', time: '7:52 PM', hook: 'ONE WAY OUT' },
  { id: 'market', file: 'photos/market.jpg', place: 'NIGHT MARKET', time: '6:47 PM', hook: 'EVERYTHING FOR SALE' },
  { id: 'lifeguard', file: 'photos/lifeguard.jpg', place: 'TOWER 7', time: '7:15 PM', hook: 'OFF DUTY' },
  { id: 'highway', file: 'photos/highway.jpg', place: 'PALM HIGHWAY', time: '7:02 PM', hook: 'DRIVE INTO THE SUN' },
  { id: 'yacht', file: 'photos/yacht.jpg', place: 'YACHT DECK', time: '7:49 PM', hook: 'GOLDEN GETAWAY' },
  { id: 'neon-street', file: 'photos/neon-street.jpg', place: 'NEON ROW', time: '8:04 PM', hook: 'THE NIGHT SWITCHES ON' },
];

export const PHOTO_BY_ID = Object.fromEntries(PHOTOS.map((p) => [p.id, p]));

// Grades: a canvas filter string, a warm/cool tint wash, a halftone dot
// strength and a posterize level (0 = off). Poster Ink is the light
// print treatment; Ink Strong is the heavy poster treatment.
export const GRADES = [
  { id: 'sunset', name: 'Sunset', filter: 'saturate(1.28) contrast(1.08) sepia(0.16) brightness(1.03)', tint: 'rgba(255,150,50,0.08)', halftone: 0, posterize: 0 },
  { id: 'neon-dusk', name: 'Neon Dusk', filter: 'saturate(1.55) contrast(1.14) hue-rotate(-12deg) brightness(0.98)', tint: 'rgba(190,60,180,0.10)', halftone: 0.05, posterize: 0 },
  { id: 'vice-pink', name: 'Vice Pink', filter: 'saturate(1.45) contrast(1.10) hue-rotate(18deg)', tint: 'rgba(255,80,160,0.10)', halftone: 0, posterize: 0 },
  { id: 'teal-heat', name: 'Teal Heat', filter: 'saturate(1.20) contrast(1.12) hue-rotate(-28deg) sepia(0.08)', tint: 'rgba(0,180,170,0.08)', halftone: 0, posterize: 0 },
  { id: 'mono-gold', name: 'Mono Gold', filter: 'grayscale(1) sepia(0.55) contrast(1.12) brightness(1.02)', tint: 'rgba(255,190,80,0.06)', halftone: 0, posterize: 0 },
  { id: 'poster-ink', name: 'Poster Ink', filter: 'saturate(1.30) contrast(1.28) brightness(1.02)', tint: 'rgba(255,120,60,0.06)', halftone: 0.10, posterize: 6 },
  { id: 'ink-strong', name: 'Ink Strong', filter: 'saturate(1.45) contrast(1.60) brightness(1.00)', tint: 'rgba(230,40,140,0.12)', halftone: 0.18, posterize: 4 },
  { id: 'noir-sunset', name: 'Noir Sunset', filter: 'saturate(0.85) contrast(1.35) brightness(0.92) sepia(0.25)', tint: 'rgba(20,10,40,0.10)', halftone: 0, posterize: 0 },
];

export const GRADE_BY_ID = Object.fromEntries(GRADES.map((g) => [g.id, g]));

export const LAYOUTS = [
  { id: 'collage9', name: 'Collage 9' },
  { id: 'hero-left', name: 'Hero Left' },
  { id: 'hero-top', name: 'Hero Top' },
  { id: 'grid4', name: 'Grid 4' },
  { id: 'strip3', name: 'Strip 3' },
  { id: 'tilted', name: 'Tilted Snaps' },
  { id: 'full-bleed', name: 'Full Bleed' },
];

export const LAYOUT_BY_ID = Object.fromEntries(LAYOUTS.map((l) => [l.id, l]));

// Presets: panels are photo ids in the order the layout's rects use them.
// Collage 9 rect order: top-left, top-right, mid-left top, mid-left bottom,
// CENTER (the big one), mid-right top, mid-right bottom, bottom-left, bottom-right.
export const PRESETS = [
  {
    id: 'sunset-duo', name: 'Sunset Duo', layout: 'collage9', grade: 'ink-strong',
    title: 'SUNSET DUO', tagline: 'Two outlaws. One sunset.',
    panels: ['marina', 'street', 'rooftop', 'pier', 'hero-duo', 'beach', 'diner', 'palms', 'chase'],
  },
  {
    id: 'sunset-chase', name: 'Sunset Chase', layout: 'collage9', grade: 'ink-strong',
    title: 'SUNSET CHASE', tagline: 'Every street is a stage.',
    panels: ['street', 'highway', 'gas', 'bridge', 'chase', 'boat', 'neon-street', 'skyline', 'boardwalk'],
  },
  {
    id: 'neon-nights', name: 'Neon Nights', layout: 'hero-left', grade: 'neon-dusk',
    title: 'NEON NIGHTS', tagline: 'The city never sleeps.',
    panels: ['neon-street', 'diner', 'gas', 'skyline', 'street'],
  },
  {
    id: 'pier-pressure', name: 'Pier Pressure', layout: 'hero-top', grade: 'sunset',
    title: 'PIER PRESSURE', tagline: 'One last cast.',
    panels: ['pier', 'marina', 'boat', 'beach'],
  },
  {
    id: 'golden-getaway', name: 'Golden Getaway', layout: 'grid4', grade: 'vice-pink',
    title: 'GOLDEN GETAWAY', tagline: 'Leave it all behind.',
    panels: ['yacht', 'hotel', 'market', 'lifeguard'],
  },
];

export const PRESET_BY_ID = Object.fromEntries(PRESETS.map((p) => [p.id, p]));

export const DEFAULT_QUOTE = 'NEON, SUN AND ONE LAST SCORE';
export const DEFAULT_QUOTE_SOURCE = 'THE LEONIDA LEDGER';
export const DEFAULT_CREDIT = 'VOL. 01 · TWO OUTLAWS · ONE COAST · ALL ORIGINAL ART — NEON COAST PRESS';
export const DEFAULT_VOLUME = 'VOL. 01';
export const DEFAULT_RIBBON = "COLLECTOR'S EDITION";

export function freshPanel(photoId) {
  const p = PHOTO_BY_ID[photoId] || PHOTOS[0];
  return { photo: p.id, place: p.place, time: p.time, hook: p.hook, zoom: 1, x: 0, y: 0 };
}

export function freshState(presetId) {
  const preset = PRESET_BY_ID[presetId] || PRESETS[0];
  return {
    preset: preset.id,
    layout: preset.layout,
    grade: preset.grade,
    title: preset.title,
    tagline: preset.tagline,
    quote: DEFAULT_QUOTE,
    quoteSource: DEFAULT_QUOTE_SOURCE,
    credit: DEFAULT_CREDIT,
    volume: DEFAULT_VOLUME,
    ribbon: DEFAULT_RIBBON,
    stars: 5,
    showTags: true,
    showQuote: true,
    showFurniture: true,
    panels: preset.panels.map((id) => freshPanel(id)),
  };
}
