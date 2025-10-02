import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { StorageService } from '../services/storage.service';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faWarehouse } from '@fortawesome/free-solid-svg-icons';
import { faTentArrowDownToLine } from '@fortawesome/free-solid-svg-icons';
import { faTent } from '@fortawesome/free-solid-svg-icons';
import { faTemperatureArrowUp } from '@fortawesome/free-solid-svg-icons';

interface SlotBooking {
  startDate: string;
  endDate: string;
}

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, FontAwesomeModule],
  template: `
    <div class="page">
      <section class="search-section">
        <h2>Find Availability</h2>
        <ul class="filters">
          <li>
            <label>
              Start date
              <input
                type="date"
                [(ngModel)]="startDate"
                (ngModelChange)="onStartDateChange($event)"
                [min]="today"
              />
            </label>
          </li>
          <li>
            <label>
              End date
              <input type="date" [(ngModel)]="endDate" min="{{ startDate }}" />
            </label>
          </li>
          <li>
            <label>
              Min available meters
              <input
                type="number"
                [(ngModel)]="minAvailableMeters"
                (ngModelChange)="onMinMetersChange($event)"
                placeholder="Enter minimum meters"
                min="0"
                step="1"
                [class.error]="minAvailableMetersError"
              />
              <div class="error-message" *ngIf="minAvailableMetersError">
                {{ minAvailableMetersError }}
              </div>
            </label>
          </li>
          <li class="storage-type-select">
            <label>
              select storage type
              <select name="" id="" [(ngModel)]="storageType">
                <option value="warehouse">Warehouse</option>
                <option value="outside">Outside</option>
                <option value="all">All</option>
              </select>
            </label>
            @if(this.storageType === 'warehouse'){
            <div [style]="{ transition: 'color 0.8s ease' }">
              <fa-icon [icon]="faTent"></fa-icon>
            </div>
            } @else if(this.storageType === 'outside'){
            <fa-icon
              [icon]="faTentArrowDownToLine"
              [style]="{ transition: 'color 0.8s ease' }"
            ></fa-icon>
            }
          </li>
          <li>
            <label>
              Cargo height
              <input type="number" [(ngModel)]="cargoHeight" min="0" step="1" />
            </label>
          </li>
          <li>
            <label>
              Cargo width
              <input type="number" [(ngModel)]="cargoWidth" min="0" step="1" />
            </label>
          </li>
          <li>
            <label> <input type="checkbox" [(ngModel)]="frostFreeOnly" /> Frost-free only </label>
          </li>
        </ul>
      </section>
      @if (searched) {
      <div class="results">
        <div class="date-range-display">
          <div class="date-info">
            <div>
              @if (startDate === endDate) {
              <span class="date-text"
                >Showing availability for <strong>{{ formatDate(startDate) }}</strong></span
              >
              } @else {
              <span class="date-text"
                >Showing availability from <strong>{{ formatDate(startDate) }}</strong> to
                <strong>{{ formatDate(endDate) }}</strong></span
              >
              } @if (minAvailableMeters && minAvailableMeters > 0) {
              <span class="meters-text"> • Min {{ minAvailableMeters }}m² required</span>
              } @if (storageType !== 'all') {
              <span class="storage-text"> • Storage type: {{ storageType }}</span>
              } @if (frostFreeOnly) {
              <span class="frostFree-text"> • Frost-free only</span>
              } @if (cargoHeight || cargoWidth) {
              <span class="gate-text">
                • Cargo height: {{ cargoHeight }}m, Cargo width: {{ cargoWidth }}m</span
              >
              }
            </div>
            <button (click)="search()" class="search-button">Search</button>
          </div>
        </div>
        <h3>Results</h3>

        <div class="hint" *ngIf="!filteredStorages.length">No warehouses match your criteria.</div>
        <div class="cards">
          <div class="card" *ngFor="let storage of filteredStorages">
            <div class="card-head">
              <div class="card-head-left">
                <div class="title">{{ storage.name }}</div>
                <div class="capacity">{{ getFullStorageCapacity(storage.id) }}m²</div>
              </div>
              <div class="badge" *ngIf="storage.frostFree">Frost-free</div>
            </div>
            <div class="slots">
              {{ getAvailableSlotCount(storage) }}/{{ getTotalSlotCount(storage.id) }} available
              slot(s)
            </div>
            <div class="meters" *ngIf="storage.slotVolume">
              {{ getAvailableMeters(storage) }}m² available
            </div>
            <button (click)="open(storage.id)">View slots</button>
          </div>
        </div>
      </div>
      }

      <!-- <section class="overview-section">
        <a routerLink="/storage">Storage overview</a>
      </section> -->
    </div>
  `,
  styles: [
    `
      .page {
        padding: 1rem;
      }
      .search-section {
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }
      .filters {
        display: flex;
        gap: 1rem;
        justify-content: space-between;
        align-items: end;
        /* flex-wrap: wrap; */
        margin-bottom: 1rem;
        list-style: none;
      }
      .filters label {
        display: flex;
        flex-direction: column;
      }
      .storage-type-select {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }
      /* .filters input[type='number'] {
        width: 5rem;
      }
      .filters input[type='date'] {
        width: 8rem;
      } */
      .cards {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
        gap: 1rem;
      }
      .card {
        border: 1px solid #e2e8f0;
        border-radius: 6px;
        padding: 0.75rem;
      }
      .card-head {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 0.5rem;
      }
      .card-head-left {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
      }
      .capacity {
        color: #6b7280;
        font-size: 0.875rem;
      }
      .badge {
        background: #0b63d1;
        color: white;
        border-radius: 4px;
        padding: 0.1rem 0.4rem;
        font-size: 0.75rem;
      }
      .hint {
        color: #666;
      }
      .date-range-display {
        margin-bottom: 1rem;
      }
      .date-info {
        margin-top: 0.5rem;
        padding: 0.75rem;
        background-color: #f8fafc;
        border: 1px solid #e2e8f0;
        border-radius: 6px;
        font-size: 0.9rem;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      .search-button {
        border-radius: 6px;
        padding: 0.5rem 1rem;
        background-color: #0b63d1;
        color: white;
        border: none;
        cursor: pointer;
        font-size: 0.9rem;
        font-weight: 500;
        transition: background-color 0.3s ease;
        &:hover {
          background-color: rgb(43, 109, 190);
        }
      }
      .date-text {
        color: #374151;
      }
      .meters-text {
        color: #0b63d1;
        font-weight: 500;
      }
      .frostFree-text {
        color: #f59e0b;
        font-weight: 500;
      }
      .gate-text {
        color: #10b981;
        font-weight: 500;
      }
      .meters {
        color: #6b7280;
        font-size: 0.875rem;
        margin-top: 0.25rem;
      }
      .error {
        border-color: #dc2626 !important;
      }
      .error-message {
        color: #dc2626;
        font-size: 0.75rem;
        margin-top: 0.25rem;
      }
      .overview-section {
        padding: 20px 10px;
      }
    `,
  ],
})
export class SearchComponent {
  faTemperatureArrowUp = faTemperatureArrowUp;
  faWarehouse = faWarehouse;
  faTentArrowDownToLine = faTentArrowDownToLine;
  faTent = faTent;
  today: string = new Date().toISOString().split('T')[0];
  startDate: string = this.today;
  endDate: string = this.today;
  frostFreeOnly = false;
  searched = false;
  filteredStorages: any[] = [];
  minAvailableMeters: number | null = null;
  minAvailableMetersError = '';
  storageType = 'all';
  cargoHeight = 1;
  cargoWidth = 1;

  private all: any[];

  constructor(private router: Router, private storageService: StorageService) {
    this.all = this.storageService.getAll();
  }

  ngOnInit() {
    // run initial search on load
    this.search();
  }

  onStartDateChange(newDate: string) {
    this.startDate = newDate;
    this.endDate = newDate;
  }

  onMinMetersChange(value: any) {
    this.minAvailableMetersError = '';

    if (value === null || value === undefined || value === '') {
      this.minAvailableMeters = null;
      return;
    }

    const numValue = Number(value);
    if (isNaN(numValue) || numValue < 0) {
      this.minAvailableMetersError = 'Please enter a valid positive number';
      return;
    }

    this.minAvailableMeters = numValue;
  }

  search() {
    this.searched = true;

    // Validate inputs
    if (!this.startDate || !this.endDate) {
      this.filteredStorages = [];
      return;
    }

    if (this.minAvailableMetersError) {
      this.filteredStorages = [];
      return;
    }

    const start = new Date(this.startDate);
    const end = new Date(this.endDate);

    // First filter by frostFree requirement
    let filteredStorages = this.all.filter((storage) =>
      this.frostFreeOnly ? !!storage.frostFree : true
    );

    // Then filter by available slots for the date range and calculate available meters
    filteredStorages = filteredStorages
      .map((storage) => ({
        ...storage,
        slots: storage.slots.filter((s: any) => this.slotMatches(s, start, end)),
      }))
      .filter((storage) => storage.slots.length > 0);

    // Finally filter by minimum available meters
    if (this.minAvailableMeters && this.minAvailableMeters > 0) {
      filteredStorages = filteredStorages.filter((storage) => {
        const availableMeters = storage.slots.length * (storage.slotVolume || 0);
        console.log(
          `Warehouse ${storage.name}: ${storage.slots.length} available slots * ${
            storage.slotVolume || 0
          } = ${availableMeters} meters`
        );
        return availableMeters >= this.minAvailableMeters!;
      });
    }

    // Finally filter by storage type
    if (this.storageType !== 'all') {
      filteredStorages = filteredStorages.filter(
        (storage) => storage.storageType === this.storageType
      );
    }

    // Finally filter by gate height and width
    if (this.cargoHeight && this.cargoWidth) {
      filteredStorages = filteredStorages.filter(
        (storage) =>
          storage.gateHeight >= +this.cargoHeight && storage.gateWidth >= +this.cargoWidth
      );
    }

    this.filteredStorages = filteredStorages;
    console.log(`Search results: ${this.filteredStorages.length} storages found`);

    // Log debug information
    if (this.minAvailableMeters && this.minAvailableMeters > 0) {
      console.log(`Filtering by minimum ${this.minAvailableMeters}m²`);
      const totalAvailableMeters = this.filteredStorages.reduce(
        (sum, storage) => sum + this.getAvailableMeters(storage),
        0
      );
      console.log(`Total available meters in results: ${totalAvailableMeters}m²`);
    }
  }

  slotMatches(slot: any, start: Date, end: Date): boolean {
    const bookings: SlotBooking[] = slot.bookings ?? [];
    return !bookings.some((b) =>
      this.rangesOverlap(start, end, new Date(b.startDate), new Date(b.endDate))
    );
  }

  rangesOverlap(aStart: Date, aEnd: Date, bStart: Date, bEnd: Date): boolean {
    const aS = new Date(aStart.getFullYear(), aStart.getMonth(), aStart.getDate()).getTime();
    const aE = new Date(aEnd.getFullYear(), aEnd.getMonth(), aEnd.getDate()).getTime();
    const bS = new Date(bStart.getFullYear(), bStart.getMonth(), bStart.getDate()).getTime();
    const bE = new Date(bEnd.getFullYear(), bEnd.getMonth(), bEnd.getDate()).getTime();
    return aS <= bE && bS <= aE;
  }

  getAvailableSlotCount(storage: any): number {
    return storage.slots?.length ?? 0;
  }

  getTotalSlotCount(storageId: number): number {
    return this.all.find((s: any) => s.id === storageId)?.slots?.length ?? 0;
  }

  getFullStorageCapacity(storage: any): number {
    const slotCount = storage.slots?.length ?? 0;
    const slotVolume = storage.slotVolume ?? 0;
    return slotCount * slotVolume;
  }

  getAvailableMeters(storage: any): number {
    const availableSlots = storage.slots?.length ?? 0;
    const slotVolume = storage.slotVolume ?? 0;
    return availableSlots * slotVolume;
  }

  open(id: number) {
    this.router.navigate(['/storage', id], {
      queryParams: { start: this.startDate, end: this.endDate },
    });
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }
}
