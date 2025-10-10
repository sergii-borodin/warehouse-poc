import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faTentArrowDownToLine } from '@fortawesome/free-solid-svg-icons';
import { faTent } from '@fortawesome/free-solid-svg-icons';
import { faTemperatureArrowUp } from '@fortawesome/free-solid-svg-icons';
import { faWarehouse } from '@fortawesome/free-solid-svg-icons';
import { faLayerGroup } from '@fortawesome/free-solid-svg-icons';
import { faTruckRampBox } from '@fortawesome/free-solid-svg-icons';

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
        <li class="storage-type-slider-container">
          <label class="slider-label">Storage type</label>
          <div class="storage-type-slider">
            <div class="slider-track">
              <div
                class="slider-indicator"
                [class.position-all]="filterState.storageType === 'all'"
                [class.position-warehouse]="filterState.storageType === 'warehouse'"
                [class.position-outside]="filterState.storageType === 'outside'"
              ></div>
              <div
                class="slider-option"
                [class.active]="filterState.storageType === 'all'"
                (click)="setStorageType('all')"
              >
                <fa-icon [icon]="faLayerGroup"></fa-icon>
                <span>All</span>
              </div>
              <div
                class="slider-option"
                [class.active]="filterState.storageType === 'warehouse'"
                (click)="setStorageType('warehouse')"
              >
                <fa-icon [icon]="faWarehouse"></fa-icon>
                <span>Warehouse</span>
              </div>
              <div
                class="slider-option"
                [class.active]="filterState.storageType === 'outside'"
                (click)="setStorageType('outside')"
              >
                <fa-icon [icon]="faTentArrowDownToLine"></fa-icon>
                <span>Outside</span>
              </div>
            </div>
          </div>
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
          <div class="mafi-trailer-filter-container">
            <div
              class="mafi-trailer-badge"
              [class.mafi-trailer-badge-selected]="filterState.mafiTrailer"
              (click)="toggleMafiTrailer()"
            >
              <fa-icon [icon]="faTruckRampBox"></fa-icon>
              <span class="tooltip">Mafi Trailer</span>
            </div>
            <input type="checkbox" [(ngModel)]="filterState.mafiTrailer" style="display: none;" />
          </div>
        </li>
      </ul>
      }
      <div class="search-button-container">
        <button (click)="onSearch()" class="search-button">Search</button>
      </div>
    </div>
  `,
  styles: [
    `
      .filters {
        background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
        border: 1px solid #e2e8f0;
        border-radius: 12px;
        padding: 1.5rem;
        margin-bottom: 1.5rem;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
        transition: all 0.3s ease;
      }

      .filters:hover {
        box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
      }

      .main-filter-list {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 1.5rem;
        margin-bottom: 1.5rem;
        list-style: none;
        padding: 0;
      }

      .filters label {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        font-weight: 500;
        color: #374151;
        font-size: 0.875rem;
      }

      .filters input[type='date'],
      .filters input[type='number'],
      .filters select {
        padding: 0.75rem;
        border: 2px solid #d1d5db;
        border-radius: 8px;
        font-size: 0.875rem;
        transition: all 0.2s ease;
        background-color: white;
        color: #374151;
      }

      .filters input[type='date']:focus,
      .filters input[type='number']:focus,
      .filters select:focus {
        outline: none;
        border-color: #0b63d1;
        box-shadow: 0 0 0 3px rgba(11, 99, 209, 0.1);
      }

      .filters input[type='date']:hover,
      .filters input[type='number']:hover,
      .filters select:hover {
        border-color: #9ca3af;
      }

      .storage-type-slider-container {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
      }

      .slider-label {
        font-weight: 500;
        color: #374151;
        font-size: 0.875rem;
        margin-bottom: 0;
      }

      .storage-type-slider {
        width: 100%;
      }

      .slider-track {
        position: relative;
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        background: #f3f4f6;
        border-radius: 10px;
        padding: 4px;
        gap: 4px;
      }

      .slider-indicator {
        position: absolute;
        height: calc(100% - 8px);
        width: calc(33.333% - 5.333px);
        background: linear-gradient(135deg, #0b63d1 0%, #1d4ed8 100%);
        border-radius: 8px;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        top: 4px;
        box-shadow: 0 2px 8px rgba(11, 99, 209, 0.3);
        z-index: 0;
      }

      .slider-indicator.position-all {
        left: 4px;
      }

      .slider-indicator.position-warehouse {
        left: calc(33.333% + 1.333px);
      }

      .slider-indicator.position-outside {
        left: calc(66.666% - 1.333px);
      }

      .slider-option {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 4px;
        padding: 12px 8px;
        cursor: pointer;
        transition: all 0.3s ease;
        position: relative;
        z-index: 1;
        border-radius: 8px;
        color: #6b7280;
        font-size: 0.75rem;
        font-weight: 500;
      }

      .slider-option fa-icon {
        font-size: 1.25rem;
        transition: all 0.3s ease;
      }

      .slider-option span {
        transition: all 0.3s ease;
      }

      .slider-option:hover:not(.active) {
        color: #374151;
      }

      .slider-option.active {
        color: white;
      }

      .slider-option:active {
        transform: scale(0.95);
      }

      .warehouse-filters {
        display: flex;
        align-items: end;

        /* display: grid;
        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); */
        gap: 1rem;
        list-style: none;
        padding: 0;
        margin-top: 1rem;
        padding-top: 1rem;
        border-top: 1px solid #d1d5db;
      }

      .frost-free-container {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        justify-content: center;
      }

      .frost-free-badge {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 40px;
        height: 40px;
        background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
        border: 2px solid #d1d5db;
        border-radius: 12px;
        cursor: pointer;
        transition: all 0.3s ease;
        color: #6b7280;
        position: relative;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      }

      .frost-free-badge:hover {
        background: linear-gradient(135deg, #e5e7eb 0%, #d1d5db 100%);
        border-color: #9ca3af;
        transform: translateY(-2px);
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
      }

      .frost-free-badge-selected {
        background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
        border-color: #0b63d1;
        color: white;
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(245, 158, 11, 0.4);
      }

      .frost-free-badge-selected:hover {
        background: linear-gradient(135deg, #d97706 0%, #b45309 100%);
        border-color: #0b63d1;
        box-shadow: 0 6px 16px rgba(245, 158, 11, 0.5);
      }

      .tooltip {
        visibility: hidden;
        opacity: 0;
        position: absolute;
        bottom: 125%;
        left: 50%;
        transform: translateX(-50%);
        background: linear-gradient(135deg, #374151 0%, #1f2937 100%);
        color: white;
        text-align: center;
        border-radius: 8px;
        padding: 10px 14px;
        font-size: 12px;
        font-weight: 500;
        white-space: nowrap;
        z-index: 1000;
        transition: all 0.3s ease;
        pointer-events: none;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
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
        transform: translateX(-50%) translateY(-4px);
      }

      .mafi-trailer-badge {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 40px;
        height: 40px;
        background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
        border: 2px solid #d1d5db;
        border-radius: 12px;
        cursor: pointer;
        transition: all 0.3s ease;
        color: #6b7280;
        position: relative;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      }

      .mafi-trailer-badge:hover {
        background: linear-gradient(135deg, #e5e7eb 0%, #d1d5db 100%);
        border-color: #9ca3af;
        transform: translateY(-2px);
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
      }

      .mafi-trailer-badge-selected {
        background: linear-gradient(135deg, #0b63d1 0%, #1d4ed8 100%);
        border-color: #0b63d1;
        color: white;
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(11, 99, 209, 0.4);
      }

      .mafi-trailer-badge-selected:hover {
        background: linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%);
        border-color: #0b63d1;
        box-shadow: 0 6px 16px rgba(11, 99, 209, 0.5);
      }

      .mafi-trailer-badge:hover .tooltip {
        visibility: visible;
        opacity: 1;
        transform: translateX(-50%) translateY(-4px);
      }

      .error {
        border-color: #dc2626 !important;
        box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.1) !important;
      }

      .error-message {
        color: #dc2626;
        font-size: 0.75rem;
        margin-top: 0.25rem;
        font-weight: 500;
      }

      .search-button-container {
        display: flex;
        justify-content: center;
        margin-top: 1.5rem;
        padding-top: 1rem;
        border-top: 1px solid #d1d5db;
      }

      .search-button {
        background: linear-gradient(135deg, #0b63d1 0%, #1d4ed8 100%);
        color: white;
        border: none;
        border-radius: 10px;
        padding: 0.875rem 2rem;
        font-size: 1rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s ease;
        box-shadow: 0 4px 6px rgba(11, 99, 209, 0.3);
        text-transform: uppercase;
        letter-spacing: 0.5px;
        min-width: 140px;
      }

      .search-button:hover {
        background: linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%);
        transform: translateY(-2px);
        box-shadow: 0 6px 12px rgba(11, 99, 209, 0.4);
      }

      .search-button:active {
        transform: translateY(0);
        box-shadow: 0 2px 4px rgba(11, 99, 209, 0.3);
      }

      /* Checkbox styling */
      .filters input[type='checkbox'] {
        width: 18px;
        height: 18px;
        accent-color: #0b63d1;
        cursor: pointer;
      }

      .filters input[type='checkbox'] + label {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        cursor: pointer;
        font-weight: 500;
        color: #374151;
      }

      /* Responsive design */
      @media (max-width: 768px) {
        .filters {
          padding: 1rem;
        }

        .main-filter-list {
          grid-template-columns: 1fr;
          gap: 1rem;
        }

        .warehouse-filters {
          grid-template-columns: 1fr;
          gap: 0.75rem;
        }

        .search-button {
          width: 100%;
          padding: 1rem;
        }

        .slider-option {
          font-size: 0.7rem;
          padding: 10px 6px;
        }

        .slider-option fa-icon {
          font-size: 1.1rem;
        }
      }

      @media (max-width: 480px) {
        .filters {
          padding: 0.75rem;
          border-radius: 8px;
        }

        .frost-free-badge,
        .mafi-trailer-badge {
          width: 44px;
          height: 44px;
        }

        .slider-option {
          font-size: 0.65rem;
          padding: 8px 4px;
          gap: 2px;
        }

        .slider-option fa-icon {
          font-size: 1rem;
        }
      }
    `,
  ],
})
export class StorageFilterComponent {
  @Input() filterState!: FilterState;
  @Output() filterStateChange = new EventEmitter<FilterState>();
  @Output() search = new EventEmitter<void>();

  faTemperatureArrowUp = faTemperatureArrowUp;
  faTentArrowDownToLine = faTentArrowDownToLine;
  faTent = faTent;
  faWarehouse = faWarehouse;
  faLayerGroup = faLayerGroup;
  faTruckRampBox = faTruckRampBox;
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

  toggleMafiTrailer() {
    this.filterState.mafiTrailer = !this.filterState.mafiTrailer;
    this.emitFilterState();
  }

  setStorageType(type: string) {
    this.filterState.storageType = type;
    this.emitFilterState();
  }

  onSearch() {
    this.search.emit();
  }

  private emitFilterState() {
    this.filterStateChange.emit({ ...this.filterState });
  }
}
