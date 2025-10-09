import { Component, OnInit } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { StorageService } from '../services/storage.service';
import { StorageUtilsService } from '../services/storage-utils.service';
import { StorageUnit } from '../shared/models';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faTemperatureArrowUp } from '@fortawesome/free-solid-svg-icons';
import { SlotGridComponent, Slot } from '../components/slot-grid/slot-grid.component';
import {
  StorageFilterComponent,
  FilterState,
} from '../components/storage-filter/storage-filter.component';

@Component({
  selector: 'app-storage-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    FontAwesomeModule,
    SlotGridComponent,
    StorageFilterComponent,
  ],
  template: `
    <div class="wrap">
      <div class="header">
        <h2>Storages overview</h2>
        <app-storage-filter
          [filterState]="filterState"
          (filterStateChange)="onFilterStateChange($event)"
          (search)="onSearch()"
        >
        </app-storage-filter>
      </div>
      <div class="comparison-controls">
        <div class="comparison-mode">
          <input
            type="checkbox"
            id="comparisonMode"
            [(ngModel)]="comparisonMode"
            (ngModelChange)="toggleComparisonMode()"
          />
          <label for="comparisonMode">Enable Comparison Mode</label>
        </div>
        @if (comparisonMode) {
        <div class="comparison-info">
          <p>Select up to 2 storages to compare</p>
          <div class="selected-count">Selected: {{ getSelectedCount() }}/2</div>
        </div>
        }
      </div>

      <div class="tabs">
        @for (s of filteredStorages; track s.id) {
        <div class="storage-item">
          <div class="storage-item-header">
            <span>{{ s.name }}</span>
            @if(s.frostFree){
            <div class="frost-free-badge" [class.frost-free-badge-selected]="s.frostFree">
              <fa-icon [icon]="faTemperatureArrowUp"></fa-icon>
              <span class="tooltip">Frost-free</span>
            </div>
            }
          </div>
          <button
            (click)="selectStorage(s.id)"
            [class.selected-first]="s.id === firstActiveId"
            [class.selected-second]="s.id === secondActiveId"
            [attr.aria-pressed]="s.id === firstActiveId || s.id === secondActiveId"
          >
            <div class="slots">
              {{ getAvailableSlotCount(s) }}/{{ getTotalSlotCount(s.id) }} available slot(s)
            </div>
            <div class="meters" *ngIf="s.slotVolume">
              {{ getAvailableMeters(s) }}/{{ getFullStorageCapacity(s) }}m² available
            </div>
          </button>
          <span *ngIf="s.gateHeight && s.gateWidth">{{ s.gateHeight }}x{{ s.gateWidth }}</span>
        </div>
        }
      </div>
      <div class="hint">Click a storage to view details</div>
      <div class="detail-overview-container">
        @if (firstActiveId) {
        <div class="overview">
          <h3>{{ getStorageById(firstActiveId)!.name }} — Slots (today)</h3>
          <app-slot-grid
            [slots]="getStorageById(firstActiveId)!.slots"
            [showTodayAvailability]="true"
          ></app-slot-grid>
        </div>
        } @if (secondActiveId){
        <div class="overview">
          <h3>{{ getStorageById(secondActiveId)!.name }} — Slots (today)</h3>
          <app-slot-grid
            [slots]="getStorageById(secondActiveId)!.slots"
            [showTodayAvailability]="true"
          ></app-slot-grid>
        </div>
        }
      </div>
    </div>
  `,
  styles: [
    `
      .wrap {
        padding: 1rem;
        font-family: Arial, sans-serif;
        transition: opacity 0.3s ease;
      }

      .wrap.hidden {
        opacity: 0;
        pointer-events: none;
      }
      .header {
        display: flex;
        flex-direction: column;
      }

      .storage-item {
        display: flex;
        flex-direction: column;
        align-items: center;
      }
      .filters-container {
        p {
          margin: 0;
        }
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }
      .storage-item-header {
        margin-bottom: 0.5rem;
        display: flex;
        align-content: center;
        justify-content: center;
        gap: 0.5rem;
      }
      .tabs {
        display: flex;
        gap: 0.5rem;
        margin: 1rem 0;
      }
      .tabs button {
        position: relative;
        width: 5rem;
        height: 8rem;
        border-radius: 6px;
        border: 1px solid rgb(88, 122, 180);
        background: #eaf4ff;
        cursor: pointer;
      }
      .tabs button.selected-first {
        background: #0b63d1;
        color: white;
      }
      .tabs button.selected-second {
        background: rgb(135, 164, 199);
        color: white;
      }
      .storage-item-header .frost-free-badge {
        position: relative;
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
      .storage-item-header .frost-free-badge-selected {
        color: white;
        background-color: orange;
        border-color: #0b63d1;
        border-radius: 5px;
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

      .slots,
      .meters {
        font-size: 0.8rem;
        color: #6b7280;
        margin: 0.25rem 0;
        text-align: center;
      }

      .slots {
        font-weight: 600;
        color: #374151;
      }

      .meters {
        font-style: italic;
      }
      .detail-overview-container {
        display: flex;
        gap: 3rem;
        justify-content: center;
      }
      .overview {
        margin-top: 1rem;
        justify-items: center;
      }

      /* Comparison Mode Styles */
      .comparison-controls {
        margin: 1rem 0;
        padding: 1rem;
        background: #f8f9fa;
        border-radius: 8px;
        border: 1px solid #e9ecef;
      }

      .comparison-mode {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin-bottom: 0.5rem;
      }

      .comparison-mode input[type='checkbox'] {
        width: 18px;
        height: 18px;
        cursor: pointer;
      }

      .comparison-mode label {
        font-weight: 600;
        color: #0b63d1;
        cursor: pointer;
      }

      .comparison-info {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-top: 0.5rem;
      }

      .comparison-info p {
        margin: 0;
        color: #6b7280;
        font-size: 0.9rem;
      }

      .selected-count {
        background: #0b63d1;
        color: white;
        padding: 0.25rem 0.75rem;
        border-radius: 12px;
        font-size: 0.8rem;
        font-weight: 600;
      }
    `,
  ],
})
export class StorageListComponent implements OnInit {
  faTemperatureArrowUp = faTemperatureArrowUp;
  storages: any[] = [];
  filteredStorages: any[] = [];
  firstActiveId?: number;
  secondActiveId?: number;

  comparisonMode = false;
  selectedStorages = new Set<number>();

  // Filter state object
  filterState: FilterState = {
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    minAvailableMeters: null,
    minAvailableMetersError: '',
    storageType: 'all',
    cargoHeight: 0,
    cargoWidth: 0,
    frostFreeOnly: false,
    mafiTrailer: false,
  };

  private storageMap = new Map<number, any>();

  constructor(
    private router: Router,
    private storageService: StorageService,
    private storageUtils: StorageUtilsService
  ) {
    this.storages = [];
  }

  ngOnInit() {
    console.log('Storage-list component ngOnInit called');

    // Load storages asynchronously and then apply initial filters
    this.storageService.getAllAsync().subscribe((storages) => {
      console.log('Storages received in storage-list component:', storages);
      this.storages = storages;
      this.storages.forEach((storage) => this.storageMap.set(storage.id, storage));
      this.applyFilters(); // Apply initial filters
    });
  }

  selectStorage(newId: number) {
    // Ensure the storage actually exists (safety check)
    const exists = this.storages.some((storage) => storage.id === newId);
    if (!exists) {
      console.warn(`Storage with id of ${newId} doesn't exist`);
    }

    if (this.comparisonMode) {
      // In comparison mode, use checkbox-like behavior
      this.toggleStorageSelection(newId);
    } else {
      // Original click behavior
      // Case 1: nothing selected yet
      if (!this.firstActiveId) {
        this.firstActiveId = newId;
        return;
      }
      // Case 2: clicked primary again → do nothing (or toggle off if you want)
      if (this.firstActiveId === newId) {
        return;
      }
      // Case 3: clicked the secondary → swap
      if (this.secondActiveId === newId) {
        const temp = this.firstActiveId;
        this.firstActiveId = this.secondActiveId;
        this.secondActiveId = temp;
        return;
      }

      // Case 4: clicked a different storage → shift primary to secondary, new becomes primary
      this.secondActiveId = this.firstActiveId;
      this.firstActiveId = newId;
    }
  }

  applyFilters() {
    // Start with all storages
    let filtered = [...this.storages];

    // Filter by frost free requirement
    if (this.filterState.frostFreeOnly) {
      filtered = filtered.filter((storage) => !!storage.frostFree);
    }

    // Filter by mafi trailer requirement
    if (this.filterState.mafiTrailer) {
      filtered = filtered.filter(
        (storage) => storage.gateHeight - 1 >= this.filterState.cargoHeight
      );
    }

    // Filter by minimum available meters (using proper availability calculation)
    if (this.filterState.minAvailableMeters && this.filterState.minAvailableMeters > 0) {
      filtered = filtered.filter((storage) => {
        const availableMeters = this.getAvailableMeters(storage);
        return availableMeters >= this.filterState.minAvailableMeters!;
      });
    }

    // Filter out storages with no available slots for the date range
    filtered = filtered.filter((storage) => this.getAvailableSlotCount(storage) > 0);

    // Filter by storage type
    if (this.filterState.storageType !== 'all') {
      filtered = filtered.filter((storage) => storage.storageType === this.filterState.storageType);
    }

    // Filter by gate height and width
    if (this.filterState.cargoHeight > 0 && this.filterState.cargoWidth > 0) {
      filtered = filtered.filter(
        (storage) =>
          storage.gateHeight >= +this.filterState.cargoHeight &&
          storage.gateWidth >= +this.filterState.cargoWidth
      );
    }

    this.filteredStorages = filtered;
    this.firstActiveId = undefined;
    this.secondActiveId = undefined;
  }

  getStorageById(id: number): any | undefined {
    return this.storageMap.get(id);
  }

  toggleComparisonMode() {
    if (!this.comparisonMode) {
      // Exiting comparison mode - clear selections
      this.selectedStorages.clear();
      this.firstActiveId = undefined;
      this.secondActiveId = undefined;
    } else {
      // Entering comparison mode - clear any existing selections
      this.selectedStorages.clear();
      this.firstActiveId = undefined;
      this.secondActiveId = undefined;
    }
  }

  toggleStorageSelection(storageId: number) {
    if (this.selectedStorages.has(storageId)) {
      // Deselecting
      this.selectedStorages.delete(storageId);
      this.updateActiveStorages();
    } else if (this.selectedStorages.size < 2) {
      // Selecting (only if less than 2 selected)
      this.selectedStorages.add(storageId);
      this.updateActiveStorages();
    }
  }

  isStorageSelected(storageId: number): boolean {
    return this.selectedStorages.has(storageId);
  }

  getSelectedCount(): number {
    return this.selectedStorages.size;
  }

  private updateActiveStorages() {
    const selectedArray = Array.from(this.selectedStorages);
    this.firstActiveId = selectedArray[0];
    this.secondActiveId = selectedArray[1];
  }

  onFilterStateChange(newFilterState: FilterState) {
    this.filterState = newFilterState;
    // Don't apply filters automatically - only when search button is clicked
  }

  onSearch() {
    this.applyFilters();
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  // Date-aware availability checking methods (similar to search component)
  getAvailableSlotCount(storage: any): number {
    // Use date-aware availability if dates are provided, otherwise use today's availability
    if (this.filterState.startDate && this.filterState.endDate) {
      return this.getAvailableSlotCountForDateRange(storage);
    }
    return this.storageUtils.getAvailableSlotCount(storage);
  }

  private getAvailableSlotCountForDateRange(storage: any): number {
    if (!storage.slots || !this.filterState.startDate || !this.filterState.endDate) return 0;
    const start = new Date(this.filterState.startDate);
    const end = new Date(this.filterState.endDate);
    return storage.slots.filter((slot: any) => this.isSlotAvailableForDateRange(slot, start, end))
      .length;
  }

  private isSlotAvailableForDateRange(slot: any, startDate: Date, endDate: Date): boolean {
    if (!slot.bookings || slot.bookings.length === 0) return true;
    return !slot.bookings.some((booking: any) =>
      this.rangesOverlap(startDate, endDate, new Date(booking.startDate), new Date(booking.endDate))
    );
  }

  private rangesOverlap(aStart: Date, aEnd: Date, bStart: Date, bEnd: Date): boolean {
    const aS = new Date(aStart.getFullYear(), aStart.getMonth(), aStart.getDate()).getTime();
    const aE = new Date(aEnd.getFullYear(), aEnd.getMonth(), aEnd.getDate()).getTime();
    const bS = new Date(bStart.getFullYear(), bStart.getMonth(), bStart.getDate()).getTime();
    const bE = new Date(bEnd.getFullYear(), bEnd.getMonth(), bEnd.getDate()).getTime();
    return aS <= bE && bS <= aE;
  }

  getTotalSlotCount(storageId: number): number {
    const storage = this.getStorageById(storageId);
    return storage ? this.storageUtils.getTotalSlotCount(storage) : 0;
  }

  getAvailableMeters(storage: StorageUnit): number {
    // Use date-aware calculation if dates are provided
    if (this.filterState.startDate && this.filterState.endDate) {
      const availableSlots = this.getAvailableSlotCountForDateRange(storage);
      return availableSlots * (storage.slotVolume || 0);
    }
    return this.storageUtils.getAvailableMeters(storage);
  }

  getFullStorageCapacity(storage: StorageUnit): number {
    return this.storageUtils.getFullStorageCapacity(storage);
  }
}
