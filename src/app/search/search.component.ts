import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { StorageService } from '../services/storage.service';

interface SlotBooking {
  startDate: string;
  endDate: string;
}

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="page">
      <h2>Find Availability</h2>

      <div class="filters">
        <label>
          Start date
          <input
            type="date"
            [(ngModel)]="startDate"
            (ngModelChange)="onStartDateChange($event)"
            [min]="today"
          />
        </label>
        <label>
          End date
          <input type="date" [(ngModel)]="endDate" min="{{ startDate }}" />
        </label>
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
        <label> <input type="checkbox" [(ngModel)]="heatingOnly" /> Heating only </label>
        <button (click)="search()">Search</button>
      </div>

      @if (searched) {
      <div class="results">
        <div class="date-range-display">
          <h3>Results</h3>
          <div class="date-info">
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
            } @if (heatingOnly) {
            <span class="heating-text"> • Heating only</span>
            }
          </div>
        </div>
        <div class="hint" *ngIf="!filtered.length">No warehouses match your criteria.</div>
        <div class="cards">
          <div class="card" *ngFor="let storage of filtered">
            <div class="card-head">
              <div class="title">{{ storage.name }}</div>
              <div class="badge" *ngIf="storage.heating">Heating</div>
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
      .filters {
        display: flex;
        gap: 1rem;
        align-items: end;
        flex-wrap: wrap;
        margin-bottom: 1rem;
      }
      .filters label {
        display: flex;
        flex-direction: column;
      }
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
      }
      .date-text {
        color: #374151;
      }
      .meters-text {
        color: #0b63d1;
        font-weight: 500;
      }
      .heating-text {
        color: #f59e0b;
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
  today: string = new Date().toISOString().split('T')[0];
  startDate: string = this.today;
  endDate: string = this.today;
  heatingOnly = false;
  searched = false;
  filtered: any[] = [];
  minAvailableMeters: number | null = null;
  minAvailableMetersError = '';

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
      this.filtered = [];
      return;
    }

    if (this.minAvailableMetersError) {
      this.filtered = [];
      return;
    }

    const start = new Date(this.startDate);
    const end = new Date(this.endDate);

    // First filter by heating requirement
    let filtered = this.all.filter((w) => (this.heatingOnly ? !!w.heating : true));

    // Then filter by available slots for the date range and calculate available meters
    filtered = filtered
      .map((w) => ({
        ...w,
        slots: w.slots.filter((s: any) => this.slotMatches(s, start, end)),
      }))
      .filter((w) => w.slots.length > 0);

    // Finally filter by minimum available meters
    if (this.minAvailableMeters && this.minAvailableMeters > 0) {
      filtered = filtered.filter((w) => {
        const availableMeters = w.slots.length * (w.slotVolume || 0);
        console.log(
          `Warehouse ${w.name}: ${w.slots.length} available slots * ${
            w.slotVolume || 0
          } = ${availableMeters} meters`
        );
        return availableMeters >= this.minAvailableMeters!;
      });
    }

    this.filtered = filtered;
    console.log(`Search results: ${this.filtered.length} warehouses found`);

    // Log debug information
    if (this.minAvailableMeters && this.minAvailableMeters > 0) {
      console.log(`Filtering by minimum ${this.minAvailableMeters}m²`);
      const totalAvailableMeters = this.filtered.reduce(
        (sum, w) => sum + this.getAvailableMeters(w),
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
    return this.all.find((s) => s.id === storageId)?.slots?.length ?? 0;
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
