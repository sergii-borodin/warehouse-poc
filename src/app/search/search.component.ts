import { Component, OnInit, OnDestroy, Pipe, PipeTransform } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { StorageService } from '../services/storage.service';
import { StorageUnit, Slot, SlotBooking } from '../shared/models';
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

@Pipe({
  name: 'capacityChartData',
  pure: true,
  standalone: true,
})
export class CapacityChartDataPipe implements PipeTransform {
  transform(availableSlots: number, totalSlots: number): ChartConfiguration<'doughnut'>['data'] {
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
}

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
    CapacityChartDataPipe,
  ],
  template: `
    <div class="page">
      <section class="search-section">
        <h2>Find Availability</h2>
        <app-storage-filter
          [filterState]="filterState"
          (filterStateChange)="onFilterStateChange($event)"
          (search)="search()"
        >
        </app-storage-filter>
      </section>
      @if (searched) {
      <div class="results">
        <h3>Available Storages</h3>
        <div class="date-range-display">
          <div class="date-info">
            <div>
              @if (filterState.startDate === filterState.endDate) {
              <span class="date-text"
                >Search filter configuration:
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
              } @if ((filterState.cargoHeight && filterState.cargoHeight > 0) ||
              (filterState.cargoWidth && filterState.cargoWidth > 0)) {
              <span class="gate-text">
                @if (filterState.cargoHeight && filterState.cargoHeight > 0) { • Cargo height:
                {{ filterState.cargoHeight }}m } @if (filterState.cargoWidth &&
                filterState.cargoWidth > 0) { @if (filterState.cargoHeight &&
                filterState.cargoHeight > 0) {, } @if (!(filterState.cargoHeight &&
                filterState.cargoHeight > 0)) {• }Cargo width: {{ filterState.cargoWidth }}m }
              </span>
              }
            </div>
          </div>
        </div>

        <div class="hint" *ngIf="!filteredStorages.length">No warehouses match your criteria.</div>
        <div class="cards">
          <div class="card" *ngFor="let storage of filteredStorages" (click)="open(storage.id)">
            <div class="card-head">
              <div class="card-head-left">
                <h3 class="title">{{ storage.name }}</h3>
                @if(storage.frostFree){
                <div class="frost-free-badge">
                  <fa-icon [icon]="faTemperatureArrowUp"></fa-icon>
                  <span class="tooltip">Frost-free</span>
                </div>
                }
              </div>

              <div class="card-head-right">
                <div class="capacity-chart">
                  <canvas
                    baseChart
                    [data]="
                      getAvailableSlotCount(storage)
                        | capacityChartData : getTotalSlotCount(storage.id)
                    "
                    [options]="capacityChartOptions"
                    [type]="'doughnut'"
                    width="30"
                    height="30"
                  >
                  </canvas>
                </div>
              </div>
            </div>

            <div class="card-stats">
              <div class="stat-item">
                <span class="stat-label">Available Slots</span>
                <span class="stat-value"
                  >{{ getAvailableSlotCount(storage) }}/{{ getTotalSlotCount(storage.id) }}</span
                >
              </div>
              <div class="stat-item" *ngIf="storage.slotVolume">
                <span class="stat-label">Available Space</span>
                <span class="stat-value"
                  >{{ getAvailableMeters(storage) }}/{{ getFullStorageCapacity(storage) }}m²</span
                >
              </div>
            </div>

            <div class="card-footer">
              <span class="view-link">View Details →</span>
            </div>
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
        transition: opacity 0.3s ease;
      }

      .page.hidden {
        opacity: 0;
        pointer-events: none;
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
        top: 50%;
        left: calc(100% + 8px);
        transform: translateY(-50%);
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
        right: 100%;
        top: 50%;
        margin-top: -5px;
        border-width: 5px;
        border-style: solid;
        border-color: transparent #374151 transparent transparent;
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
        grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
        gap: 1.5rem;
      }

      .card {
        background: white;
        border: 1px solid #e2e8f0;
        border-radius: 12px;
        padding: 1.5rem;
        cursor: pointer;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
        position: relative;
        overflow: hidden;
      }

      .card::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 4px;
        background: linear-gradient(135deg, #0b63d1 0%, #1d4ed8 100%);
        transform: scaleX(0);
        transition: transform 0.3s ease;
        border-radius: 12px 12px 0 0;
      }

      .card:hover {
        border-color: #0b63d1;
        box-shadow: 0 10px 25px -5px rgba(11, 99, 209, 0.2), 0 8px 10px -6px rgba(11, 99, 209, 0.1);
        transform: translateY(-4px);
      }

      .card:hover::before {
        transform: scaleX(1);
      }

      .card:active {
        transform: translateY(-2px);
      }

      .card-head {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 1.25rem;
      }

      .card-head-left {
        display: flex;
        flex-direction: row;
        align-items: center;
        gap: 0.75rem;
        flex: 1;
      }

      .title {
        font-size: 1.25rem;
        font-weight: 700;
        color: #1f2937;
        margin: 0;
        line-height: 1.3;
      }

      .card-head-left .frost-free-badge {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 32px;
        height: 32px;
        min-width: 32px;
        border: none;
        border-radius: 6px;
        background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
        color: white;
        font-size: 1rem;
        position: relative;
        transition: all 0.2s ease;
        box-shadow: 0 2px 4px rgba(245, 158, 11, 0.3);
      }

      .card-head-left .frost-free-badge:hover {
        box-shadow: 0 4px 8px rgba(245, 158, 11, 0.4);
      }

      .card-head-right {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }

      .capacity-chart {
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .card-stats {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
        margin-bottom: 1rem;
        padding: 1rem;
        background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
        border-radius: 8px;
      }

      .stat-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .stat-label {
        font-size: 0.875rem;
        color: #6b7280;
        font-weight: 500;
      }

      .stat-value {
        font-size: 0.875rem;
        color: #1f2937;
        font-weight: 700;
      }

      .card-footer {
        display: flex;
        justify-content: flex-end;
        padding-top: 0.75rem;
        border-top: 1px solid #e5e7eb;
      }

      .view-link {
        color: #0b63d1;
        font-weight: 600;
        font-size: 0.875rem;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        display: inline-block;
      }

      .card:hover .view-link {
        color: #1d4ed8;
        transform: translateX(4px) scale(1.05);
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

      /* Responsive card styles */
      @media (max-width: 768px) {
        .cards {
          grid-template-columns: 1fr;
          gap: 1rem;
        }

        .card {
          padding: 1.25rem;
        }

        .title {
          font-size: 1.125rem;
        }

        .capacity-chart {
          width: 40px;
          height: 40px;
        }
      }

      @media (max-width: 480px) {
        .card {
          padding: 1rem;
        }

        .card-head {
          margin-bottom: 1rem;
        }

        .title {
          font-size: 1rem;
        }

        .card-head-left .frost-free-badge {
          width: 28px;
          height: 28px;
          min-width: 28px;
          font-size: 0.875rem;
        }

        .card-stats {
          padding: 0.75rem;
          gap: 0.5rem;
        }

        .stat-label,
        .stat-value {
          font-size: 0.8125rem;
        }
      }
    `,
  ],
})
export class SearchComponent implements OnInit, OnDestroy {
  faTemperatureArrowUp = faTemperatureArrowUp;
  faWarehouse = faWarehouse;
  faTentArrowDownToLine = faTentArrowDownToLine;
  faTent = faTent;
  searched = false;
  filteredStorages: StorageUnit[] = [];
  private all: StorageUnit[] = [];
  private searchStartDate?: string;
  private searchEndDate?: string;
  private subscriptions: Subscription[] = [];

  // Filter state object
  filterState: FilterState = {
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    minAvailableMeters: null,
    minAvailableMetersError: '',
    storageType: 'all',
    cargoHeight: null,
    cargoWidth: null,
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
        enabled: false,
        external: (context) => {
          // Tooltip Element
          let tooltipEl = document.getElementById('chartjs-tooltip');

          // Create element on first render
          if (!tooltipEl) {
            tooltipEl = document.createElement('div');
            tooltipEl.id = 'chartjs-tooltip';
            tooltipEl.style.position = 'fixed';
            tooltipEl.style.pointerEvents = 'none';
            tooltipEl.style.zIndex = '9999';
            document.body.appendChild(tooltipEl);
          }

          // Hide if no tooltip
          const tooltipModel = context.tooltip;
          if (tooltipModel.opacity === 0) {
            tooltipEl.style.opacity = '0';
            return;
          }

          // Set Text
          if (tooltipModel.body) {
            const titleLines = tooltipModel.title || [];
            const bodyLines = tooltipModel.body.map((b) => b.lines);

            let innerHtml =
              '<div style="background: #374151; color: white; padding: 8px 12px; border-radius: 6px; font-size: 12px; white-space: nowrap;">';

            bodyLines.forEach((body, i) => {
              const colors = tooltipModel.labelColors[i];
              const label = tooltipModel.dataPoints[i].label || '';
              const value = tooltipModel.dataPoints[i].parsed;
              const total = (context.chart.data.datasets[0].data as number[]).reduce(
                (a: number, b: number) => a + b,
                0
              );
              const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
              innerHtml += `${label}: ${value} (${percentage}%)`;
            });

            innerHtml += '</div>';
            tooltipEl.innerHTML = innerHtml;
          }

          const position = context.chart.canvas.getBoundingClientRect();

          // Display, position, and set styles for font
          tooltipEl.style.opacity = '1';

          // Position tooltip to the left of the chart
          const tooltipWidth = tooltipEl.offsetWidth;
          tooltipEl.style.left = position.left + window.scrollX - tooltipWidth - 10 + 'px';
          tooltipEl.style.top =
            position.top + window.scrollY + position.height / 2 - tooltipEl.offsetHeight / 2 + 'px';
        },
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
    cutout: '40%',
  };

  constructor(
    private router: Router,
    private storageService: StorageService,
    private storageUtils: StorageUtilsService
  ) {
    this.all = [];
    console.log('Search component constructor');
  }

  ngOnInit() {
    console.log('Search component ngOnInit called');

    // Load storages and run initial search
    this.storageService.getAllAsync().subscribe((storages) => {
      console.log('Storages received in search component:', storages?.length, 'items');
      this.all = storages || [];
      console.log('this.all is now:', this.all.length, 'items');
      // run initial search on load
      this.search();
    });
  }

  ngOnDestroy() {
    // Clean up subscriptions
    this.subscriptions.forEach((sub) => sub.unsubscribe());

    // Clean up external tooltip
    const tooltipEl = document.getElementById('chartjs-tooltip');
    if (tooltipEl) {
      tooltipEl.remove();
    }
  }

  onFilterStateChange(newFilterState: FilterState) {
    this.filterState = newFilterState;
  }

  search() {
    console.log('Search method called, this.all.length:', this.all.length);
    this.searched = true;

    // Validate inputs
    if (!this.filterState.startDate || !this.filterState.endDate) {
      console.log('Missing dates, clearing results');
      this.filteredStorages = [];
      return;
    }

    if (this.filterState.minAvailableMetersError) {
      this.filteredStorages = [];
      return;
    }

    // Store the search dates so they don't change when filter state changes
    this.searchStartDate = this.filterState.startDate;
    this.searchEndDate = this.filterState.endDate;

    const start = new Date(this.filterState.startDate);
    const end = new Date(this.filterState.endDate);

    // First filter by frostFree requirement
    let filteredStorages = this.all.filter((storage) =>
      this.filterState.frostFreeOnly ? !!storage.frostFree : true
    );

    // Filter by minimum available meters (using the new method that checks date range)
    if (this.filterState.minAvailableMeters && this.filterState.minAvailableMeters > 0) {
      filteredStorages = filteredStorages.filter((storage) => {
        const availableMeters = this.getAvailableMeters(storage);
        console.log(
          `Warehouse ${storage.name}: ${this.getAvailableSlotCount(storage)} available slots * ${
            storage.slotVolume || 0
          } = ${availableMeters} meters`
        );
        return availableMeters >= this.filterState.minAvailableMeters!;
      });
    }

    // Filter out storages with no available slots for the date range
    filteredStorages = filteredStorages.filter(
      (storage) => this.getAvailableSlotCount(storage) > 0
    );

    // Filter by storage type
    if (this.filterState.storageType !== 'all') {
      filteredStorages = filteredStorages.filter(
        (storage) => storage.storageType === this.filterState.storageType
      );
    }

    // Filter by gate height and width with proper adjustments
    // Only apply to warehouse type storages
    if (this.filterState.storageType === 'warehouse' || this.filterState.storageType === 'all') {
      // Calculate effective gate height based on mafi trailer selection
      // Mafi trailer: -1m adjustment, Air gap (default): -0.4m adjustment
      const gateHeightAdjustment = this.filterState.mafiTrailer ? -1 : -0.4;

      // Filter by cargo height if specified
      if (this.filterState.cargoHeight && this.filterState.cargoHeight > 0) {
        filteredStorages = filteredStorages.filter((storage) => {
          // Skip outside storages for gate height check
          if (storage.storageType === 'outside') return true;

          const effectiveGateHeight = storage.gateHeight + gateHeightAdjustment;
          return effectiveGateHeight >= +this.filterState.cargoHeight!;
        });
      }

      // Filter by cargo width if specified
      if (this.filterState.cargoWidth && this.filterState.cargoWidth > 0) {
        filteredStorages = filteredStorages.filter((storage) => {
          // Skip outside storages for gate width check
          if (storage.storageType === 'outside') return true;

          return storage.gateWidth >= +this.filterState.cargoWidth!;
        });
      }
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

  rangesOverlap(aStart: Date, aEnd: Date, bStart: Date, bEnd: Date): boolean {
    const aS = new Date(aStart.getFullYear(), aStart.getMonth(), aStart.getDate()).getTime();
    const aE = new Date(aEnd.getFullYear(), aEnd.getMonth(), aEnd.getDate()).getTime();
    const bS = new Date(bStart.getFullYear(), bStart.getMonth(), bStart.getDate()).getTime();
    const bE = new Date(bEnd.getFullYear(), bEnd.getMonth(), bEnd.getDate()).getTime();
    return aS <= bE && bS <= aE;
  }

  private isSlotAvailableForDateRange(slot: Slot, start: Date, end: Date): boolean {
    if (!slot.bookings || slot.bookings.length === 0) return true;

    return !slot.bookings.some((booking) =>
      this.rangesOverlap(start, end, new Date(booking.startDate), new Date(booking.endDate))
    );
  }

  getAvailableSlotCount(storage: StorageUnit): number {
    // Use the same logic as storage-utils but with the search date range (not current filter state)
    if (!storage.slots || !this.searchStartDate || !this.searchEndDate) return 0;
    const start = new Date(this.searchStartDate);
    const end = new Date(this.searchEndDate);
    return storage.slots.filter((slot) => this.isSlotAvailableForDateRange(slot, start, end))
      .length;
  }

  getTotalSlotCount(storageId: number): number {
    const storage = this.all.find((s: StorageUnit) => s.id === storageId);
    return storage ? this.storageUtils.getTotalSlotCount(storage) : 0;
  }

  getFullStorageCapacity(storage: StorageUnit): number {
    return this.storageUtils.getFullStorageCapacity(storage);
  }

  getAvailableMeters(storage: StorageUnit): number {
    // Use the same logic as storage-utils but with the selected date range
    const availableSlots = this.getAvailableSlotCount(storage);
    return availableSlots * (storage.slotVolume || 0);
  }

  getCapacityChartData(storage: StorageUnit): ChartConfiguration<'doughnut'>['data'] {
    const totalSlots = this.getTotalSlotCount(storage.id);
    const availableSlots = this.getAvailableSlotCount(storage); // This is the filtered slots count
    // For the chart, we want to show available vs booked for the selected date range
    // Since availableSlots is already the count of slots available for the date range,
    // bookedSlots should be the remaining slots that are booked during this period
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
    const queryParams: any = {
      start: this.filterState.startDate,
      end: this.filterState.endDate,
    };

    // Add required slot count if minimum meters filter is set
    if (this.filterState.minAvailableMeters && this.filterState.minAvailableMeters > 0) {
      const storage = this.all.find((s) => s.id === id);
      if (storage) {
        const requiredSlots = this.getRequiredSlotCount(storage);
        if (requiredSlots > 0) {
          queryParams.requiredSlots = requiredSlots;
        }
      }
    }

    this.router.navigate(['/storage', id], { queryParams });
  }

  /**
   * Calculate the required number of slots based on the minimum available meters filter
   */
  private getRequiredSlotCount(storage: StorageUnit): number {
    if (!this.filterState.minAvailableMeters || this.filterState.minAvailableMeters <= 0) {
      return 0;
    }

    if (!storage.slotVolume || storage.slotVolume <= 0) {
      return 0;
    }

    const requiredSlots = Math.ceil(this.filterState.minAvailableMeters / storage.slotVolume);
    const availableSlots = this.getAvailableSlotCount(storage);
    return Math.min(requiredSlots, availableSlots);
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
