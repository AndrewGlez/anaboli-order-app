import React from 'react';
import renderer from 'react-test-renderer';
import { InstallPrompt } from '../../components/InstallPrompt';

// Mock the hook
jest.mock('../../hooks/useInstallPrompt', () => ({
  useInstallPrompt: () => ({
    canInstall: false,
    isStandalone: false,
    prompt: null,
    updateAvailable: false,
  }),
}));

// Mock store
jest.mock('../../store/themeStore', () => ({
  useThemeStore: () => ({
    theme: 'light',
  }),
}));

describe('InstallPrompt', () => {
  it('renders nothing when not installable', () => {
    const tree = renderer.create(<InstallPrompt />).toJSON();
    expect(tree).toBeNull();
  });
});
