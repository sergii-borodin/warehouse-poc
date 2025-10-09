import { Injectable } from '@angular/core';
import { StorageUnit, Slot } from '../shared/models';
import { StorageBusinessService } from './storage-business.service';

/**
 * Utility service that provides helper methods for storage operations
 * @deprecated Most functionality has been moved to StorageBusinessService
 * This service is kept for backward compatibility
 */
@Injectable({
  providedIn: 'root',
})
export class StorageUtilsService {
  constructor(private storageBusinessService: StorageBusinessService) {}

  /**
   * Get available slot count for a storage
   * @deprecated Use StorageBusinessService.getAvailableSlotCount() instead
   */
  getAvailableSlotCount(storage: StorageUnit): number {
    return this.storageBusinessService.getAvailableSlotCount(storage);
  }

  /**
   * Get total slot count for a storage
   * @deprecated Use StorageBusinessService.getTotalSlotCount() instead
   */
  getTotalSlotCount(storage: StorageUnit): number {
    return this.storageBusinessService.getTotalSlotCount(storage);
  }

  /**
   * Get available meters for a storage
   * @deprecated Use StorageBusinessService.getAvailableMeters() instead
   */
  getAvailableMeters(storage: StorageUnit): number {
    return this.storageBusinessService.getAvailableMeters(storage);
  }

  /**
   * Get full storage capacity in meters
   * @deprecated Use StorageBusinessService.getFullStorageCapacity() instead
   */
  getFullStorageCapacity(storage: StorageUnit): number {
    return this.storageBusinessService.getFullStorageCapacity(storage);
  }

  /**
   * Check if a slot is available
   * @deprecated Use StorageBusinessService.isSlotAvailable() instead
   */
  isSlotAvailable(slot: Slot): boolean {
    return this.storageBusinessService.isSlotAvailable(slot);
  }
}
