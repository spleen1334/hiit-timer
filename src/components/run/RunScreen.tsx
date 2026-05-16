import type { Messages } from '../../i18n';
import type { Phase, SessionMode } from '../../timer/types';
import { RunControls } from './RunControls';
import { RunMeta } from './RunMeta';
import { TimerCard } from './TimerCard';

type RunScreenProps = {
  messages: Messages;
  mode: SessionMode;
  phase: Phase;
  round: number;
  rounds: number;
  secondsLeft: number;
  phaseProgress: number;
  roundProgress: number;
  isWarning: boolean;
  runningLabel: string;
  runningKicker: string;
  onPause: () => void;
  onResume: () => void;
  onRestart: () => void;
  onStop: () => void;
};

export function RunScreen({
  messages,
  mode,
  phase,
  round,
  rounds,
  secondsLeft,
  phaseProgress,
  roundProgress,
  isWarning,
  runningLabel,
  runningKicker,
  onPause,
  onResume,
  onRestart,
  onStop,
}: RunScreenProps) {
  return (
    <section className="panel run-panel">
      <RunMeta
        kicker={runningKicker}
        roundLabel={messages.roundCounter(Math.min(round, rounds), rounds)}
        roundProgress={roundProgress}
      />

      <TimerCard
        phase={phase}
        isWarning={isWarning}
        phaseProgress={phaseProgress}
        label={runningLabel}
        secondsLeft={secondsLeft}
      />

      <RunControls
        messages={messages}
        mode={mode}
        onPause={onPause}
        onResume={onResume}
        onRestart={onRestart}
        onStop={onStop}
      />
    </section>
  );
}
