import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { StorageService, StorageUnit, Slot, SlotBooking } from '../services/storage.service';
import { StorageUtilsService } from '../services/storage-utils.service';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faWarehouse } from '@fortawesome/free-solid-svg-icons';
import { faTentArrowDownToLine } from '@fortawesome/free-solid-svg-icons';
import { faTent } from '@fortawesome/free-solid-svg-icons';
import { faTemperatureArrowUp } from '@fortawesome/free-solid-svg-icons';
import { ChartConfiguration, ChartOptions } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import {
  StorageFilterComponent,
  FilterState,
} from '../components/storage-filter/storage-filter.component';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    FontAwesomeModule,
    BaseChartDirective,
    StorageFilterComponent,
  ],
  template: `
    <div class="page">
      <section class="search-section">
        <h2>Find Availability</h2>
        <app-storage-filter [filterState]="filterState"> </app-storage-filter>
      </section>
      @if (searched) {
      <div class="results">
        <div class="date-range-display">
          <div class="date-info">
            <div>
              @if (filterState.startDate === filterState.endDate) {
              <span class="date-text"
                >Showing availability for
                <strong>{{ formatDate(filterState.startDate) }}</strong></span
              >
              } @else {
              <span class="date-text"
                >Showing availability from
                <strong>{{ formatDate(filterState.startDate) }}</strong> to
                <strong>{{ formatDate(filterState.endDate) }}</strong></span
              >
              } @if (filterState.minAvailableMeters && filterState.minAvailableMeters > 0) {
              <span class="meters-text">
                • Min {{ filterState.minAvailableMeters }}m² required</span
              >
              } @if (filterState.storageType !== 'all') {
              <span class="storage-text"> • Storage type: {{ filterState.storageType }}</span>
              } @if (filterState.frostFreeOnly) {
              <span class="frostFree-text"> • Frost-free only</span>
              } @if (filterState.cargoHeight || filterState.cargoWidth) {
              <span class="gate-text">
                • Cargo height: {{ filterState.cargoHeight }}m, Cargo width:
                {{ filterState.cargoWidth }}m</span
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
                  <span class="tooltip">Frost-free</span>
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
      .frost-free-badge {
        position: relative;
      }
      .tooltip {
        visibility: hidden;
        opacity: 0;
        position: absolute;
        bottom: 125%;
        left: 50%;
        transform: translateX(-50%);
        background-color: #374151;
        color: white;
        text-align: center;
        border-radius: 6px;
        padding: 8px 12px;
        font-size: 12px;
        white-space: nowrap;
        z-index: 1000;
        transition: opacity 0.3s, visibility 0.3s;
        pointer-events: none;
      }
      .tooltip::after {
        content: '';
        position: absolute;
        top: 100%;
        left: 50%;
        margin-left: -5px;
        border-width: 5px;
        border-style: solid;
        border-color: #374151 transparent transparent transparent;
      }
      .frost-free-badge:hover .tooltip {
        visibility: visible;
        opacity: 1;
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
        gap: 0.5rem;
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
  searched = false;
  filteredStorages: StorageUnit[] = [];
  private all: StorageUnit[];

  // Filter state object
  filterState: FilterState = {
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    minAvailableMeters: null,
    minAvailableMetersError: '',
    storageType: 'all',
    cargoHeight: 1,
    cargoWidth: 1,
    frostFreeOnly: false,
    mafiTrailer: false,
  };

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

  constructor(
    private router: Router,
    private storageService: StorageService,
    private storageUtils: StorageUtilsService
  ) {
    this.all = this.storageService.getAll();
  }

  ngOnInit() {
    // run initial search on load
    this.search();
  }

  // onFilterStateChange(newFilterState: FilterState) {
  //   this.filterState = newFilterState;
  //   this.search();
  // }

  search() {
    this.searched = true;

    // Validate inputs
    if (!this.filterState.startDate || !this.filterState.endDate) {
      this.filteredStorages = [];
      return;
    }

    if (this.filterState.minAvailableMetersError) {
      this.filteredStorages = [];
      return;
    }

    const start = new Date(this.filterState.startDate);
    const end = new Date(this.filterState.endDate);

    // First filter by frostFree requirement
    let filteredStorages = this.all.filter((storage) =>
      this.filterState.frostFreeOnly ? !!storage.frostFree : true
    );

    // Then filter by mafiTrailer requirement
    filteredStorages = filteredStorages.filter((storage) =>
      this.filterState.mafiTrailer ? storage.gateHeight - 1 >= this.filterState.cargoHeight : true
    );

    // Then filter by available slots for the date range and calculate available meters
    filteredStorages = filteredStorages
      .map((storage) => ({
        ...storage,
        slots: storage.slots.filter((s: any) => this.slotMatches(s, start, end)),
      }))
      .filter((storage) => storage.slots.length > 0);

    // Finally filter by minimum available meters
    if (this.filterState.minAvailableMeters && this.filterState.minAvailableMeters > 0) {
      filteredStorages = filteredStorages.filter((storage) => {
        const availableMeters = storage.slots.length * (storage.slotVolume || 0);
        console.log(
          `Warehouse ${storage.name}: ${storage.slots.length} available slots * ${
            storage.slotVolume || 0
          } = ${availableMeters} meters`
        );
        return availableMeters >= this.filterState.minAvailableMeters!;
      });
    }

    // Finally filter by storage type
    if (this.filterState.storageType !== 'all') {
      filteredStorages = filteredStorages.filter(
        (storage) => storage.storageType === this.filterState.storageType
      );
    }

    // Finally filter by gate height and width
    if (this.filterState.cargoHeight && this.filterState.cargoWidth) {
      filteredStorages = filteredStorages.filter(
        (storage) =>
          storage.gateHeight >= +this.filterState.cargoHeight &&
          storage.gateWidth >= +this.filterState.cargoWidth
      );
    }

    this.filteredStorages = filteredStorages;
    console.log(`Search results: ${this.filteredStorages.length} storages found`);

    // Log debug information
    if (this.filterState.minAvailableMeters && this.filterState.minAvailableMeters > 0) {
      console.log(`Filtering by minimum ${this.filterState.minAvailableMeters}m²`);
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
    return this.storageUtils.getAvailableSlotCount(storage);
  }

  getTotalSlotCount(storageId: number): number {
    const storage = this.all.find((s: StorageUnit) => s.id === storageId);
    return storage ? this.storageUtils.getTotalSlotCount(storage) : 0;
  }

  getFullStorageCapacity(storage: StorageUnit): number {
    return this.storageUtils.getFullStorageCapacity(storage);
  }

  getAvailableMeters(storage: StorageUnit): number {
    return this.storageUtils.getAvailableMeters(storage);
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
      queryParams: { start: this.filterState.startDate, end: this.filterState.endDate },
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
