import { useState } from 'react';
import { persistedState } from '../../data/persistedState';
import type { Messages } from '../../i18n';
import { usePersistedState } from '../../hooks/usePersistentState';
import type { CardioExercise, SectionVisibility, TrainingProgram } from '../../plan/types';
import {
  CardioIcon,
  CooldownIcon,
  ExerciseFieldIcon,
  NotesIcon,
  TimeFieldIcon,
  GearIcon,
  WarmupIcon,
  WorkoutIcon,
} from './PlanIcons';
import { PlanSection } from './PlanSection';
import { WorkoutList } from './WorkoutList';
import { PlanIcon as AppPlanIcon } from '../shared/icons';

type PlanScreenProps = {
  messages: Messages;
  program: TrainingProgram;
  onProgramChange: (next: TrainingProgram) => void;
};

export function PlanScreen({ messages, program, onProgramChange }: PlanScreenProps) {
  const [editingCardioById, setEditingCardioById] = useState<Record<string, boolean>>({});
  const [sections, setSections] = usePersistedState<SectionVisibility>(persistedState.planSectionVisibility);

  const updateCardio = (id: string, patch: Partial<CardioExercise>) => {
    onProgramChange({
      ...program,
      cardio: program.cardio.map((entry) =>
        entry.id === id ? { ...entry, ...patch } : entry,
      ),
    });
  };

  const addCardio = () => {
    const nextIndex = program.cardio.length + 1;
    onProgramChange({
      ...program,
      cardio: [
        ...program.cardio,
        {
          id: `cardio-${Date.now()}`,
          exercise: `Cardio ${nextIndex}`,
          time: '10 min',
        },
      ],
    });
  };

  const removeCardio = (id: string) => {
    onProgramChange({
      ...program,
      cardio: program.cardio.filter((entry) => entry.id !== id),
    });
    setEditingCardioById((current) => {
      const next = { ...current };
      delete next[id];
      return next;
    });
  };

  const toggleSection = (section: keyof SectionVisibility) => {
    setSections((current) => ({ ...current, [section]: !current[section] }));
  };

  const toggleCardioEdit = (id: string) => {
    setEditingCardioById((current) => ({ ...current, [id]: !current[id] }));
  };

  return (
    <section className="panel plan-panel">
      <div className="headline plan-headline">
        <div className="plan-header-main">
          <div className="plan-header-copy">
            <p className="screen-hero-kicker">{messages.planTabLabel}</p>
            <h1>{messages.planTitle}</h1>
            <p>{messages.planSubtitle}</p>
          </div>

          <div className="plan-header-mark" aria-hidden="true">
            <span className="plan-header-ring plan-header-ring-a" />
            <span className="plan-header-ring plan-header-ring-b" />
            <span className="plan-header-ring plan-header-ring-c" />
            <span className="plan-header-icon-shell">
              <AppPlanIcon />
            </span>
          </div>
        </div>

        <div className="plan-header-icons" aria-hidden="true">
          <span className="plan-header-icon"><WarmupIcon /></span>
          <span className="plan-header-icon"><WorkoutIcon /></span>
          <span className="plan-header-icon"><CardioIcon /></span>
          <span className="plan-header-icon"><CooldownIcon /></span>
          <span className="plan-header-icon"><NotesIcon /></span>
        </div>
      </div>

      <PlanSection
        id="plan-warmup"
        className="plan-section-warmup"
        title={messages.warmupSectionLabel}
        icon={<WarmupIcon />}
        isOpen={sections.warmup}
        onToggle={() => toggleSection('warmup')}
        expandLabel={messages.expandLabel}
        collapseLabel={messages.collapseLabel}
      >
        <label className="notes-wrap">
          <span>{messages.warmupInputLabel}</span>
          <textarea
            value={program.warmup}
            onChange={(event) => onProgramChange({ ...program, warmup: event.target.value })}
            rows={4}
          />
        </label>
      </PlanSection>

      <PlanSection
        id="plan-workout"
        className="plan-section-workout"
        title={messages.workoutSectionLabel}
        icon={<WorkoutIcon />}
        isOpen={sections.workout}
        onToggle={() => toggleSection('workout')}
        expandLabel={messages.expandLabel}
        collapseLabel={messages.collapseLabel}
      >
        <WorkoutList
          messages={messages}
          exercises={program.workout}
          onExercisesChange={(nextWorkout) => onProgramChange({ ...program, workout: nextWorkout })}
        />
      </PlanSection>

      <PlanSection
        id="plan-cardio"
        className="plan-section-cardio"
        title={messages.cardioSectionLabel}
        icon={<CardioIcon />}
        isOpen={sections.cardio}
        onToggle={() => toggleSection('cardio')}
        expandLabel={messages.expandLabel}
        collapseLabel={messages.collapseLabel}
      >
        <div className="cardio-list">
          {program.cardio.map((entry, index) => (
            <div key={entry.id} className={`cardio-item ${index % 2 === 0 ? 'row-even' : 'row-odd'}`}>
              <div className="cardio-summary">
                <div className="cardio-summary-copy">
                  <strong>{entry.exercise}</strong>
                  <span>{entry.time}</span>
                </div>
                <button
                  type="button"
                  className="edit-toggle"
                  aria-label={messages.editLabel}
                  onClick={() => toggleCardioEdit(entry.id)}
                >
                  <GearIcon />
                  <span>{messages.editLabel}</span>
                </button>
              </div>

              {editingCardioById[entry.id] ? (
                <div className="cardio-editor">
                  <label className="cardio-field">
                    <span>
                      <ExerciseFieldIcon />
                      {messages.cardioExerciseLabel}
                    </span>
                    <input
                      type="text"
                      value={entry.exercise}
                      onChange={(event) => updateCardio(entry.id, { exercise: event.target.value })}
                    />
                  </label>
                  <label className="cardio-field">
                    <span>
                      <TimeFieldIcon />
                      {messages.cardioTimeLabel}
                    </span>
                    <input
                      type="text"
                      value={entry.time}
                      onChange={(event) => updateCardio(entry.id, { time: event.target.value })}
                    />
                  </label>
                  <button
                    type="button"
                    className="workout-remove-button"
                    onClick={() => removeCardio(entry.id)}
                  >
                    {messages.removeCardioLabel}
                  </button>
                </div>
              ) : null}
            </div>
          ))}
        </div>
        <button type="button" className="add-workout-button add-cardio-button" onClick={addCardio}>
          {messages.addCardioLabel}
        </button>
      </PlanSection>

      <PlanSection
        id="plan-cooldown"
        className="plan-section-cooldown"
        title={messages.cooldownSectionLabel}
        icon={<CooldownIcon />}
        isOpen={sections.cooldown}
        onToggle={() => toggleSection('cooldown')}
        expandLabel={messages.expandLabel}
        collapseLabel={messages.collapseLabel}
      >
        <label className="notes-wrap">
          <span>{messages.cooldownInputLabel}</span>
          <textarea
            value={program.cooldown}
            onChange={(event) => onProgramChange({ ...program, cooldown: event.target.value })}
            rows={4}
          />
        </label>
      </PlanSection>

      <PlanSection
        id="plan-notes"
        className="plan-section-notes"
        title={messages.notesSectionLabel}
        icon={<NotesIcon />}
        isOpen={sections.notes}
        onToggle={() => toggleSection('notes')}
        expandLabel={messages.expandLabel}
        collapseLabel={messages.collapseLabel}
      >
        <label className="notes-wrap">
          <span>{messages.notesInputLabel}</span>
          <textarea
            value={program.notes}
            onChange={(event) => onProgramChange({ ...program, notes: event.target.value })}
            rows={4}
          />
        </label>
      </PlanSection>
    </section>
  );
}
