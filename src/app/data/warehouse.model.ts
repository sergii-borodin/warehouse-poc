export type SlotStatus = 'Rented' | 'Reserved' | 'Offered' | 'Internal' | 'Available';

export interface Slot {
  id: string;
  name: string;
  status: SlotStatus;
  rentedBy?: string;
  startDate?: string; // ISO YYYY-MM-DD
  endDate?: string; // ISO YYYY-MM-DD
}

export interface Warehouse {
  id: string;
  name: string;
  length: number; // meters (used for scaling)
  width: number; // meters (used for scaling)
  slots: Slot[];
}
