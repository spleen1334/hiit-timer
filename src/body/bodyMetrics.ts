export type BodyMetricEntry = {
  id: string;
  date: string;
  weightKg: string;
  bodyFatPercent: string;
  heightCm?: string;
};

export type BodyMetricDraft = {
  date: string;
  weightKg: string;
  bodyFatPercent: string;
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === 'object' && !Array.isArray(value);

const normalizeString = (value: unknown) => (typeof value === 'string' ? value.trim() : '');

export const parseBodyMetricNumber = (value: string) => {
  const normalized = value.trim().replace(',', '.');

  return normalized.length > 0 ? Number(normalized) : Number.NaN;
};

const parseBodyMetricDate = (value: string) => {
  const parsed = new Date(`${value}T12:00:00`);

  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const getDateValue = (daysAgo = 0) => {
  const now = new Date();
  const local = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 12);

  local.setDate(local.getDate() - daysAgo);

  const year = local.getFullYear();
  const month = String(local.getMonth() + 1).padStart(2, '0');
  const day = String(local.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
};

export const getTodayDateValue = () => getDateValue(0);

export const createBodyMetricDraft = (date = getTodayDateValue()): BodyMetricDraft => ({
  date,
  weightKg: '',
  bodyFatPercent: '',
});

const DEMO_WEIGHTS = ['76.0', '76.2', '76.5', '76.8', '77.1', '77.4', '77.8', '78.1', '78.5', '78.9'];
const DEMO_BODY_FAT = ['19.2', '19.0', '18.8', '18.7', '18.6', '18.5', '18.4', '18.2', '18.1', '18.0'];

export const createDemoBodyMetricEntries = (): BodyMetricEntry[] =>
  DEMO_WEIGHTS.map((weightKg, index) => {
    const daysAgo = DEMO_WEIGHTS.length - 1 - index;

    return {
      id: `body-metric-demo-${index}`,
      date: getDateValue(daysAgo),
      weightKg,
      bodyFatPercent: DEMO_BODY_FAT[index],
    };
  }).reverse();

export const sanitizeBodyMetricEntries = (value: unknown): BodyMetricEntry[] => {
  if (!Array.isArray(value)) {
    return [];
  }

  const entriesByDate = new Map<string, BodyMetricEntry>();

  value
    .flatMap((entry, index) => {
      if (!isRecord(entry)) {
        return [];
      }

      const date = normalizeString(entry.date);
      const weightKg = normalizeString(entry.weightKg);

      if (!date || !weightKg) {
        return [];
      }

      const heightCm = normalizeString(entry.heightCm);

      return [
        {
          id: normalizeString(entry.id) || `body-metric-${index}`,
          date,
          weightKg,
          bodyFatPercent: normalizeString(entry.bodyFatPercent),
          ...(heightCm ? { heightCm } : {}),
        },
      ];
    })
    .forEach((entry) => {
      if (!entriesByDate.has(entry.date)) {
        entriesByDate.set(entry.date, entry);
      }
    });

  return [...entriesByDate.values()]
    .sort((left, right) => {
      const leftDate = parseBodyMetricDate(left.date);
      const rightDate = parseBodyMetricDate(right.date);

      if (leftDate && rightDate) {
        return rightDate.getTime() - leftDate.getTime();
      }

      if (leftDate) {
        return -1;
      }

      if (rightDate) {
        return 1;
      }

      return right.id.localeCompare(left.id);
    });
};

export const validateBodyMetricEntries = (value: unknown): BodyMetricEntry[] => {
  if (!Array.isArray(value)) throw new Error('Invalid body metric entries.');
  const dates = new Set<string>();
  for (const entry of value) {
    if (!isRecord(entry) || typeof entry.id !== 'string' || !entry.id.trim() || typeof entry.date !== 'string' || !parseBodyMetricDate(entry.date) || typeof entry.weightKg !== 'string' || !Number.isFinite(parseBodyMetricNumber(entry.weightKg)) || parseBodyMetricNumber(entry.weightKg) <= 0 || typeof entry.bodyFatPercent !== 'string' || (entry.bodyFatPercent !== '' && (!Number.isFinite(parseBodyMetricNumber(entry.bodyFatPercent)) || parseBodyMetricNumber(entry.bodyFatPercent) < 0)) || (entry.heightCm !== undefined && typeof entry.heightCm !== 'string')) throw new Error('Invalid body metric entries.');
    if (dates.has(entry.date)) throw new Error('Duplicate body metric dates.');
    dates.add(entry.date);
  }
  const sanitized = sanitizeBodyMetricEntries(value);
  if (JSON.stringify(sanitized) !== JSON.stringify(value)) throw new Error('Invalid body metric entries.');
  return sanitized;
};

export const sortBodyMetricEntries = (entries: BodyMetricEntry[]) => sanitizeBodyMetricEntries(entries);

export const calculateBodyMetricBmi = (weightKg: string, heightCm: string) => {
  const weight = parseBodyMetricNumber(weightKg);
  const height = parseBodyMetricNumber(heightCm);

  if (!Number.isFinite(weight) || !Number.isFinite(height) || weight <= 0 || height <= 0) {
    return null;
  }

  return weight / ((height / 100) ** 2);
};

export const getLatestBodyMetricHeight = (entries: BodyMetricEntry[]) =>
  entries.find((entry) => normalizeString(entry.heightCm))?.heightCm?.trim() ?? '';
