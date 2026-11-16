// NPPES demo-file helpers. Today they read /demo/nppes-weekly.json (built by
// scripts/build-nppes-sample.mjs). Later: GET /api/nppes/batches/:id from the backend.
import { fmtDate } from '../../../utils/utils';
import { idbDel, idbGet, idbSet } from '../../../utils/idb';

const IDB_KEY = 'nppes-weekly';

/** Weekly file previously imported in this browser (IndexedDB). */
export const readSavedWeekly = () => idbGet(IDB_KEY).catch(() => null);
export const saveWeekly = (data) => idbSet(IDB_KEY, data);
export const clearWeekly = () => idbDel(IDB_KEY).catch(() => {});

/** Optional built-in fallback: public/demo/nppes-weekly.json. Returns null when it is missing. */
export async function loadDemoFile() {
  try {
    const res = await fetch(`${import.meta.env.BASE_URL}demo/nppes-weekly.json`);
    if (!res.ok || (res.headers.get('content-type') || '').includes('html')) return null;
    return await res.json();
  } catch {
    return null;
  }
}

/** Unzips + parses a weekly NPPES ZIP in a Web Worker. onProgress(0-99). */
export function importWeeklyZip(file, onProgress) {
  return new Promise((resolve, reject) => {
    const worker = new Worker(new URL('../../../utils/nppesWorker.js', import.meta.url), { type: 'module' });
    worker.onmessage = ({ data }) => {
      if (data.type === 'progress') onProgress?.(data.pct);
      else if (data.type === 'done') {
        worker.terminate();
        resolve({ meta: data.meta, providers: data.providers });
      } else if (data.type === 'error') {
        worker.terminate();
        reject(new Error(data.message));
      }
    };
    worker.onerror = (e) => {
      worker.terminate();
      reject(new Error(e.message || 'Import failed.'));
    };
    worker.postMessage({ file });
  });
}

/** Apply the company publication rules + optional filters; returns { eligible, excluded }. */
export function applyRules(providers, rules, { state = 'All states', limit = 300 } = {}) {
  const inScope = providers.filter((p) => state === 'All states' || p.state === state);
  const passing = inScope.filter((p) => rules.allow.includes(p.specialty) && p.score >= rules.min);
  return {
    inScope: inScope.length,
    passing: passing.length,
    rows: passing.slice(0, limit), // providers are already sorted by score (desc)
  };
}

/** Provider row → BDE lead shape (see createBdeSeed in utils/data.js). */
export function toBdeLead(p, id, batchName) {
  return {
    id,
    name: p.name,
    state: p.state,
    tz: p.tz,
    city: p.city,
    npi: p.npi,
    type: p.type,
    enum: p.enumDate ? new Date(p.enumDate + 'T00:00').getTime() : Date.now(),
    specialty: p.specialty,
    taxonomy: p.taxonomy,
    score: p.score,
    address: `${p.address}, ${p.city}, ${p.state} ${p.zip}`,
    license: p.license ? `${p.license} (${p.licenseState})` : '',
    batch: batchName,
    phones: [{ value: p.phone, source: 'NPPES practice location', ok: true }],
    owner: '',
    status: 'Available',
    attempts: 0,
    claimed: null,
    expiry: null,
    services: [],
    follow: null,
    completed: [],
    appt: null,
    transfer: null,
    achieved: null,
    history: [],
    email: '',
    shares: [],
  };
}

export const periodLabel = (meta) => meta?.period || fmtDate(Date.now());
