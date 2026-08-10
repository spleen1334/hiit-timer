import { useEffect, useRef, useState } from 'react';
import { downloadBodyCsvExport, importBodyCsv } from '../../data/bodyCsv';
import { downloadPlanTimerDataExport, importPlanTimerData } from '../../data/planTimerData';
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
  onClearBodyData,
}: SettingsScreenProps) {
  const planTimerFileInputRef = useRef<HTMLInputElement>(null);
  const bodyFileInputRef = useRef<HTMLInputElement>(null);
  const [planTimerStatus, setPlanTimerStatus] = useState<'idle' | 'busy' | 'exported' | 'imported' | 'error'>('idle');
  const [bodyStatus, setBodyStatus] = useState<'idle' | 'busy' | 'exported' | 'imported' | 'error'>('idle');
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

  const handlePlanTimerExport = async () => {
    setPlanTimerStatus('busy');
    try {
      await downloadPlanTimerDataExport();
      setPlanTimerStatus('exported');
    } catch {
      setPlanTimerStatus('error');
    }
  };

  const handleBodyExport = async () => {
    setBodyStatus('busy');
    try {
      await downloadBodyCsvExport();
      setBodyStatus('exported');
    } catch {
      setBodyStatus('error');
    }
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

  const handlePlanTimerImportClick = () => {
    setPlanTimerStatus('idle');
    planTimerFileInputRef.current?.click();
  };

  const handleBodyImportClick = () => {
    setBodyStatus('idle');
    bodyFileInputRef.current?.click();
  };

  const handlePlanTimerImport = async (file: File | null) => {
    if (!file) {
      return;
    }

    setPlanTimerStatus('busy');
    try {
      if (file.size > MAX_IMPORT_FILE_SIZE_BYTES) {
        throw new Error('Plan and timer import file is too large.');
      }

      await importPlanTimerData(await file.text());
      setPlanTimerStatus('imported');
      window.setTimeout(() => window.location.reload(), 250);
    } catch {
      setPlanTimerStatus('error');
    } finally {
      if (planTimerFileInputRef.current) {
        planTimerFileInputRef.current.value = '';
      }
    }
  };

  const handleBodyImport = async (file: File | null) => {
    if (!file) {
      return;
    }

    setBodyStatus('busy');
    try {
      if (file.size > MAX_IMPORT_FILE_SIZE_BYTES) {
        throw new Error('Body import file is too large.');
      }

      await importBodyCsv(await file.text());
      setBodyStatus('imported');
      window.setTimeout(() => window.location.reload(), 250);
    } catch {
      setBodyStatus('error');
    } finally {
      if (bodyFileInputRef.current) {
        bodyFileInputRef.current.value = '';
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
          <div className="settings-hero-main">
            <div className="settings-hero-copy">
              <p className="screen-hero-kicker">{messages.settingsLabel}</p>
              <h1>{messages.settingsTitle}</h1>
              <p>{messages.settingsSubtitle}</p>
            </div>

            <div className="settings-hero-mark" aria-hidden="true">
              <span className="settings-hero-ring settings-hero-ring-a" />
              <span className="settings-hero-ring settings-hero-ring-b" />
              <span className="settings-hero-ring settings-hero-ring-c" />
              <span className="settings-hero-icon-shell">
                <CogIcon />
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="settings-stack">
        <section className="settings-card settings-card-language">
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

        <section className="settings-card settings-card-sound">
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
          <section className="settings-card settings-card-install">
            <p className="settings-card-label">{messages.installAppLabel}</p>
            <button type="button" className="settings-button settings-button-primary" onClick={onInstall}>
              {messages.installAppLabel}
            </button>
          </section>
        ) : null}

        <section className="settings-card settings-card-plan-timer">
          <p className="settings-card-label">{messages.planTimerDataLabel}</p>
          <p className="settings-card-hint">{messages.planTimerDataHint}</p>
          <div className="settings-button-stack">
            <button type="button" className="settings-button settings-button-primary" onClick={() => void handlePlanTimerExport()} disabled={planTimerStatus === 'busy'}>
              {messages.exportPlanTimerDataLabel}
            </button>
            <button type="button" className="settings-button settings-button-secondary" onClick={handlePlanTimerImportClick} disabled={planTimerStatus === 'busy'}>
              {messages.importPlanTimerDataLabel}
            </button>
          </div>
          <input
            ref={planTimerFileInputRef}
            type="file"
            accept="application/json,.json"
            className="settings-file-input"
            onChange={(event) => void handlePlanTimerImport(event.target.files?.[0] ?? null)}
          />
          {planTimerStatus === 'exported' ? <p className="settings-success">{messages.planTimerDataExportSuccess}</p> : null}
          {planTimerStatus === 'imported' ? <p className="settings-success">{messages.planTimerDataSuccess}</p> : null}
          {planTimerStatus === 'error' ? <p className="settings-error">{messages.planTimerDataError}</p> : null}
        </section>

        <section className="settings-card settings-card-body-data">
          <p className="settings-card-label">{messages.bodyDataLabel}</p>
          <p className="settings-card-hint">{messages.bodyDataHint}</p>
          <div className="settings-button-stack">
            <button type="button" className="settings-button settings-button-primary" onClick={() => void handleBodyExport()} disabled={bodyStatus === 'busy'}>
              {messages.exportBodyDataLabel}
            </button>
            <button type="button" className="settings-button settings-button-secondary" onClick={handleBodyImportClick} disabled={bodyStatus === 'busy'}>
              {messages.importBodyDataLabel}
            </button>
          </div>
          <input
            ref={bodyFileInputRef}
            type="file"
            accept="text/csv,.csv"
            className="settings-file-input"
            onChange={(event) => void handleBodyImport(event.target.files?.[0] ?? null)}
          />
          {bodyStatus === 'exported' ? <p className="settings-success">{messages.bodyDataExportSuccess}</p> : null}
          {bodyStatus === 'imported' ? <p className="settings-success">{messages.bodyDataSuccess}</p> : null}
          {bodyStatus === 'error' ? <p className="settings-error">{messages.bodyDataError}</p> : null}
        </section>

        <section className="settings-card settings-card-drive">
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
            <button type="button" className="settings-button settings-button-danger" onClick={onClearBodyData}>
              {messages.clearBodyDataLabel}
            </button>
          </div>
        </section>
      </div>
    </section>
  );
}
