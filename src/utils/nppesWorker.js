// Web Worker: unzip → stream-parse npidata CSV → filter/score → post result. Keeps the UI responsive.
import { CsvParser, NppesProcessor } from './nppesParser';
import { listZipEntries, openEntryStream, isNpiDataEntry } from './zip';

self.onmessage = async ({ data: { file } }) => {
  try {
    const entry = (await listZipEntries(file)).find(isNpiDataEntry);
    if (!entry) throw Error('npidata_pfile_*.csv was not found inside this ZIP.');
    const proc = new NppesProcessor();
    const parser = new CsvParser((r) => proc.onRow(r));
    const reader = (await openEntryStream(file, entry)).pipeThrough(new TextDecoderStream()).getReader();
    let chars = 0;
    let last = -1;
    for (;;) {
      const { value, done } = await reader.read();
      if (done) break;
      parser.write(value);
      chars += value.length;
      const pct = Math.min(99, Math.round((chars / entry.size) * 100));
      if (pct !== last) {
        last = pct;
        self.postMessage({ type: 'progress', pct });
      }
    }
    parser.end();
    self.postMessage({ type: 'done', ...proc.result(entry.name.split('/').pop(), file.name) });
  } catch (err) {
    self.postMessage({ type: 'error', message: err.message });
  }
};
