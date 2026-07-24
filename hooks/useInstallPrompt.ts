import { useState, useEffect } from 'react';
import { Platform } from 'react-native';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

interface InstallPromptState {
  canInstall: boolean;
  isStandalone: boolean;
  prompt: BeforeInstallPromptEvent | null;
  updateAvailable: boolean;
}

export function useInstallPrompt(): InstallPromptState {
  const [state, setState] = useState<InstallPromptState>({
    canInstall: false,
    isStandalone: false,
    prompt: null,
    updateAvailable: false,
  });

  useEffect(() => {
    // Only run on web
    if (Platform.OS !== 'web') return;

    // Check if already standalone
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone ===
        true;

    let deferredPrompt: BeforeInstallPromptEvent | null = null;

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      deferredPrompt = e as BeforeInstallPromptEvent;
      setState((prev) => ({
        ...prev,
        canInstall: true,
        prompt: deferredPrompt,
      }));
    };

    const handleAppInstalled = () => {
      deferredPrompt = null;
      setState((prev) => ({
        ...prev,
        canInstall: false,
        prompt: null,
      }));
    };

    // Listen for beforeinstallprompt
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    setState((prev) => ({
      ...prev,
      isStandalone,
    }));

    // Check for service worker update
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistration().then((registration) => {
        if (registration?.waiting) {
          setState((prev) => ({
            ...prev,
            updateAvailable: true,
          }));
        }

        registration?.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (
                newWorker.state === 'installed' &&
                navigator.serviceWorker.controller
              ) {
                setState((prev) => ({
                  ...prev,
                  updateAvailable: true,
                }));
              }
            });
          }
        });
      });
    }

    return () => {
      window.removeEventListener(
        'beforeinstallprompt',
        handleBeforeInstallPrompt
      );
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  return state;
}
