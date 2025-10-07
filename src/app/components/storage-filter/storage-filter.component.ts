import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faTentArrowDownToLine } from '@fortawesome/free-solid-svg-icons';
import { faTent } from '@fortawesome/free-solid-svg-icons';
import { faTemperatureArrowUp } from '@fortawesome/free-solid-svg-icons';

export interface FilterState {
  startDate: string;
  endDate: string;
  minAvailableMeters: number | null;
  minAvailableMetersError: string;
  storageType: string;
  cargoHeight: number;
  cargoWidth: number;
  frostFreeOnly: boolean;
  mafiTrailer: boolean;
}

@Component({
  selector: 'app-storage-filter',
  standalone: true,
  imports: [CommonModule, FormsModule, FontAwesomeModule],
  template: `
    <div class="filters">
      <ul class="main-filter-list">
        <li>
          <label>
            Start date
            <input
              type="date"
              [(ngModel)]="filterState.startDate"
              (ngModelChange)="onStartDateChange($event)"
              [min]="today"
            />
          </label>
        </li>
        <li>
          <label>
            End date
            <input
              type="date"
              [(ngModel)]="filterState.endDate"
              min="{{ filterState.startDate }}"
            />
          </label>
        </li>
        <li>
          <label>
            Min available meters
            <input
              type="number"
              [(ngModel)]="filterState.minAvailableMeters"
              (ngModelChange)="onMinMetersChange($event)"
              placeholder="Enter minimum meters"
              min="0"
              step="1"
              [class.error]="filterState.minAvailableMetersError"
            />
            <div class="error-message" *ngIf="filterState.minAvailableMetersError">
              {{ filterState.minAvailableMetersError }}
            </div>
          </label>
        </li>
        <li class="storage-type-select">
          <label>
            Storage type
            <select name="" id="" [(ngModel)]="filterState.storageType">
              <option value="warehouse">Warehouse</option>
              <option value="outside">Outside</option>
              <option value="all">All</option>
            </select>
          </label>
          <!-- @if(this.filterState.storageType === 'warehouse'){
          <div [style]="{ transition: 'color 0.8s ease' }">
            <fa-icon [icon]="faTent"></fa-icon>
          </div>
          } @else if(this.filterState.storageType === 'outside'){
          <fa-icon
            [icon]="faTentArrowDownToLine"
            [style]="{ transition: 'color 0.8s ease' }"
          ></fa-icon>
          } -->
        </li>
      </ul>
      @if(this.filterState.storageType === 'warehouse'){
      <ul class="warehouse-filters">
        <li>
          <label>
            Cargo height
            <input type="number" [(ngModel)]="filterState.cargoHeight" min="0" step="1" />
          </label>
        </li>
        <li>
          <label>
            Cargo width
            <input type="number" [(ngModel)]="filterState.cargoWidth" min="0" step="1" />
          </label>
        </li>
        <li>
          <div class="frost-free-filter-container">
            <div
              class="frost-free-badge"
              [class.frost-free-badge-selected]="filterState.frostFreeOnly"
              (click)="toggleFrostFree()"
            >
              <fa-icon [icon]="faTemperatureArrowUp"></fa-icon>
              <span class="tooltip">Frost-free</span>
            </div>
            <input type="checkbox" [(ngModel)]="filterState.frostFreeOnly" style="display: none;" />
          </div>
        </li>
        <li>
          <label>
            <input type="checkbox" [(ngModel)]="filterState.mafiTrailer" /> Mafi Trailer
          </label>
        </li>
      </ul>
      }
    </div>
  `,
  styles: [
    `
      .filters {
        display: grid;
        grid-template-columns: 1fr 1fr;
        align-items: end;
        margin-bottom: 1rem;
        list-style: none;
        /* background-color: rgb(232, 232, 232); */
        padding: 1rem;
        border-radius: 6px;
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
      .frost-free-container {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }
      .frost-free-badge {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 40px;
        height: 40px;
        background-color: #f3f4f6;
        border: 2px solid #d1d5db;
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.2s ease;
        color: #6b7280;
        position: relative;
      }
      .frost-free-badge:hover {
        background-color: #e5e7eb;
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
      .error {
        border-color: #dc2626 !important;
      }
      .error-message {
        color: #dc2626;
        font-size: 0.75rem;
        margin-top: 0.25rem;
      }
    `,
  ],
})
export class StorageFilterComponent {
  @Input() filterState!: FilterState;
  @Output() filterStateChange = new EventEmitter<FilterState>();

  faTemperatureArrowUp = faTemperatureArrowUp;
  faTentArrowDownToLine = faTentArrowDownToLine;
  faTent = faTent;
  today: string = new Date().toISOString().split('T')[0];

  onStartDateChange(newDate: string) {
    this.filterState.startDate = newDate;
    this.filterState.endDate = newDate;
    this.emitFilterState();
  }

  onMinMetersChange(value: any) {
    this.filterState.minAvailableMetersError = '';

    if (value === null || value === undefined || value === '') {
      this.filterState.minAvailableMeters = null;
      this.emitFilterState();
      return;
    }

    const numValue = Number(value);
    if (isNaN(numValue) || numValue < 0) {
      this.filterState.minAvailableMetersError = 'Please enter a valid positive number';
      this.emitFilterState();
      return;
    }

    this.filterState.minAvailableMeters = numValue;
    this.emitFilterState();
  }

  toggleFrostFree() {
    this.filterState.frostFreeOnly = !this.filterState.frostFreeOnly;
    this.emitFilterState();
  }

  private emitFilterState() {
    this.filterStateChange.emit({ ...this.filterState });
  }
}
