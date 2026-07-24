import { copyToClipboard, readFromClipboard } from '../../../services/web/clipboard';

jest.mock('expo-clipboard', () => ({
  setStringAsync: jest.fn(async () => {}),
  getStringAsync: jest.fn(async () => 'mocked-clipboard-text'),
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

  it('readFromClipboard accepts no arguments', () => {
    expect(readFromClipboard.length).toBe(0);
  });

  it('copyToClipboard delegates to expo-clipboard.setStringAsync', async () => {
    const Clipboard = require('expo-clipboard');
    await copyToClipboard('hello world');
    expect(Clipboard.setStringAsync).toHaveBeenCalledWith('hello world');
  });

  it('readFromClipboard delegates to expo-clipboard.getStringAsync', async () => {
    const value = await readFromClipboard();
    expect(value).toBe('mocked-clipboard-text');
  });
});
