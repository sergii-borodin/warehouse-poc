import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import {
  StorageUnit,
  SlotBooking,
  StorageCapacity,
  StorageFilter,
  BookingRequest,
  BookingResponse,
  StorageOperationResult,
} from '../shared/models';
import { StorageDataService } from './storage-data.service';
import { StorageBusinessService } from './storage-business.service';

/**
 * Facade service that coordinates between data access and business logic services
 * Provides a clean API for components to interact with storage operations
 */
@Injectable({
  providedIn: 'root',
})
export class StorageService {
  constructor(
    private storageDataService: StorageDataService,
    private storageBusinessService: StorageBusinessService
  ) {}

  /**
   * Get all storage units
   * @deprecated Use getAllStorages() instead for better type safety
   */
  getAll(): StorageUnit[] {
    // Return synchronous data for backward compatibility
    return this.storageDataService.currentStorages;
  }

  /**
   * Get all storage units as observable
   */
  getAllStorages(): Observable<StorageUnit[]> {
    return this.storageDataService.getAllStorages();
  }

  /**
   * Get all storage units as observable (backward compatibility)
   * @deprecated Use getAllStorages() instead
   */
  getAllAsync(): Observable<StorageUnit[]> {
    return this.getAllStorages();
  }

  /**
   * Get storage unit by ID
   */
  getById(id: number): Observable<StorageUnit | null> {
    return this.storageDataService.getStorageById(id);
  }

  /**
   * Get storage unit by ID synchronously (backward compatibility)
   * @deprecated Use getById() instead for better type safety
   */
  getByIdSync(id: number): StorageUnit | undefined {
    const storages = this.getAll();
    return storages.find((s) => s.id === id);
  }

  /**
   * Add a booking to a storage slot
   */
  addBooking(request: BookingRequest): Observable<BookingResponse> {
    return this.storageDataService.addBooking(request);
  }

  /**
   * Add a booking synchronously (backward compatibility)
   * @deprecated Use addBooking() with observable instead
   */
  addBookingSync(storageId: number, slotId: number, booking: SlotBooking): boolean {
    try {
      const request: BookingRequest = {
        storageId,
        slotId,
        booking,
      };

      // For backward compatibility, we'll use a synchronous approach
      const storage = this.getByIdSync(storageId);
      if (!storage) return false;

      const slot = storage.slots.find((s) => s.id === slotId);
      if (!slot) return false;

      if (!slot.bookings) slot.bookings = [];
      slot.bookings.push(booking);

      return true;
    } catch (error) {
      console.error('Error adding booking:', error);
      return false;
    }
  }

  /**
   * Get storage capacity information
   */
  getStorageCapacity(storageId: number): Observable<StorageCapacity | null> {
    return this.storageBusinessService.getStorageCapacity(storageId);
  }

  /**
   * Get available slot count for a storage
   */
  getAvailableSlotCount(storage: StorageUnit): number {
    return this.storageBusinessService.getAvailableSlotCount(storage);
  }

  /**
   * Get total slot count for a storage
   */
  getTotalSlotCount(storage: StorageUnit): number {
    return this.storageBusinessService.getTotalSlotCount(storage);
  }

  /**
   * Get available meters for a storage
   */
  getAvailableMeters(storage: StorageUnit): number {
    return this.storageBusinessService.getAvailableMeters(storage);
  }

  /**
   * Get full storage capacity in meters
   */
  getFullStorageCapacity(storage: StorageUnit): number {
    return this.storageBusinessService.getFullStorageCapacity(storage);
  }

  /**
   * Filter storages based on criteria
   */
  filterStorages(filter: StorageFilter): Observable<StorageUnit[]> {
    return this.storageBusinessService.filterStorages(filter);
  }

  /**
   * Get total system capacity
   */
  getTotalSystemCapacity(): Observable<StorageCapacity> {
    return this.storageBusinessService.getTotalSystemCapacity();
  }

  /**
   * Get total storage capacity (backward compatibility)
   * @deprecated Use getTotalSystemCapacity() instead
   */
  totalStorageCapacity(): number {
    const storages = this.getAll();
    return storages.reduce((total, storage) => total + (storage.slots?.length || 0), 0);
  }

  /**
   * Check if a slot is available
   */
  isSlotAvailable(slot: any): boolean {
    return this.storageBusinessService.isSlotAvailable(slot);
  }

  /**
   * Remove a booking
   */
  removeBooking(
    storageId: number,
    slotId: number,
    bookingId: string
  ): Observable<StorageOperationResult> {
    return this.storageDataService.removeBooking(storageId, slotId, bookingId);
  }

  /**
   * Update a storage unit
   */
  updateStorage(storage: StorageUnit): Observable<StorageOperationResult<StorageUnit>> {
    return this.storageDataService.updateStorage(storage);
  }

  /**
   * Check if data is initialized
   */
  isInitialized(): boolean {
    return this.storageDataService.isDataInitialized();
  }
}
