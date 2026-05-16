import { DEFAULT_PROGRAM } from './defaultProgram';
import type { CardioExercise, TrainingProgram, WorkoutExercise } from './types';

const asString = (value: unknown, fallback: string) => {
  if (typeof value === 'string' && value.trim().length > 0) {
    return value;
  }

  return fallback;
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
    rest: asString(input.rest, fallback.rest),
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
