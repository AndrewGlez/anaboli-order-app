import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Platform, useColorScheme as useRNColorScheme } from 'react-native';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { useFonts, Montserrat_400Regular, Montserrat_500Medium, Montserrat_600SemiBold, Montserrat_700Bold } from '@expo-google-fonts/montserrat';
import { SplashScreen } from 'expo-router';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useThemeStore } from '@/store/themeStore';
import { InstallPrompt } from '@/components/InstallPrompt';
import { UpdateToast } from '@/components/UpdateToast';
import { Toaster } from 'sonner';

if (Platform.OS === 'web') {
  require('@/web/styles.css');
}

// Prevent splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

// Register service worker only after first successful online visit
function useServiceWorkerRegistration() {
  useEffect(() => {
    if (Platform.OS !== 'web') return;
    if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) return;

    const registerSW = () => {
      navigator.serviceWorker.register('/sw.js').catch((err) => {
        console.log('SW registration failed:', err);
      });
    };

    // Only register when online — gate on navigator.onLine
    if (navigator.onLine) {
      // Defer until after the page fully loads
      if (document.readyState === 'complete') {
        registerSW();
      } else {
        window.addEventListener('load', registerSW, { once: true });
      }
    }

    // Also register when coming back online (deferred visit pattern)
    const handleOnline = () => {
      registerSW();
      window.removeEventListener('online', handleOnline);
    };
    window.addEventListener('online', handleOnline);

    return () => {
      window.removeEventListener('online', handleOnline);
    };
  }, []);
}

function useWebAppManifest() {
  useEffect(() => {
    if (Platform.OS !== 'web') return;

    let manifestLink = document.querySelector<HTMLLinkElement>('link[rel="manifest"]');
    if (!manifestLink) {
      manifestLink = document.createElement('link');
      manifestLink.rel = 'manifest';
      document.head.appendChild(manifestLink);
    }
    manifestLink.href = '/manifest.json';
  }, []);
}

export default function RootLayout() {
  useFrameworkReady();
  useServiceWorkerRegistration();
  useWebAppManifest();
  const colorScheme = useColorScheme();
  const setSystemTheme = useThemeStore((s) => s.setSystemTheme);
  const rnSystemScheme = useRNColorScheme();

  // Feed the host OS preference into the theme store so `mode === "system"`
  // resolves reactively. `useRNColorScheme` returns "light" | "dark" | null
  // (web); null is treated as the existing systemTheme, not as an override.
  useEffect(() => {
    if (rnSystemScheme === 'light' || rnSystemScheme === 'dark') {
      setSystemTheme(rnSystemScheme);
    }
  }, [rnSystemScheme, setSystemTheme]);

  const [fontsLoaded, fontError] = useFonts({
    Montserrat_400Regular,
    Montserrat_500Medium,
    Montserrat_600SemiBold,
    Montserrat_700Bold,
  });

  // Hide splash screen once fonts are loaded
  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  // Return null to keep splash screen visible while fonts load
  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <>
      {Platform.OS === 'web' && <UpdateToast />}
      {Platform.OS === 'web' && <InstallPrompt />}
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" options={{ title: 'Oops!' }} />
      </Stack>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      {Platform.OS === 'web' && <Toaster position="top-right" richColors />}
    </>
  );
}
