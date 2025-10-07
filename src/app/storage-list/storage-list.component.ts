import { Component } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { StorageService } from '../services/storage.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faTemperatureArrowUp } from '@fortawesome/free-solid-svg-icons';
import { SlotGridComponent, Slot } from '../components/slot-grid/slot-grid.component';

@Component({
  selector: 'app-storage-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, FontAwesomeModule, SlotGridComponent],
  template: `
    <div class="wrap">
      <div class="header">
        <h2>Storages overview</h2>
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
        <button
          (click)="selectStorage(s.id)"
          [class.selected-first]="s.id === firstActiveId"
          [class.selected-second]="s.id === secondActiveId"
          aria-pressed="{{ s.id === firstActiveId || s.id === secondActiveId }}"
        >
          {{ s.name }}
        </button>
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
      }
      .header {
        display: flex;
        justify-content: space-between;
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
export class StorageListComponent {
  faTemperatureArrowUp = faTemperatureArrowUp;
  storages: any[];
  filteredStorages: any[] = [];
  firstActiveId?: number;
  secondActiveId?: number;

  filterFrostFree = false;
  comparisonMode = false;
  selectedStorages = new Set<number>();

  private storageMap = new Map<number, any>();

  constructor(private router: Router, private storageService: StorageService) {
    this.storages = this.storageService.getAll();
    this.filteredStorages = [...this.storages];
    this.storages.forEach((storage) => this.storageMap.set(storage.id, storage));
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
    this.filteredStorages = this.storages.filter((s) =>
      this.filterFrostFree ? s.frostFree : true
    );
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
}
