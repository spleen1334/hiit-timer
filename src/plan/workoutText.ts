import type { ParsedWorkoutExercise } from './types';

export type WorkoutTextError = { line: number; message: string };
export type WorkoutDay = { title: string; exercises: ParsedWorkoutExercise[] };
export type WorkoutTextParseResult = { exercises: ParsedWorkoutExercise[]; errors: WorkoutTextError[]; days: WorkoutDay[] };

type Block = { raw: string; line: number; exercise?: ParsedWorkoutExercise };

const headerPattern = /^\s*##\s+(.+?)\s*$/;
const fieldPattern = /^\s*([a-zA-Z][\w-]*)\s*:\s*(.*)$/;
const knownFields = new Set(['order', 'description', 'sets', 'reps', 'weight', 'rest', 'group']);

const splitBlocks = (text: string) => {
  const lines = text.split(/(?<=\n)/);
  const starts: number[] = [];
  let offset = 0;
  const lineOffsets: number[] = [];
  for (const line of lines) {
    lineOffsets.push(offset);
    if (headerPattern.test(line.replace(/\r?\n$/, ''))) starts.push(offset);
    offset += line.length;
  }
  if (starts.length === 0) return { prefix: text, blocks: [] as Block[] };

  const prefix = text.slice(0, starts[0]);
  const blocks = starts.map((start, index) => {
    const end = starts[index + 1] ?? text.length;
    const line = lineOffsets.findIndex((candidate) => candidate === start) + 1;
    return { raw: text.slice(start, end), line };
  });
  return { prefix, blocks };
};

const replaceOrder = (raw: string, order: number) =>
  raw.replace(/^(\s*order\s*:\s*)\d+(\s*)$/im, (_whole, before: string, after: string) => `${before}${order}${after}`);

const orderBlocks = (blocks: Block[]) => {
  const sorted = [...blocks].sort((a, b) => (a.exercise!.order - b.exercise!.order));
  const units: Block[][] = [];
  const grouped = new Map<string, Block[]>();
  for (const block of sorted) {
    const group = block.exercise!.group;
    if (!group) {
      units.push([block]);
      continue;
    }
    let unit = grouped.get(group);
    if (!unit) {
      unit = [];
      grouped.set(group, unit);
      units.push(unit);
    }
    unit.push(block);
  }
  return units.flat();
};

const parseBlock = (block: Block, errors: WorkoutTextError[]): ParsedWorkoutExercise | undefined => {
  const lines = block.raw.split(/\r?\n/);
  const firstLine = lines[0] ?? '';
  const header = firstLine.match(headerPattern);
  if (!header) {
    errors.push({ line: block.line, message: 'Expected an exercise heading (## Title).' });
    return undefined;
  }

  const title = header[1].trim();
  if (!title) errors.push({ line: block.line, message: 'Exercise title cannot be empty.' });
  const values = new Map<string, { value: string; line: number }>();
  let descriptionLines: string[] | undefined;
  let descriptionContinues = false;

  for (let index = 1; index < lines.length; index += 1) {
    const line = lines[index].replace(/\r$/, '');
    if (line.trim() === '') continue;
    if (descriptionContinues && descriptionLines && /^\s+/.test(line)) {
      descriptionLines.push(line.trimStart());
      continue;
    }
    const field = line.match(fieldPattern);
    if (!field) {
      errors.push({ line: block.line + index, message: 'Expected a field such as `sets: 3`.' });
      continue;
    }
    const key = field[1].toLowerCase();
    if (!knownFields.has(key)) {
      errors.push({ line: block.line + index, message: `Unknown field "${field[1]}".` });
      continue;
    }
    if (values.has(key)) {
      errors.push({ line: block.line + index, message: `Duplicate field "${key}".` });
      continue;
    }
    values.set(key, { value: field[2].trim(), line: block.line + index });
    if (key === 'description') descriptionLines = [field[2].trim()];
    descriptionContinues = key === 'description';
  }

  const required = ['order', 'sets', 'reps', 'weight', 'rest'];
  for (const key of required) {
    if (!values.has(key)) errors.push({ line: block.line, message: `Missing required field "${key}".` });
  }
  const orderValue = values.get('order');
  const order = Number(orderValue?.value);
  if (orderValue && (!/^\d+$/.test(orderValue.value) || !Number.isSafeInteger(order) || order < 1)) {
    errors.push({ line: orderValue.line, message: 'Order must be a positive integer.' });
  }
  const setsValue = values.get('sets');
  const setsMatch = setsValue?.value.match(/^(\d+)(?:\s*-\s*(\d+))?$/);
  if (setsValue && (!setsMatch || Number(setsMatch[1]) < 1 || (setsMatch[2] && Number(setsMatch[2]) < Number(setsMatch[1])))) {
    errors.push({ line: setsValue.line, message: 'Sets must be a positive integer or an ascending integer range.' });
  }
  const repsValue = values.get('reps');
  if (repsValue && !repsValue.value) errors.push({ line: repsValue.line, message: 'Reps cannot be empty.' });
  const weightValue = values.get('weight');
  let weight: number | 'unknown' = 'unknown';
  if (weightValue) {
    if (/^(BW|0(?:\.0+)?)$/i.test(weightValue.value)) weight = 0;
    else if (/^unknown$/i.test(weightValue.value)) weight = 'unknown';
    else if (/^\d+(?:\.\d+)?$/.test(weightValue.value) && Number.isFinite(Number(weightValue.value))) weight = Number(weightValue.value);
    else errors.push({ line: weightValue.line, message: 'Weight must be a nonnegative number in kg, BW, or unknown (legacy migration only).' });
  }
  const restValue = values.get('rest');
  const rest = Number(restValue?.value);
  if (restValue && (!/^\d+$/.test(restValue.value) || !Number.isSafeInteger(rest) || rest < 0)) {
    errors.push({ line: restValue.line, message: 'Rest must be a nonnegative integer number of seconds.' });
  }
  const groupValue = values.get('group');
  if (groupValue && !groupValue.value) errors.push({ line: groupValue.line, message: 'Group cannot be empty.' });

  if (errors.some((error) => error.line >= block.line && error.line < block.line + lines.length)) return undefined;
  return {
    title,
    description: descriptionLines?.join('\n') ?? '',
    sets: setsValue!.value,
    reps: repsValue!.value,
    weight,
    rest,
    ...(groupValue ? { group: groupValue.value } : {}),
    order,
    rawBlock: block.raw,
  };
};

const parseSingleDay = (text: string) => {
  const { prefix, blocks } = splitBlocks(text);
  const errors: WorkoutTextError[] = [];
  if (prefix.trim()) errors.push({ line: 1, message: 'Text before the first exercise heading is not allowed.' });
  const parsedBlocks = blocks.map((block) => ({ ...block, exercise: parseBlock(block, errors) }));
  const validBlocks = parsedBlocks.filter((block): block is Block & { exercise: ParsedWorkoutExercise } => Boolean(block.exercise));
  const sortedBlocks = orderBlocks(validBlocks);
  const exercises = sortedBlocks.map((block, index) => ({ ...block.exercise!, order: index + 1 }));

  return { exercises, errors };
};

const joinBlocks = (rawBlocks: string[]) => rawBlocks.reduce((output, raw) => {
  const separator = output && !output.endsWith('\n') ? '\n\n' : '';
  return output + separator + raw;
}, '');

// Replace generated migration IDs only; keep user-authored group names intact.
export const cleanLegacyGroupNames = (text: string): string => {
  const parsed = parseWorkoutText(text);
  if (parsed.errors.length) return text;
  const used = new Set(parsed.exercises.map((exercise) => exercise.group).filter(Boolean));
  const names = new Map<string, string>();
  let number = 1;
  for (const exercise of parsed.exercises) {
    if (!exercise.group?.startsWith('legacy-') || names.has(exercise.group)) continue;
    while (used.has(`sets${number}`)) number += 1;
    const name = `sets${number++}`;
    names.set(exercise.group, name);
    used.add(name);
  }
  return text.replace(/^([ \t]*group[ \t]*:[ \t]*)([^\r\n]*)(\r?)$/gim,
    (line, prefix: string, value: string, ending: string) => names.has(value.trim()) ? `${prefix}${names.get(value.trim())}${ending}` : line);
};

const normalizeSingleDay = (text: string): string => {
  const result = parseSingleDay(text);
  if (result.errors.length) return '';
  if (!result.exercises.length) return '';
  const { prefix } = splitBlocks(text);
  return prefix + joinBlocks(result.exercises.map((exercise, index) => replaceOrder(exercise.rawBlock!, index + 1)));
};

const moveSingleDay = (text: string, index: number, direction: -1 | 1, withinGroup = false): string => {
  const parsed = parseSingleDay(text);
  if (parsed.errors.length || index < 0 || index >= parsed.exercises.length) return text;
  const blocks = parsed.exercises.map((exercise) => ({ raw: exercise.rawBlock!, line: 0, exercise }));
  const current = blocks[index];

  if (withinGroup && current.exercise.group) {
    const groupIndices = blocks.flatMap((block, i) => block.exercise.group === current.exercise.group ? [i] : []);
    const localIndex = groupIndices.indexOf(index);
    const targetIndex = localIndex + direction;
    if (targetIndex < 0 || targetIndex >= groupIndices.length) return text;
    const a = groupIndices[localIndex];
    const b = groupIndices[targetIndex];
    [blocks[a], blocks[b]] = [blocks[b], blocks[a]];
  } else {
    const units: typeof blocks[] = [];
    const seenGroups = new Map<string, typeof blocks>();
    for (const block of blocks) {
      const group = block.exercise.group;
      if (!group) units.push([block]);
      else {
        let unit = seenGroups.get(group);
        if (!unit) {
          unit = [];
          seenGroups.set(group, unit);
          units.push(unit);
        }
        unit.push(block);
      }
    }
    const unitIndex = units.findIndex((unit) => unit.includes(current));
    const targetIndex = unitIndex + direction;
    if (targetIndex < 0 || targetIndex >= units.length) return text;
    [units[unitIndex], units[targetIndex]] = [units[targetIndex], units[unitIndex]];
    blocks.splice(0, blocks.length, ...units.flat());
  }

  const { prefix } = splitBlocks(text);
  return prefix + joinBlocks(blocks.map((block, i) => replaceOrder(block.raw, i + 1)));
};


type DaySource = { title: string; heading: string; body: string; offset: number };

const splitDays = (text: string): DaySource[] => {
  const headings = [...text.matchAll(/^# [^\r\n]+(?:\r?\n|$)/gm)];
  if (!headings.length) return [{ title: '', heading: '', body: text, offset: 0 }];
  const days: DaySource[] = [];
  const prefix = text.slice(0, headings[0].index);
  if (prefix.trim()) days.push({ title: '', heading: '', body: prefix, offset: 0 });
  headings.forEach((match, index) => {
    const start = match.index! + match[0].length;
    days.push({
      title: match[0].slice(2).trim(),
      heading: (index === 0 && !prefix.trim() ? prefix : '') + match[0],
      body: text.slice(start, headings[index + 1]?.index ?? text.length),
      offset: text.slice(0, start).split('\n').length - 1,
    });
  });
  return days;
};

export const parseWorkoutText = (text: string): WorkoutTextParseResult => {
  const days: WorkoutDay[] = [];
  const errors: WorkoutTextError[] = [];
  for (const source of splitDays(text)) {
    const parsed = parseSingleDay(source.body);
    days.push({ title: source.title, exercises: parsed.exercises });
    errors.push(...parsed.errors.map(error => ({ ...error, line: error.line + source.offset })));
  }
  return { days, exercises: days.flatMap(day => day.exercises), errors };
};

const joinDays = (days: DaySource[]) => joinBlocks(days.map(day => {
  const heading = day.heading && !day.heading.endsWith('\n') && day.body ? day.heading + '\n' : day.heading;
  return heading + day.body;
}));

export const normalizeWorkoutText = (text: string): string => {
  if (parseWorkoutText(text).errors.length) return text;
  return joinDays(splitDays(text).map(day => ({ ...day, body: normalizeSingleDay(day.body) })));
};

// The UI passes the exercise index in the complete document; moves stay inside its day.
export const moveWorkout = (text: string, index: number, direction: -1 | 1, withinGroup = false): string => {
  if (parseWorkoutText(text).errors.length) return text;
  const days = splitDays(text);
  let offset = 0;
  for (const day of days) {
    const count = parseSingleDay(day.body).exercises.length;
    if (index >= offset && index < offset + count) {
      day.body = moveSingleDay(day.body, index - offset, direction, withinGroup);
      return joinDays(days);
    }
    offset += count;
  }
  return text;
};
