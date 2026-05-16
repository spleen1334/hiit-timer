import { LOCALE_OPTIONS, type Locale } from '../../i18n';

export function ConfirmDialog({
  title,
  body,
  cancelLabel,
  confirmLabel,
  onCancel,
  onConfirm,
}: {
  title: string;
  body: string;
  cancelLabel: string;
  confirmLabel: string;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <div className="dialog-overlay" role="dialog" aria-modal="true" aria-labelledby="confirm-dialog-title">
      <div className="dialog-card">
        <p id="confirm-dialog-title" className="dialog-title">
          {title}
        </p>
        <p className="dialog-body">{body}</p>
        <div className="dialog-actions">
          <button type="button" className="dialog-button dialog-button-secondary" onClick={onCancel}>
            {cancelLabel}
          </button>
          <button type="button" className="dialog-button dialog-button-danger" onClick={onConfirm}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export function LocaleDialog({
  title,
  cancelLabel,
  selectedLocale,
  onClose,
  onSelect,
}: {
  title: string;
  cancelLabel: string;
  selectedLocale: Locale;
  onClose: () => void;
  onSelect: (nextLocale: Locale) => void;
}) {
  return (
    <div className="dialog-overlay" role="dialog" aria-modal="true" aria-labelledby="locale-dialog-title">
      <div className="dialog-card locale-dialog-card">
        <p id="locale-dialog-title" className="dialog-title">
          {title}
        </p>
        <div className="locale-dialog-options" role="listbox" aria-label={title}>
          {LOCALE_OPTIONS.map((option) => (
            <button
              key={option.id}
              type="button"
              className={`locale-dialog-option ${selectedLocale === option.id ? 'is-selected' : ''}`}
              onClick={() => onSelect(option.id)}
              role="option"
              aria-selected={selectedLocale === option.id}
            >
              <span>{option.label}</span>
              <span className="locale-option-mark" aria-hidden="true">
                {selectedLocale === option.id ? '●' : ''}
              </span>
            </button>
          ))}
        </div>
        <div className="dialog-actions">
          <button type="button" className="dialog-button dialog-button-secondary" onClick={onClose}>
            {cancelLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export function InfoDialog({
  title,
  body,
  closeLabel,
  onClose,
}: {
  title: string;
  body: string;
  closeLabel: string;
  onClose: () => void;
}) {
  return (
    <div className="dialog-overlay" role="dialog" aria-modal="true" aria-labelledby="info-dialog-title">
      <div className="dialog-card">
        <p id="info-dialog-title" className="dialog-title">
          {title}
        </p>
        <p className="dialog-body">{body}</p>
        <div className="dialog-actions">
          <button type="button" className="dialog-button dialog-button-secondary" onClick={onClose}>
            {closeLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
