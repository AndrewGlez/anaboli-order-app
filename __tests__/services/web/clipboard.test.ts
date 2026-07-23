import { copyToClipboard, readFromClipboard } from '../../../services/web/clipboard';

// Mock Platform
jest.mock('react-native', () => ({
  Platform: {
    OS: 'web',
  },
}));

describe('clipboard', () => {
  it('exports copyToClipboard function', () => {
    expect(typeof copyToClipboard).toBe('function');
  });

  it('exports readFromClipboard function', () => {
    expect(typeof readFromClipboard).toBe('function');
  });

  it('copyToClipboard accepts a string', () => {
    expect(copyToClipboard.length).toBe(1);
  });
});
