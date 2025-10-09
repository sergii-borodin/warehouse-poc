import { Injectable } from '@angular/core';
import { Observable, combineLatest, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import {
  StorageUnit,
  Slot,
  SlotBooking,
  StorageCapacity,
  StorageFilter,
  StorageType,
} from '../shared/models';
import { StorageDataService } from './storage-data.service';

@Injectable({
  providedIn: 'root',
})
export class StorageBusinessService {
  constructor(private storageDataService: StorageDataService) {}

  /**
   * Get storage capacity information
   */
  getStorageCapacity(storageId: number): Observable<StorageCapacity | null> {
    return this.storageDataService.getStorageById(storageId).pipe(
      map((storage) => {
        if (!storage) return null;

        const totalSlots = this.getTotalSlotCount(storage);
        const availableSlots = this.getAvailableSlotCount(storage);
        const totalMeters = this.getFullStorageCapacity(storage);
        const availableMeters = this.getAvailableMeters(storage);
        const utilizationPercentage = totalSlots > 0 ? (availableSlots / totalSlots) * 100 : 0;

        return {
          totalSlots,
          availableSlots,
          totalMeters,
          availableMeters,
          utilizationPercentage: Math.round(utilizationPercentage * 100) / 100,
        };
      })
    );
  }

  /**
   * Get all storage capacities
   */
  getAllStorageCapacities(): Observable<Map<number, StorageCapacity>> {
    return this.storageDataService.getAllStorages().pipe(
      switchMap((storages) => {
        const capacityObservables = storages.map((storage) =>
          this.getStorageCapacity(storage.id).pipe(
            map((capacity) => ({ id: storage.id, capacity }))
          )
        );

        return combineLatest(capacityObservables).pipe(
          map((results) => {
            const capacityMap = new Map<number, StorageCapacity>();
            results.forEach((result) => {
              if (result.capacity) {
                capacityMap.set(result.id, result.capacity);
              }
            });
            return capacityMap;
          })
        );
      })
    );
  }

  /**
   * Filter storages based on criteria
   */
  filterStorages(filter: StorageFilter): Observable<StorageUnit[]> {
    return this.storageDataService
      .getAllStorages()
      .pipe(map((storages) => storages.filter((storage) => this.matchesFilter(storage, filter))));
  }

  /**
   * Check if a storage matches the given filter criteria
   */
  private matchesFilter(storage: StorageUnit, filter: StorageFilter): boolean {
    // Storage type filter
    if (filter.storageType && filter.storageType !== 'all') {
      if (storage.storageType !== filter.storageType) {
        return false;
      }
    }

    // Frost-free filter
    if (filter.frostFreeOnly && !storage.frostFree) {
      return false;
    }

    // Cargo dimensions filter (for warehouses)
    if (storage.storageType === StorageType.WAREHOUSE) {
      if (filter.cargoHeight && storage.gateHeight < filter.cargoHeight) {
        return false;
      }
      if (filter.cargoWidth && storage.gateWidth < filter.cargoWidth) {
        return false;
      }
    }

    // Minimum available meters filter
    if (filter.minAvailableMeters && filter.minAvailableMeters > 0) {
      const availableMeters = this.getAvailableMetersForDateRange(
        storage,
        filter.startDate,
        filter.endDate
      );
      if (availableMeters < filter.minAvailableMeters) {
        return false;
      }
    }

    return true;
  }

  /**
   * Get available meters for a specific date range
   */
  getAvailableMetersForDateRange(
    storage: StorageUnit,
    startDate?: string,
    endDate?: string
  ): number {
    const availableSlots = this.getAvailableSlotCountForDateRange(storage, startDate, endDate);
    return availableSlots * (storage.slotVolume || 0);
  }

  /**
   * Get available slot count for a specific date range
   */
  getAvailableSlotCountForDateRange(
    storage: StorageUnit,
    startDate?: string,
    endDate?: string
  ): number {
    if (!storage.slots) return 0;

    const start = startDate ? new Date(startDate) : new Date();
    const end = endDate ? new Date(endDate) : new Date();

    return storage.slots.filter((slot) => this.isSlotAvailableForDateRange(slot, start, end))
      .length;
  }

  /**
   * Get total slot count for a storage
   */
  getTotalSlotCount(storage: StorageUnit): number {
    return storage.slots ? storage.slots.length : 0;
  }

  /**
   * Get available slot count for today
   */
  getAvailableSlotCount(storage: StorageUnit): number {
    return this.getAvailableSlotCountForDateRange(storage);
  }

  /**
   * Get available meters for today
   */
  getAvailableMeters(storage: StorageUnit): number {
    return this.getAvailableMetersForDateRange(storage);
  }

  /**
   * Get full storage capacity in meters
   */
  getFullStorageCapacity(storage: StorageUnit): number {
    const totalSlots = this.getTotalSlotCount(storage);
    return totalSlots * (storage.slotVolume || 0);
  }

  /**
   * Check if a slot is available for a specific date range
   */
  private isSlotAvailableForDateRange(slot: Slot, startDate: Date, endDate: Date): boolean {
    if (!slot.bookings || slot.bookings.length === 0) return true;

    return !slot.bookings.some((booking) =>
      this.rangesOverlap(startDate, endDate, new Date(booking.startDate), new Date(booking.endDate))
    );
  }

  /**
   * Check if a slot is available today
   */
  isSlotAvailable(slot: Slot): boolean {
    const today = new Date();
    return this.isSlotAvailableForDateRange(slot, today, today);
  }

  /**
   * Check if two date ranges overlap
   */
  private rangesOverlap(aStart: Date, aEnd: Date, bStart: Date, bEnd: Date): boolean {
    const aS = new Date(aStart.getFullYear(), aStart.getMonth(), aStart.getDate()).getTime();
    const aE = new Date(aEnd.getFullYear(), aEnd.getMonth(), aEnd.getDate()).getTime();
    const bS = new Date(bStart.getFullYear(), bStart.getMonth(), bStart.getDate()).getTime();
    const bE = new Date(bEnd.getFullYear(), bEnd.getMonth(), bEnd.getDate()).getTime();

    return aS <= bE && bS <= aE;
  }

  /**
   * Get slot utilization percentage
   */
  getSlotUtilization(slot: Slot): number {
    if (!slot.bookings || slot.bookings.length === 0) return 0;

    const today = new Date();
    const isBookedToday = slot.bookings.some((booking) =>
      this.rangesOverlap(today, today, new Date(booking.startDate), new Date(booking.endDate))
    );

    return isBookedToday ? 100 : 0;
  }

  /**
   * Get total system capacity across all storages
   */
  getTotalSystemCapacity(): Observable<StorageCapacity> {
    return this.storageDataService.getAllStorages().pipe(
      map((storages) => {
        const totalSlots = storages.reduce(
          (sum, storage) => sum + this.getTotalSlotCount(storage),
          0
        );
        const availableSlots = storages.reduce(
          (sum, storage) => sum + this.getAvailableSlotCount(storage),
          0
        );
        const totalMeters = storages.reduce(
          (sum, storage) => sum + this.getFullStorageCapacity(storage),
          0
        );
        const availableMeters = storages.reduce(
          (sum, storage) => sum + this.getAvailableMeters(storage),
          0
        );
        const utilizationPercentage = totalSlots > 0 ? (availableSlots / totalSlots) * 100 : 0;

        return {
          totalSlots,
          availableSlots,
          totalMeters,
          availableMeters,
          utilizationPercentage: Math.round(utilizationPercentage * 100) / 100,
        };
      })
    );
  }
}
