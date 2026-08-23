import type { TrainingProgram } from './types';
import { sanitizeTrainingProgram } from './sanitizeProgram';

export const TRAINING_PROGRAM_EXPORT_VERSION = 2;
export const TRAINING_PROGRAM_EXPORT_FILENAME = 'pulse-trainer-plan.json';

type TrainingProgramExportPayload = {
  schemaVersion: 2;
  trainingProgram: TrainingProgram;
};
type TrainingProgramSchemaVersion = 1 | 2;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === 'object' && !Array.isArray(value);

const TRAINING_PROGRAM_KEYS = ['warmup', 'workout', 'cardio', 'cooldown', 'notes'] as const;
const BODY_PARTS = ['back', 'legs', 'chest', 'shoulders', 'biceps', 'triceps', 'core', 'cardio', 'full-body'];

const isNonEmptyString = (value: unknown) => typeof value === 'string' && value.trim().length > 0;

const isWorkoutExercise = (value: unknown) =>
  isRecord(value) &&
  isNonEmptyString(value.id) &&
  isNonEmptyString(value.title) &&
  isNonEmptyString(value.description) &&
  isNonEmptyString(value.sets) &&
  isNonEmptyString(value.reps) &&
  isNonEmptyString(value.weight) &&
  isNonEmptyString(value.rest) &&
  typeof value.bodyPart === 'string' &&
  BODY_PARTS.includes(value.bodyPart) &&
  (value.supersetId === undefined || typeof value.supersetId === 'string');

const isCardioExercise = (value: unknown) =>
  isRecord(value) &&
  isNonEmptyString(value.id) &&
  isNonEmptyString(value.exercise) &&
  isNonEmptyString(value.time);

const looksLikeTrainingProgram = (value: unknown) => {
  if (!isRecord(value) || !TRAINING_PROGRAM_KEYS.every((key) => key in value)) {
    return false;
  }

  return (
    typeof value.warmup === 'string' &&
    Array.isArray(value.workout) &&
    value.workout.every(isWorkoutExercise) &&
    ((typeof value.cardio === 'string') ||
      (Array.isArray(value.cardio) && value.cardio.every(isCardioExercise))) &&
    typeof value.cooldown === 'string' &&
    typeof value.notes === 'string'
  );
};

export const buildTrainingProgramExportPayload = (trainingProgram: TrainingProgram): TrainingProgramExportPayload => ({
  schemaVersion: TRAINING_PROGRAM_EXPORT_VERSION,
  trainingProgram,
});

export const serializeTrainingProgramExport = (trainingProgram: TrainingProgram) =>
  JSON.stringify(buildTrainingProgramExportPayload(trainingProgram), null, 2);

const readTrainingProgramCandidate = (value: unknown, schemaVersion?: TrainingProgramSchemaVersion) => {
  if (!looksLikeTrainingProgram(value)) {
    throw new Error('Unsupported training plan JSON.');
  }

  if (schemaVersion === 1 && !Array.isArray((value as Record<string, unknown>).cardio)) {
    throw new Error('Unsupported training plan JSON.');
  }

  if (schemaVersion === 2 && typeof (value as Record<string, unknown>).cardio !== 'string') {
    throw new Error('Unsupported training plan JSON.');
  }

  const candidate = value as TrainingProgram;
  const sanitized = sanitizeTrainingProgram(candidate);

  return {
    ...sanitized,
    warmup: candidate.warmup,
    cooldown: candidate.cooldown,
    notes: candidate.notes,
  };
};

const readSchemaVersion = (value: Record<string, unknown>): TrainingProgramSchemaVersion | undefined => {
  if (!('schemaVersion' in value)) return undefined;
  if (value.schemaVersion !== 1 && value.schemaVersion !== 2) {
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
  const blob = new Blob([serializeTrainingProgramExport(trainingProgram)], {
    type: 'application/json;charset=utf-8',
  });
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
