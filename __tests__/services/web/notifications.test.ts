import { showAlert } from '../../../services/web/notifications';

// Mock Platform
jest.mock('react-native', () => ({
  Platform: {
    OS: 'web',
  },
}));

describe('notifications', () => {
  it('exports showAlert function', () => {
    expect(typeof showAlert).toBe('function');
  });
});
