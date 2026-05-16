export function RunMeta({
  kicker,
  roundLabel,
  roundProgress,
}: {
  kicker: string;
  roundLabel: string;
  roundProgress: number;
}) {
  return (
    <div className="run-meta">
      <div className="run-meta-copy">
        <p className="eyebrow">{kicker}</p>
        <div className="round-progress" aria-hidden="true">
          <div className="round-progress-fill" style={{ transform: `scaleX(${roundProgress})` }} />
        </div>
      </div>
      <p className="round-pill">{roundLabel}</p>
    </div>
  );
}
