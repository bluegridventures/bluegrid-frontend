// Minimal in-browser ZIP reader (central directory + deflate via DecompressionStream). No upload, no library.

export async function listZipEntries(file) {
  const tail = new Uint8Array(await file.slice(-65557).arrayBuffer());
  const v = new DataView(tail.buffer);
  let end = tail.length - 22;
  while (end >= 0 && (v.getUint32(end, true) !== 0x06054b50 || end + 22 + v.getUint16(end + 20, true) !== tail.length)) end--;
  if (end < 0) throw Error('This does not look like a ZIP file.');
  const count = v.getUint16(end + 10, true);
  const size = v.getUint32(end + 12, true);
  const offset = v.getUint32(end + 16, true);
  if (count === 0xffff || size === 0xffffffff || offset === 0xffffffff) throw Error('ZIP64 archives are not supported here.');
  if (offset + size > file.size) throw Error('Invalid ZIP directory.');
  const buf = await file.slice(offset, offset + size).arrayBuffer();
  const dv = new DataView(buf);
  const entries = [];
  let pos = 0;
  for (let i = 0; i < count; i++) {
    if (pos + 46 > size || dv.getUint32(pos, true) !== 0x02014b50) throw Error('Invalid ZIP directory.');
    const n = dv.getUint16(pos + 28, true);
    const extra = dv.getUint16(pos + 30, true);
    const comment = dv.getUint16(pos + 32, true);
    entries.push({
      name: new TextDecoder().decode(new Uint8Array(buf, pos + 46, n)),
      method: dv.getUint16(pos + 10, true),
      csize: dv.getUint32(pos + 20, true),
      size: dv.getUint32(pos + 24, true),
      offset: dv.getUint32(pos + 42, true),
    });
    pos += 46 + n + extra + comment;
  }
  return entries;
}

/** Returns a ReadableStream of the entry's decompressed bytes. */
export async function openEntryStream(file, entry) {
  const head = new DataView(await file.slice(entry.offset, entry.offset + 30).arrayBuffer());
  if (head.getUint32(0, true) !== 0x04034b50) throw Error('Invalid ZIP entry header.');
  const start = entry.offset + 30 + head.getUint16(26, true) + head.getUint16(28, true);
  const raw = file.slice(start, start + entry.csize).stream();
  if (entry.method === 0) return raw;
  if (entry.method === 8) {
    if (typeof DecompressionStream === 'undefined') throw Error('Your browser cannot unzip files. Please use a current Chrome, Edge or Firefox.');
    return raw.pipeThrough(new DecompressionStream('deflate-raw'));
  }
  throw Error('Unsupported ZIP compression method.');
}

export const isNpiDataEntry = (e) => /^npidata_pfile_.*\.csv$/i.test(e.name.split('/').pop()) && !/fileheader/i.test(e.name);
