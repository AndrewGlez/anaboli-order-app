import React from 'react';
import renderer from 'react-test-renderer';
import { DesktopSidebar } from '../../../components/navigation/DesktopSidebar';

// Mock expo-router
jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

// Mock store
jest.mock('../../../store/themeStore', () => ({
  useThemeStore: () => ({
    theme: 'light',
  }),
}));

describe('DesktopSidebar', () => {
  it('renders without crashing', () => {
    const tree = renderer.create(
      <DesktopSidebar activeHref="/" />
    ).toJSON();
    expect(tree).toBeTruthy();
  });

  it('renders app name and all navigation items', () => {
    const component = renderer.create(
      <DesktopSidebar activeHref="/" />
    );
    const json = JSON.stringify(component.toJSON());
    // Check that app name and all 4 tab titles are present
    expect(json).toContain('Order App');
    expect(json).toContain('Ordenes');
    expect(json).toContain('Nuevo');
    expect(json).toContain('Análisis');
    expect(json).toContain('Ajustes');
  });
});
