import React from 'react';
import renderer from 'react-test-renderer';
import { PhoneTabs } from '../../../components/navigation/PhoneTabs';

// Mock expo-router Tabs
jest.mock('expo-router', () => {
  const React = require('react');
  const MockTabs = (props: any) => React.createElement('Tabs', null, props.children);
  MockTabs.Screen = (props: any) => React.createElement('Tabs.Screen', props);
  return {
    Tabs: MockTabs,
    usePathname: () => '/',
  };
});

// Mock store
jest.mock('../../../store/themeStore', () => ({
  useThemeStore: () => ({
    theme: 'light',
  }),
}));

describe('PhoneTabs', () => {
  it('renders without crashing', () => {
    const tree = renderer.create(
      <PhoneTabs />
    ).toJSON();
    expect(tree).toBeTruthy();
  });
});
