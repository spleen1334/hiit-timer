import { useEffect, useMemo, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import type { Messages } from '../../i18n';
import { useBodyData } from '../../hooks/useBodyData';
import {
  calculateBodyMetricBmi,
  createBodyMetricDraft,
  parseBodyMetricNumber,
  sortBodyMetricEntries,
  type BodyMetricDraft,
  type BodyMetricEntry,
} from '../../body/bodyMetrics';
import { CogIcon } from '../shared/icons';

type BodyScreenProps = {
  messages: Messages;
  locale: string;
};

type BodyMetricsRange = '1m' | '3m' | '6m' | '1y';

type BodyMetricsRangeLabelKey =
  | 'bodyMetricsRange1MonthLabel'
  | 'bodyMetricsRange3MonthsLabel'
  | 'bodyMetricsRange6MonthsLabel'
  | 'bodyMetricsRange1YearLabel';

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
const CHART_HEIGHT = 220;
const CHART_PADDING_X = 18;
const CHART_PADDING_Y = 16;

const RANGE_OPTIONS: Array<{ id: BodyMetricsRange; labelKey: BodyMetricsRangeLabelKey }> = [
  { id: '1m', labelKey: 'bodyMetricsRange1MonthLabel' },
  { id: '3m', labelKey: 'bodyMetricsRange3MonthsLabel' },
  { id: '6m', labelKey: 'bodyMetricsRange6MonthsLabel' },
  { id: '1y', labelKey: 'bodyMetricsRange1YearLabel' },
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

const getMonthKey = (date = new Date()) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

const getMonthDate = (monthKey: string) => {
  const [year, month] = monthKey.split('-').map(Number);
  return new Date(year, month - 1, 1, 12);
};

const shiftMonth = (monthKey: string, offset: number) => {
  const next = getMonthDate(monthKey);
  next.setMonth(next.getMonth() + offset);
  return getMonthKey(next);
};

const getRangeMonths = (range: BodyMetricsRange) => {
  if (range === '1y') return 12;
  if (range === '6m') return 6;
  if (range === '3m') return 3;
  return 1;
};

const getRangeBounds = (anchorMonth: string, range: BodyMetricsRange, currentMonth: string) => {
  const start = getMonthDate(shiftMonth(anchorMonth, -(getRangeMonths(range) - 1)));
  const anchorDate = getMonthDate(anchorMonth);
  const now = new Date();
  const end = anchorMonth === currentMonth
    ? new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999)
    : new Date(anchorDate.getFullYear(), anchorDate.getMonth() + 1, 0, 23, 59, 59, 999);

  return { start, end };
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

  return option ? messages[option.labelKey] : messages.bodyMetricsRange1MonthLabel;
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
  const { entries, height: bodyHeight, age: bodyAge, ready, error: bodyDataError, setEntries, setProfile } = useBodyData();
  const [draft, setDraft] = useState<BodyMetricDraft>(() => createBodyMetricDraft());
  const [profileDraft, setProfileDraft] = useState({ height: '', age: '' });
  const [editingEntryId, setEditingEntryId] = useState<string | null>(null);
  const [recentOpen, setRecentOpen] = useState(false);
  const [recentLimit, setRecentLimit] = useState(RECENT_INITIAL_LIMIT);
  const [range, setRange] = useState<BodyMetricsRange>('1m');
  const [anchorMonth, setAnchorMonth] = useState(() => getMonthKey());
  const [chartPopulationKey, setChartPopulationKey] = useState(0);
  const [isChartPopulationActive, setIsChartPopulationActive] = useState(false);
  const [showBodyFat, setShowBodyFat] = useState(false);
  const [selectedChartEntryId, setSelectedChartEntryId] = useState<string | null>(null);
  const [hoverChartEntryId, setHoverChartEntryId] = useState<string | null>(null);
  const [isMeasurementSheetOpen, setIsMeasurementSheetOpen] = useState(false);
  const [isProfileSheetOpen, setIsProfileSheetOpen] = useState(false);
  const measurementSheetRef = useRef<HTMLElement | null>(null);
  const measurementTriggerRef = useRef<HTMLButtonElement | null>(null);
  const profileDraftInitializedRef = useRef(false);


  const numberFormatter = useMemo(
    () => new Intl.NumberFormat(locale, { maximumFractionDigits: 1 }),
    [locale],
  );
  const dateFormatter = useMemo(() => new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }), [locale]);

  const selectedHeight = bodyHeight.trim();
  const currentMonth = getMonthKey();
  const anchorMonthLabel = useMemo(
    () => new Intl.DateTimeFormat(locale, { month: 'long', year: 'numeric' }).format(getMonthDate(anchorMonth)),
    [anchorMonth, locale],
  );
  const primaryButtonLabel = editingEntryId ? messages.bodyMetricsUpdateLabel : messages.bodyMetricsSaveLabel;
  const canSave = isEntryReady(draft);
  const isAnySheetOpen = isMeasurementSheetOpen || isProfileSheetOpen;

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

  const discardMeasurementDraft = () => {
    resetDraft();
    setIsMeasurementSheetOpen(false);
  };

  const dismissMeasurementSheet = () => {
    setIsMeasurementSheetOpen(false);
  };

  const dismissProfileSheet = () => {
    setIsProfileSheetOpen(false);
  };

  useEffect(() => {
    if (isAnySheetOpen) {
      window.requestAnimationFrame(() => {
        const firstControl = measurementSheetRef.current?.querySelector<HTMLElement>(
          'input:not([disabled]), button:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
        );
        (firstControl ?? measurementSheetRef.current)?.focus();
      });
      return;
    }

    if (measurementTriggerRef.current?.isConnected) {
      measurementTriggerRef.current.focus();
    }
  }, [isAnySheetOpen]);

  useEffect(() => {
    if (!isAnySheetOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        setIsMeasurementSheetOpen(false);
        setIsProfileSheetOpen(false);
        return;
      }

      if (event.key !== 'Tab' || !measurementSheetRef.current) {
        return;
      }

      const focusable = Array.from(
        measurementSheetRef.current.querySelectorAll<HTMLElement>(
          'input:not([disabled]), button:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ),
      );

      if (focusable.length === 0) {
        event.preventDefault();
        measurementSheetRef.current.focus();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    const handleFocusIn = (event: FocusEvent) => {
      if (measurementSheetRef.current?.contains(event.target as Node)) {
        return;
      }

      const firstControl = measurementSheetRef.current?.querySelector<HTMLElement>(
        'input:not([disabled]), button:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      (firstControl ?? measurementSheetRef.current)?.focus();
    };

    window.addEventListener('keydown', handleKeyDown);
    document.addEventListener('focusin', handleFocusIn);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('focusin', handleFocusIn);
    };
  }, [isAnySheetOpen]);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => setIsChartPopulationActive(true));

    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    setRecentLimit(RECENT_INITIAL_LIMIT);
  }, [anchorMonth, range]);

  const openProfileSheet = (trigger: HTMLButtonElement) => {
    measurementTriggerRef.current = trigger;
    if (!profileDraftInitializedRef.current) {
      setProfileDraft({ height: selectedHeight, age: bodyAge.trim() });
      profileDraftInitializedRef.current = true;
    }
    setIsProfileSheetOpen(true);
  };

  const discardProfileDraft = () => {
    setProfileDraft({ height: selectedHeight, age: bodyAge.trim() });
    profileDraftInitializedRef.current = false;
    setIsProfileSheetOpen(false);
  };

  const saveProfile = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await setProfile({ height: profileDraft.height.trim(), age: profileDraft.age.trim() });
    profileDraftInitializedRef.current = false;
    setIsProfileSheetOpen(false);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
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

    await setEntries((current) => {
      const remaining = current.filter((entry) => entry.id !== editingEntryId && entry.date !== nextEntry.date);
      return sortBodyMetricEntries([nextEntry, ...remaining]);
    });
    discardMeasurementDraft();
    setChartPopulationKey((current) => current + 1);
  };

  const beginEdit = (entry: BodyMetricEntry, trigger: HTMLButtonElement) => {
    measurementTriggerRef.current = trigger;
    setEditingEntryId(entry.id);
    setDraft({
      date: entry.date,
      weightKg: entry.weightKg,
      bodyFatPercent: entry.bodyFatPercent,
    });
    setIsMeasurementSheetOpen(true);
  };

  const removeEntry = async (entryId: string) => {
    await setEntries((current) => sortBodyMetricEntries(current.filter((entry) => entry.id !== entryId)));

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

  const filteredEntries = useMemo(() => {
    const { start, end } = getRangeBounds(anchorMonth, range, currentMonth);

    return entries
      .filter((entry) => {
        const date = parseBodyMetricDate(entry.date);
        return Boolean(date && date >= start && date <= end);
      });
  }, [anchorMonth, currentMonth, entries, range]);

  const latestEntry = filteredEntries[0] ?? null;

  const chartEntries = useMemo<ChartEntry[]>(
    () =>
      filteredEntries
        .map((entry) => {
          const date = parseBodyMetricDate(entry.date);
          const weight = parseBodyMetricNumber(entry.weightKg);
          const bodyFat = parseBodyMetricNumber(entry.bodyFatPercent);

          if (!date) {
            return null;
          }

          return {
            id: entry.id,
            date,
            weight: Number.isFinite(weight) && weight > 0 ? weight : null,
            bodyFat: Number.isFinite(bodyFat) && bodyFat >= 0 ? bodyFat : null,
          };
        })
        .filter((entry): entry is ChartEntry => Boolean(entry))
        .sort((left, right) => left.date.getTime() - right.date.getTime()),
    [filteredEntries],
  );

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
    () => filteredEntries.slice(0, recentLimit),
    [filteredEntries, recentLimit],
  );
  const hasMoreRecentEntries = recentLimit < filteredEntries.length;
  const canGoNextMonth = anchorMonth < currentMonth;

  const moveAnchorMonth = (offset: number) => {
    const next = shiftMonth(anchorMonth, offset);

    if ((offset > 0 && next > currentMonth) || next === anchorMonth) {
      return;
    }

    setAnchorMonth(next);
    setChartPopulationKey((current) => current + 1);
  };

  const selectRange = (nextRange: BodyMetricsRange) => {
    if (nextRange === range) {
      return;
    }

    setRange(nextRange);
    setChartPopulationKey((current) => current + 1);
  };

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
          key={`chart-svg-${chartPopulationKey}`}
          viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
          className={`body-metrics-chart ${isChartPopulationActive ? 'is-populating' : ''}`}
          role="img"
          aria-label={messages.bodyMetricsGraphLabel}
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
              className={`body-metrics-grid-line body-metrics-grid-line-${ratio * 100}`}
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
                className="body-metrics-series-path"
                pathLength={1}
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
                  className="body-metrics-series-point"
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
                    className="body-metrics-series-path body-metrics-series-path-body-fat"
                    pathLength={1}
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
                      className="body-metrics-series-point body-metrics-series-point-body-fat"
                      fill="#fde68a"
                      stroke="#0f172a"
                      strokeWidth="2"
                    />
                  ))}
                </g>
              ))
            : null}
        </svg>

        <div key={`chart-points-${chartPopulationKey}`} className="body-metrics-chart-points">
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

      <div className="body-metrics-chart-legend">
        <div className="body-metrics-chart-pill">
          <span className="body-metrics-chart-swatch is-weight" aria-hidden="true" />
          <span>{messages.weightLabel}</span>
          <strong>{latestChartEntry?.weight != null ? `${numberFormatter.format(latestChartEntry.weight)} kg` : '—'}</strong>
        </div>
        {showBodyFat ? (
          <div className="body-metrics-chart-pill">
            <span className="body-metrics-chart-swatch is-body-fat" aria-hidden="true" />
            <span>{messages.bodyMetricsBodyFatLabel}</span>
            <strong>{latestChartEntry?.bodyFat != null ? `${numberFormatter.format(latestChartEntry.bodyFat)}%` : '—'}</strong>
          </div>
        ) : null}
      </div>

    </>
  );

  if (!ready || bodyDataError) return null;

  return (
    <section className="panel body-panel view-stage">
      <div className="headline mode-headline">
          <div className="mode-header-copy">
            <p className="screen-hero-kicker">{messages.bodyTabLabel}</p>
            <h1>{messages.bodyTitleLabel}</h1>
          </div>
      </div>

      <div className="body-metrics-stack">
        <div className="body-metrics-top">
        <section className="body-metrics-card body-metrics-chart-card">
          <div className="body-metrics-card-head">
            <div>
              <p className="body-metrics-kicker">{messages.bodyMetricsGraphLabel}</p>
            </div>
            <div className="body-metrics-chart-controls">
              <div className="body-metrics-month-nav" aria-label={messages.bodyMetricsMonthNavigationLabel}>
                  <button
                    type="button"
                    className="body-metrics-month-button"
                    onClick={() => moveAnchorMonth(-1)}
                    aria-label={messages.bodyMetricsPreviousMonthLabel}
                    title={messages.bodyMetricsPreviousMonthLabel}
                  >
                    <span className="body-metrics-month-icon body-metrics-month-icon-previous" aria-hidden="true" />
                  </button>
                  <span className="body-metrics-month-anchor" aria-live="polite">{anchorMonthLabel}</span>
                  <button
                    type="button"
                    className="body-metrics-month-button"
                    onClick={() => moveAnchorMonth(1)}
                    disabled={!canGoNextMonth}
                    aria-label={messages.bodyMetricsNextMonthLabel}
                    title={messages.bodyMetricsNextMonthLabel}
                  >
                    <span className="body-metrics-month-icon body-metrics-month-icon-next" aria-hidden="true" />
                  </button>
              </div>
              <div className="body-metrics-range-grid">
                  {RANGE_OPTIONS.map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      className={`body-metrics-range-button ${range === option.id ? 'is-active' : ''}`}
                      onClick={() => selectRange(option.id)}
                      aria-pressed={range === option.id}
                    >
                      {messages[option.labelKey]}
                    </button>
                  ))}
              </div>
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
                <span className="body-metrics-series-toggle-label">{messages.bodyMetricsBodyFatToggleLabel}</span>
                <span className="body-metrics-series-state">{showBodyFat ? messages.onLabel : messages.offLabel}</span>
              </button>
            </div>
          </div>

          {chartBody}
        </section>

        <section className="body-metrics-card body-metrics-form-card">
          <button
            ref={measurementTriggerRef}
            type="button"
            className="body-metrics-add-button"
            onClick={(event) => {
              measurementTriggerRef.current = event.currentTarget;
              setIsMeasurementSheetOpen(true);
            }}
          >
            <span aria-hidden="true">+</span>
            <span>{messages.bodyMetricsAddLabel}</span>
          </button>
        </section>

        </div>

        <button
          type="button"
          className="body-metrics-card body-metrics-current-card body-metrics-stats-card"
          onClick={(event) => openProfileSheet(event.currentTarget)}
          aria-label={messages.bodyMetricsStatsLabel}
        >
          <div className="body-metrics-stats-head">
            <p className="body-metrics-kicker">{messages.bodyMetricsStatsLabel}</p>
            <span className="body-metrics-stats-edit">{messages.editLabel}</span>
          </div>
          <div className="body-metrics-summary-list body-metrics-stats-list">
            <div className="body-metrics-summary-row">
              <span>{messages.weightLabel}</span>
              <strong>{latestEntry?.weightKg ? `${numberFormatter.format(parseBodyMetricNumber(latestEntry.weightKg))} kg` : '—'}</strong>
            </div>
            <div className="body-metrics-summary-row">
              <span>{messages.bodyMetricsBodyFatLabel}</span>
              <strong>{latestEntry?.bodyFatPercent ? formatPercent(latestEntry.bodyFatPercent) : '—'}</strong>
            </div>
            <div className="body-metrics-summary-row">
              <span>{messages.bodyMetricsBmiLabel}</span>
              <strong>{formatBmi(latestEntry?.weightKg ?? '')}</strong>
            </div>
            <div className="body-metrics-summary-row">
              <span>{messages.bodyMetricsHeightLabel}</span>
              <strong>{selectedHeight ? `${numberFormatter.format(parseBodyMetricNumber(selectedHeight))} cm` : '—'}</strong>
            </div>
            <div className="body-metrics-summary-row">
              <span>{messages.bodyMetricsAgeLabel}</span>
              <strong>{bodyAge.trim() || '—'}</strong>
            </div>
          </div>
        </button>

        <section className="body-metrics-card body-metrics-recent-card">
          <button
            type="button"
            className="body-metrics-recent-toggle"
            onClick={toggleRecentEntries}
            aria-expanded={recentOpen}
            aria-controls="body-recent-list"
          >
            <span className="body-metrics-kicker">
              {messages.bodyMetricsRecentLabel} · {filteredEntries.length}
            </span>
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
                          <button type="button" className="body-metrics-edit-button" onClick={(event) => beginEdit(entry, event.currentTarget)}>
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
                  onClick={() => setRecentLimit((current) => Math.min(current + RECENT_PAGE_SIZE, filteredEntries.length))}
                >
                  {messages.bodyMetricsLoadMoreLabel}
                </button>
              ) : null}
            </>
          ) : null}
        </section>

      </div>

      {isMeasurementSheetOpen ? (
        <div className="body-metrics-sheet-overlay" role="presentation">
          <section
            className="body-metrics-sheet"
            role="dialog"
            aria-modal="true"
            aria-labelledby="body-metrics-sheet-title"
            ref={measurementSheetRef}
            tabIndex={-1}
          >
            <div className="body-metrics-sheet-handle" aria-hidden="true" />
            <div className="body-metrics-sheet-head">
              <div>
                <p className="body-metrics-kicker">{editingEntryId ? messages.bodyMetricsUpdateLabel : messages.bodyMetricsSaveLabel}</p>
                <h2 id="body-metrics-sheet-title">{editingEntryId ? messages.bodyMetricsUpdateLabel : messages.bodyMetricsAddLabel}</h2>
              </div>
              <button type="button" className="body-metrics-sheet-close" onClick={dismissMeasurementSheet} aria-label={messages.cancelLabel}>
                ×
              </button>
            </div>
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
                  onChange={(event) => setDraft((current) => ({ ...current, bodyFatPercent: event.target.value }))}
                  placeholder="%"
                />
              </label>

              <div className="body-metrics-actions">
                <button type="submit" className="body-metrics-save-button" disabled={!canSave}>
                  {primaryButtonLabel}
                </button>
                <button type="button" className="body-metrics-cancel-button" onClick={discardMeasurementDraft}>
                  {messages.cancelLabel}
                </button>
              </div>
            </form>
          </section>
        </div>
      ) : null}

      {isProfileSheetOpen ? (
        <div className="body-metrics-sheet-overlay" role="presentation">
          <section
            className="body-metrics-sheet body-metrics-profile-sheet"
            role="dialog"
            aria-modal="true"
            aria-labelledby="body-metrics-profile-sheet-title"
            ref={measurementSheetRef}
            tabIndex={-1}
          >
            <div className="body-metrics-sheet-handle" aria-hidden="true" />
            <div className="body-metrics-sheet-head">
              <div>
                <p className="body-metrics-kicker">{messages.editLabel}</p>
                <h2 id="body-metrics-profile-sheet-title">{messages.bodyMetricsStatsLabel}</h2>
              </div>
              <button type="button" className="body-metrics-sheet-close" onClick={dismissProfileSheet} aria-label={messages.cancelLabel}>
                ×
              </button>
            </div>
            <form className="body-metrics-form" onSubmit={(event) => void saveProfile(event)}>
              <label className="editor-label body-metrics-field">
                <span>{messages.bodyMetricsHeightLabel}</span>
                <input
                  type="number"
                  inputMode="decimal"
                  min="1"
                  step="0.1"
                  value={profileDraft.height}
                  onChange={(event) => setProfileDraft((current) => ({ ...current, height: event.target.value }))}
                  placeholder="cm"
                />
              </label>

              <label className="editor-label body-metrics-field">
                <span>{messages.bodyMetricsAgeLabel}</span>
                <input
                  type="number"
                  inputMode="numeric"
                  min="1"
                  max="120"
                  step="1"
                  value={profileDraft.age}
                  onChange={(event) => setProfileDraft((current) => ({ ...current, age: event.target.value }))}
                  placeholder="—"
                />
              </label>

              <div className="body-metrics-actions">
                <button type="submit" className="body-metrics-save-button">
                  {messages.bodyMetricsSaveLabel}
                </button>
                <button type="button" className="body-metrics-cancel-button" onClick={discardProfileDraft}>
                  {messages.cancelLabel}
                </button>
              </div>
            </form>
          </section>
        </div>
      ) : null}
    </section>
  );
}
