import type { Messages } from '../../i18n';
import type { SessionMode } from '../../timer/types';
import { PauseIcon, PlayIcon, RestartIcon, StopIcon } from '../shared/icons';

export function RunControls({
  messages,
  mode,
  onPause,
  onResume,
  onRestart,
  onStop,
}: {
  messages: Messages;
  mode: SessionMode;
  onPause: () => void;
  onResume: () => void;
  onRestart: () => void;
  onStop: () => void;
}) {
  return (
    <div className="run-controls">
      {mode === 'paused' ? (
        <button type="button" className="secondary-button action-button" onClick={onResume}>
          <PlayIcon />
          {messages.resumeLabel}
        </button>
      ) : mode === 'complete' ? (
        <button type="button" className="secondary-button action-button" onClick={onRestart}>
          <RestartIcon />
          {messages.restartLabel}
        </button>
      ) : (
        <button type="button" className="secondary-button action-button" onClick={onPause}>
          <PauseIcon />
          {messages.pauseLabel}
        </button>
      )}

      <button type="button" className="ghost-button action-button" onClick={onStop}>
        <StopIcon />
        {messages.stopLabel}
      </button>
    </div>
  );
}
