import React from 'react';
import renderer from 'react-test-renderer';
import { UpdateToast } from '../../components/UpdateToast';

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

describe('UpdateToast', () => {
  it('renders nothing when no update available', () => {
    const tree = renderer.create(<UpdateToast />).toJSON();
    expect(tree).toBeNull();
  });
});
