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

  search() {
    this.searched = true;
    if (!this.startDate || !this.endDate) {
      this.filtered = [];
      return;
    }
    const start = new Date(this.startDate);
    const end = new Date(this.endDate);
    this.filtered = this.all
      .filter((w) => (this.heatingOnly ? !!w.heating : true))
      .map((w) => ({ ...w, slots: w.slots.filter((s: any) => this.slotMatches(s, start, end)) }))
      .filter((w) => w.slots.length > 0);
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
