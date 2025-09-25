import { Component } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { StorageService } from '../services/storage.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faTemperatureArrowUp } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-storage-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, FontAwesomeModule],
  template: `
    <div class="wrap">
      <h2>Storages</h2>
      <div class="filters">
        <label>
          <input type="checkbox" [(ngModel)]="filterHeating" (ngModelChange)="applyFilters()" />
          Heating only
        </label>
      </div>
      <div class="tabs">
        @for (s of filteredStorages; track s.id) {
        <button
          (click)="selectStorage(s.id)"
          [class.selected-first]="s.id === firstActiveId"
          [class.selected-second]="s.id === secondActiveId"
          aria-pressed="{{ s.id === firstActiveId || s.id === secondActiveId }}"
        >
          @if(s.heating){
          <div class="heating-badge"><fa-icon [icon]="faTemperatureArrowUp"></fa-icon></div>
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
          <div class="slots-grid">
            @for (slot of getStorageById(firstActiveId)!.slots; track slot.id) {
            <div
              class="slot"
              [class.available]="isSlotAvailableToday(slot)"
              [class.unavailable]="!isSlotAvailableToday(slot)"
            >
              <div class="name">{{ slot.name }}</div>
              <div class="status">
                {{ isSlotAvailableToday(slot) ? 'Available today' : 'Not available today' }}
              </div>
            </div>
            }
          </div>
        </div>
        } @if (secondActiveId){
        <div class="overview">
          <h3>{{ getStorageById(secondActiveId)!.name }} — Slots (today)</h3>
          <div class="slots-grid">
            @for (slot of getStorageById(secondActiveId)!.slots; track slot.id) {
            <div
              class="slot"
              [class.available]="isSlotAvailableToday(slot)"
              [class.unavailable]="!isSlotAvailableToday(slot)"
            >
              <div class="name">{{ slot.name }}</div>
              <div class="status">
                {{ isSlotAvailableToday(slot) ? 'Available today' : 'Not available today' }}
              </div>
            </div>
            }
          </div>
        </div>
        }
      </div>

      <!-- @if (activeStorage()) {
      <div class="overview">
        <h3>{{ activeStorage()!.name }} — Slots (today)</h3>
        <div class="slots-grid">
          @for (slot of activeStorage()!.slots; track slot.id) {
          <div
            class="slot"
            [class.available]="isSlotAvailableToday(slot)"
            [class.unavailable]="!isSlotAvailableToday(slot)"
          >
            <div class="name">{{ slot.name }}</div>
            <div class="status">
              {{ isSlotAvailableToday(slot) ? 'Available today' : 'Not available today' }}
            </div>
          </div>
          }
        </div>
      </div>
      } -->
    </div>
  `,
  styles: [
    `
      .wrap {
        padding: 1rem;
        font-family: Arial, sans-serif;
      }
      .tabs {
        display: flex;
        gap: 0.5rem;
        margin: 1rem 0;
      }
      .tabs button {
        position: relative;
        width: 16%;
        height: 8rem;
        padding: 0.6rem 0.9rem;
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
      .heating-badge {
        position: absolute;
        display: flex;
        justify-content: center;
        align-items: center;
        width: 20px;
        height: 20px;
        right: -5px;
        top: -5px;
        border-radius: 50%;
        background-color: tomato;
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
      .slots-grid {
        width: 21rem;
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 1rem;
      }
      .slot {
        width: 10rem;
        border: 1px solid #ccc;
        border-radius: 4px;
        padding: 0.5rem;
        background: #fff;
        text-align: center;
      }
      .slot.available {
        background: #d4edda;
        border-color: #155724;
        color: #155724;
      }
      .slot.unavailable {
        background: #f8d7da;
        border-color: #721c24;
        color: #721c24;
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

  filterHeating = false;

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
    this.filteredStorages = this.storages.filter((s) => (this.filterHeating ? s.heating : true));
  }

  getStorageById(id: number): any | undefined {
    return this.storageMap.get(id);
  }

  isSlotAvailableToday(slot: any): boolean {
    const today = new Date();
    const start = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const end = start;
    const bookings: { startDate: string; endDate: string }[] = slot.bookings ?? [];
    return !bookings.some((b) =>
      this.rangesOverlap(start, end, new Date(b.startDate), new Date(b.endDate))
    );
  }

  private rangesOverlap(aStart: Date, aEnd: Date, bStart: Date, bEnd: Date): boolean {
    const aS = new Date(aStart.getFullYear(), aStart.getMonth(), aStart.getDate()).getTime();
    const aE = new Date(aEnd.getFullYear(), aEnd.getMonth(), aEnd.getDate()).getTime();
    const bS = new Date(bStart.getFullYear(), bStart.getMonth(), bStart.getDate()).getTime();
    const bE = new Date(bEnd.getFullYear(), bEnd.getMonth(), bEnd.getDate()).getTime();
    return aS <= bE && bS <= aE;
  }
}
