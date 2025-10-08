import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { environment } from '../../environments/environment';
import storages from '../../assets/storages.json';

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
  private storages: StorageUnit[] = [];
  private storagesSubject = new BehaviorSubject<StorageUnit[]>([]);
  public storages$ = this.storagesSubject.asObservable();

  private isInitialized = false;

  constructor() {
    console.log('StorageService constructor called');
    this.loadStorages();
  }

  private loadStorages(): void {
    console.log('loadStorages called');

    try {
      console.log('Loading storages from imported data...');
      this.storages = storages as StorageUnit[];
      this.storagesSubject.next(this.storages);
      this.isInitialized = true;
      console.log('Data loaded successfully from import:', this.storages?.length, 'items');
    } catch (error) {
      console.error('Error loading storages from import:', error);
      this.isInitialized = true;
    }
  }

  getAll(): StorageUnit[] {
    return this.storages;
  }

  getAllAsync(): Observable<StorageUnit[]> {
    return this.storages$;
  }

  getById(id: number): StorageUnit | undefined {
    return this.storages?.find((s) => s.id === id);
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

  totalStorageCapacity(): number {
    const capacity = this.storages.reduce(
      (accumulator, storage) => accumulator + storage.slots.length,
      0
    );
    console.log('Total storage capacity:', capacity);
    return capacity;
  }
}
