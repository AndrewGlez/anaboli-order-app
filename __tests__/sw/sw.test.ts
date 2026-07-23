import * as fs from 'fs';
import * as path from 'path';

describe('Service Worker', () => {
  const swPath = path.join(__dirname, '../../public/sw.js');
  let swContent: string;

  beforeAll(() => {
    swContent = fs.readFileSync(swPath, 'utf-8');
  });

  it('has cache-first strategy for shell assets', () => {
    expect(swContent).toContain('caches.match(request)');
    expect(swContent).toContain('CACHE_NAME');
  });

  it('has network-first strategy for navigation', () => {
    expect(swContent).toContain('request.mode === \'navigate\'');
    expect(swContent).toContain('fetch(request)');
  });

  it('deletes old caches on activate', () => {
    expect(swContent).toContain('caches.keys()');
    expect(swContent).toContain('caches.delete(name)');
  });

  it('skips waiting on install', () => {
    expect(swContent).toContain('self.skipWaiting()');
  });

  it('claims clients on activate', () => {
    expect(swContent).toContain('self.clients.claim()');
  });

  it('handles SKIP_WAITING message', () => {
    expect(swContent).toContain('SKIP_WAITING');
    expect(swContent).toContain('event.data.type');
  });

  it('only handles GET requests', () => {
    expect(swContent).toContain('request.method !== \'GET\'');
  });
});
