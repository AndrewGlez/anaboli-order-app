import React from 'react';
import renderer from 'react-test-renderer';
import { TabletTopNav } from '../../../components/navigation/TabletTopNav';

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

describe('TabletTopNav', () => {
  it('renders without crashing', () => {
    const tree = renderer.create(
      <TabletTopNav activeHref="/" />
    ).toJSON();
    expect(tree).toBeTruthy();
  });

  it('renders a view with tab items', () => {
    const component = renderer.create(
      <TabletTopNav activeHref="/" />
    );
    const json = JSON.stringify(component.toJSON());
    // Check that all 3 tab titles are present
    expect(json).toContain('Inventario');
    expect(json).toContain('Producción');
    expect(json).toContain('Ajustes');
  });
});
