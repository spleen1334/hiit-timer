import { useRef, useState } from 'react';
import type { Messages } from '../../i18n';
import { moveWorkout, normalizeWorkoutText, parseWorkoutText } from '../../plan/workoutText';
import { WORKOUT_EXAMPLE } from '../../plan/workoutTemplate';
import { WorkoutExerciseCard } from './WorkoutExerciseCard';

type Props = { messages: Messages; text: string; onTextChange: (text: string) => void };

export function WorkoutList({ messages, text, onTextChange }: Props) {
  const [draft, setDraft] = useState<string | null>(null);
  const [showErrors, setShowErrors] = useState(false);
  const [status, setStatus] = useState('');
  const [selectedDay, setSelectedDay] = useState(0);
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const parsed = parseWorkoutText(text);
  const dayIndex = Math.min(selectedDay, parsed.days.length - 1);
  const currentDay = parsed.days[dayIndex];
  const hasDayTabs = parsed.days.length > 1 || Boolean(currentDay.title);
  const dayOffset = parsed.days.slice(0, dayIndex).reduce((sum, day) => sum + day.exercises.length, 0);
  const draftParsed = parseWorkoutText(draft ?? text);
  const editing = draft !== null;
  const errors = editing ? draftParsed.errors : parsed.errors;
  const move = (index: number, direction: -1 | 1, withinGroup = false) => {
    onTextChange(moveWorkout(text, index, direction, withinGroup));
    setStatus(messages.workoutMovedLabel);
  };
  const edit = () => { setDraft(text); setShowErrors(false); setStatus(''); };
  const save = () => {
    if (draftParsed.errors.length) { setShowErrors(true); return; }
    onTextChange(normalizeWorkoutText(draft ?? text));
    setDraft(null);
    setStatus(messages.workoutSavedLabel);
  };
  const errorList = errors.length > 0 && (showErrors || !editing) ? (
    <div className="workout-text-errors" id="workout-errors" role="alert">
      <strong>{messages.workoutErrorsLabel}</strong>
      <ul>{errors.map((error, index) => <li key={index}>{messages.workoutLineLabel} {error.line}: {error.message}</li>)}</ul>
    </div>
  ) : null;

  if (editing) return (
    <div className="workout-document">
      <p className="workout-document-hint" id="workout-text-hint">{messages.workoutTextHint}</p>
      <details className="workout-format"><summary>{messages.workoutSyntaxLabel}</summary><pre>{WORKOUT_EXAMPLE}</pre></details>
      <label className="plan-text-editor-field">
        <span>{messages.workoutTextLabel}</span>
        <textarea autoFocus className="workout-textarea" rows={20} spellCheck={false} autoCapitalize="off"
          aria-describedby={`workout-text-hint${showErrors && errors.length ? ' workout-errors' : ''}`}
          aria-invalid={showErrors && errors.length > 0}
          value={draft ?? ''} onChange={(event) => setDraft(event.target.value)} />
      </label>
      {errorList}
      <button type="button" className="plan-text-done-button" onClick={save}>{messages.workoutSaveLabel}</button>
      <button type="button" className="plan-text-done-button" onClick={() => { setDraft(null); setShowErrors(false); }}>{messages.cancelLabel}</button>
    </div>
  );

  const entries: Array<{ indices: number[]; group?: string }> = [];
  currentDay.exercises.forEach((exercise, localIndex) => {
    const index = dayOffset + localIndex;
    const last = entries[entries.length - 1];
    if (exercise.group && last?.group === exercise.group) last.indices.push(index);
    else entries.push({ indices: [index], group: exercise.group });
  });
  return (
    <div className="workout-document">
      <button type="button" className="plan-text-done-button" onClick={edit}>{messages.workoutEditLabel}</button>
      {hasDayTabs ? <div className="workout-day-tabs" role="tablist" aria-label={messages.workoutDaysLabel}>
        {parsed.days.map((day, index) => <button key={index} type="button" role="tab"
          id={`workout-day-tab-${index}`} aria-controls="workout-day-panel" aria-selected={index === dayIndex}
          tabIndex={index === dayIndex ? 0 : -1}
          onClick={() => setSelectedDay(index)}
          onKeyDown={(event) => {
            const next = event.key === 'ArrowRight' ? (index + 1) % parsed.days.length
              : event.key === 'ArrowLeft' ? (index - 1 + parsed.days.length) % parsed.days.length
              : event.key === 'Home' ? 0 : event.key === 'End' ? parsed.days.length - 1 : null;
            if (next !== null) { event.preventDefault(); setSelectedDay(next); document.getElementById(`workout-day-tab-${next}`)?.focus(); }
          }}>{day.title || messages.workoutDayLabel + ' ' + (index + 1)}</button>)}
      </div> : null}
      {errorList}
      <div id="workout-day-panel" className="workout-day-panel" role={hasDayTabs ? 'tabpanel' : undefined}
        aria-labelledby={hasDayTabs ? `workout-day-tab-${dayIndex}` : undefined}
        onTouchStart={(event) => { const touch = event.touches[0]; touchStart.current = { x: touch.clientX, y: touch.clientY }; }}
        onTouchEnd={(event) => {
          const start = touchStart.current; touchStart.current = null;
          const end = event.changedTouches[0];
          if (!start || !end) return;
          const dx = end.clientX - start.x; const dy = end.clientY - start.y;
          if (Math.abs(dx) > 65 && Math.abs(dx) > Math.abs(dy) * 1.5) setSelectedDay(Math.max(0, Math.min(parsed.days.length - 1, dayIndex + (dx < 0 ? 1 : -1))));
        }}>
      {!currentDay.exercises.length && !errors.length ? <p className="workout-document-hint">{messages.planEmptyTextLabel}</p> : null}
      {!errors.length && entries.map((entry, entryIndex) => (
        <section className={entry.group ? 'workout-connected' : 'workout-single'} key={entryIndex} aria-label={entry.group ? messages.makeSupersetLabel : undefined}>
          {entry.group ? <div className="workout-group-heading"><span>{messages.makeSupersetLabel}</span><div className="workout-move-controls">
            <button type="button" disabled={entryIndex === 0} onClick={() => move(entry.indices[0], -1)} aria-label={messages.workoutMoveGroupUpLabel} title={messages.workoutMoveGroupUpLabel}>↑</button>
            <button type="button" disabled={entryIndex === entries.length - 1} onClick={() => move(entry.indices[0], 1)} aria-label={messages.workoutMoveGroupDownLabel} title={messages.workoutMoveGroupDownLabel}>↓</button>
          </div></div> : null}
          {entry.indices.map((index, memberIndex) => <WorkoutExerciseCard key={index}
            exercise={parsed.exercises[index]} messages={messages}
            canMoveUp={entry.group ? memberIndex > 0 : entryIndex > 0}
            canMoveDown={entry.group ? memberIndex < entry.indices.length - 1 : entryIndex < entries.length - 1}
            onMove={(direction) => move(index, direction, Boolean(entry.group))} />)}

        </section>
      ))}
      </div>
      <span className="workout-document-status" role="status">{status}</span>
    </div>
  );
}
