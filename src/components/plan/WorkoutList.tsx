import { Fragment, useMemo, useRef, useState } from 'react';
import type { DragEvent } from 'react';
import type { Messages } from '../../i18n';
import type { WorkoutExercise } from '../../plan/types';
import { LinkIcon } from './PlanIcons';
import { WorkoutExerciseCard } from './WorkoutExerciseCard';

type WorkoutListProps = {
  messages: Messages;
  exercises: WorkoutExercise[];
  onExercisesChange: (next: WorkoutExercise[]) => void;
};

type DragPayload = {
  draggedId: string;
  draggedSupersetId?: string;
  sourceIds: string[];
};

type RenderEntry =
  | { key: string; leadId: string; type: 'single'; exercise: WorkoutExercise }
  | { key: string; leadId: string; type: 'superset'; supersetId: string; members: WorkoutExercise[] };

export function WorkoutList({ messages, exercises, onExercisesChange }: WorkoutListProps) {
  const [editingById, setEditingById] = useState<Record<string, boolean>>({});
  const [activeDropZone, setActiveDropZone] = useState<string | null>(null);
  const dragRef = useRef<DragPayload | null>(null);

  const groupsBySuperset = useMemo(() => {
    const groups = new Map<string, WorkoutExercise[]>();

    for (const exercise of exercises) {
      if (!exercise.supersetId) {
        continue;
      }

      const current = groups.get(exercise.supersetId) ?? [];
      current.push(exercise);
      groups.set(exercise.supersetId, current);
    }

    return groups;
  }, [exercises]);

  const indexByExerciseId = useMemo(
    () => new Map(exercises.map((exercise, index) => [exercise.id, index])),
    [exercises],
  );

  const renderedEntries = useMemo(() => {
    const seen = new Set<string>();
    const items: RenderEntry[] = [];

    for (const exercise of exercises) {
      if (!exercise.supersetId) {
        items.push({ key: exercise.id, leadId: exercise.id, type: 'single', exercise });
        continue;
      }

      const members = groupsBySuperset.get(exercise.supersetId) ?? [];
      if (members.length < 2) {
        items.push({ key: exercise.id, leadId: exercise.id, type: 'single', exercise });
        continue;
      }

      if (seen.has(exercise.supersetId)) {
        continue;
      }

      seen.add(exercise.supersetId);
      items.push({
        key: exercise.supersetId,
        leadId: members[0].id,
        type: 'superset',
        supersetId: exercise.supersetId,
        members,
      });
    }

    return items;
  }, [exercises, groupsBySuperset]);

  const reorderByIds = (movingIds: string[], beforeExerciseId: string | null) => {
    if (beforeExerciseId && movingIds.includes(beforeExerciseId)) {
      return;
    }

    const remaining = exercises.filter((exercise) => !movingIds.includes(exercise.id));
    const moving = exercises.filter((exercise) => movingIds.includes(exercise.id));

    const insertIndex = beforeExerciseId
      ? remaining.findIndex((exercise) => exercise.id === beforeExerciseId)
      : remaining.length;
    const safeIndex = insertIndex >= 0 ? insertIndex : remaining.length;

    const next = [
      ...remaining.slice(0, safeIndex),
      ...moving,
      ...remaining.slice(safeIndex),
    ];

    onExercisesChange(next);
  };

  const reorderDraggedBlock = (beforeExerciseId: string | null) => {
    const payload = dragRef.current;
    if (!payload) {
      return;
    }

    reorderByIds(payload.sourceIds, beforeExerciseId);
  };

  const reorderWithinSuperset = (supersetId: string, draggedId: string, beforeId: string | null) => {
    const memberIds = exercises
      .filter((exercise) => exercise.supersetId === supersetId)
      .map((exercise) => exercise.id);

    if (!memberIds.includes(draggedId)) {
      return;
    }

    if (beforeId === draggedId) {
      return;
    }

    const reorderedIds = memberIds.filter((id) => id !== draggedId);
    const insertIndex = beforeId ? reorderedIds.indexOf(beforeId) : reorderedIds.length;
    const safeIndex = insertIndex >= 0 ? insertIndex : reorderedIds.length;
    reorderedIds.splice(safeIndex, 0, draggedId);

    const idToExercise = new Map(exercises.map((exercise) => [exercise.id, exercise]));
    const reorderedMembers = reorderedIds
      .map((id) => idToExercise.get(id))
      .filter((exercise): exercise is WorkoutExercise => Boolean(exercise));

    const next: WorkoutExercise[] = [];
    let inserted = false;

    for (const exercise of exercises) {
      if (exercise.supersetId !== supersetId) {
        next.push(exercise);
        continue;
      }

      if (!inserted) {
        next.push(...reorderedMembers);
        inserted = true;
      }
    }

    onExercisesChange(next);
  };

  const combineAsSuperset = (targetId: string) => {
    const payload = dragRef.current;
    if (!payload || payload.sourceIds.includes(targetId)) {
      return;
    }

    const target = exercises.find((exercise) => exercise.id === targetId);
    const sourceLead = exercises.find((exercise) => exercise.id === payload.draggedId);

    if (!target || !sourceLead) {
      return;
    }

    const supersetId = sourceLead.supersetId ?? target.supersetId ?? `ss-${Date.now()}`;
    const withSuperset = exercises.map((exercise) =>
      payload.sourceIds.includes(exercise.id) || exercise.id === targetId
        ? { ...exercise, supersetId }
        : exercise,
    );

    const remaining = withSuperset.filter((exercise) => !payload.sourceIds.includes(exercise.id));
    const moving = withSuperset.filter((exercise) => payload.sourceIds.includes(exercise.id));
    const targetIndex = remaining.findIndex((exercise) => exercise.id === targetId);
    const safeIndex = targetIndex >= 0 ? targetIndex : remaining.length;

    onExercisesChange([
      ...remaining.slice(0, safeIndex),
      ...moving,
      ...remaining.slice(safeIndex),
    ]);
  };

  const clearSuperset = (exerciseId: string) => {
    const target = exercises.find((exercise) => exercise.id === exerciseId);
    if (!target?.supersetId) {
      return;
    }

    const sameGroup = exercises.filter((exercise) => exercise.supersetId === target.supersetId);
    if (sameGroup.length <= 2) {
      onExercisesChange(
        exercises.map((exercise) =>
          exercise.supersetId === target.supersetId ? { ...exercise, supersetId: undefined } : exercise,
        ),
      );
      return;
    }

    onExercisesChange(
      exercises.map((exercise) =>
        exercise.id === exerciseId ? { ...exercise, supersetId: undefined } : exercise,
      ),
    );
  };

  const onExerciseChange = (exerciseId: string, patch: Partial<WorkoutExercise>) => {
    onExercisesChange(
      exercises.map((exercise) =>
        exercise.id === exerciseId ? { ...exercise, ...patch } : exercise,
      ),
    );
  };

  const toggleEdit = (exerciseId: string) => {
    setEditingById((current) => ({
      ...current,
      [exerciseId]: !current[exerciseId],
    }));
  };

  const beginDrag = (exerciseId: string, event: DragEvent<HTMLElement>) => {
    const source = exercises.find((exercise) => exercise.id === exerciseId);
    if (!source) {
      return;
    }

    const sourceIds = source.supersetId
      ? exercises
          .filter((exercise) => exercise.supersetId === source.supersetId)
          .map((exercise) => exercise.id)
      : [exerciseId];

    dragRef.current = {
      draggedId: exerciseId,
      draggedSupersetId: source.supersetId,
      sourceIds,
    };
    event.dataTransfer.effectAllowed = 'move';
    setActiveDropZone(null);
  };

  const endDrag = () => {
    dragRef.current = null;
    setActiveDropZone(null);
  };

  const addWorkout = () => {
    const nextIndex = exercises.length + 1;
    onExercisesChange([
      ...exercises,
      {
        id: `ex-${Date.now()}`,
        title: `Workout ${nextIndex}`,
        description: 'Edit details',
        sets: '3',
        reps: '10',
        weight: 'BW',
        rest: '60 sec',
        bodyPart: 'full-body',
      },
    ]);
  };

  const removeWorkout = (exerciseId: string) => {
    const target = exercises.find((exercise) => exercise.id === exerciseId);
    if (!target) {
      return;
    }

    const filtered = exercises.filter((exercise) => exercise.id !== exerciseId);
    if (!target.supersetId) {
      onExercisesChange(filtered);
      return;
    }

    const remainingInSuperset = filtered.filter((exercise) => exercise.supersetId === target.supersetId);
    if (remainingInSuperset.length <= 1) {
      onExercisesChange(
        filtered.map((exercise) =>
          exercise.supersetId === target.supersetId ? { ...exercise, supersetId: undefined } : exercise,
        ),
      );
      return;
    }

    onExercisesChange(filtered);
  };

  return (
    <div className="workout-list">
      {groupsBySuperset.size > 0 ? <p className="superset-hint">{messages.supersetHintLabel}</p> : null}

      {renderedEntries.map((entry) => (
        <Fragment key={entry.key}>
          <div
            className={`reorder-drop-zone ${activeDropZone === entry.leadId ? 'is-active' : ''}`}
            onDragOver={(event) => {
              event.preventDefault();
              setActiveDropZone(entry.leadId);
            }}
            onDragLeave={() => setActiveDropZone((current) => (current === entry.leadId ? null : current))}
            onDrop={(event) => {
              event.preventDefault();
              reorderDraggedBlock(entry.leadId);
              endDrag();
            }}
          />

          {entry.type === 'single' ? (
            <WorkoutExerciseCard
              exercise={entry.exercise}
              messages={messages}
              isEditing={Boolean(editingById[entry.exercise.id])}
              tone={(indexByExerciseId.get(entry.exercise.id) ?? 0) % 2 === 0 ? 'row-even' : 'row-odd'}
              onExerciseChange={onExerciseChange}
              onToggleEdit={toggleEdit}
              onDropOn={(targetId) => {
                combineAsSuperset(targetId);
                endDrag();
              }}
              onDragStartCard={beginDrag}
              onDragEndCard={endDrag}
              onRemoveWorkout={removeWorkout}
            />
          ) : (
            <section className="superset-stack" aria-label="Superset group">
              <div className="superset-left-line" aria-hidden="true" />
              {entry.members.map((member) => (
                <Fragment key={member.id}>
                  <div
                    className={`superset-reorder-drop ${activeDropZone === `group:${entry.supersetId}:${member.id}` ? 'is-active' : ''}`}
                    onDragOver={(event) => {
                      event.preventDefault();
                      setActiveDropZone(`group:${entry.supersetId}:${member.id}`);
                    }}
                    onDragLeave={() =>
                      setActiveDropZone((current) =>
                        current === `group:${entry.supersetId}:${member.id}` ? null : current,
                      )
                    }
                    onDrop={(event) => {
                      event.preventDefault();
                      const payload = dragRef.current;
                      if (payload?.draggedSupersetId === entry.supersetId) {
                        reorderWithinSuperset(entry.supersetId, payload.draggedId, member.id);
                      }
                      endDrag();
                    }}
                  />

                  <div className="superset-member">
                    <button
                      type="button"
                      className="superset-link-icon"
                      aria-label={messages.removeSupersetLabel}
                      onClick={() => clearSuperset(member.id)}
                    >
                      <LinkIcon />
                    </button>
                    <WorkoutExerciseCard
                      exercise={member}
                      messages={messages}
                      isEditing={Boolean(editingById[member.id])}
                      tone={(indexByExerciseId.get(member.id) ?? 0) % 2 === 0 ? 'row-even' : 'row-odd'}
                      onExerciseChange={onExerciseChange}
                      onToggleEdit={toggleEdit}
                      onDropOn={(targetId) => {
                        combineAsSuperset(targetId);
                        endDrag();
                      }}
                      onDragStartCard={beginDrag}
                      onDragEndCard={endDrag}
                      onRemoveWorkout={removeWorkout}
                    />
                  </div>
                </Fragment>
              ))}
              <div
                className={`superset-reorder-drop ${activeDropZone === `group:${entry.supersetId}:end` ? 'is-active' : ''}`}
                onDragOver={(event) => {
                  event.preventDefault();
                  setActiveDropZone(`group:${entry.supersetId}:end`);
                }}
                onDragLeave={() =>
                  setActiveDropZone((current) =>
                    current === `group:${entry.supersetId}:end` ? null : current,
                  )
                }
                onDrop={(event) => {
                  event.preventDefault();
                  const payload = dragRef.current;
                  if (payload?.draggedSupersetId === entry.supersetId) {
                    reorderWithinSuperset(entry.supersetId, payload.draggedId, null);
                  }
                  endDrag();
                }}
              />
            </section>
          )}
        </Fragment>
      ))}

      <div
        className={`reorder-drop-zone reorder-drop-zone-end ${activeDropZone === 'end' ? 'is-active' : ''}`}
        onDragOver={(event) => {
          event.preventDefault();
          setActiveDropZone('end');
        }}
        onDragLeave={() => setActiveDropZone((current) => (current === 'end' ? null : current))}
        onDrop={(event) => {
          event.preventDefault();
          reorderDraggedBlock(null);
          endDrag();
        }}
      />

      <button type="button" className="add-workout-button" onClick={addWorkout}>
        {messages.addWorkoutLabel}
      </button>
    </div>
  );
}
