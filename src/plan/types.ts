export type AppViewMode = 'timer' | 'plan';

export type BodyPartIcon =
  | 'back'
  | 'legs'
  | 'chest'
  | 'shoulders'
  | 'biceps'
  | 'triceps'
  | 'core'
  | 'cardio'
  | 'full-body';

export type WorkoutExercise = {
  id: string;
  title: string;
  description: string;
  sets: string;
  reps: string;
  weight: string;
  rest: string;
  bodyPart: BodyPartIcon;
  supersetId?: string;
};

export type CardioExercise = {
  id: string;
  exercise: string;
  time: string;
};

export type TrainingProgram = {
  warmup: string;
  workout: WorkoutExercise[];
  cardio: CardioExercise[];
  cooldown: string;
  notes: string;
};

export type SectionVisibility = {
  warmup: boolean;
  workout: boolean;
  cardio: boolean;
  cooldown: boolean;
  notes: boolean;
};
