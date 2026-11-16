// OPTIONAL: builds public/demo/nppes-weekly.json from an extracted weekly file (a built-in fallback demo file).
// The app can also import the weekly ZIP directly in the browser (Admin → NPPES Data → Import weekly ZIP).
//
//   node scripts/build-nppes-sample.mjs path/to/npidata_pfile_20261102-20261108.csv
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { basename, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { CsvParser, NppesProcessor } from '../src/utils/nppesParser.js';

const input = process.argv[2];
if (!input) {
  console.error('Usage: node scripts/build-nppes-sample.mjs <npidata_pfile_*.csv>');
  process.exit(1);
}
const OUT = resolve(dirname(fileURLToPath(import.meta.url)), '../public/demo/nppes-weekly.json');

const proc = new NppesProcessor();
const parser = new CsvParser((r) => proc.onRow(r));
parser.write(readFileSync(input, 'utf8'));
parser.end();
const result = proc.result(basename(input));

mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, JSON.stringify(result));
console.log(result.meta, `\nWrote ${result.providers.length} providers → ${OUT}`);
