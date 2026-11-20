// Neon Coast — Poster Cover Studio. The entry program (Node 22, standard
// library only): copies app/ and screenshots/ into /output and writes
// /output/dossier.json with buildDossier from vendor/makefun-app.ts.
import { cpSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-app.ts';

const root = fileURLToPath(new URL('.', import.meta.url));
const outDir = process.env.MAKEFUN_OUTPUT_DIR || '/output';

mkdirSync(outDir, { recursive: true });
for (const name of ['app', 'screenshots']) {
  rmSync(join(outDir, name), { recursive: true, force: true });
  cpSync(join(root, name), join(outDir, name), { recursive: true });
}

const dossier = buildDossier(outDir, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 48 * 1024 * 1024,
  app_path_max_bytes: 1000,
});
writeFileSync(join(outDir, 'dossier.json'), dossier);
console.log(`Neon Coast: wrote ${outDir} (dossier ${dossier.length} bytes)`);
