// Tiny IndexedDB key/value helper — used for data too big for localStorage (the weekly NPPES file).
const DB = 'bluegrid-demo';
const STORE = 'kv';

const open = () =>
  new Promise((resolve, reject) => {
    const req = indexedDB.open(DB, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(STORE);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });

const run = async (mode, fn) => {
  const db = await open();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, mode);
    const req = fn(tx.objectStore(STORE));
    tx.oncomplete = () => resolve(req.result);
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error);
  });
};

export const idbGet = (key) => run('readonly', (s) => s.get(key));
export const idbSet = (key, value) => run('readwrite', (s) => s.put(value, key));
export const idbDel = (key) => run('readwrite', (s) => s.delete(key));
