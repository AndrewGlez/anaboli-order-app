import { exportToXlsx } from '../../../services/web/fileExport';

// Mock Platform
jest.mock('react-native', () => ({
  Platform: {
    OS: 'web',
  },
}));

describe('fileExport', () => {
  it('exports a function', () => {
    expect(typeof exportToXlsx).toBe('function');
  });

  it('has correct signature', () => {
    // Verify the function accepts data and filename
    expect(exportToXlsx.length).toBe(2);
  });
});
