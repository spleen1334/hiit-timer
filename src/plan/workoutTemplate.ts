export const WORKOUT_AI_TEMPLATE = `Create a workout plan using the exact format below.
Return only the workout text: no introduction, explanation, code fences, or extra commentary.
Separate workout days with # Day 1, # Day 2, etc. Custom day names are allowed. Use ## for exercise headings. Restart exercise order at 1 in each day. Group labels apply only within their day. Keep exercises in the order they should be performed. Use a positive integer for order; sets may be a positive integer or ascending range. Rest is a nonnegative integer in seconds; reps may be a count, range, or hold duration. Weight is a number in kg, and 0 means bodyweight. Use a nonempty group label (such as sets0 or sets1) only for exercises performed together; grouped exercises must be adjacent and share the same label. Leave group out for standalone exercises. Add description only when useful, and indent any description continuation lines.

## Exercise name
order: 1
description: Optional short coaching cue
sets: 3
reps: 8-12
weight: 20
rest: 90
group: sets0

Examples:

# Day 1

## Dumbbell bench press
order: 1
sets: 3
reps: 8-10
weight: 20
rest: 90
group: sets0

## One-arm dumbbell row
order: 2
description: Keep your back steady
sets: 3
reps: 10 each side
weight: 20
rest: 90
group: sets0

# Day 2

## Goblet squat
order: 1
sets: 3
reps: 10-12
weight: 24
rest: 120

## Push-up
order: 2
sets: 2
reps: 8-15
weight: 0
rest: 60

# Day 3

## Seated cable row
order: 1
description: Example workout — adjust the load to suit you.
sets: 3
reps: 10-12
weight: 30
rest: 90

## Plank
order: 2
sets: 3
reps: 30-45 seconds
weight: 0
rest: 60`;

export const WORKOUT_EXAMPLE = `# Day 1

## Dumbbell bench press
order: 1
sets: 3
reps: 8-10
weight: 20
rest: 90
group: sets0

## One-arm dumbbell row
order: 2
description: Keep your back steady
sets: 3
reps: 10 each side
weight: 20
rest: 90
group: sets0

# Day 2

## Goblet squat
order: 1
sets: 3
reps: 10-12
weight: 24
rest: 120

## Push-up
order: 2
sets: 2
reps: 8-15
weight: 0
rest: 60

# Day 3

## Seated cable row
order: 1
description: Example workout — adjust the load to suit you.
sets: 3
reps: 10-12
weight: 30
rest: 90

## Plank
order: 2
sets: 3
reps: 30-45 seconds
weight: 0
rest: 60`;
