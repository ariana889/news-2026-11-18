import { closeSync, copyFileSync, existsSync, mkdirSync, openSync, readSync, statSync } from 'node:fs';
import { join } from 'node:path';

const MAX_BYTES = 1048576;
const PNG_MAGIC = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
const outDir = process.env.MAKEFUN_OUTPUT_DIR || '/output';
const source = join(import.meta.dirname, 'entry.png');

function fail(reason: string): never {
  console.error(`error: ${reason}`);
  process.exit(1);
}

function firstBytes(path: string, count: number): Buffer {
  const fd = openSync(path, 'r');
  const head = Buffer.alloc(count);
  try {
    readSync(fd, head, 0, count, 0);
  } finally {
    closeSync(fd);
  }
  return head;
}

if (!existsSync(source)) {
  fail(`source image not found at ${source}`);
}

const size = statSync(source).size;
if (size > MAX_BYTES) {
  fail(`source image is ${size} bytes, over the ${MAX_BYTES} byte limit: ${source}`);
}

const head = firstBytes(source, 8);
const format = head.subarray(0, PNG_MAGIC.length).equals(PNG_MAGIC)
  ? 'PNG'
  : head[0] === 0xff && head[1] === 0xd8 && head[2] === 0xff
    ? 'JPEG'
    : null;
if (!format) {
  fail(`source image is neither PNG nor JPEG (first bytes ${head.subarray(0, 4).toString('hex')}): ${source}`);
}

mkdirSync(outDir, { recursive: true });
const target = join(outDir, 'entry.png');
copyFileSync(source, target);
console.log(`copied ${source} -> ${target} (${format}, ${size} bytes)`);
