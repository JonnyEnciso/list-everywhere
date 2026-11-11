// node scripts/render.mjs [--preview] [CompId ...] -> out/<CompId>-4K.mp4 (2160x3840, 60 fps), or out/<CompId>-preview.mp4 (1080x1920)
// with --preview; all Shorts when no id is given. Bundles once.
import {bundle} from '@remotion/bundler';
import {renderMedia, selectComposition, getCompositions} from '@remotion/renderer';
import path from 'node:path';
const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const browserExecutable = '/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell';
const serveUrl = await bundle({entryPoint: path.join(root, 'src/index.ts'), outDir: path.join(root, '.bundle')});
const args = process.argv.slice(2);
const preview = args.includes('--preview');
const picked = args.filter((a) => a !== '--preview');
const ids = picked.length ? picked : (await getCompositions(serveUrl, {browserExecutable})).map((c) => c.id);
for (const id of ids) {
  const composition = await selectComposition({serveUrl, id, browserExecutable});
  const t0 = Date.now();
  await renderMedia({composition, serveUrl, codec: 'h264', scale: preview ? 1 : 2, imageFormat: 'jpeg', jpegQuality: 95, crf: 16,
    pixelFormat: 'yuv420p', concurrency: 4, browserExecutable, chromiumOptions: {gl: 'swangle'},
    outputLocation: path.join(root, `out/${id}-${preview ? 'preview' : '4K'}.mp4`)});
  console.log(id, 'rendered in', Math.round((Date.now() - t0) / 1000), 's');
}
