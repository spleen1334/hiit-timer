import type { TrainingProgram } from './types';

const workout = `## Zgib (siroki/uski rotirano)
order: 1
description: Bodyweight pull-up variation with rotating grip focus.
sets: 4
reps: 5
weight: 0
rest: 90

## Leg press
order: 2
description: Increased load, strength focus. Legacy weight: 80-90 kg
sets: 4
reps: 8
weight: unknown
rest: 120

## Veslanje (sprava, neutralni hvat)
order: 3
description: Machine row with neutral grip. Legacy weight: 45-55 kg
sets: 4
reps: 10
weight: unknown
rest: 90

## Chest press (sprava ili sklekovi)
order: 4
description: Upper body balance movement. Legacy weight: Moderate
sets: 3
reps: 10
weight: unknown
rest: 75

## Letenje (bucice)
order: 5
description: Controlled fly movement. Legacy weight: 2-3 kg
sets: 3
reps: 15
weight: unknown
rest: 60

## Leg curl (kick)
order: 6
description: Hamstring isolation.
sets: 3-4
reps: 10
weight: 40
rest: 75

## Ekstenzija noge
order: 7
description: Leg extension machine.
sets: 3
reps: 12
weight: 45
rest: 75

## Biceps hammer (neutralni hvat)
order: 8
description: Neutral grip dumbbell curl. Legacy weight: 5-6 kg
sets: 3
reps: 10-12
weight: unknown
rest: 60

## Triceps pushdown (sajla/uze)
order: 9
description: Cable rope pushdown. Legacy weight: 10-15 kg
sets: 3
reps: 10-12
weight: unknown
rest: 60

## Plank (na podlakticama)
order: 10
description: Forearm plank hold.
sets: 3
reps: 45 sec
weight: 0
rest: 45`;

export const DEFAULT_PROGRAM: TrainingProgram = {
  warmup:
    '- 5 min dynamic mobility (hips, shoulders, thoracic spine)\n- 2 light ramp-up sets for first two strength movements',
  workout,
  cardio: 'Incline treadmill walk — 12 min\nBike easy spin — 8 min',
  cooldown:
    '- 5 min easy walk + nasal breathing\n- Light static stretch for chest, lats, quads, hamstrings',
  notes:
    'Target quality reps. Keep 1-2 reps in reserve on compound lifts. If energy drops, prioritize exercise #1-#4.',
};
