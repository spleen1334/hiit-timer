import { DEFAULT_PROGRAM } from './defaultProgram';
import type { CardioExercise, TrainingProgram, WorkoutExercise } from './types';

const asString = (value: unknown, fallback: string) => {
  if (typeof value === 'string' && value.trim().length > 0) {
    return value;
  }

  return fallback;
};

const normalizeRestSeconds = (value: unknown, fallback: string) => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return String(Math.max(0, Math.round(value)));
  }

  const source = typeof value === 'string' ? value.trim() : fallback.trim();
  if (source.length === 0) {
    return fallback.replace(/[^\d]/g, '') || '60';
  }

  const mmss = source.match(/^(\d{1,2}):(\d{1,2})$/);
  if (mmss) {
    const minutes = Number(mmss[1]);
    const seconds = Number(mmss[2]);
    if (Number.isFinite(minutes) && Number.isFinite(seconds)) {
      return String(minutes * 60 + seconds);
    }
  }

  if (/^\d{4,}$/.test(source)) {
    const parsed = Number(source);
    if (Number.isFinite(parsed) && parsed > 600) {
      const half = Math.floor(source.length / 2);
      const firstPart = Number(source.slice(0, half));
      if (Number.isFinite(firstPart) && firstPart > 0) {
        return String(firstPart);
      }
    }
  }

  const numbers = [...source.matchAll(/\d+(?:[.,]\d+)?/g)].map((match) => Number(match[0].replace(',', '.')));
  if (numbers.length === 0) {
    return fallback.replace(/[^\d]/g, '') || '60';
  }

  if (/-/.test(source) && numbers.length >= 2) {
    return String(Math.max(0, Math.round(numbers[0])));
  }

  if (/min/i.test(source)) {
    return String(Math.max(0, Math.round(numbers[0] * 60)));
  }

  return String(Math.max(0, Math.round(numbers[0])));
};

const sanitizeWorkoutExercise = (input: Partial<WorkoutExercise>, index: number): WorkoutExercise => {
  const fallback = DEFAULT_PROGRAM.workout[index] ?? DEFAULT_PROGRAM.workout[0];
  return {
    id: asString(input.id, `ex-${index + 1}`),
    title: asString(input.title, fallback.title),
    description: asString(input.description, fallback.description),
    sets: asString(input.sets, fallback.sets),
    reps: asString(input.reps, fallback.reps),
    weight: asString(input.weight, fallback.weight),
    rest: normalizeRestSeconds(input.rest, fallback.rest),
    bodyPart: input.bodyPart ?? fallback.bodyPart,
    supersetId: input.supersetId ? String(input.supersetId) : undefined,
  };
};

const sanitizeCardioExercise = (input: Partial<CardioExercise>, index: number): CardioExercise => {
  const fallback = DEFAULT_PROGRAM.cardio[index] ?? DEFAULT_PROGRAM.cardio[0];
  return {
    id: asString(input.id, `cardio-${index + 1}`),
    exercise: asString(input.exercise, fallback.exercise),
    time: asString(input.time, fallback.time),
  };
};

export const sanitizeTrainingProgram = (value: unknown): TrainingProgram => {
  if (!value || typeof value !== 'object') {
    return DEFAULT_PROGRAM;
  }

  const candidate = value as Partial<TrainingProgram>;

  const warmup = Array.isArray(candidate.warmup)
    ? candidate.warmup.map((item) => asString(item, '')).filter((item) => item.length > 0).join('\n')
    : asString(candidate.warmup, DEFAULT_PROGRAM.warmup);
  const workout = Array.isArray(candidate.workout)
    ? candidate.workout.map((item, index) => sanitizeWorkoutExercise(item ?? {}, index))
    : DEFAULT_PROGRAM.workout;
  const cardio = Array.isArray(candidate.cardio)
    ? candidate.cardio.map((item, index) => sanitizeCardioExercise(item ?? {}, index))
    : DEFAULT_PROGRAM.cardio;
  const cooldown = Array.isArray(candidate.cooldown)
    ? candidate.cooldown.map((item) => asString(item, '')).filter((item) => item.length > 0).join('\n')
    : asString(candidate.cooldown, DEFAULT_PROGRAM.cooldown);
  const notes = asString(candidate.notes, DEFAULT_PROGRAM.notes);

  return {
    warmup,
    workout,
    cardio,
    cooldown,
    notes,
  };
};
