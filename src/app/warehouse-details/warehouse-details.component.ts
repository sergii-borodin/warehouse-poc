import { Component, signal, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faArrowUp } from '@fortawesome/free-solid-svg-icons';
import { WarehouseService } from '../services/warehouse.service';

interface Slot {
  id: number;
  name: string;
  status: 'free' | 'reserved' | 'occupied';
}

@Component({
  selector: 'app-warehouse-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, FontAwesomeModule],
  template: `
    <div class="page">
      <button class="back" (click)="back()">← Back</button>

      @if (warehouse) {
      <h2>{{ warehouse.name }}</h2>

      <div class="orient">
        <fa-icon [icon]="faArrowUp"></fa-icon>
        <p>North here</p>
      </div>

      <div class="date-filter" *ngIf="datesChosen()">
        <h3>Dates: {{ startDate }} → {{ endDate }}</h3>
      </div>

      <div class="content">
        <div class="visual-area">
          @if (!datesChosen()) {
          <div class="placeholder">Use the search page to pick dates to see available slots.</div>
          } @else {
          <div
            class="warehouse-rect"
            [style.width.px]="scaleWidth(warehouse.width)"
            [style.height.px]="scaleLength(warehouse.length)"
          >
            @for (slot of getAvailableSlots(); track slot.id) {
            <div
              class="slot"
              [class.selected]="selected() && selected()!.id === slot.id"
              (click)="selectSlot(slot)"
              [style.height.%]="slotHeightPercent"
            >
              <div class="slot-inner">
                <div>{{ slot.name }}</div>
                <div class="status">Available</div>
              </div>
            </div>
            }
          </div>
          }
        </div>

        <div class="controls">
          @if (selected()) {
          <div class="selected-info">
            <h3>Selected: {{ selected()!.name }}</h3>
            <p>Status: {{ selected()!.status }}</p>
            <button [disabled]="isDisabled(selected()!)" (click)="openRentForm()">Rent area</button>
          </div>
          } @if (rentFormOpen()) {
          <div class="rent-form">
            <h3>Rent {{ selected()!.name }}</h3>
            <label>
              Company name
              <input [(ngModel)]="companyName" placeholder="Company name" />
            </label>
            <div class="dates">
              <div>From: {{ startDate }}</div>
              <div>To: {{ endDate }}</div>
            </div>
            <div class="form-actions">
              <button (click)="confirmRent()">Confirm</button>
              <button (click)="cancelRent()">Cancel</button>
            </div>
          </div>
          } @if (confirmation()) {
          <div class="confirmation">
            ✅ Slot {{ confirmation()!.slotName }} has been rented by "{{
              confirmation()!.company
            }}" <br />From: {{ confirmation()!.start }} To: {{ confirmation()!.end }}
          </div>
          }
        </div>
      </div>
      }
    </div>
  `,
  styles: [
    `
      .page {
        padding: 1rem;
      }
      .back {
        margin-bottom: 1rem;
      }
      .content {
        display: flex;
        gap: 2rem;
      }
      .orient {
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 0.4rem;
        margin-bottom: 1rem;
      }
      .warehouse-rect {
        border: 2px solid #333;
        position: relative;
        display: flex;
        flex-direction: column;
      }
      .slot {
        flex: 1;
        border: 1px solid #ccc;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
      }
      .slot.disabled {
        background: #f2f2f2;
        color: #999;
        cursor: not-allowed;
      }
      .slot.selected {
        background: #cce5ff;
        border: 2px solid #004085;
      }
      .slot-inner {
        text-align: center;
        font-size: 0.9rem;
      }
      .date-filter {
        margin-bottom: 1rem;
      }
      /* calendar UI removed in details; dates come from search */
      .placeholder {
        color: #666;
        font-style: italic;
        padding: 1rem 0;
      }
      .rent-form label {
        display: block;
        margin-bottom: 0.5rem;
      }
      .form-actions {
        margin-top: 1rem;
        display: flex;
        gap: 0.5rem;
      }
      .confirmation {
        background: #e6ffed;
        border: 1px solid #28a745;
        padding: 0.5rem;
      }
    `,
  ],
})
export class WarehouseDetailComponent implements OnInit {
  faArrowUp = faArrowUp;
  warehouse: any;
  slotHeightPercent = 0;

  selected = signal<Slot | null>(null);
  rentFormOpen = signal(false);
  confirmation = signal<{ slotName: string; company: string; start: string; end: string } | null>(
    null
  );

  companyName = '';
  startDate = '';
  endDate = '';
  private availableSlotsCache: Slot[] = [];

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private warehouseService: WarehouseService
  ) {}

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.warehouse = this.warehouseService.getById(id);

    if (this.warehouse) {
      this.slotHeightPercent = 100 / this.warehouse.slots.length;
    }
    const qp = this.route.snapshot.queryParamMap;
    const start = qp.get('start');
    const end = qp.get('end');
    if (start && end) {
      this.startDate = start;
      this.endDate = end;
      this.refreshAvailableSlots();
    }
  }

  scaleWidth(width: number): number {
    return width / 2;
  }

  scaleLength(length: number): number {
    return length / 2;
  }

  back() {
    this.router.navigate(['/']);
  }

  selectSlot(slot: Slot) {
    if (this.datesChosen() && !this.isDisabled(slot)) {
      this.selected.set(slot);
      this.rentFormOpen.set(false);
      this.confirmation.set(null);
      this.refreshAvailableSlots();
    }
  }

  isDisabled(slot: Slot): boolean {
    return slot.status !== 'free';
  }

  openRentForm() {
    this.rentFormOpen.set(true);
  }

  cancelRent() {
    this.rentFormOpen.set(false);
    this.companyName = '';
    this.refreshAvailableSlots();
  }

  confirmRent() {
    if (!this.selected() || !this.companyName || !this.startDate || !this.endDate) return;

    this.confirmation.set({
      slotName: this.selected()!.name,
      company: this.companyName,
      start: this.startDate,
      end: this.endDate,
    });

    this.selected.update((s) => (s ? { ...s, status: 'reserved' } : s));
    this.rentFormOpen.set(false);
    this.companyName = '';
    this.refreshAvailableSlots();
  }

  // calendar logic removed; dates come from search page
  datesChosen(): boolean {
    return !!(this.startDate && this.endDate);
  }

  refreshAvailableSlots() {
    if (!this.warehouse || !this.datesChosen()) {
      this.availableSlotsCache = [];
      return;
    }
    const start = new Date(this.startDate);
    const end = new Date(this.endDate);
    this.availableSlotsCache = this.warehouse.slots.filter((slot: any) =>
      this.isSlotAvailableForRange(slot, start, end)
    );
  }

  getAvailableSlots(): Slot[] {
    return this.availableSlotsCache;
  }

  isSlotAvailableForRange(slot: any, start: Date, end: Date): boolean {
    if (slot.status !== 'free') return false;
    const bookings: { startDate: string; endDate: string }[] = slot.bookings ?? [];
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
}
