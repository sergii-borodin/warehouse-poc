export interface SlotBooking {
  id?: string;
  startDate: string; // ISO YYYY-MM-DD
  endDate: string; // ISO YYYY-MM-DD
  responsiblePerson: string;
  administrator: string;
  companyName: string;
  companyEmail: string;
  companyTlf: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Slot {
  id: number;
  name: string;
  bookings?: SlotBooking[];
  isActive?: boolean;
}

export enum StorageType {
  WAREHOUSE = 'warehouse',
  OUTSIDE = 'outside',
}

export enum GatePosition {
  FRONT = 'front',
  BACK = 'back',
  SIDE = 'side',
}

export interface StorageUnit {
  id: number;
  name: string;
  address: string;
  width: number;
  length: number;
  storageType: StorageType;
  gateHeight: number;
  gateWidth: number;
  frostFree: boolean;
  slotVolume: number;
  gatePositioning: GatePosition[];
  slots: Slot[];
  isActive?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface StorageCapacity {
  totalSlots: number;
  availableSlots: number;
  totalMeters: number;
  availableMeters: number;
  utilizationPercentage: number;
}

export interface StorageFilter {
  startDate?: string;
  endDate?: string;
  minAvailableMeters?: number;
  storageType?: StorageType | 'all';
  cargoHeight?: number;
  cargoWidth?: number;
  frostFreeOnly?: boolean;
  mafiTrailer?: boolean;
}

export interface BookingRequest {
  storageId: number;
  slotId: number;
  booking: Omit<SlotBooking, 'id' | 'createdAt' | 'updatedAt'>;
}

export interface BookingResponse {
  success: boolean;
  booking?: SlotBooking;
  error?: string;
}

export interface StorageOperationResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
