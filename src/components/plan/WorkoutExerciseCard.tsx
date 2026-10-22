import type { Messages } from '../../i18n';
import { parseWorkoutText } from '../../plan/workoutText';

type Exercise = ReturnType<typeof parseWorkoutText>['exercises'][number];
type Props = { exercise: Exercise; messages: Messages; canMoveUp: boolean; canMoveDown: boolean; onMove: (direction: -1 | 1) => void };

export function WorkoutExerciseCard({ exercise, messages, canMoveUp, canMoveDown, onMove }: Props) {
  const weight = String(exercise.weight) === 'unknown' ? messages.workoutUnknownWeightLabel
    : Number(exercise.weight) === 0 ? messages.workoutBodyWeightLabel : `${exercise.weight} kg`;
  return (
    <article className="workout-reading-card">
      <div className="workout-card-heading">
      <h3><span className="workout-order">{exercise.order}.</span> {exercise.title}</h3>
      <div className="workout-move-controls">
        <button type="button" disabled={!canMoveUp} aria-label={`${messages.workoutMoveUpLabel}: ${exercise.title}`} onClick={() => onMove(-1)} title={messages.workoutMoveUpLabel}>↑</button>
        <button type="button" disabled={!canMoveDown} aria-label={`${messages.workoutMoveDownLabel}: ${exercise.title}`} onClick={() => onMove(1)} title={messages.workoutMoveDownLabel}>↓</button>
      </div>
      </div>
      {exercise.description ? <p className="workout-description">{exercise.description}</p> : null}
      <dl className="workout-reading-metrics">
        <div><dt>{messages.setsLabel}</dt><dd>{exercise.sets}</dd></div>
        <div><dt>{messages.repsLabel}</dt><dd>{exercise.reps}</dd></div>
        <div><dt>{messages.weightLabel}</dt><dd>{weight}</dd></div>
        <div><dt>{messages.pauseLabelPlan}</dt><dd>{exercise.rest} s</dd></div>
      </dl>

    </article>
  );
}
