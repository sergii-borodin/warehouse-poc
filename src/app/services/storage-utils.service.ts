import { Injectable } from '@angular/core';
import { StorageUnit, Slot, SlotBooking } from './storage.service';

@Injectable({
  providedIn: 'root',
})
export class StorageUtilsService {
  getAvailableSlotCount(storage: StorageUnit): number {
    if (!storage.slots) return 0;
    return storage.slots.filter((slot) => this.isSlotAvailable(slot)).length;
  }

  getTotalSlotCount(storage: StorageUnit): number {
    return storage.slots ? storage.slots.length : 0;
  }

  getAvailableMeters(storage: StorageUnit): number {
    const availableSlots = this.getAvailableSlotCount(storage);
    return availableSlots * (storage.slotVolume || 0);
  }

  getFullStorageCapacity(storage: StorageUnit): number {
    const totalSlots = this.getTotalSlotCount(storage);
    return totalSlots * (storage.slotVolume || 0);
  }

  private isSlotAvailable(slot: Slot): boolean {
    if (!slot.bookings || slot.bookings.length === 0) return true;

    const today = new Date();
    const start = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const end = start;

    return !slot.bookings.some((booking) =>
      this.rangesOverlap(start, end, new Date(booking.startDate), new Date(booking.endDate))
    );
  }

  private rangesOverlap(aStart: Date, aEnd: Date, bStart: Date, bEnd: Date): boolean {
    const aS = new Date(aStart.getFullYear(), aStart.getMonth(), aStart.getDate()).getTime();
    const aE = new Date(aEnd.getFullYear(), aEnd.getMonth(), aEnd.getDate()).getTime();
    const bS = new Date(bStart.getFullYear(), bStart.getMonth(), bStart.getDate()).getTime();
    const bE = new Date(bEnd.getFullYear(), bEnd.getMonth(), bEnd.getDate()).getTime();
    return aS <= bE && bS <= aE;
  }
}

