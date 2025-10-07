import { Injectable } from '@angular/core';
import storages from '../../storages.json';

export interface SlotBooking {
  startDate: string; // ISO YYYY-MM-DD
  endDate: string; // ISO YYYY-MM-DD
  responsiblePerson: string;
  administrator: string;
  companyName: string;
  companyEmail: string;
  companyTlf: string;
}

export interface Slot {
  id: number;
  name: string;
  bookings?: SlotBooking[];
}

export enum StorageType {
  WAREHOUSE = 'warehouse',
  OUTSIDE = 'outside',
}

export interface StorageUnit {
  id: number;
  name: string;
  address: string;
  width: number;
  length: number;
  storageType: string;
  gateHeight: number;
  gateWidth: number;
  frostFree: boolean;
  slotVolume: number;
  gatePositioning: string[];
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

  totalStorageCapacity() {
    const capacity = this.storages.reduce(
      (accumulator, storage) => accumulator + storage.slots.length,
      0
    );
    console.log('capacity', capacity);
  }
}
