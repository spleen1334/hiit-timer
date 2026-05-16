import type { Messages } from '../../i18n';
import type { TimerSettings } from '../../timer/types';
import { CollapsiblePanel } from '../shared/CollapsiblePanel';
import { CogIcon, SoundOffIcon, SoundOnIcon } from '../shared/icons';

type SettingsPanelProps = {
  messages: Messages;
  settings: TimerSettings;
  isOpen: boolean;
  localeLabel: string;
  isLocaleDialogOpen: boolean;
  canInstall: boolean;
  onToggleOpen: () => void;
  onOpenLocaleDialog: () => void;
  onToggleSound: () => void;
  onInstall: () => void;
  onClearHistory: () => void;
};

export function SettingsPanel({
  messages,
  settings,
  isOpen,
  localeLabel,
  isLocaleDialogOpen,
  canInstall,
  onToggleOpen,
  onOpenLocaleDialog,
  onToggleSound,
  onInstall,
  onClearHistory,
}: SettingsPanelProps) {
  return (
    <div className="panel-section">
      <button
        type="button"
        className={`panel-toggle ${isOpen ? 'is-open' : ''}`}
        onClick={onToggleOpen}
        aria-expanded={isOpen}
        aria-controls="settings-panel"
      >
        <span className="panel-toggle-icon-wrap">
          <CogIcon />
        </span>
        <span>{messages.settingsLabel}</span>
        <span className="panel-toggle-chevron" aria-hidden="true">
          {isOpen ? '−' : '+'}
        </span>
      </button>

      <CollapsiblePanel id="settings-panel" isOpen={isOpen}>
        <div className="utility-grid">
          <div className="toolbar-card toolbar-card-split">
            <div className="toolbar-stack">
              <p className="toolbar-label">{messages.languageLabel}</p>
              <button
                type="button"
                className="locale-trigger"
                onClick={onOpenLocaleDialog}
                aria-haspopup="dialog"
                aria-expanded={isLocaleDialogOpen}
              >
                <span className="locale-trigger-text">{localeLabel}</span>
                <span className="locale-trigger-chevron" aria-hidden="true">
                  +
                </span>
              </button>
            </div>

            <div className="toolbar-actions">
              <div className="sound-meta">
                <span className={`sound-indicator ${settings.soundEnabled ? 'is-on' : ''}`} aria-hidden="true">
                  {settings.soundEnabled ? <SoundOnIcon /> : <SoundOffIcon />}
                </span>
                <div>
                  <p className="toolbar-label">{messages.soundLabel}</p>
                  <p className="toolbar-hint">{messages.soundHint}</p>
                </div>
              </div>

              <button
                type="button"
                className={`sound-switch ${settings.soundEnabled ? 'is-on' : ''}`}
                onClick={onToggleSound}
                aria-pressed={settings.soundEnabled}
                aria-label={messages.soundLabel}
              >
                <span className="sound-switch-track">
                  <span className="sound-switch-thumb" />
                </span>
                <span className="sound-switch-text">{settings.soundEnabled ? messages.onLabel : messages.offLabel}</span>
              </button>

              {canInstall ? (
                <button type="button" className="install-button" onClick={onInstall}>
                  {messages.installAppLabel}
                </button>
              ) : null}

              <button type="button" className="clear-history-button" onClick={onClearHistory}>
                {messages.clearHistoryLabel}
              </button>
            </div>
          </div>
        </div>
      </CollapsiblePanel>
    </div>
  );
}
