import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { StorageService, StorageUnit, Slot, SlotBooking } from '../services/storage.service';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faWarehouse } from '@fortawesome/free-solid-svg-icons';
import { faTentArrowDownToLine } from '@fortawesome/free-solid-svg-icons';
import { faTent } from '@fortawesome/free-solid-svg-icons';
import { faTemperatureArrowUp } from '@fortawesome/free-solid-svg-icons';
import { ChartConfiguration, ChartOptions } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, FontAwesomeModule, BaseChartDirective],
  template: `
    <div class="page">
      <section class="search-section">
        <h2>Find Availability</h2>
        <div class="filters">
          <ul class="main-filter-list">
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
              <!-- @if(this.storageType === 'warehouse'){
              <div [style]="{ transition: 'color 0.8s ease' }">
                <fa-icon [icon]="faTent"></fa-icon>
              </div>
              } @else if(this.storageType === 'outside'){
              <fa-icon
                [icon]="faTentArrowDownToLine"
                [style]="{ transition: 'color 0.8s ease' }"
              ></fa-icon>
              } -->
            </li>
          </ul>
          @if(this.storageType === 'warehouse'){
          <ul class="warehouse-filters">
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
              <div class="frost-free-filter-container">
                <div
                  class="frost-free-badge"
                  [class.frost-free-badge-selected]="frostFreeOnly"
                  (click)="toggleFrostFree()"
                >
                  <fa-icon [icon]="faTemperatureArrowUp"></fa-icon>
                </div>
                <input type="checkbox" [(ngModel)]="frostFreeOnly" style="display: none;" />
              </div>
            </li>
            <li>
              <label> <input type="checkbox" [(ngModel)]="mafiTrailer" /> Mafi Trailer </label>
            </li>
          </ul>
          }
        </div>
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
                @if(storage.frostFree){
                <div class="frost-free-badge">
                  <fa-icon [icon]="faTemperatureArrowUp"></fa-icon>
                </div>
                }
                <!-- <div class="badge" *ngIf="storage.frostFree">Frost-free</div> -->
              </div>

              <div class="card-head-right">
                <div class="capacity-chart">
                  <canvas
                    baseChart
                    [data]="getCapacityChartData(storage)"
                    [options]="capacityChartOptions"
                    [type]="'doughnut'"
                    width="20"
                    height="20"
                  >
                  </canvas>
                </div>
              </div>
            </div>
            <div class="slots">
              {{ getAvailableSlotCount(storage) }}/{{ getTotalSlotCount(storage.id) }} available
              slot(s)
            </div>
            <div class="meters" *ngIf="storage.slotVolume">
              {{ getAvailableMeters(storage) }}/{{ getFullStorageCapacity(storage) }}m² available
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
        /* background-color: rgb(232, 232, 232); */
        padding: 1rem;
        border-radius: 6px;
      }
      .filters {
        display: grid;
        grid-template-columns: 1fr 1fr;

        align-items: end;
        margin-bottom: 1rem;
        list-style: none;
      }
      .main-filter-list {
        width: 100%;
        display: flex;
        justify-content: space-between;
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
      .warehouse-filters {
        display: flex;
        list-style: none;
        align-items: end;
        justify-content: space-between;
        width: 100%;
        gap: 1rem;
      }
      .frost-free-badge {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 20px;
        height: 20px;
        background-color: #f3f4f6;
        border: 2px solid #d1d5db;
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.2s ease;
      }
      .frost-free-filter-container .frost-free-badge {
        width: 40px;
        height: 40px;
      }
      .frost-free-filter-container .frost-free-badge-selected {
        color: white;
      }
      .frost-free-badge:hover {
        border-color: #9ca3af;
      }
      .frost-free-badge-selected {
        background-color: orange;
        border-color: #0b63d1;
        color: white;
      }
      .frost-free-badge-selected:hover {
        border-color: rgb(118, 131, 165);
        transition: all 0.4s ease;
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
        gap: 0.25rem;
        flex: 1;
      }
      .card-head-left .frost-free-badge {
        border: 1px solid rgb(88, 122, 180);
        border-radius: 5px;
        background-color: orange;
        color: white;
      }
      .card-head-right {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }
      /* .frost-free-filter-badge {
        display: flex;
        position: absolute;
        justify-content: center;
        align-items: center;
        width: 10px;
        height: 10px;
        border: 1px solid rgb(88, 122, 180);
        border-radius: 50%;
      } */
      /* .badge {
        width: 5rem;
        background: #0b63d1;
        color: white;
        border-radius: 4px;
        padding: 0.1rem 0.4rem;
        font-size: 0.75rem;
      } */
      .capacity-chart {
        width: 30px;
        height: 30px;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .capacity {
        color: #6b7280;
        font-size: 0.875rem;
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
  filteredStorages: StorageUnit[] = [];
  minAvailableMeters: number | null = null;
  minAvailableMetersError = '';
  storageType = 'all';
  cargoHeight = 1;
  cargoWidth = 1;
  mafiTrailer = false;
  private all: StorageUnit[];

  // Chart configuration
  capacityChartOptions: ChartOptions<'doughnut'> = {
    responsive: false,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        enabled: true,
        callbacks: {
          label: function (context) {
            const label = context.label || '';
            const value = context.parsed;
            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
            const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
            return `${label}: ${value} (${percentage}%)`;
          },
        },
      },
    },
    cutout: '60%',
  };

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

  toggleFrostFree() {
    this.frostFreeOnly = !this.frostFreeOnly;
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

    // Then filter by mafiTrailer requirement
    filteredStorages = filteredStorages.filter((storage) =>
      this.mafiTrailer ? storage.gateHeight - 1 >= this.cargoHeight : true
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

  slotMatches(slot: Slot, start: Date, end: Date): boolean {
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

  getAvailableSlotCount(storage: StorageUnit): number {
    return storage.slots?.length ?? 0;
  }

  getTotalSlotCount(storageId: number): number {
    return this.all.find((s: StorageUnit) => s.id === storageId)?.slots?.length ?? 0;
  }

  getFullStorageCapacity(storage: StorageUnit): number {
    return (
      (this.all.find((s: StorageUnit) => s.id === storage.id)?.slots?.length ?? 0) *
      storage.slotVolume
    );
  }

  getAvailableMeters(storage: StorageUnit): number {
    const availableSlots = storage.slots?.length ?? 0;
    const slotVolume = storage.slotVolume ?? 0;
    return availableSlots * slotVolume;
  }

  getCapacityChartData(storage: StorageUnit): ChartConfiguration<'doughnut'>['data'] {
    const totalSlots = this.getTotalSlotCount(storage.id);
    const availableSlots = this.getAvailableSlotCount(storage);
    const bookedSlots = totalSlots - availableSlots;

    return {
      labels: ['Available', 'Booked'],
      datasets: [
        {
          data: [availableSlots, bookedSlots],
          backgroundColor: ['#10b981', '#e5e7eb'],
          borderWidth: 0,
        },
      ],
    };
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
