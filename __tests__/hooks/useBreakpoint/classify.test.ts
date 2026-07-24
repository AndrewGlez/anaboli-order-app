import { classifyWidth, BREAKPOINTS } from '../../../hooks/useBreakpoint';

describe('classifyWidth', () => {
  it('returns phone for widths below 768px', () => {
    expect(classifyWidth(0)).toBe('phone');
    expect(classifyWidth(320)).toBe('phone');
    expect(classifyWidth(767)).toBe('phone');
  });

  it('returns tablet for widths 768-1023px', () => {
    expect(classifyWidth(768)).toBe('tablet');
    expect(classifyWidth(900)).toBe('tablet');
    expect(classifyWidth(1023)).toBe('tablet');
  });

  it('returns desktop for widths >= 1024px', () => {
    expect(classifyWidth(1024)).toBe('desktop');
    expect(classifyWidth(1280)).toBe('desktop');
    expect(classifyWidth(1920)).toBe('desktop');
  });

  it('has correct breakpoint constants', () => {
    expect(BREAKPOINTS.tablet).toBe(768);
    expect(BREAKPOINTS.desktop).toBe(1024);
  });

  it('handles exact boundary values', () => {
    // Phone: < 768
    expect(classifyWidth(767)).toBe('phone');
    // Tablet: 768-1023
    expect(classifyWidth(768)).toBe('tablet');
    expect(classifyWidth(1023)).toBe('tablet');
    // Desktop: >= 1024
    expect(classifyWidth(1024)).toBe('desktop');
  });
});
