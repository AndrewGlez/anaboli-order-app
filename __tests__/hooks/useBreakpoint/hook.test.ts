import { renderHook } from '@testing-library/react-hooks';

describe('useBreakpoint hook', () => {
  it('returns phone in non-web environment', () => {
    const { useBreakpoint } = require('../../../hooks/useBreakpoint');
    const { result } = renderHook(() => useBreakpoint());
    // In Node/bun test environment, isWebPlatform() returns false
    expect(result.current).toBe('phone');
  });

  it('exports BREAKPOINTS constants', () => {
    const { BREAKPOINTS } = require('../../../hooks/useBreakpoint');
    expect(BREAKPOINTS.tablet).toBe(768);
    expect(BREAKPOINTS.desktop).toBe(1024);
  });

  it('exports classifyWidth function', () => {
    const { classifyWidth } = require('../../../hooks/useBreakpoint');
    expect(typeof classifyWidth).toBe('function');
  });
});
