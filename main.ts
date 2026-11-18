import { copyFileSync, existsSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

const outDir = process.env.MAKEFUN_OUTPUT_DIR || '/output';
const source = join(import.meta.dirname, 'entry.png');

if (!existsSync(source)) {
  console.error(`error: source image not found at ${source}`);
  process.exit(1);
}

mkdirSync(outDir, { recursive: true });
const target = join(outDir, 'entry.png');
copyFileSync(source, target);
console.log(`copied ${source} -> ${target}`);
