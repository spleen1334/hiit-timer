import test from 'node:test';
import assert from 'node:assert/strict';
import { parseWorkoutText, normalizeWorkoutText, moveWorkout } from './workoutText.ts';
import { sanitizeTrainingProgram } from './sanitizeProgram.ts';
import { parseTrainingProgramImport, serializeTrainingProgramExport } from './importExport.ts';

const block = (title, order, extra = '') => `## ${title}\norder: ${order}\nsets: 3\nreps: 8-10\nweight: 12.5\nrest: 60${extra}`;

test('parses flexible reps, multiline descriptions, groups, and empty workout text', () => {
  const source = `## Squat\norder: 1\ndescription: Main lift\n  keep the torso tall\nsets: 3-4\nreps: AMRAP\nweight: BW\nrest: 90\ngroup: A`;
  const parsed = parseWorkoutText(source);
  assert.deepEqual(parsed.errors, []);
  assert.equal(parsed.exercises[0].description, 'Main lift\nkeep the torso tall');
  assert.equal(parsed.exercises[0].reps, 'AMRAP');
  assert.equal(parsed.exercises[0].weight, 0);
  assert.equal(parsed.exercises[0].group, 'A');
  assert.deepEqual(parseWorkoutText('').exercises, []);
});

test('reports missing, duplicate, unknown, and invalid fields with source lines', () => {
  const parsed = parseWorkoutText('## Bad\norder: 0\nsets: 0\nsets: 2\nreps: \nweight: heavy\nrest: -1\nwat: yes');
  assert.ok(parsed.errors.length >= 6);
  assert.ok(parsed.errors.some(({ line, message }) => line === 4 && message.includes('Duplicate')));
  assert.ok(parsed.errors.some(({ line, message }) => line === 8 && message.includes('Unknown')));
});

test('normalizes duplicate order values stably and keeps groups adjacent', () => {
  const source = [
    block('A1', 2, '\ngroup: alpha'),
    block('B', 1),
    block('A2', 2, '\ngroup: alpha'),
  ].join('\n\n');
  const normalized = normalizeWorkoutText(source);
  const parsed = parseWorkoutText(normalized);
  assert.deepEqual(parsed.exercises.map(({ title, order }) => [title, order]), [['B', 1], ['A1', 2], ['A2', 3]]);
  assert.deepEqual(parsed.errors, []);
});

test('moves group blocks as a unit and can reorder members within that group', () => {
  const source = [block('A1', 1, '\ngroup: superset'), block('A2', 2, '\ngroup: superset'), block('B', 3)].join('\n\n');
  const moved = parseWorkoutText(moveWorkout(source, 0, 1));
  assert.deepEqual(moved.exercises.map(({ title }) => title), ['B', 'A1', 'A2']);
  const within = parseWorkoutText(moveWorkout(source, 0, 1, true));
  assert.deepEqual(within.exercises.map(({ title }) => title), ['A2', 'A1', 'B']);
  const noFinalNewline = block('Last', 1);
  const reordered = moveWorkout(`${block('First', 1)}\n\n${noFinalNewline.replace('order: 1', 'order: 2')}`, 1, -1);
  assert.deepEqual(parseWorkoutText(reordered).exercises.map(({ title }) => title), ['Last', 'First']);
});

const legacyExercise = {
  id: 'old-1', title: 'Press', description: 'Original note', sets: '3', reps: '10-12',
  weight: 'Moderate', rest: '90 sec', bodyPart: 'chest',
};

test('migrates legacy arrays without dropping freeform fields and imports schema versions 1 and 2', () => {
  const base = { warmup: 'warm', workout: [legacyExercise], cardio: [], cooldown: 'cool', notes: 'note' };
  for (const schemaVersion of [1, 2]) {
    const versioned = { ...base, cardio: schemaVersion === 1 ? [] : 'bike' };
    const imported = parseTrainingProgramImport(JSON.stringify({ schemaVersion, trainingProgram: versioned }));
    const exercise = parseWorkoutText(imported.workout).exercises[0];
    assert.equal(exercise.weight, 'unknown');
    assert.match(exercise.description, /Original note/);
    assert.match(exercise.description, /Legacy weight: Moderate/);
    assert.equal(exercise.reps, '10-12');
  }
});

test('exports schema version 3 and imports its text workout representation', () => {
  const program = sanitizeTrainingProgram({ ...structuredClone({
    warmup: 'warm', workout: block('Press', 1), cardio: 'bike', cooldown: 'cool', notes: 'note',
  }) });
  const json = serializeTrainingProgramExport(program);
  assert.equal(JSON.parse(json).schemaVersion, 3);
  assert.equal(parseTrainingProgramImport(json).workout, program.workout);
});

test('ships with a parseable default workout and keeps bodyweight as numeric zero', async () => {
  const { DEFAULT_PROGRAM } = await import('./defaultProgram.ts');
  const parsed = parseWorkoutText(DEFAULT_PROGRAM.workout);
  assert.deepEqual(parsed.errors, []);
  assert.equal(parsed.exercises.length, 10);
  assert.equal(parsed.exercises[0].weight, 0);
});


test('keeps other sections and tolerates empty or malformed legacy descriptions', () => {
  const base = { warmup: 'My warmup', workout: [{ ...legacyExercise, description: 42 }], cardio: 'My cardio', cooldown: 'My cooldown', notes: 'My notes' };
  const migrated = sanitizeTrainingProgram(base);
  assert.equal(migrated.warmup, 'My warmup');
  assert.equal(migrated.notes, 'My notes');
  assert.deepEqual(parseWorkoutText(migrated.workout).errors, []);
  const imported = parseTrainingProgramImport(JSON.stringify({ schemaVersion: 2, trainingProgram: { ...base, workout: [{ ...legacyExercise, description: '' }] } }));
  assert.equal(parseWorkoutText(imported.workout).exercises[0].title, 'Press');
});


test('cleans generated legacy group IDs without merging or renaming custom groups', () => {
  const base = { warmup: '', cardio: '', cooldown: '', notes: '' };
  const text = [block('Custom', 1, '\ngroup: sets1'), block('A', 2, '\ngroup: legacy-ss-1234'), block('B', 3, '\ngroup: legacy-ss-1234'), block('C', 4, '\ngroup: legacy-ss-9876')].join('\n\n');
  const migrated = sanitizeTrainingProgram({ ...base, workout: text });
  assert.deepEqual(parseWorkoutText(migrated.workout).exercises.map(e => e.group), ['sets1', 'sets2', 'sets2', 'sets3']);
  assert.equal(sanitizeTrainingProgram(migrated).workout, migrated.workout);
  const legacy = sanitizeTrainingProgram({ ...base, workout: [{ ...legacyExercise, supersetId: 'ss-1234' }, { ...legacyExercise, id: 'second', supersetId: 'ss-1234' }] });
  assert.deepEqual(parseWorkoutText(legacy.workout).exercises.map(e => e.group), ['sets1', 'sets1']);
});


test('separates days with local order and groups, preserving headings and empty days', () => {
  const source = '# Day 1\n\n' + [block('A', 2, '\ngroup: same'), block('B', 1, '\ngroup: same')].join('\n\n')
    + '\n\n# Upper body\n\n' + block('C', 1, '\ngroup: same') + '\n\n# Rest day';
  const normalized = normalizeWorkoutText(source);
  const parsed = parseWorkoutText(normalized);
  assert.deepEqual(parsed.errors, []);
  assert.deepEqual(parsed.days.map(day => day.title), ['Day 1', 'Upper body', 'Rest day']);
  assert.deepEqual(parsed.days.map(day => day.exercises.map(e => [e.title, e.order])), [[['B', 1], ['A', 2]], [['C', 1]], []]);
  assert.equal(normalizeWorkoutText(normalized), normalized);
  const moved = parseWorkoutText(moveWorkout(normalized, 0, 1, true));
  assert.deepEqual(moved.days[0].exercises.map(e => e.title), ['A', 'B']);
  assert.equal(moved.days[1].exercises[0].title, 'C');
  assert.equal(moveWorkout(normalized, 2, -1), normalized);
});

test('day parser keeps global error line numbers and old workouts as an implicit day', () => {
  const source = '# Day 1\n' + block('A', 1) + '\n\n# Day 2\n## Bad\norder: 0';
  const parsed = parseWorkoutText(source);
  const invalidLine = source.split('\n').findIndex(line => line === 'order: 0') + 1;
  assert.ok(parsed.errors.some(error => error.line === invalidLine && error.message.includes('Order')));
  assert.equal(normalizeWorkoutText(source), source);
  assert.equal(parseWorkoutText(block('Old', 1)).days.length, 1);
});


test('AI editor example is a valid multi-day workout', async () => {
  const { WORKOUT_EXAMPLE } = await import('./workoutTemplate.ts');
  const parsed = parseWorkoutText(WORKOUT_EXAMPLE);
  assert.deepEqual(parsed.errors, []);
  assert.equal(parsed.days.length, 3);
  assert.deepEqual(parsed.days.map(day => day.exercises[0].order), [1, 1, 1]);
});
