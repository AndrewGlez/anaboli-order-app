/**
 * @jest-environment jsdom
 */
import { exportToXlsx, saveXlsxToFile, removeTempFile } from '../../../services/web/fileExport';

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

  it('exports saveXlsxToFile function', () => {
    expect(typeof saveXlsxToFile).toBe('function');
  });

  it('exports removeTempFile function', () => {
    expect(typeof removeTempFile).toBe('function');
  });

  it('saveXlsxToFile accepts base64 data and filename', () => {
    expect(saveXlsxToFile.length).toBe(2);
  });
});

describe('saveXlsxToFile on web', () => {
  beforeEach(() => {
    // Mock DOM methods for Blob download
    const mockLink = {
      href: '',
      download: '',
      click: jest.fn(),
    };
    jest.spyOn(document, 'createElement').mockReturnValue(mockLink as any);
    jest.spyOn(document.body, 'appendChild').mockReturnValue(document.body);
    jest.spyOn(document.body, 'removeChild').mockReturnValue(document.body);
    jest.spyOn(URL, 'createObjectURL').mockReturnValue('blob:mock-url');
    jest.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('triggers a download on web and returns undefined', async () => {
    // Create a small valid base64 string (empty xlsx is fine for test)
    const result = await saveXlsxToFile('dGVzdA==', 'test.xlsx');
    expect(result).toBeUndefined();
    expect(document.createElement).toHaveBeenCalledWith('a');
    expect(document.body.appendChild).toHaveBeenCalled();
    expect(document.body.removeChild).toHaveBeenCalled();
  });
});

describe('removeTempFile on web', () => {
  it('is a no-op on web', async () => {
    // Should not throw
    await removeTempFile('some/path');
  });
});
