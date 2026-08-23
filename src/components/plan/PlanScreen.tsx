import { useState } from 'react';
import { persistedState } from '../../data/persistedState';
import type { Messages } from '../../i18n';
import { usePersistedState } from '../../hooks/usePersistentState';
import type { SectionVisibility, TrainingProgram } from '../../plan/types';
import {
  CardioIcon,
  CooldownIcon,
  NotesIcon,
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

type PlanTextSectionProps = {
  label: string;
  value: string;
  emptyLabel: string;
  editLabel: string;
  doneLabel: string;
  isEditing: boolean;
  onToggleEdit: () => void;
  onChange: (value: string) => void;
};

function PlanTextSection({
  label,
  value,
  emptyLabel,
  editLabel,
  doneLabel,
  isEditing,
  onToggleEdit,
  onChange,
}: PlanTextSectionProps) {
  if (isEditing) {
    return (
      <div className="plan-text-editor">
        <label className="plan-text-editor-field">
          <span>{label}</span>
          <textarea autoFocus rows={4} value={value} onChange={(event) => onChange(event.target.value)} />
        </label>
        <button type="button" className="plan-text-done-button" onClick={onToggleEdit}>
          {doneLabel}
        </button>
      </div>
    );
  }

  return (
    <div className="plan-text-summary">
      <button type="button" className="plan-text-summary-button" onClick={onToggleEdit}>
        <span className="plan-text-summary-label">{label}</span>
        <span className={`plan-text-summary-value ${value.trim() ? '' : 'is-empty'}`.trim()}>
          {value.trim() || emptyLabel}
        </span>
      </button>
      <button type="button" className="plan-text-edit-button" onClick={onToggleEdit}>
        {editLabel}
      </button>
    </div>
  );
}

export function PlanScreen({ messages, program, onProgramChange }: PlanScreenProps) {
  const [sections, setSections] = usePersistedState<SectionVisibility>(persistedState.planSectionVisibility);
  const [editingTextSection, setEditingTextSection] = useState<keyof Pick<TrainingProgram, 'warmup' | 'cardio' | 'cooldown' | 'notes'> | null>(null);

  const toggleSection = (section: keyof SectionVisibility) => {
    setSections((current) => ({ ...current, [section]: !current[section] }));
  };

  return (
    <section className="panel plan-panel">
      <div className="headline mode-headline">
          <div className="mode-header-copy">
            <p className="screen-hero-kicker">{messages.planTabLabel}</p>
            <h1>{messages.planTitle}</h1>
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
        <PlanTextSection
          label={messages.warmupInputLabel}
          value={program.warmup}
          emptyLabel={messages.planEmptyTextLabel}
          editLabel={messages.editLabel}
          doneLabel={messages.doneLabel}
          isEditing={editingTextSection === 'warmup'}
          onToggleEdit={() => setEditingTextSection((current) => (current === 'warmup' ? null : 'warmup'))}
          onChange={(value) => onProgramChange({ ...program, warmup: value })}
        />
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
        <PlanTextSection
          label={messages.cardioSectionLabel}
          value={program.cardio}
          emptyLabel={messages.planEmptyTextLabel}
          editLabel={messages.editLabel}
          doneLabel={messages.doneLabel}
          isEditing={editingTextSection === 'cardio'}
          onToggleEdit={() => setEditingTextSection((current) => (current === 'cardio' ? null : 'cardio'))}
          onChange={(value) => onProgramChange({ ...program, cardio: value })}
        />
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
        <PlanTextSection
          label={messages.cooldownInputLabel}
          value={program.cooldown}
          emptyLabel={messages.planEmptyTextLabel}
          editLabel={messages.editLabel}
          doneLabel={messages.doneLabel}
          isEditing={editingTextSection === 'cooldown'}
          onToggleEdit={() => setEditingTextSection((current) => (current === 'cooldown' ? null : 'cooldown'))}
          onChange={(value) => onProgramChange({ ...program, cooldown: value })}
        />
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
        <PlanTextSection
          label={messages.notesInputLabel}
          value={program.notes}
          emptyLabel={messages.planEmptyTextLabel}
          editLabel={messages.editLabel}
          doneLabel={messages.doneLabel}
          isEditing={editingTextSection === 'notes'}
          onToggleEdit={() => setEditingTextSection((current) => (current === 'notes' ? null : 'notes'))}
          onChange={(value) => onProgramChange({ ...program, notes: value })}
        />
      </PlanSection>
    </section>
  );
}
