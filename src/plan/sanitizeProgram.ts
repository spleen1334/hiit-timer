import { DEFAULT_PROGRAM } from './defaultProgram';
import type { CardioExercise, TrainingProgram, WorkoutExercise } from './types';
import { cleanLegacyGroupNames, normalizeWorkoutText, parseWorkoutText } from './workoutText';

const asString = (value: unknown, fallback: string) =>
  typeof value === 'string' && value.trim().length > 0 ? value : fallback;

const asTextSection = (value: unknown, fallback: string) => typeof value === 'string' ? value : fallback;

const normalizeRestSeconds = (value: unknown, fallback: string) => {
  if (typeof value === 'number' && Number.isFinite(value)) return String(Math.max(0, Math.round(value)));
  const source = typeof value === 'string' ? value.trim() : fallback.trim();
  const mmss = source.match(/^(\d{1,2}):(\d{1,2})$/);
  if (mmss) return String(Number(mmss[1]) * 60 + Number(mmss[2]));
  const match = source.match(/\d+(?:[.,]\d+)?/);
  if (!match) return fallback.replace(/[^\d]/g, '') || '60';
  const parsed = Number(match[0].replace(',', '.'));
  return String(Math.max(0, Math.round(/min/i.test(source) ? parsed * 60 : parsed)));
};

const migrateLegacyWorkout = (items: unknown[]) => items.map((item, index) => {
  const source = item && typeof item === 'object' && !Array.isArray(item)
    ? item as Partial<WorkoutExercise>
    : {};
  const fallback = { title: `Exercise ${index + 1}`, description: '', sets: '1', reps: '1', weight: 'unknown', rest: '60' };
  const title = asString(source.title, fallback.title).replace(/[\r\n]+/g, ' ').trim();
  const setsInput = asString(source.sets, fallback.sets).trim();
  const setsMatch = setsInput.match(/^(\d+)(?:\s*-\s*(\d+))?$/);
  const sets = setsMatch && Number(setsMatch[1]) > 0 && (!setsMatch[2] || Number(setsMatch[2]) >= Number(setsMatch[1]))
    ? `${setsMatch[1]}${setsMatch[2] ? `-${setsMatch[2]}` : ''}`
    : '1';
  const repsInput = asString(source.reps, fallback.reps).replace(/[\r\n]+/g, ' ').trim();
  const weightInput = asString(source.weight, fallback.weight).trim();
  const knownBodyweight = /^(bodyweight|body weight|bw)$/i.test(weightInput);
  const numericWeight = weightInput.match(/^(\d+(?:\.\d+)?)\s*(?:kg)?$/i);
  const weight = knownBodyweight ? '0' : numericWeight ? numericWeight[1] : 'unknown';
  const legacyDescription = typeof source.description === 'string' ? source.description.trim() : '';
  const details = [legacyDescription];
  if (weight === 'unknown' && weightInput !== 'unknown') details.push(`Legacy weight: ${weightInput}`);
  if (sets === '1' && setsInput !== '1') details.push(`Legacy sets: ${setsInput}`);
  const description = details.filter(Boolean).join('\n');
  const group = source.supersetId ? `legacy-${String(source.supersetId).replace(/[\r\n]+/g, ' ')}` : undefined;
  return [
    `## ${title}`,
    `order: ${index + 1}`,
    ...(description ? [`description: ${description.split('\n')[0]}`, ...description.split('\n').slice(1).map((line) => `  ${line}`)] : []),
    `sets: ${sets}`,
    `reps: ${repsInput || '1'}`,
    `weight: ${weight}`,
    `rest: ${normalizeRestSeconds(source.rest, fallback.rest)}`,
    ...(group ? [`group: ${group}`] : []),
  ].join('\n');
}).join('\n\n');

const sanitizeCardioExercise = (input: Partial<CardioExercise>, index: number): CardioExercise => {
  const fallbackLine = DEFAULT_PROGRAM.cardio.split('\n')[index] ?? DEFAULT_PROGRAM.cardio.split('\n')[0];
  const [fallbackExercise, fallbackTime] = fallbackLine.split(' — ');
  return {
    id: asString(input.id, `cardio-${index + 1}`),
    exercise: asString(input.exercise, fallbackExercise),
    time: asString(input.time, fallbackTime),
  };
};

const migrateCardioArray = (value: unknown[]) => value
  .map((item, index) => {
    if (item && typeof item === 'object' && !Array.isArray(item)) {
      const entry = sanitizeCardioExercise(item as Partial<CardioExercise>, index);
      return `${entry.exercise} — ${entry.time}`;
    }
    return asString(item, '');
  })
  .filter((item) => item.length > 0)
  .join('\n');

export const sanitizeTrainingProgram = (value: unknown): TrainingProgram => {
  if (!value || typeof value !== 'object') return DEFAULT_PROGRAM;
  const candidate = value as Partial<TrainingProgram> & { workout?: unknown };
  let workout: string;
  if (typeof candidate.workout === 'string') {
    const normalized = normalizeWorkoutText(cleanLegacyGroupNames(candidate.workout));
    // Preserve invalid user text verbatim so the editor can report parser diagnostics.
    workout = parseWorkoutText(candidate.workout).errors.length ? candidate.workout : normalized;
  } else if (Array.isArray(candidate.workout)) {
    workout = normalizeWorkoutText(cleanLegacyGroupNames(migrateLegacyWorkout(candidate.workout)));
  } else {
    workout = DEFAULT_PROGRAM.workout;
  }

  const warmup = Array.isArray(candidate.warmup)
    ? candidate.warmup.map((item) => asString(item, '')).filter(Boolean).join('\n')
    : asTextSection(candidate.warmup, DEFAULT_PROGRAM.warmup);
  const cardio = Array.isArray(candidate.cardio)
    ? migrateCardioArray(candidate.cardio)
    : asTextSection(candidate.cardio, DEFAULT_PROGRAM.cardio);
  const cooldown = Array.isArray(candidate.cooldown)
    ? candidate.cooldown.map((item) => asString(item, '')).filter(Boolean).join('\n')
    : asTextSection(candidate.cooldown, DEFAULT_PROGRAM.cooldown);

  return {
    warmup,
    workout,
    cardio,
    cooldown,
    notes: asTextSection(candidate.notes, DEFAULT_PROGRAM.notes),
  };
};
