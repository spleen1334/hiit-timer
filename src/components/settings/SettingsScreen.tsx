import { useRef, useState } from 'react';
import type { Messages } from '../../i18n';
import type { TrainingProgram } from '../../plan/types';
import { downloadTrainingProgramExport, parseTrainingProgramImport } from '../../plan/importExport';
import { BackIcon, CogIcon } from '../shared/icons';

const MAX_IMPORT_FILE_SIZE_BYTES = 1_000_000;

type SettingsScreenProps = {
  messages: Messages;
  localeLabel: string;
  isLocaleDialogOpen: boolean;
  canInstall: boolean;
  trainingProgram: TrainingProgram;
  soundEnabled: boolean;
  onBack: () => void;
  onOpenLocaleDialog: () => void;
  onToggleSound: () => void;
  onInstall: () => void;
  onClearHistory: () => void;
  onImportTrainingProgram: (next: unknown) => void;
};

export function SettingsScreen({
  messages,
  localeLabel,
  isLocaleDialogOpen,
  canInstall,
  trainingProgram,
  soundEnabled,
  onBack,
  onOpenLocaleDialog,
  onToggleSound,
  onInstall,
  onClearHistory,
  onImportTrainingProgram,
}: SettingsScreenProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState(false);

  const handleExport = () => {
    downloadTrainingProgramExport(trainingProgram);
  };

  const handleImportClick = () => {
    setImportError(null);
    setImportSuccess(false);
    fileInputRef.current?.click();
  };

  const handleImportFile = async (file: File | null) => {
    if (!file) {
      return;
    }

    try {
      if (file.size > MAX_IMPORT_FILE_SIZE_BYTES) {
        throw new Error('Training plan import file is too large.');
      }

      const rawJson = await file.text();
      const imported = parseTrainingProgramImport(rawJson);
      onImportTrainingProgram(imported);
      setImportError(null);
      setImportSuccess(true);
    } catch {
      setImportError(messages.planImportError);
      setImportSuccess(false);
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <section className="panel settings-panel view-stage">
      <div className="headline settings-headline">
        <button type="button" className="settings-back-button" onClick={onBack}>
          <BackIcon />
          <span>{messages.backLabel}</span>
        </button>

        <div className="settings-hero">
          <span className="settings-hero-icon" aria-hidden="true">
            <CogIcon />
          </span>
          <div className="settings-hero-copy">
            <h1>{messages.settingsTitle}</h1>
            <p>{messages.settingsSubtitle}</p>
          </div>
        </div>
      </div>

      <div className="settings-stack">
        <section className="settings-card">
          <p className="settings-card-label">{messages.languageLabel}</p>
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
        </section>

        <section className="settings-card">
          <p className="settings-card-label">{messages.soundLabel}</p>
          <p className="settings-card-hint">{messages.soundHint}</p>
          <button
            type="button"
            className={`sound-switch ${soundEnabled ? 'is-on' : ''}`}
            onClick={onToggleSound}
            aria-pressed={soundEnabled}
            aria-label={messages.soundLabel}
          >
            <span className="sound-switch-track">
              <span className="sound-switch-thumb" />
            </span>
            <span className="sound-switch-text">{soundEnabled ? messages.onLabel : messages.offLabel}</span>
          </button>
        </section>

        {canInstall ? (
          <section className="settings-card">
            <p className="settings-card-label">{messages.installAppLabel}</p>
            <button type="button" className="settings-button settings-button-primary" onClick={onInstall}>
              {messages.installAppLabel}
            </button>
          </section>
        ) : null}

        <section className="settings-card">
          <p className="settings-card-label">{messages.clearHistoryLabel}</p>
          <button type="button" className="clear-history-button" onClick={onClearHistory}>
            {messages.clearHistoryLabel}
          </button>
        </section>

        <section className="settings-card">
          <p className="settings-card-label">{messages.planTitle}</p>
          <p className="settings-card-hint">{messages.planImportHint}</p>
          <div className="settings-button-stack">
            <button type="button" className="settings-button settings-button-primary" onClick={handleExport}>
              {messages.exportPlanLabel}
            </button>
            <button type="button" className="settings-button settings-button-secondary" onClick={handleImportClick}>
              {messages.importPlanLabel}
            </button>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json,.json"
            className="settings-file-input"
            onChange={(event) => void handleImportFile(event.target.files?.[0] ?? null)}
          />
          {importSuccess ? <p className="settings-success">{messages.planImportSuccess}</p> : null}
          {importError ? <p className="settings-error">{importError}</p> : null}
        </section>
      </div>
    </section>
  );
}
