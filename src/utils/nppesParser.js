// Shared NPPES parsing logic. Used by the browser worker (ZIP import) AND by
// scripts/build-nppes-sample.mjs. No DOM / Node APIs in here.

/* ---- taxonomy → specialty (first matching prefix wins). Edit freely. ---- */
export const SPECIALTY_BY_TAXONOMY = [
  ['1041', 'Clinical social work'], // 1041C0700X clinical SW, 1041S0200X school SW
  ['104100', 'Clinical social work'],
  ['101Y', 'Counseling'], // mental health / professional / addiction / school counselors
  ['106H', 'Marriage & family therapy'],
  ['2084P', 'Psychiatry'],
  ['363LP0808', 'Psychiatry'], // psychiatric / mental-health nurse practitioner
  ['103T', 'Psychology'],
  ['261QM0801', 'Behavioral health facility'],
  ['261QM0850', 'Behavioral health facility'],
  ['261QM0855', 'Behavioral health facility'],
  ['261QR0405', 'Behavioral health facility'],
  ['323P', 'Behavioral health facility'],
  ['324500', 'Behavioral health facility'],
];
const specialtyOf = (code) => SPECIALTY_BY_TAXONOMY.find(([p]) => code.startsWith(p))?.[1] || null;

const TZ_GROUPS = {
  'America/New_York': 'CT DE DC FL GA ME MD MA NH NJ NY NC OH PA RI SC VT VA WV MI IN KY',
  'America/Chicago': 'AL AR IL IA LA MN MS MO OK TX WI KS NE ND SD TN',
  'America/Denver': 'CO MT NM UT WY ID',
  'America/Phoenix': 'AZ',
  'America/Los_Angeles': 'CA NV OR WA',
  'America/Anchorage': 'AK',
  'Pacific/Honolulu': 'HI',
  'America/Puerto_Rico': 'PR',
};
const TZ = Object.fromEntries(Object.entries(TZ_GROUPS).flatMap(([tz, list]) => list.split(' ').map((s) => [s, tz])));

/** Streaming CSV parser (quoted fields, embedded commas/newlines). Call write() per chunk, then end(). */
export class CsvParser {
  constructor(onRow) {
    this.onRow = onRow;
    this.row = [];
    this.field = '';
    this.q = false;
    this.pendingQuote = false;
  }

  write(text) {
    for (let i = 0; i < text.length; i++) {
      const c = text[i];
      if (this.pendingQuote) {
        this.pendingQuote = false;
        if (c === '"') {
          this.field += '"';
          continue;
        }
        this.q = false; // that quote closed the field; handle c normally below
      }
      if (this.q) {
        if (c === '"') this.pendingQuote = true;
        else this.field += c;
      } else if (c === '"') this.q = true;
      else if (c === ',') {
        this.row.push(this.field);
        this.field = '';
      } else if (c === '\n') {
        this.row.push(this.field);
        this.field = '';
        if (this.row.length > 1 || this.row[0] !== '') this.onRow(this.row);
        this.row = [];
      } else if (c !== '\r') this.field += c;
    }
  }

  end() {
    if (this.pendingQuote) {
      this.pendingQuote = false;
      this.q = false;
    }
    if (this.field || this.row.length) {
      this.row.push(this.field);
      this.onRow(this.row);
    }
  }
}

const titleCase = (s) =>
  s && s === s.toUpperCase() ? s.toLowerCase().replace(/(^|[\s\-'/(])([a-z])/g, (_, a, b) => a + b.toUpperCase()) : s;
const fmtPhone = (d) => `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`;
const isoDate = (mdy) => (mdy ? `${mdy.slice(6, 10)}-${mdy.slice(0, 2)}-${mdy.slice(3, 5)}` : '');

/** Feed it rows from CsvParser (first row = header). Then call result(). */
export class NppesProcessor {
  constructor() {
    this.header = null;
    this.totals = { rows: 0, deactivated: 0, outsideUS: 0, otherSpecialty: 0, noPhone: 0, eligible: 0 };
    this.providers = [];
  }

  initHeader(h) {
    const col = (name) => {
      const i = h.indexOf(name);
      if (i < 0) throw new Error('This is not an NPPES npidata file (missing column: ' + name + ').');
      return i;
    };
    this.C = {
      npi: col('NPI'), type: col('Entity Type Code'),
      org: col('Provider Organization Name (Legal Business Name)'), last: col('Provider Last Name (Legal Name)'),
      first: col('Provider First Name'), cred: col('Provider Credential Text'),
      addr1: col('Provider First Line Business Practice Location Address'),
      city: col('Provider Business Practice Location Address City Name'),
      state: col('Provider Business Practice Location Address State Name'),
      zip: col('Provider Business Practice Location Address Postal Code'),
      country: col('Provider Business Practice Location Address Country Code (If outside U.S.)'),
      phone: col('Provider Business Practice Location Address Telephone Number'),
      enumDate: col('Provider Enumeration Date'), deact: col('NPI Deactivation Reason Code'),
      sole: col('Is Sole Proprietor'), subpart: col('Is Organization Subpart'),
    };
    this.tax = Array.from({ length: 15 }, (_, i) => ({
      code: col(`Healthcare Provider Taxonomy Code_${i + 1}`),
      lic: col(`Provider License Number_${i + 1}`),
      licState: col(`Provider License Number State Code_${i + 1}`),
      primary: col(`Healthcare Provider Primary Taxonomy Switch_${i + 1}`),
    }));
    this.header = h;
  }

  onRow(r) {
    if (!this.header) return this.initHeader(r);
    const { C, totals } = this;
    totals.rows++;
    if (r[C.deact]) return void totals.deactivated++;
    if (r[C.country] && r[C.country] !== 'US') return void totals.outsideUS++;
    const t = this.tax.find((x) => r[x.primary] === 'Y') || this.tax[0];
    const taxonomy = r[t.code];
    const specialty = specialtyOf(taxonomy);
    if (!specialty) return void totals.otherSpecialty++;
    const digits = r[C.phone].replace(/\D/g, '');
    if (digits.length !== 10) return void totals.noPhone++;

    const individual = r[C.type] === '1';
    const state = r[C.state];
    const name = individual
      ? [titleCase(r[C.first]), titleCase(r[C.last])].filter(Boolean).join(' ') + (r[C.cred] ? ', ' + r[C.cred].replace(/\./g, '') : '')
      : titleCase(r[C.org]);
    const zip = r[C.zip];

    // Demo lead score (0-100). NPPES has no score — this is a simple heuristic you can replace.
    let score = 45 + 10; // base + has a practice phone
    if (r[C.sole] === 'Y') score += 15; // small practice, likely no in-house billing team
    if (r[t.lic]) score += 12; // licensed in primary taxonomy
    if (individual) score += 8;
    if (r[C.addr1] && zip.length >= 5) score += 5;
    if (r[C.subpart] === 'Y') score -= 5;

    this.providers.push({
      npi: r[C.npi], name, type: individual ? 'Individual' : 'Organization', specialty, taxonomy,
      score: Math.min(99, score), phone: fmtPhone(digits),
      address: titleCase(r[C.addr1]), city: titleCase(r[C.city]), state, zip: zip.slice(0, 5), tz: TZ[state] || 'America/New_York',
      enumDate: isoDate(r[C.enumDate]), license: r[t.lic] || '', licenseState: r[t.licState] || '', soleProprietor: r[C.sole] === 'Y',
    });
    totals.eligible++;
  }

  result(sourceName, uploadedFile = '') {
    const providers = this.providers.sort((a, b) => b.score - a.score);
    const m = sourceName.match(/(\d{8})-(\d{8})/);
    const d = (s) => s.replace(/(\d{4})(\d\d)(\d\d)/, '$1-$2-$3');
    return {
      meta: {
        source: sourceName,
        uploadedFile,
        period: m ? `${d(m[1])} → ${d(m[2])}` : '',
        generatedAt: new Date().toISOString(),
        totals: this.totals,
        bySpecialty: providers.reduce((o, p) => ((o[p.specialty] = (o[p.specialty] || 0) + 1), o), {}),
      },
      providers,
    };
  }
}
