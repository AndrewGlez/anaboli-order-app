import React from 'react';
import { render } from '@testing-library/react-native';
import { Platform } from 'react-native';
import { InstallPrompt } from '@/components/InstallPrompt';

// Mock the useInstallPrompt hook
jest.mock('@/hooks/useInstallPrompt');

describe('InstallPrompt component', () => {
  // REQ-001: Suppress on non-web
  test('suppresses on non-web Platform.OS', () => {
    // Mock Platform.OS to 'ios'
    const originalPlatformOS = Platform.OS;
    Object.defineProperty(Platform, 'OS', {
      value: 'ios',
      configurable: true,
    });

    const { rerender } = render(<InstallPrompt />);
    expect(rerender().toJSON()).toBeNull();

    // Restore
    Object.defineProperty(Platform, 'OS', {
      value: originalPlatformOS,
      configurable: true,
    });
  });
});
