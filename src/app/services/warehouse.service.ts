import { Injectable, signal } from '@angular/core';
import type { Warehouse } from '../data/warehouse.model';
import { MOCK_WAREHOUSES } from '../data/warehouse.mock';

const STORAGE_KEY = 'poc_warehouses_v1';

@Injectable({ providedIn: 'root' })
export class WarehouseService {
  private _warehouses = signal<Warehouse[]>(this.load());
  public readonly warehouses = this._warehouses.asReadonly();

  private load(): Warehouse[] {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        return JSON.parse(raw) as Warehouse[];
      } catch {
        /* fallthrough */
      }
    }
    // deep clone mocks so we don't accidentally mutate imported objects
    return JSON.parse(JSON.stringify(MOCK_WAREHOUSES));
  }

  private persist() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this._warehouses()));
  }

  getAll(): Warehouse[] {
    return this._warehouses();
  }

  getById(id: string): Warehouse | undefined {
    return this._warehouses().find((w) => w.id === id);
  }

  updateWarehouse(updated: Warehouse) {
    const arr = this._warehouses().map((w) => (w.id === updated.id ? updated : w));
    this._warehouses.set(arr);
    this.persist();
  }

  rentSlot(
    warehouseId: string,
    slotId: string,
    rentedBy: string,
    startDate: string,
    endDate: string
  ) {
    const w = this.getById(warehouseId);
    if (!w) return;
    const slots = w.slots.map((s) => {
      if (s.id !== slotId) return s;
      return {
        ...s,
        status: 'Rented' as const,
        rentedBy,
        startDate,
        endDate,
      };
    });
    this.updateWarehouse({ ...w, slots });
  }
}
