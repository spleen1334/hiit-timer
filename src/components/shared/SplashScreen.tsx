type SplashScreenProps = {
  appName: string;
  isHiding?: boolean;
};

const splashIconSrc = `${import.meta.env.BASE_URL}icon.svg`;

export function SplashScreen({ appName, isHiding = false }: SplashScreenProps) {
  return (
    <div className={`splash-screen ${isHiding ? 'is-hiding' : ''}`.trim()} role="status" aria-live="polite" aria-label={appName}>
      <div className="splash-grid" aria-hidden="true" />
      <div className="splash-glow splash-glow-a" aria-hidden="true" />
      <div className="splash-glow splash-glow-b" aria-hidden="true" />
      <div className="splash-glow splash-glow-c" aria-hidden="true" />

      <div className="splash-stage">
        <div className="splash-orbit splash-orbit-a" aria-hidden="true" />
        <div className="splash-orbit splash-orbit-b" aria-hidden="true" />
        <div className="splash-orbit splash-orbit-c" aria-hidden="true" />

        <div className="splash-logo-shell">
          <div className="splash-logo-frame" aria-hidden="true" />
          <img className="splash-logo" src={splashIconSrc} alt="" aria-hidden="true" />
          <div className="splash-scan" aria-hidden="true" />
        </div>

        <div className="splash-particles" aria-hidden="true">
          <span />
          <span />
          <span />
          <span />
          <span />
          <span />
        </div>
      </div>
    </div>
  );
}
