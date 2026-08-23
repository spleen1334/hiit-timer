import { validateBodyMetricEntries, type BodyMetricEntry } from '../body/bodyMetrics';
import { readLocalStorageItem, removeLocalStorageItem } from './localStorage';
import { normalizeBodyAge, readBodyData, writeBodyData } from './bodyData';
import { BODY_HEIGHT_KEY, BODY_METRICS_KEY } from './storageKeys';

const LEGACY_HEADER = 'date,weightKg,bodyFatPercent,heightCm';
const HEADER = `${LEGACY_HEADER},ageYears`;
const csvEscape = (value: string) => /[,"\n\r]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;

const parseCsv = (input: string): string[][] => {
  const rows: string[][] = []; let row: string[] = []; let cell = ''; let quoted = false;
  for (let i = 0; i < input.length; i += 1) {
    const char = input[i];
    if (quoted) {
      if (char === '"') { if (input[i + 1] === '"') { cell += '"'; i += 1; } else quoted = false; }
      else cell += char;
    } else if (char === '"') { if (cell !== '') throw new Error('Malformed CSV.'); quoted = true; }
    else if (char === ',') { row.push(cell); cell = ''; }
    else if (char === '\n' || char === '\r') { if (char === '\r' && input[i + 1] === '\n') i += 1; row.push(cell); rows.push(row); row = []; cell = ''; }
    else cell += char;
  }
  if (quoted) throw new Error('Malformed CSV.');
  if (cell !== '' || row.length > 0) { row.push(cell); rows.push(row); }
  return rows;
};

export async function buildBodyCsvExport() {
  const snapshot = (await readBodyData()) ?? { entries: [], height: '', age: '' };
  const rows = snapshot.entries.map((entry) => [entry.date, entry.weightKg, entry.bodyFatPercent, snapshot.height, snapshot.age].map(csvEscape).join(','));
  if (rows.length === 0 && (snapshot.height || snapshot.age)) rows.push(['', '', '', snapshot.height, snapshot.age].map(csvEscape).join(','));
  return [HEADER, ...rows].join('\n');
}

export async function downloadBodyCsvExport() {
  const blob = new Blob([await buildBodyCsvExport()], { type: 'text/csv' }); const url = URL.createObjectURL(blob);
  const link = document.createElement('a'); link.href = url; link.download = 'pulse-trainer-body.csv'; document.body.append(link); link.click(); link.remove(); URL.revokeObjectURL(url);
}

export async function importBodyCsv(raw: string) {
  const rows = parseCsv(raw);
  if (rows.length === 0 || (rows[0].join(',') !== LEGACY_HEADER && rows[0].join(',') !== HEADER)) throw new Error('Invalid body CSV.');
  const hasAgeColumn = rows[0].join(',') === HEADER;
  const dataRows = rows.slice(1); const heights = new Set<string>(); const ages = new Set<string>(); const entries: BodyMetricEntry[] = [];
  dataRows.forEach((cells, index) => {
    if (cells.length !== (hasAgeColumn ? 5 : 4)) throw new Error('Invalid body CSV.');
    const [date, weightKg, bodyFatPercent, heightCm, ageYears] = cells;
    const normalizedAge = hasAgeColumn ? normalizeBodyAge(ageYears) : '';
    if (hasAgeColumn && ageYears && !normalizedAge) throw new Error('Invalid body CSV age.');
    if (!date && !weightKg && !bodyFatPercent) {
      if ((!heightCm && !normalizedAge) || index !== 0 || dataRows.length !== 1) throw new Error('Invalid body CSV metadata row.');
      if (heightCm) heights.add(heightCm);
      if (normalizedAge) ages.add(normalizedAge);
      return;
    }
    if (!date || !weightKg || bodyFatPercent === undefined) throw new Error('Invalid body CSV row.');
    if (heightCm) heights.add(heightCm);
    if (normalizedAge) ages.add(normalizedAge);
    entries.push({ id: `body-csv-${index}-${Date.now()}`, date, weightKg, bodyFatPercent, ...(heightCm ? { heightCm } : {}) });
  });
  if (heights.size > 1) throw new Error('Conflicting body heights.');
  if (ages.size > 1) throw new Error('Conflicting body ages.');
  const valid = validateBodyMetricEntries(entries);
  await writeBodyData({ entries: valid, height: [...heights][0] ?? '', age: [...ages][0] ?? '' });
  removeLocalStorageItem(BODY_METRICS_KEY); removeLocalStorageItem(BODY_HEIGHT_KEY);
}
