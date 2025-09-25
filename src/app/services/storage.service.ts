import { Injectable } from '@angular/core';
import storages from '../../storages.json';

interface SlotBooking {
  startDate: string; // ISO YYYY-MM-DD
  endDate: string; // ISO YYYY-MM-DD
}

interface Slot {
  id: number;
  name: string;
  bookings?: SlotBooking[];
}

interface StorageUnit {
  id: number;
  name: string;
  address: string;
  width: number;
  length: number;
  heating: boolean;
  slots: Slot[];
}

@Injectable({ providedIn: 'root' })
export class StorageService {
  private storages: StorageUnit[];

  constructor() {
    this.storages = storages as StorageUnit[];
  }

  getAll() {
    return this.storages;
  }

  getById(id: number) {
    return this.storages.find((s) => s.id === id);
  }

  addBooking(storageId: number, slotId: number, booking: SlotBooking): boolean {
    const storage = this.getById(storageId);
    if (!storage) return false;
    const slot = storage.slots.find((s) => s.id === slotId);
    if (!slot) return false;
    if (!slot.bookings) slot.bookings = [];
    slot.bookings.push(booking);
    return true;
  }
}
