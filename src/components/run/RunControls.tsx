import type { Messages } from '../../i18n';
import type { SessionMode, TimerToolMode } from '../../timer/types';
import { PauseIcon, PlayIcon, RestartIcon, StopIcon } from '../shared/icons';

export function RunControls({
  messages,
  timerTool,
  mode,
  onPause,
  onResume,
  onRestart,
  onReset,
  onStop,
}: {
  messages: Messages;
  timerTool: TimerToolMode;
  mode: SessionMode;
  onPause: () => void;
  onResume: () => void;
  onRestart: () => void;
  onReset: () => void;
  onStop: () => void;
}) {
  const isStopwatch = timerTool === 'stopwatch';

  return (
    <div className={`run-controls ${isStopwatch ? 'stopwatch-inline-controls' : ''}`}>
      {isStopwatch ? (
        mode === 'paused' ? (
          <button type="button" className="secondary-button action-button action-button-resume" onClick={onResume}>
            <PlayIcon />
            {messages.resumeLabel}
          </button>
        ) : (
          <button type="button" className="secondary-button action-button action-button-pause" onClick={onPause}>
            <PauseIcon />
            {messages.pauseLabel}
          </button>
        )
      ) : mode === 'paused' ? (
        <button type="button" className="secondary-button action-button action-button-resume" onClick={onResume}>
          <PlayIcon />
          {messages.resumeLabel}
        </button>
      ) : mode === 'complete' ? (
        <button type="button" className="secondary-button action-button action-button-danger" onClick={onRestart}>
          <RestartIcon />
          {messages.restartLabel}
        </button>
      ) : (
        <button type="button" className="secondary-button action-button action-button-pause" onClick={onPause}>
          <PauseIcon />
          {messages.pauseLabel}
        </button>
      )}

      {isStopwatch ? (
        <button
          type="button"
          className="ghost-button action-button action-button-danger action-button-icon-only"
          onClick={onReset}
          aria-label={messages.resetLabel}
          title={messages.resetLabel}
        >
          <RestartIcon />
        </button>
      ) : (
        <button type="button" className="ghost-button action-button action-button-danger" onClick={onStop}>
          <StopIcon />
          {messages.stopLabel}
        </button>
      )}
    </div>
  );
}
