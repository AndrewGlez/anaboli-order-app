import { TAB_ITEMS } from '../../../components/navigation/tabConfig';

describe('tabConfig', () => {
  it('has 4 tab items', () => {
    expect(TAB_ITEMS).toHaveLength(4);
  });

  it('each item has required fields', () => {
    TAB_ITEMS.forEach((item) => {
      expect(item).toHaveProperty('name');
      expect(item).toHaveProperty('href');
      expect(item).toHaveProperty('title');
      expect(item).toHaveProperty('icon');
    });
  });

  it('has correct tab names', () => {
    expect(TAB_ITEMS[0].name).toBe('index');
    expect(TAB_ITEMS[1].name).toBe('new-order');
    expect(TAB_ITEMS[2].name).toBe('analytics');
    expect(TAB_ITEMS[3].name).toBe('settings');
  });

  it('has correct tab titles', () => {
    expect(TAB_ITEMS[0].title).toBe('Ordenes');
    expect(TAB_ITEMS[1].title).toBe('Nuevo');
    expect(TAB_ITEMS[2].title).toBe('Análisis');
    expect(TAB_ITEMS[3].title).toBe('Ajustes');
  });
});
