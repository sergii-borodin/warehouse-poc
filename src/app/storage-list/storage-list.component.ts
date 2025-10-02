import { Component } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { StorageService } from '../services/storage.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faTemperatureArrowUp } from '@fortawesome/free-solid-svg-icons';
import { faWarehouse } from '@fortawesome/free-solid-svg-icons';
import { SlotGridComponent, Slot } from '../components/slot-grid/slot-grid.component';

@Component({
  selector: 'app-storage-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, FontAwesomeModule, SlotGridComponent],
  template: `
    <div class="wrap">
      <div class="header">
        <h2>Storages overview</h2>
        <div class="filters-container">
          <p>Filters:</p>
          <ul class="filters">
            <li class="filter-item">
              <input
                type="checkbox"
                [(ngModel)]="filterFrostFree"
                (ngModelChange)="applyFilters()"
              />
              <div class="frost-free-badge"><fa-icon [icon]="faTemperatureArrowUp"></fa-icon></div>
              <label> Frost free only </label>
            </li>
            <li class="filter-item">
              <input
                type="checkbox"
                [(ngModel)]="filterFrostFree"
                (ngModelChange)="applyFilters()"
              />
              <div class="frost-free-badge"><fa-icon [icon]="faTemperatureArrowUp"></fa-icon></div>
              <label> Frost free only </label>
            </li>
          </ul>
        </div>
      </div>
      <div class="tabs">
        @for (s of filteredStorages; track s.id) {
        <button
          (click)="selectStorage(s.id)"
          [class.selected-first]="s.id === firstActiveId"
          [class.selected-second]="s.id === secondActiveId"
          aria-pressed="{{ s.id === firstActiveId || s.id === secondActiveId }}"
        >
          @if(s.frostFree){
          <div class="frost-free-badge absolute">
            <fa-icon [icon]="faTemperatureArrowUp"></fa-icon>
          </div>
          }
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
      .filters {
        margin: 0.5rem 0 0.5rem;
      }
      .filter-item {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }
      .frost-free-badge {
        display: flex;
        justify-content: center;
        align-items: center;
        width: 20px;
        height: 20px;
        border: 1px solid rgb(88, 122, 180);
        border-radius: 50%;
        background-color: white;
      }
      .absolute {
        position: absolute;
        right: -5px;
        top: -5px;
      }
      .hint {
        color: #666;
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
}
