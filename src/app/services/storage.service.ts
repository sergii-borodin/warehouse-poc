import { Injectable } from '@angular/core';

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
  width: number;
  length: number;
  heating: boolean;
  slots: Slot[];
}

@Injectable({ providedIn: 'root' })
export class StorageService {
  private storages: StorageUnit[] = [
    {
      id: 1,
      name: 'Main Storage',
      width: 500,
      length: 600,
      slots: [
        { id: 1, name: 'A1' },
        {
          id: 2,
          name: 'A2',
          bookings: [
            { startDate: '2025-09-25', endDate: '2025-09-30' },
            { startDate: '2025-10-05', endDate: '2025-10-12' },
          ],
        },
        { id: 3, name: 'A3' },
        { id: 4, name: 'A4' },
        { id: 5, name: 'A5' },
        { id: 6, name: 'A6' },
      ],
      heating: true,
    },
    {
      id: 2,
      name: 'East Wing',
      width: 400,
      length: 500,
      heating: false,
      slots: [
        { id: 1, name: 'B1' },
        { id: 2, name: 'B2' },
        {
          id: 3,
          name: 'B3',
          bookings: [{ startDate: '2025-09-01', endDate: '2025-09-30' }],
        },
        { id: 4, name: 'B4' },
      ],
    },
    {
      id: 3,
      name: 'South Depot',
      width: 300,
      length: 450,
      heating: false,
      slots: [
        { id: 1, name: 'C1' },
        {
          id: 2,
          name: 'C2',
          bookings: [{ startDate: '2025-09-23', endDate: '2025-11-01' }],
        },
        { id: 3, name: 'C3' },
      ],
    },
  ];

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
