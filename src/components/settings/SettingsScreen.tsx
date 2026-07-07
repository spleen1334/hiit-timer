import { useEffect, useRef, useState } from 'react';
import { downloadAppDataExport, importAppData } from '../../data/appDataExport';
import { exportAppDataToGoogleDrive, isGoogleDriveConfigured, preloadGoogleDriveAuth } from '../../integrations/googleDrive';
import type { Messages } from '../../i18n';
import { BackIcon, CogIcon } from '../shared/icons';

const MAX_IMPORT_FILE_SIZE_BYTES = 1_000_000;

type SettingsScreenProps = {
  messages: Messages;
  localeLabel: string;
  isLocaleDialogOpen: boolean;
  canInstall: boolean;
  soundEnabled: boolean;
  onBack: () => void;
  onOpenLocaleDialog: () => void;
  onToggleSound: () => void;
  onInstall: () => void;
  onClearTimerHistory: () => void;
  onClearBodyData: () => void;
};

export function SettingsScreen({
  messages,
  localeLabel,
  isLocaleDialogOpen,
  canInstall,
  soundEnabled,
  onBack,
  onOpenLocaleDialog,
  onToggleSound,
  onInstall,
  onClearTimerHistory,
  onClearBodyData,
}: SettingsScreenProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState(false);
  const [driveStatus, setDriveStatus] = useState<'idle' | 'exporting' | 'success' | 'error'>('idle');
  const googleDriveConfigured = isGoogleDriveConfigured();

  useEffect(() => {
    if (!googleDriveConfigured) {
      return;
    }

    void preloadGoogleDriveAuth().catch(() => {
      // Export still reports the load failure when the user taps the Drive action.
    });
  }, [googleDriveConfigured]);

  const handleExport = () => {
    downloadAppDataExport();
  };

  const handleGoogleDriveExport = async () => {
    setDriveStatus('exporting');
    try {
      await exportAppDataToGoogleDrive();
      setDriveStatus('success');
    } catch {
      setDriveStatus('error');
    }
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
        throw new Error('App data import file is too large.');
      }

      const rawJson = await file.text();
      importAppData(rawJson);
      setImportError(null);
      setImportSuccess(true);
      window.setTimeout(() => window.location.reload(), 250);
    } catch {
      setImportError(messages.dataImportError);
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
          <p className="settings-card-label">{messages.applicationDataLabel}</p>
          <p className="settings-card-hint">{messages.dataImportHint}</p>
          <div className="settings-button-stack">
            <button type="button" className="settings-button settings-button-primary" onClick={handleExport}>
              {messages.exportDataLabel}
            </button>
            <button type="button" className="settings-button settings-button-secondary" onClick={handleImportClick}>
              {messages.importDataLabel}
            </button>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json,.json"
            className="settings-file-input"
            onChange={(event) => void handleImportFile(event.target.files?.[0] ?? null)}
          />
          {importSuccess ? <p className="settings-success">{messages.dataImportSuccess}</p> : null}
          {importError ? <p className="settings-error">{importError}</p> : null}
        </section>

        <section className="settings-card">
          <p className="settings-card-label">{messages.googleDriveLabel}</p>
          <p className="settings-card-hint">
            {googleDriveConfigured ? messages.googleDriveHint : messages.googleDriveNotConfiguredHint}
          </p>
          <div className="settings-button-stack">
            <button
              type="button"
              className="settings-button settings-button-primary"
              onClick={() => void handleGoogleDriveExport()}
              disabled={!googleDriveConfigured || driveStatus === 'exporting'}
            >
              {driveStatus === 'exporting' ? messages.googleDriveExportingLabel : messages.googleDriveExportLabel}
            </button>
            <button type="button" className="settings-button settings-button-secondary" disabled>
              {messages.googleDriveImportLabel}
            </button>
          </div>
          <p className="settings-card-hint">{messages.googleDriveImportComingSoon}</p>
          {driveStatus === 'success' ? <p className="settings-success">{messages.googleDriveExportSuccess}</p> : null}
          {driveStatus === 'error' ? <p className="settings-error">{messages.googleDriveExportError}</p> : null}
        </section>

        <section className="settings-card settings-delete-card">
          <p className="settings-card-label">{messages.deleteDataLabel}</p>
          <div className="settings-button-stack">
            <button type="button" className="settings-button settings-button-danger" onClick={onClearTimerHistory}>
              {messages.clearTimerHistoryLabel}
            </button>
            <button type="button" className="settings-button settings-button-danger" onClick={onClearBodyData}>
              {messages.clearBodyDataLabel}
            </button>
          </div>
        </section>
      </div>
    </section>
  );
}
