import { useState } from 'react';
import type { Messages } from '../../i18n';
import { usePersistentState } from '../../hooks/usePersistentState';
import { PLAN_SECTION_VISIBILITY_KEY } from '../../plan/constants';
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

type PlanScreenProps = {
  messages: Messages;
  program: TrainingProgram;
  onProgramChange: (next: TrainingProgram) => void;
};

const DEFAULT_SECTION_VISIBILITY: SectionVisibility = {
  warmup: true,
  workout: true,
  cardio: true,
  cooldown: true,
  notes: true,
};

const sanitizeSectionVisibility = (value: unknown): SectionVisibility => {
  if (!value || typeof value !== 'object') {
    return DEFAULT_SECTION_VISIBILITY;
  }

  const candidate = value as Partial<SectionVisibility>;
  return {
    warmup: candidate.warmup ?? true,
    workout: candidate.workout ?? true,
    cardio: candidate.cardio ?? true,
    cooldown: candidate.cooldown ?? true,
    notes: candidate.notes ?? true,
  };
};

export function PlanScreen({ messages, program, onProgramChange }: PlanScreenProps) {
  const [editingCardioById, setEditingCardioById] = useState<Record<string, boolean>>({});
  const [sections, setSections] = usePersistentState<SectionVisibility>(
    PLAN_SECTION_VISIBILITY_KEY,
    () => DEFAULT_SECTION_VISIBILITY,
    {
      parse: (stored) => sanitizeSectionVisibility(JSON.parse(stored)),
    },
  );

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
        <div className="plan-title-wrap">
          <h1>{messages.planTitle}</h1>
          <div className="plan-header-icons" aria-hidden="true">
            <span className="plan-header-icon"><WarmupIcon /></span>
            <span className="plan-header-icon"><WorkoutIcon /></span>
            <span className="plan-header-icon"><CardioIcon /></span>
            <span className="plan-header-icon"><CooldownIcon /></span>
            <span className="plan-header-icon"><NotesIcon /></span>
          </div>
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
                  aria-label={messages.settingsLabel}
                  onClick={() => toggleCardioEdit(entry.id)}
                >
                  <GearIcon />
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
