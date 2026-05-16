import type { ChangeEvent, DragEvent, ReactNode } from 'react';
import type { Messages } from '../../i18n';
import type { BodyPartIcon, WorkoutExercise } from '../../plan/types';
import { BodyPartBadge, GearIcon, RepsIcon, RestIcon, SetsIcon, WeightIcon } from './PlanIcons';

type WorkoutExerciseCardProps = {
  exercise: WorkoutExercise;
  messages: Messages;
  isEditing: boolean;
  tone: 'row-even' | 'row-odd';
  onExerciseChange: (exerciseId: string, patch: Partial<WorkoutExercise>) => void;
  onToggleEdit: (id: string) => void;
  onDropOn: (targetId: string) => void;
  onDragStartCard: (id: string, event: DragEvent<HTMLElement>) => void;
  onDragEndCard: () => void;
  onRemoveWorkout: (id: string) => void;
};

const BODY_PART_ORDER: BodyPartIcon[] = [
  'back',
  'legs',
  'chest',
  'shoulders',
  'biceps',
  'triceps',
  'core',
  'cardio',
  'full-body',
];

const formatBodyPartLabel = (bodyPart: BodyPartIcon) =>
  bodyPart
    .split('-')
    .map((chunk) => chunk.charAt(0).toUpperCase() + chunk.slice(1))
    .join(' ');

const formatWeightSummary = (weight: string) => {
  if (/^body\s*weight$/i.test(weight.trim())) {
    return 'BW';
  }

  return weight;
};

export function WorkoutExerciseCard({
  exercise,
  messages,
  isEditing,
  tone,
  onExerciseChange,
  onToggleEdit,
  onDropOn,
  onDragStartCard,
  onDragEndCard,
  onRemoveWorkout,
}: WorkoutExerciseCardProps) {
  const patch =
    (field: keyof WorkoutExercise) =>
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      onExerciseChange(exercise.id, { [field]: event.target.value });
    };

  return (
    <article
      className={`workout-card ${tone} ${exercise.supersetId ? 'is-superset' : ''} ${isEditing ? 'is-editing' : ''}`}
      draggable
      onDragStart={(event) => onDragStartCard(exercise.id, event)}
      onDragEnd={onDragEndCard}
      onDragOver={(event) => event.preventDefault()}
      onDrop={(event) => {
        event.preventDefault();
        onDropOn(exercise.id);
      }}
    >
      <div className="workout-summary">
        <BodyPartBadge type={exercise.bodyPart} />
        <div className="workout-summary-copy">
          <h3>{exercise.title}</h3>
          <p>
            {messages.setsLabel} <strong>{exercise.sets}</strong> x {messages.repsLabel} <strong>{exercise.reps}</strong> x {messages.weightLabel} <strong>{formatWeightSummary(exercise.weight)}</strong> x {messages.pauseLabelPlan} <strong>{exercise.rest}</strong>
          </p>
        </div>
        <button
          type="button"
          className="edit-toggle"
          aria-label={messages.settingsLabel}
          onClick={() => onToggleEdit(exercise.id)}
        >
          <GearIcon />
        </button>
      </div>

      {isEditing ? (
        <div className="workout-editor">
          <div className="editor-grid">
            <label className="editor-label">
              <span>{messages.titleLabel}</span>
              <input type="text" value={exercise.title} onChange={patch('title')} />
            </label>
            <label className="editor-label">
              <span>{messages.descriptionLabel}</span>
              <textarea rows={2} value={exercise.description} onChange={patch('description')} />
            </label>
          </div>

          <div className="exercise-metrics">
            <MetricEditor icon={<SetsIcon />} label={messages.setsLabel} value={exercise.sets} onChange={patch('sets')} />
            <MetricEditor icon={<RepsIcon />} label={messages.repsLabel} value={exercise.reps} onChange={patch('reps')} />
            <MetricEditor icon={<WeightIcon />} label={messages.weightLabel} value={exercise.weight} onChange={patch('weight')} />
            <MetricEditor icon={<RestIcon />} label={messages.pauseLabelPlan} value={exercise.rest} onChange={patch('rest')} />
          </div>

          <label className="editor-label body-part-select">
            <span>{messages.bodyPartLabel}</span>
            <select value={exercise.bodyPart} onChange={patch('bodyPart')}>
              {BODY_PART_ORDER.map((bodyPart) => (
                <option key={bodyPart} value={bodyPart}>
                  {formatBodyPartLabel(bodyPart)}
                </option>
              ))}
            </select>
          </label>

          <button type="button" className="workout-remove-button" onClick={() => onRemoveWorkout(exercise.id)}>
            {messages.removeWorkoutLabel}
          </button>
        </div>
      ) : null}
    </article>
  );
}

function MetricEditor({
  icon,
  label,
  value,
  onChange,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <label className="metric-item metric-editor">
      <span className="metric-icon">{icon}</span>
      <span className="metric-label">{label}</span>
      <input type="text" value={value} onChange={onChange} />
    </label>
  );
}
