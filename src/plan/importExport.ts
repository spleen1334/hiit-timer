import type { TrainingProgram, WorkoutExercise } from './types';
import { sanitizeTrainingProgram } from './sanitizeProgram';

export const TRAINING_PROGRAM_EXPORT_VERSION = 3;
export const TRAINING_PROGRAM_EXPORT_FILENAME = 'pulse-trainer-plan.json';

type TrainingProgramExportPayload = { schemaVersion: 3; trainingProgram: TrainingProgram };
type TrainingProgramSchemaVersion = 1 | 2 | 3;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === 'object' && !Array.isArray(value);

const TRAINING_PROGRAM_KEYS = ['warmup', 'workout', 'cardio', 'cooldown', 'notes'] as const;
const BODY_PARTS = ['back', 'legs', 'chest', 'shoulders', 'biceps', 'triceps', 'core', 'cardio', 'full-body'];
const isNonEmptyString = (value: unknown) => typeof value === 'string' && value.trim().length > 0;

const isLegacyWorkoutExercise = (value: unknown): value is WorkoutExercise =>
  isRecord(value) && isNonEmptyString(value.id) && isNonEmptyString(value.title) &&
  typeof value.description === 'string' && isNonEmptyString(value.sets) &&
  isNonEmptyString(value.reps) && isNonEmptyString(value.weight) &&
  isNonEmptyString(value.rest) && typeof value.bodyPart === 'string' && BODY_PARTS.includes(value.bodyPart) &&
  (value.supersetId === undefined || typeof value.supersetId === 'string');

const isCardioExercise = (value: unknown) =>
  isRecord(value) && isNonEmptyString(value.id) && isNonEmptyString(value.exercise) && isNonEmptyString(value.time);

const looksLikeTrainingProgram = (value: unknown) =>
  isRecord(value) && TRAINING_PROGRAM_KEYS.every((key) => key in value) &&
  (typeof value.warmup === 'string' || Array.isArray(value.warmup)) &&
  ((typeof value.workout === 'string') || (Array.isArray(value.workout) && value.workout.every(isLegacyWorkoutExercise))) &&
  ((typeof value.cardio === 'string') || (Array.isArray(value.cardio) && value.cardio.every(isCardioExercise))) &&
  (typeof value.cooldown === 'string' || Array.isArray(value.cooldown)) && typeof value.notes === 'string';

export const buildTrainingProgramExportPayload = (trainingProgram: TrainingProgram): TrainingProgramExportPayload => ({
  schemaVersion: TRAINING_PROGRAM_EXPORT_VERSION,
  trainingProgram,
});

export const serializeTrainingProgramExport = (trainingProgram: TrainingProgram) =>
  JSON.stringify(buildTrainingProgramExportPayload(trainingProgram), null, 2);

const readTrainingProgramCandidate = (value: unknown, schemaVersion?: TrainingProgramSchemaVersion): TrainingProgram => {
  if (!looksLikeTrainingProgram(value)) throw new Error('Unsupported training plan JSON.');
  const candidate = value as Record<string, unknown>;
  if (schemaVersion === 1 && (!Array.isArray(candidate.workout) || !Array.isArray(candidate.cardio))) {
    throw new Error('Unsupported training plan JSON.');
  }
  if (schemaVersion === 2 && (!Array.isArray(candidate.workout) || typeof candidate.cardio !== 'string')) {
    throw new Error('Unsupported training plan JSON.');
  }
  if (schemaVersion === 3 && (typeof candidate.workout !== 'string' || typeof candidate.cardio !== 'string')) {
    throw new Error('Unsupported training plan JSON.');
  }
  const sanitized = sanitizeTrainingProgram(candidate);
  return {
    ...sanitized,
    warmup: typeof candidate.warmup === 'string' ? candidate.warmup : sanitized.warmup,
    cooldown: typeof candidate.cooldown === 'string' ? candidate.cooldown : sanitized.cooldown,
    notes: typeof candidate.notes === 'string' ? candidate.notes : sanitized.notes,
  };
};

const readSchemaVersion = (value: Record<string, unknown>): TrainingProgramSchemaVersion | undefined => {
  if (!('schemaVersion' in value)) return undefined;
  if (value.schemaVersion !== 1 && value.schemaVersion !== 2 && value.schemaVersion !== 3) {
    throw new Error('Unsupported training plan JSON.');
  }
  return value.schemaVersion;
};

export const parseTrainingProgramImport = (rawJson: string): TrainingProgram => {
  const parsed = JSON.parse(rawJson) as unknown;
  if (isRecord(parsed) && 'trainingProgram' in parsed && parsed.trainingProgram != null) {
    return readTrainingProgramCandidate(parsed.trainingProgram, readSchemaVersion(parsed));
  }
  return readTrainingProgramCandidate(parsed, isRecord(parsed) ? readSchemaVersion(parsed) : undefined);
};

export const downloadTrainingProgramExport = (trainingProgram: TrainingProgram) => {
  const blob = new Blob([serializeTrainingProgramExport(trainingProgram)], { type: 'application/json;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = TRAINING_PROGRAM_EXPORT_FILENAME;
  anchor.rel = 'noopener';
  anchor.style.display = 'none';
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
};
