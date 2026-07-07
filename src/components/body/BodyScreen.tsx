import { useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { persistedState } from '../../data/persistedState';
import type { Messages } from '../../i18n';
import { usePersistedState, usePersistentState } from '../../hooks/usePersistentState';
import {
  calculateBodyMetricBmi,
  createBodyMetricDraft,
  getLatestBodyMetricHeight,
  parseBodyMetricNumber,
  sortBodyMetricEntries,
  type BodyMetricDraft,
  type BodyMetricEntry,
} from '../../body/bodyMetrics';
import { BodyIcon, CogIcon } from '../shared/icons';

type BodyScreenProps = {
  messages: Messages;
  locale: string;
};

type BodyMetricsRange = '1m' | '3m' | '6m' | '1y' | 'all';

type BodyMetricsRangeLabelKey =
  | 'bodyMetricsRange1MonthLabel'
  | 'bodyMetricsRange3MonthsLabel'
  | 'bodyMetricsRange6MonthsLabel'
  | 'bodyMetricsRange1YearLabel'
  | 'bodyMetricsRangeAllLabel';

type ChartEntry = {
  id: string;
  date: Date;
  weight: number | null;
  bodyFat: number | null;
};

type ChartPoint = { x: number; y: number };

type ChartDot = {
  id: string;
  entryId: string;
  kind: 'weight' | 'bodyFat';
  left: number;
  top: number;
  label: string;
};

const RECENT_INITIAL_LIMIT = 10;
const RECENT_PAGE_SIZE = 10;
const CHART_POINT_LIMIT = 120;
const CHART_WIDTH = 320;
const CHART_HEIGHT = 164;
const CHART_PADDING_X = 18;
const CHART_PADDING_Y = 16;

const RANGE_OPTIONS: Array<{ id: BodyMetricsRange; labelKey: BodyMetricsRangeLabelKey }> = [
  { id: '1m', labelKey: 'bodyMetricsRange1MonthLabel' },
  { id: '3m', labelKey: 'bodyMetricsRange3MonthsLabel' },
  { id: '6m', labelKey: 'bodyMetricsRange6MonthsLabel' },
  { id: '1y', labelKey: 'bodyMetricsRange1YearLabel' },
  { id: 'all', labelKey: 'bodyMetricsRangeAllLabel' },
];

const parseBodyMetricDate = (value: string) => {
  const parsed = new Date(`${value}T12:00:00`);

  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const formatDateForDisplay = (formatter: Intl.DateTimeFormat, value: string) => {
  const parsed = parseBodyMetricDate(value);

  return parsed ? formatter.format(parsed) : value;
};

const isEntryReady = (draft: BodyMetricDraft) => {
  const weight = parseBodyMetricNumber(draft.weightKg);

  return Boolean(draft.date.trim()) && Number.isFinite(weight) && weight > 0;
};

const getRangeCutoff = (range: BodyMetricsRange) => {
  if (range === 'all') {
    return null;
  }

  const now = new Date();
  const cutoff = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 12);

  if (range === '1y') {
    cutoff.setFullYear(cutoff.getFullYear() - 1);
  } else if (range === '6m') {
    cutoff.setMonth(cutoff.getMonth() - 6);
  } else if (range === '3m') {
    cutoff.setMonth(cutoff.getMonth() - 3);
  } else {
    cutoff.setMonth(cutoff.getMonth() - 1);
  }

  return cutoff;
};

const getSeriesBounds = (values: number[]) => {
  if (values.length === 0) {
    return { min: 0, max: 1 };
  }

  const min = Math.min(...values);
  const max = Math.max(...values);

  if (min === max) {
    return { min: min - 1, max: max + 1 };
  }

  return { min, max };
};

const scalePoint = (index: number, total: number, value: number, min: number, max: number): ChartPoint => {
  const innerWidth = CHART_WIDTH - CHART_PADDING_X * 2;
  const innerHeight = CHART_HEIGHT - CHART_PADDING_Y * 2;
  const normalizedX = total <= 1 ? 0.5 : index / (total - 1);
  const normalizedY = (value - min) / (max - min || 1);

  return {
    x: CHART_PADDING_X + innerWidth * normalizedX,
    y: CHART_HEIGHT - CHART_PADDING_Y - innerHeight * normalizedY,
  };
};

const buildSeriesSegments = <T,>(
  entries: T[],
  getValue: (entry: T) => number | null,
  min: number,
  max: number,
) => {
  const segments: ChartPoint[][] = [];
  let currentSegment: ChartPoint[] = [];

  entries.forEach((entry, index) => {
    const value = getValue(entry);

    if (value == null || !Number.isFinite(value)) {
      if (currentSegment.length > 0) {
        segments.push(currentSegment);
        currentSegment = [];
      }

      return;
    }

    currentSegment.push(scalePoint(index, entries.length, value, min, max));
  });

  if (currentSegment.length > 0) {
    segments.push(currentSegment);
  }

  return segments;
};

const buildPathData = (points: ChartPoint[]) =>
  points.map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x.toFixed(1)} ${point.y.toFixed(1)}`).join(' ');

const buildRangeLabel = (messages: Messages, range: BodyMetricsRange) => {
  const option = RANGE_OPTIONS.find((item) => item.id === range);

  return option ? messages[option.labelKey] : messages.bodyMetricsRangeAllLabel;
};

const getPointX = (index: number, total: number) => {
  const innerWidth = CHART_WIDTH - CHART_PADDING_X * 2;
  const normalizedX = total <= 1 ? 0.5 : index / (total - 1);

  return CHART_PADDING_X + innerWidth * normalizedX;
};

const sampleChartEntries = (entries: ChartEntry[]) => {
  if (entries.length <= CHART_POINT_LIMIT) {
    return entries;
  }

  const indexes = new Set<number>();

  for (let index = 0; index < CHART_POINT_LIMIT; index += 1) {
    indexes.add(Math.round((index * (entries.length - 1)) / (CHART_POINT_LIMIT - 1)));
  }

  return Array.from(indexes)
    .sort((left, right) => left - right)
    .map((index) => entries[index]);
};

export function BodyScreen({ messages, locale }: BodyScreenProps) {
  const [entries, setEntries] = usePersistedState<BodyMetricEntry[]>(persistedState.bodyMetricEntries);
  const bodyHeightSpec = persistedState.bodyHeight;
  const [bodyHeight, setBodyHeight] = usePersistentState<string>(
    bodyHeightSpec.key,
    () => getLatestBodyMetricHeight(entries),
    bodyHeightSpec,
  );
  const [isEditingHeight, setIsEditingHeight] = useState(() => !bodyHeight.trim());
  const [heightDraft, setHeightDraft] = useState(() => bodyHeight.trim());
  const [draft, setDraft] = useState<BodyMetricDraft>(() => createBodyMetricDraft());
  const [editingEntryId, setEditingEntryId] = useState<string | null>(null);
  const [recentOpen, setRecentOpen] = useState(false);
  const [recentLimit, setRecentLimit] = useState(RECENT_INITIAL_LIMIT);
  const [range, setRange] = useState<BodyMetricsRange>('all');
  const [showBodyFat, setShowBodyFat] = useState(false);
  const [selectedChartEntryId, setSelectedChartEntryId] = useState<string | null>(null);
  const [hoverChartEntryId, setHoverChartEntryId] = useState<string | null>(null);

  const numberFormatter = useMemo(
    () => new Intl.NumberFormat(locale, { maximumFractionDigits: 1 }),
    [locale],
  );
  const dateFormatter = useMemo(() => new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }), [locale]);

  const latestEntry = entries[0] ?? null;
  const selectedHeight = bodyHeight.trim();
  const primaryButtonLabel = editingEntryId ? messages.bodyMetricsUpdateLabel : messages.bodyMetricsSaveLabel;
  const canSave = isEntryReady(draft);

  const formatPercent = (value: string) => {
    const parsed = parseBodyMetricNumber(value);

    if (!Number.isFinite(parsed)) {
      return '—';
    }

    return `${numberFormatter.format(parsed)}%`;
  };

  const formatBmi = (weightKg: string) => {
    if (!selectedHeight) {
      return '—';
    }

    const bmi = calculateBodyMetricBmi(weightKg, selectedHeight);

    return bmi == null ? '—' : numberFormatter.format(bmi);
  };

  const resetDraft = () => {
    setDraft(createBodyMetricDraft());
    setEditingEntryId(null);
  };

  useEffect(() => {
    if (!isEditingHeight) {
      setHeightDraft(bodyHeight.trim());
    }
  }, [bodyHeight, isEditingHeight]);

  const beginHeightEdit = () => {
    setHeightDraft(selectedHeight);
    setIsEditingHeight(true);
  };

  const cancelHeightEdit = () => {
    setHeightDraft(selectedHeight);
    setIsEditingHeight(false);
  };

  const saveHeight = () => {
    const nextHeight = heightDraft.trim();

    if (!nextHeight) {
      return;
    }

    setBodyHeight(nextHeight);
    setIsEditingHeight(false);
  };

  const canSaveHeight = (() => {
    const parsed = parseBodyMetricNumber(heightDraft);
    return Number.isFinite(parsed) && parsed > 0;
  })();

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!canSave) {
      return;
    }

    const nextEntry: BodyMetricEntry = {
      id: editingEntryId ?? `body-metric-${Date.now()}`,
      date: draft.date.trim(),
      weightKg: draft.weightKg.trim(),
      bodyFatPercent: draft.bodyFatPercent.trim(),
    };

    setEntries((current) => {
      const remaining = current.filter((entry) => entry.id !== editingEntryId && entry.date !== nextEntry.date);
      return sortBodyMetricEntries([nextEntry, ...remaining]);
    });
    resetDraft();
  };

  const beginEdit = (entry: BodyMetricEntry) => {
    setEditingEntryId(entry.id);
    setDraft({
      date: entry.date,
      weightKg: entry.weightKg,
      bodyFatPercent: entry.bodyFatPercent,
    });
  };

  const removeEntry = (entryId: string) => {
    setEntries((current) => sortBodyMetricEntries(current.filter((entry) => entry.id !== entryId)));

    if (editingEntryId === entryId) {
      resetDraft();
    }
  };

  const toggleRecentEntries = () => {
    if (recentOpen) {
      setRecentLimit(RECENT_INITIAL_LIMIT);
    }

    setRecentOpen((current) => !current);
  };

  const chartEntries = useMemo<ChartEntry[]>(() => {
    const cutoff = getRangeCutoff(range);

    return entries
      .map((entry) => {
        const date = parseBodyMetricDate(entry.date);

        if (!date) {
          return null;
        }

        const weight = parseBodyMetricNumber(entry.weightKg);
        const bodyFat = parseBodyMetricNumber(entry.bodyFatPercent);

        return {
          id: entry.id,
          date,
          weight: Number.isFinite(weight) && weight > 0 ? weight : null,
          bodyFat: Number.isFinite(bodyFat) && bodyFat >= 0 ? bodyFat : null,
        };
      })
      .filter((entry): entry is ChartEntry => Boolean(entry && (!cutoff || entry.date >= cutoff)))
      .sort((left, right) => left.date.getTime() - right.date.getTime());
  }, [entries, range]);

  useEffect(() => {
    const hasSelectedEntry = selectedChartEntryId ? chartEntries.some((entry) => entry.id === selectedChartEntryId) : false;
    const hasHoveredEntry = hoverChartEntryId ? chartEntries.some((entry) => entry.id === hoverChartEntryId) : false;

    if (!hasSelectedEntry) {
      setSelectedChartEntryId(null);
    }

    if (!hasHoveredEntry) {
      setHoverChartEntryId(null);
    }
  }, [chartEntries, hoverChartEntryId, selectedChartEntryId]);

  const latestChartEntry = chartEntries[chartEntries.length - 1] ?? null;
  const displayChartEntries = useMemo(() => sampleChartEntries(chartEntries), [chartEntries]);
  const visibleRecentEntries = useMemo(
    () => entries.slice(0, recentLimit),
    [entries, recentLimit],
  );
  const hasMoreRecentEntries = recentLimit < entries.length;

  const weightBounds = useMemo(
    () =>
      getSeriesBounds(displayChartEntries.map((entry) => entry.weight).filter((value): value is number => value != null)),
    [displayChartEntries],
  );
  const bodyFatBounds = useMemo(
    () =>
      getSeriesBounds(displayChartEntries.map((entry) => entry.bodyFat).filter((value): value is number => value != null)),
    [displayChartEntries],
  );

  const weightSegments = useMemo(
    () => buildSeriesSegments(displayChartEntries, (entry) => entry.weight, weightBounds.min, weightBounds.max),
    [displayChartEntries, weightBounds],
  );
  const bodyFatSegments = useMemo(
    () => buildSeriesSegments(displayChartEntries, (entry) => entry.bodyFat, bodyFatBounds.min, bodyFatBounds.max),
    [bodyFatBounds, displayChartEntries],
  );

  const chartDots = useMemo<ChartDot[]>(() => {
    if (displayChartEntries.length === 0) {
      return [];
    }

    return displayChartEntries.flatMap((entry, index) => {
      const left = (getPointX(index, displayChartEntries.length) / CHART_WIDTH) * 100;
      const dots: ChartDot[] = [];

      if (entry.weight != null) {
        const point = scalePoint(index, displayChartEntries.length, entry.weight, weightBounds.min, weightBounds.max);
        dots.push({
          id: `weight-${entry.id}`,
          entryId: entry.id,
          kind: 'weight',
          left,
          top: (point.y / CHART_HEIGHT) * 100,
          label: `${messages.weightLabel} ${numberFormatter.format(entry.weight)} kg`,
        });
      }

      if (showBodyFat && entry.bodyFat != null) {
        const point = scalePoint(index, displayChartEntries.length, entry.bodyFat, bodyFatBounds.min, bodyFatBounds.max);
        dots.push({
          id: `body-fat-${entry.id}`,
          entryId: entry.id,
          kind: 'bodyFat',
          left,
          top: (point.y / CHART_HEIGHT) * 100,
          label: `${messages.bodyMetricsBodyFatLabel} ${numberFormatter.format(entry.bodyFat)}%`,
        });
      }

      return dots;
    });
  }, [bodyFatBounds, displayChartEntries, messages.bodyMetricsBodyFatLabel, messages.weightLabel, numberFormatter, showBodyFat, weightBounds]);

  const activeChartEntryId = hoverChartEntryId ?? selectedChartEntryId;
  const activeChartEntry = activeChartEntryId ? chartEntries.find((entry) => entry.id === activeChartEntryId) ?? null : null;

  const chartBody = (
    <>
      <div className="body-metrics-chart-frame">
        <svg
          viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
          className="body-metrics-chart"
          role="img"
          aria-label={messages.bodyMetricsChartLabel}
        >
          <defs>
            <linearGradient id="body-metrics-weight-stroke" x1="0" x2="1" y1="0" y2="0">
              <stop offset="0%" stopColor="#22d3ee" />
              <stop offset="100%" stopColor="#14b8a6" />
            </linearGradient>
            <linearGradient id="body-metrics-body-fat-stroke" x1="0" x2="1" y1="0" y2="0">
              <stop offset="0%" stopColor="#fbbf24" />
              <stop offset="100%" stopColor="#fb7185" />
            </linearGradient>
          </defs>

          <rect x="0" y="0" width={CHART_WIDTH} height={CHART_HEIGHT} rx="20" fill="rgba(15, 23, 42, 0.38)" />

          {[0.25, 0.5, 0.75].map((ratio) => (
            <line
              key={ratio}
              x1={CHART_PADDING_X}
              x2={CHART_WIDTH - CHART_PADDING_X}
              y1={CHART_PADDING_Y + (CHART_HEIGHT - CHART_PADDING_Y * 2) * ratio}
              y2={CHART_PADDING_Y + (CHART_HEIGHT - CHART_PADDING_Y * 2) * ratio}
              stroke="rgba(255, 255, 255, 0.08)"
              strokeDasharray="4 6"
            />
          ))}

          {weightSegments.map((segment, segmentIndex) => (
            <g key={`weight-${segmentIndex}`}>
              <path
                d={buildPathData(segment)}
                fill="none"
                stroke="url(#body-metrics-weight-stroke)"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {segment.map((point, pointIndex) => (
                <circle
                  key={`weight-point-${segmentIndex}-${pointIndex}`}
                  cx={point.x}
                  cy={point.y}
                  r="3.5"
                  fill="#7dd3fc"
                  stroke="#0f172a"
                  strokeWidth="2"
                />
              ))}
            </g>
          ))}

          {showBodyFat
            ? bodyFatSegments.map((segment, segmentIndex) => (
                <g key={`body-fat-${segmentIndex}`}>
                  <path
                    d={buildPathData(segment)}
                    fill="none"
                    stroke="url(#body-metrics-body-fat-stroke)"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeDasharray="7 5"
                  />
                  {segment.map((point, pointIndex) => (
                    <circle
                      key={`body-fat-point-${segmentIndex}-${pointIndex}`}
                      cx={point.x}
                      cy={point.y}
                      r="3.2"
                      fill="#fde68a"
                      stroke="#0f172a"
                      strokeWidth="2"
                    />
                  ))}
                </g>
              ))
            : null}
        </svg>

        <div className="body-metrics-chart-points">
          {chartDots.map((dot) => (
            <button
              key={dot.id}
              type="button"
              className={`body-metrics-chart-point ${dot.kind} ${activeChartEntryId === dot.entryId ? 'is-active' : ''}`}
              style={{ left: `${dot.left}%`, top: `${dot.top}%` }}
              onClick={() => setSelectedChartEntryId(dot.entryId)}
              onPointerEnter={() => setHoverChartEntryId(dot.entryId)}
              onPointerLeave={() => setHoverChartEntryId((current) => (current === dot.entryId ? null : current))}
              onFocus={() => setHoverChartEntryId(dot.entryId)}
              onBlur={() => setHoverChartEntryId((current) => (current === dot.entryId ? null : current))}
              aria-pressed={activeChartEntryId === dot.entryId}
              aria-label={dot.label}
              title={dot.label}
            >
              <span className="body-metrics-chart-point-core" />
            </button>
          ))}
        </div>

        {chartEntries.length === 0 ? (
          <div className="body-metrics-chart-empty-overlay">
            <p>{messages.bodyMetricsChartEmptyLabel}</p>
          </div>
        ) : null}

        {activeChartEntry ? (
          <div className="body-metrics-chart-detail" aria-live="polite">
            <p className="body-metrics-chart-detail-kicker">{dateFormatter.format(activeChartEntry.date)}</p>
            <div className="body-metrics-chart-detail-list">
              <div className="body-metrics-chart-detail-row">
                <span>{messages.weightLabel}</span>
                <strong>{activeChartEntry.weight != null ? `${numberFormatter.format(activeChartEntry.weight)} kg` : '—'}</strong>
              </div>
              {activeChartEntry.bodyFat != null ? (
                <div className="body-metrics-chart-detail-row">
                  <span>{messages.bodyMetricsBodyFatLabel}</span>
                  <strong>{`${numberFormatter.format(activeChartEntry.bodyFat)}%`}</strong>
                </div>
              ) : null}
            </div>
          </div>
        ) : null}
      </div>

      {chartEntries.length > 0 ? (
        <div className="body-metrics-chart-legend">
          <div className="body-metrics-chart-pill">
            <span className="body-metrics-chart-swatch is-weight" aria-hidden="true" />
            <span>{messages.weightLabel}</span>
            <strong>{latestChartEntry?.weight != null ? `${numberFormatter.format(latestChartEntry.weight)} kg` : '—'}</strong>
          </div>
          <div className="body-metrics-chart-pill">
            <span className="body-metrics-chart-swatch is-body-fat" aria-hidden="true" />
            <span>{messages.bodyMetricsBodyFatLabel}</span>
            <strong>{latestChartEntry?.bodyFat != null ? `${numberFormatter.format(latestChartEntry.bodyFat)}%` : '—'}</strong>
          </div>
        </div>
      ) : null}

      <button
        type="button"
        className={`sound-switch body-metrics-series-toggle ${showBodyFat ? 'is-on' : ''}`}
        onClick={() => setShowBodyFat((current) => !current)}
        aria-pressed={showBodyFat}
        aria-label={messages.bodyMetricsBodyFatToggleLabel}
      >
        <span className="sound-switch-track">
          <span className="sound-switch-thumb" />
        </span>
        <span className="sound-switch-text">{messages.bodyMetricsBodyFatToggleLabel}</span>
        <span className="body-metrics-series-state">{showBodyFat ? messages.onLabel : messages.offLabel}</span>
      </button>
    </>
  );

  return (
    <section className="panel body-panel view-stage">
      <div className="headline body-headline">
        <div className="body-title-wrap">
          <span className="body-title-icon" aria-hidden="true">
            <BodyIcon />
          </span>
          <div className="body-title-copy">
            <h1>{messages.bodyTitleLabel}</h1>
            <p>{messages.bodySubtitleLabel}</p>
          </div>
        </div>
      </div>

      <div className="body-metrics-stack">
        <section className="body-metrics-card body-metrics-current-card">
          <p className="body-metrics-kicker">{messages.bodyMetricsCurrentLabel}</p>
          {latestEntry ? (
            <div className="body-metrics-summary">
              <strong className="body-metrics-summary-date">{formatDateForDisplay(dateFormatter, latestEntry.date)}</strong>
              <div className="body-metrics-summary-list">
                <div className="body-metrics-summary-row">
                  <span>{messages.weightLabel}</span>
                  <strong>{`${numberFormatter.format(parseBodyMetricNumber(latestEntry.weightKg))} kg`}</strong>
                </div>
                <div className="body-metrics-summary-row">
                  <span>{messages.bodyMetricsBodyFatLabel}</span>
                  <strong>{latestEntry.bodyFatPercent ? formatPercent(latestEntry.bodyFatPercent) : '—'}</strong>
                </div>
                <div className="body-metrics-summary-row">
                  <span>{messages.bodyMetricsBmiLabel}</span>
                  <strong>{formatBmi(latestEntry.weightKg)}</strong>
                </div>
              </div>
            </div>
          ) : (
            <p className="body-metrics-empty">{messages.bodyMetricsEmptyLabel}</p>
          )}
        </section>

        <section className="body-metrics-card body-metrics-height-card">
          {isEditingHeight ? (
            <div className="body-metrics-height-editor">
              <label className="editor-label body-metrics-field">
                <span>{messages.bodyMetricsHeightLabel}</span>
                <input
                  type="number"
                  inputMode="decimal"
                  min="1"
                  step="0.1"
                  value={heightDraft}
                  onChange={(event) => setHeightDraft(event.target.value)}
                  placeholder="cm"
                />
              </label>
              <div className="body-metrics-height-actions">
                <button type="button" className="body-metrics-save-button" onClick={saveHeight} disabled={!canSaveHeight}>
                  {messages.bodyMetricsSaveLabel}
                </button>
                {selectedHeight ? (
                  <button type="button" className="body-metrics-cancel-button" onClick={cancelHeightEdit}>
                    {messages.cancelLabel}
                  </button>
                ) : null}
              </div>
            </div>
          ) : (
            <div className="body-metrics-height-display">
              <div className="body-metrics-height-chip">
                <span>{messages.bodyMetricsHeightLabel}</span>
                <strong>{selectedHeight ? `${numberFormatter.format(parseBodyMetricNumber(selectedHeight))} cm` : '—'}</strong>
              </div>
              <button type="button" className="body-metrics-height-edit-button" onClick={beginHeightEdit}>
                {messages.editLabel}
              </button>
            </div>
          )}
        </section>

        <section className="body-metrics-card body-metrics-chart-card">
          <div className="body-metrics-card-head">
            <div>
              <p className="body-metrics-kicker">{messages.bodyMetricsChartLabel}</p>
              <strong className="body-metrics-card-title">{buildRangeLabel(messages, range)}</strong>
            </div>
            <div className="body-metrics-range-grid">
              {RANGE_OPTIONS.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  className={`body-metrics-range-button ${range === option.id ? 'is-active' : ''}`}
                  onClick={() => setRange(option.id)}
                  aria-pressed={range === option.id}
                >
                  {messages[option.labelKey]}
                </button>
              ))}
            </div>
          </div>

          {chartBody}
        </section>

        <section className="body-metrics-card body-metrics-form-card">
          <p className="body-metrics-kicker">{primaryButtonLabel}</p>
          <form className="body-metrics-form" onSubmit={(event) => void handleSubmit(event)}>
            <label className="editor-label body-metrics-field">
              <span>{messages.bodyMetricsDateLabel}</span>
              <input
                type="date"
                value={draft.date}
                onChange={(event) => setDraft((current) => ({ ...current, date: event.target.value }))}
                required
              />
              <p className="body-metrics-field-hint">{messages.bodyMetricsDateHint}</p>
            </label>

            <label className="editor-label body-metrics-field">
              <span>{messages.weightLabel}</span>
              <input
                type="number"
                inputMode="decimal"
                min="0.1"
                step="0.1"
                value={draft.weightKg}
                onChange={(event) => setDraft((current) => ({ ...current, weightKg: event.target.value }))}
                placeholder="0.0"
                required
              />
            </label>

            <label className="editor-label body-metrics-field">
              <span>{messages.bodyMetricsBodyFatLabel}</span>
              <input
                type="number"
                inputMode="decimal"
                min="0"
                max="100"
                step="0.1"
                value={draft.bodyFatPercent}
                onChange={(event) =>
                  setDraft((current) => ({ ...current, bodyFatPercent: event.target.value }))
                }
                placeholder="%"
              />
            </label>

            <div className="body-metrics-actions">
              <button type="submit" className="body-metrics-save-button" disabled={!canSave}>
                {primaryButtonLabel}
              </button>
              {editingEntryId ? (
                <button type="button" className="body-metrics-cancel-button" onClick={resetDraft}>
                  {messages.cancelLabel}
                </button>
              ) : null}
            </div>
          </form>
        </section>

        <section className="body-metrics-card body-metrics-recent-card">
          <button
            type="button"
            className="body-metrics-recent-toggle"
            onClick={toggleRecentEntries}
            aria-expanded={recentOpen}
            aria-controls="body-recent-list"
          >
            <span className="body-metrics-kicker">{messages.bodyMetricsRecentLabel}</span>
            <span className="body-metrics-recent-toggle-state">{recentOpen ? messages.collapseLabel : messages.expandLabel}</span>
          </button>

          {recentOpen ? (
            <>
              {visibleRecentEntries.length > 0 ? (
                <div id="body-recent-list" className="body-metrics-entry-list">
                  {visibleRecentEntries.map((entry, index) => {
                    const bmi = calculateBodyMetricBmi(entry.weightKg, selectedHeight);
                    const details = [
                      `${numberFormatter.format(parseBodyMetricNumber(entry.weightKg))} kg`,
                      entry.bodyFatPercent ? formatPercent(entry.bodyFatPercent) : null,
                      `BMI ${bmi == null ? '—' : numberFormatter.format(bmi)}`,
                    ].filter((value): value is string => Boolean(value));

                    return (
                      <article key={entry.id} className={`body-metrics-entry ${index === 0 ? 'is-current' : ''}`}>
                        <div className="body-metrics-entry-copy">
                          <strong>{formatDateForDisplay(dateFormatter, entry.date)}</strong>
                          <span>{details.join(' · ')}</span>
                        </div>

                        <div className="body-metrics-entry-actions">
                          <button type="button" className="body-metrics-edit-button" onClick={() => beginEdit(entry)}>
                            <CogIcon />
                            <span>{messages.editLabel}</span>
                          </button>
                          <button
                            type="button"
                            className="body-metrics-remove-button"
                            onClick={() => removeEntry(entry.id)}
                          >
                            {messages.bodyMetricsRemoveLabel}
                          </button>
                        </div>
                      </article>
                    );
                  })}
                </div>
              ) : (
                <p className="body-metrics-empty" id="body-recent-list">
                  {messages.bodyMetricsEmptyLabel}
                </p>
              )}

              {hasMoreRecentEntries ? (
                <button
                  type="button"
                  className="body-metrics-load-more-button"
                  onClick={() => setRecentLimit((current) => Math.min(current + RECENT_PAGE_SIZE, entries.length))}
                >
                  {messages.bodyMetricsLoadMoreLabel}
                </button>
              ) : null}
            </>
          ) : null}
        </section>

      </div>
    </section>
  );
}
