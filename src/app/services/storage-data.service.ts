import { Injectable } from '@angular/core';
import { Observable, of, throwError, BehaviorSubject } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import {
  StorageUnit,
  SlotBooking,
  StorageOperationResult,
  BookingRequest,
  BookingResponse,
} from '../shared/models';
import storages from '../../assets/storages.json';

@Injectable({
  providedIn: 'root',
})
export class StorageDataService {
  private storagesSubject = new BehaviorSubject<StorageUnit[]>([]);
  public storages$ = this.storagesSubject.asObservable();

  /**
   * Get current storages value synchronously (for backward compatibility)
   */
  get currentStorages(): StorageUnit[] {
    return this.storagesSubject.value;
  }

  private isInitialized = false;

  constructor() {
    this.initializeData();
  }

  private initializeData(): void {
    try {
      const storageData = (storages as StorageUnit[]).map((storage) => ({
        ...storage,
        storageType: storage.storageType as any, // Type assertion for enum
        createdAt: new Date(),
        updatedAt: new Date(),
        isActive: true,
        slots: storage.slots?.map((slot) => ({
          ...slot,
          isActive: true,
          bookings: slot.bookings?.map((booking) => ({
            ...booking,
            id: this.generateId(),
            createdAt: new Date(),
            updatedAt: new Date(),
          })),
        })),
      }));

      this.storagesSubject.next(storageData);
      this.isInitialized = true;
    } catch (error) {
      console.error('Error initializing storage data:', error);
      this.isInitialized = true;
      this.storagesSubject.next([]);
    }
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  /**
   * Get all storage units
   */
  getAllStorages(): Observable<StorageUnit[]> {
    if (!this.isInitialized) {
      return of([]);
    }
    return this.storages$.pipe(
      map((storages) => storages.filter((storage) => storage.isActive !== false))
    );
  }

  /**
   * Get storage unit by ID
   */
  getStorageById(id: number): Observable<StorageUnit | null> {
    return this.getAllStorages().pipe(
      map((storages) => storages.find((storage) => storage.id === id) || null)
    );
  }

  /**
   * Add a new booking to a storage slot
   */
  addBooking(request: BookingRequest): Observable<BookingResponse> {
    return this.getStorageById(request.storageId).pipe(
      map((storage) => {
        if (!storage) {
          return {
            success: false,
            error: `Storage with ID ${request.storageId} not found`,
          };
        }

        const slot = storage.slots.find((s) => s.id === request.slotId);
        if (!slot) {
          return {
            success: false,
            error: `Slot with ID ${request.slotId} not found in storage ${request.storageId}`,
          };
        }

        // Initialize bookings array if it doesn't exist
        if (!slot.bookings) {
          slot.bookings = [];
        }

        // Create new booking with generated ID and timestamps
        const newBooking: SlotBooking = {
          ...request.booking,
          id: this.generateId(),
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        slot.bookings.push(newBooking);

        // Update the storage in the subject
        this.updateStorageInternal(storage);

        return {
          success: true,
          booking: newBooking,
        };
      }),
      catchError((error) =>
        of({
          success: false,
          error: `Failed to add booking: ${error.message}`,
        })
      )
    );
  }

  /**
   * Remove a booking from a storage slot
   */
  removeBooking(
    storageId: number,
    slotId: number,
    bookingId: string
  ): Observable<StorageOperationResult> {
    return this.getStorageById(storageId).pipe(
      map((storage) => {
        if (!storage) {
          return {
            success: false,
            error: `Storage with ID ${storageId} not found`,
          };
        }

        const slot = storage.slots.find((s) => s.id === slotId);
        if (!slot || !slot.bookings) {
          return {
            success: false,
            error: `Slot with ID ${slotId} not found or has no bookings`,
          };
        }

        const bookingIndex = slot.bookings.findIndex((b) => b.id === bookingId);
        if (bookingIndex === -1) {
          return {
            success: false,
            error: `Booking with ID ${bookingId} not found`,
          };
        }

        slot.bookings.splice(bookingIndex, 1);
        this.updateStorageInternal(storage);

        return {
          success: true,
          message: 'Booking removed successfully',
        };
      }),
      catchError((error) =>
        of({
          success: false,
          error: `Failed to remove booking: ${error.message}`,
        })
      )
    );
  }

  /**
   * Update a storage unit
   */
  updateStorage(updatedStorage: StorageUnit): Observable<StorageOperationResult<StorageUnit>> {
    try {
      const currentStorages = this.storagesSubject.value;
      const index = currentStorages.findIndex((s) => s.id === updatedStorage.id);

      if (index === -1) {
        return of({
          success: false,
          error: `Storage with ID ${updatedStorage.id} not found`,
        });
      }

      const storageWithTimestamp = {
        ...updatedStorage,
        updatedAt: new Date(),
      };

      currentStorages[index] = storageWithTimestamp;
      this.storagesSubject.next([...currentStorages]);

      return of({
        success: true,
        data: storageWithTimestamp,
        message: 'Storage updated successfully',
      });
    } catch (error) {
      return of({
        success: false,
        error: `Failed to update storage: ${error}`,
      });
    }
  }

  /**
   * Get total storage capacity across all storages
   */
  getTotalCapacity(): Observable<number> {
    return this.getAllStorages().pipe(
      map((storages) =>
        storages.reduce((total, storage) => total + (storage.slots?.length || 0), 0)
      )
    );
  }

  /**
   * Check if service is initialized
   */
  isDataInitialized(): boolean {
    return this.isInitialized;
  }

  private updateStorageInternal(storage: StorageUnit): void {
    const currentStorages = this.storagesSubject.value;
    const index = currentStorages.findIndex((s) => s.id === storage.id);
    if (index !== -1) {
      currentStorages[index] = {
        ...storage,
        updatedAt: new Date(),
      };
      this.storagesSubject.next([...currentStorages]);
    }
  }
}
