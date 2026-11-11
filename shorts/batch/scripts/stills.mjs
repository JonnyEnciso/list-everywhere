// node scripts/stills.mjs <CompId> t1 t2 ... -> images/qa/<CompId>-<t>.png (scale 0.5); bundles once to .bundle/
import {bundle} from '@remotion/bundler';
import {renderStill, selectComposition} from '@remotion/renderer';
import path from 'node:path';
import fs from 'node:fs';
const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const browserExecutable = '/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell';
const [id, ...times] = process.argv.slice(2);
const serveUrl = await bundle({entryPoint: path.join(root, 'src/index.ts'), outDir: path.join(root, '.bundle-stills')});
const comp = await selectComposition({serveUrl, id, browserExecutable});
fs.mkdirSync(path.join(root, 'images/qa'), {recursive: true});
for (const ts of times) {
  const frame = Math.min(comp.durationInFrames - 1, Math.round(parseFloat(ts) * comp.fps));
  await renderStill({composition: comp, serveUrl, frame, scale: 0.5, browserExecutable, output: path.join(root, `images/qa/${id}-${ts}.png`)});
}
console.log('stills', times.length);
