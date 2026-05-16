import { useCallback, useEffect, useState } from 'react';
import { isIosInstallable, isStandaloneMode } from '../timer/platform';
import type { InstallPromptEvent } from '../timer/types';

export function useInstallPrompt({ onFallbackPrompt }: { onFallbackPrompt: () => void }) {
  const [installPromptEvent, setInstallPromptEvent] = useState<InstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(() => isStandaloneMode());
  const [isIosInstallPromptAvailable, setIsIosInstallPromptAvailable] = useState(
    () => !isStandaloneMode() && isIosInstallable(),
  );

  useEffect(() => {
    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setInstallPromptEvent(event as InstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setInstallPromptEvent(null);
      setIsInstalled(true);
      setIsIosInstallPromptAvailable(false);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt as EventListener);
    window.addEventListener('appinstalled', handleAppInstalled);

    const syncInstallState = () => {
      const standalone = isStandaloneMode();
      setIsInstalled(standalone);
      setIsIosInstallPromptAvailable(!standalone && isIosInstallable());
    };

    const mediaQuery = window.matchMedia('(display-mode: standalone)');

    syncInstallState();
    mediaQuery.addEventListener?.('change', syncInstallState);
    document.addEventListener('visibilitychange', syncInstallState);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt as EventListener);
      window.removeEventListener('appinstalled', handleAppInstalled);
      mediaQuery.removeEventListener?.('change', syncInstallState);
      document.removeEventListener('visibilitychange', syncInstallState);
    };
  }, []);

  const requestInstall = useCallback(async () => {
    if (installPromptEvent) {
      await installPromptEvent.prompt();
      const { outcome } = await installPromptEvent.userChoice;

      if (outcome === 'accepted') {
        setIsInstalled(true);
      } else {
        setInstallPromptEvent(null);
      }

      return;
    }

    onFallbackPrompt();
  }, [installPromptEvent, onFallbackPrompt]);

  return {
    canInstall: !isInstalled || isIosInstallPromptAvailable,
    requestInstall,
  };
}
