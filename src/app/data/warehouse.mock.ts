import type { Warehouse } from './warehouse.model';

export const MOCK_WAREHOUSES: Warehouse[] = [
  {
    id: 'w1',
    name: 'Warehouse A',
    length: 100,
    width: 200,
    slots: Array.from({ length: 10 }).map((_, i) => {
      const idx = i + 1;
      return {
        id: `s${idx}`,
        name: `A${idx}`,
        ...(idx === 3
          ? { rentedBy: 'Global Shipping ApS', startDate: '2025-09-01', endDate: '2025-09-30' }
          : {}),
      };
    }),
  },
  {
    id: 'w2',
    name: 'Warehouse B',
    length: 120,
    width: 160,
    slots: Array.from({ length: 10 }).map((_, i) => {
      const idx = 11 + i;
      return {
        id: `s${idx}`,
        name: `B${i + 1}`,
      };
    }),
  },
  {
    id: 'w3',
    name: 'Warehouse C',
    length: 90,
    width: 220,
    slots: Array.from({ length: 10 }).map((_, i) => {
      const idx = 21 + i;
      return {
        id: `s${idx}`,
        name: `C${i + 1}`,
      };
    }),
  },
];
