import { Component, signal, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faArrowUp } from '@fortawesome/free-solid-svg-icons';
import { StorageService } from '../services/storage.service';

interface Slot {
  id: number;
  name: string;
}

@Component({
  selector: 'app-storage-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, FontAwesomeModule],
  template: `
    <div class="page">
      <button class="back" (click)="back()">← Back</button>

      @if (storage) {
      <h2>{{ storage.name }}</h2>

      <div class="orient">
        <fa-icon [icon]="faArrowUp"></fa-icon>
        <p>North here</p>
      </div>

      <div class="content">
        <div class="visual-area">
          <div
            class="storage-rect"
            [style.width.px]="scaleWidth(storage.width)"
            [style.height.px]="scaleLength(storage.length)"
          >
            @for (slot of storage.slots; track slot.id) {
            <div
              class="slot"
              [class.selected]="selected() && selected()!.id === slot.id"
              [class.available]="isAvailable(slot)"
              [class.unavailable]="!isAvailable(slot)"
              (click)="selectSlot(slot)"
              [style.height.%]="slotHeightPercent"
            >
              <div class="slot-inner">
                <div>{{ slot.name }}</div>
                <div class="status">{{ isAvailable(slot) ? 'Available' : 'Not available' }}</div>
              </div>
            </div>
            }
          </div>
        </div>

        <div class="controls">
          @if (selected()) {
          <div class="selected-info">
            <h3>Selected: {{ selected()!.name }}</h3>
            <p>Selected slot is available for chosen dates</p>
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
      .storage-rect {
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
      .slot.selected {
        background: #cce5ff;
        border: 2px solid #004085;
      }
      .slot.available {
        background: #e6ffed;
        border-color: #28a745;
      }
      .slot.unavailable {
        background: #ffe6e6;
        border-color: #dc3545;
        cursor: not-allowed;
      }
      .slot-inner {
        text-align: center;
        font-size: 0.9rem;
      }
      .slot .today {
        margin-top: 0.25rem;
        font-size: 0.8rem;
        color: #333;
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
export class StorageDetailComponent implements OnInit {
  faArrowUp = faArrowUp;
  storage: any;
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
    private storageService: StorageService
  ) {}

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.storage = this.storageService.getById(id);

    if (this.storage) {
      this.slotHeightPercent = 100 / this.storage.slots.length;
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
    this.router.navigate(['/storage']);
  }

  selectSlot(slot: Slot) {
    if (this.datesChosen() && this.isAvailable(slot)) {
      this.selected.set(slot);
      this.rentFormOpen.set(false);
      this.confirmation.set(null);
    }
  }

  isDisabled(slot: Slot): boolean {
    return !this.isAvailable(slot);
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
    const ok = this.storageService.addBooking(this.storage.id, this.selected()!.id, {
      startDate: this.startDate,
      endDate: this.endDate,
    });
    if (ok) {
      this.confirmation.set({
        slotName: this.selected()!.name,
        company: this.companyName,
        start: this.startDate,
        end: this.endDate,
      });
      this.rentFormOpen.set(false);
      this.companyName = '';
      this.refreshAvailableSlots();
      this.router.navigate(['/storage']);
    }
  }

  datesChosen(): boolean {
    return !!(this.startDate && this.endDate);
  }

  refreshAvailableSlots() {
    if (!this.storage || !this.datesChosen()) {
      this.availableSlotsCache = [];
      return;
    }
    const start = new Date(this.startDate);
    const end = new Date(this.endDate);
    this.availableSlotsCache = this.storage.slots.filter((slot: any) =>
      this.isSlotAvailableForRange(slot, start, end)
    );
  }

  getAvailableSlots(): Slot[] {
    return this.availableSlotsCache;
  }

  isSlotAvailableForRange(slot: any, start: Date, end: Date): boolean {
    const bookings: { startDate: string; endDate: string }[] = slot.bookings ?? [];
    return !bookings.some((b) =>
      this.rangesOverlap(start, end, new Date(b.startDate), new Date(b.endDate))
    );
  }

  isAvailable(slot: any): boolean {
    if (!this.datesChosen()) return true;
    const start = new Date(this.startDate);
    const end = new Date(this.endDate);
    return this.isSlotAvailableForRange(slot, start, end);
  }

  isAvailableToday(slot: any): boolean {
    const today = new Date();
    const start = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const end = start;
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
