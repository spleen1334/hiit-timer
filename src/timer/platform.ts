export const isStandaloneMode = () =>
  window.matchMedia('(display-mode: standalone)').matches ||
  (window.navigator as Navigator & { standalone?: boolean }).standalone === true;

export const isIosInstallable = () => {
  const userAgent = window.navigator.userAgent;
  const isAppleMobile = /iphone|ipad|ipod/i.test(userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const isSafari = /safari/i.test(userAgent) && !/crios|fxios|edgios|android/i.test(userAgent);

  return isAppleMobile && isSafari;
};

export const canVibrate = () => 'vibrate' in navigator;

export const canRequestWakeLock = () => 'wakeLock' in navigator;
