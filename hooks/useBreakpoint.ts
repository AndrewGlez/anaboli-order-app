import { useState, useEffect, useCallback } from 'react';

export type Breakpoint = 'phone' | 'tablet' | 'desktop';

export const BREAKPOINTS = {
  tablet: 768,
  desktop: 1024,
} as const;

export function classifyWidth(width: number): Breakpoint {
  if (width >= BREAKPOINTS.desktop) return 'desktop';
  if (width >= BREAKPOINTS.tablet) return 'tablet';
  return 'phone';
}

function isWebPlatform(): boolean {
  try {
    // Dynamic import to avoid module resolution issues in test env
    const { Platform } = require('react-native');
    return Platform.OS === 'web';
  } catch {
    return typeof window !== 'undefined';
  }
}

export function useBreakpoint(): Breakpoint {
  const getDefault = useCallback((): Breakpoint => {
    if (!isWebPlatform()) return 'phone';
    if (typeof window === 'undefined') return 'phone';
    return classifyWidth(window.innerWidth);
  }, []);

  const [breakpoint, setBreakpoint] = useState<Breakpoint>(getDefault);

  useEffect(() => {
    if (!isWebPlatform()) return;
    if (typeof window === 'undefined') return;

    let rafId: number | null = null;

    const handleResize = () => {
      if (rafId !== null) return;
      rafId = requestAnimationFrame(() => {
        rafId = null;
        setBreakpoint(classifyWidth(window.innerWidth));
      });
    };

    // Set initial value
    setBreakpoint(classifyWidth(window.innerWidth));

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      if (rafId !== null) cancelAnimationFrame(rafId);
    };
  }, []);

  return breakpoint;
}
