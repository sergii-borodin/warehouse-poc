import { Component, signal, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faArrowUp } from '@fortawesome/free-solid-svg-icons';
import { StorageService } from '../services/storage.service';
import { AuthService } from '../services/auth.service';
import { User } from '../shared/models';
import { SlotGridComponent, Slot } from '../components/slot-grid/slot-grid.component';

@Component({
  selector: 'app-storage-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, FontAwesomeModule, SlotGridComponent],
  template: `
    <div class="page">
      <button class="back" (click)="back()">← Back</button>

      @if (storage) {

      <div class="content">
        <div class="overview">
          <h3>{{ storage.name }} — Slots</h3>
          <!-- <app-slot-grid [slots]="storage.slots" [showTodayAvailability]="true"></app-slot-grid> -->
          <div class="visual-area">
            <div
              class="storage-rect"
              [style.width.px]="scaleWidth(storage.width)"
              [style.height.px]="scaleLength(storage.length)"
            >
              <!-- Gates visualization -->
              <!-- [style.width.px]=" gate === 'north' || gate === 'south' ? getGateWidth() * 3 :
              getGateWidth() " [style.height.px]=" gate === 'east' || gate === 'west' ?
              getGateHeight() * 3 : getGateHeight() " -->
              @for (gate of storage.gatePositioning; track gate) {
              <div
                class="gate gate-{{ gate }}"
                [style.width.px]="getGateWidth() * 3"
                [style.height.px]="getGateHeight()"
              >
                <span class="gate-label" west-gate="gate === 'west">{{ gate.toUpperCase() }}</span>
              </div>
              }

              <app-slot-grid
                [slots]="getSlotsForRendering(storage.slots)"
                [clickable]="true"
                [showTodayAvailability]="false"
                [customDateRange]="getDateRange()"
                [availableText]="'Available'"
                [unavailableText]="'Not available'"
                [selectedSlot]="selected()"
                (slotClicked)="selectSlot($event)"
              ></app-slot-grid>
            </div>
          </div>
        </div>

        <div class="controls">
          @if (selected()) {
          <div class="selected-info">
            <h3>Selected: {{ selected()!.name || 'Slot ' + selected()!.id }}</h3>
            <p>Selected slot is available for chosen dates</p>
            <button [disabled]="isDisabled(selected()!)" (click)="openRentForm()">Rent area</button>
          </div>
          } @if (rentFormOpen()) {
          <div class="rent-form">
            <h3>Rent {{ selected()!.name || 'Slot ' + selected()!.id }}</h3>
            <label>
              Company name
              <input [(ngModel)]="companyName" placeholder="Company name" />
            </label>
            <label>
              Responsible Person
              <select [(ngModel)]="responsiblePerson">
                <option value="">Select responsible person</option>
                @for (user of users; track user.username) {
                <option [value]="user.username">{{ user.username }}</option>
                }
              </select>
            </label>
            <label>
              Client email
              <input [(ngModel)]="companyEmail" placeholder="provide company email" />
            </label>
            <label>
              Client TLF
              <input [(ngModel)]="companyTlf" placeholder="provide client TLF" />
            </label>
            <label>
              Administrator
              <input [(ngModel)]="administrator" readonly />
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
        flex-direction: column;
        align-items: center;
        gap: 2rem;
      }
      .storage-rect {
        gap: 1rem;
        padding: 2rem;
        border: 2px solid #333;
        position: relative;
      }
      .rent-form label {
        display: block;
        margin-bottom: 0.5rem;
      }
      .rent-form input,
      .rent-form select {
        width: 100%;
        padding: 0.5rem;
        border: 1px solid #ccc;
        border-radius: 4px;
        font-size: 1rem;
        margin-top: 0.25rem;
      }
      .rent-form input[readonly] {
        background-color: #f8f9fa;
        color: #6c757d;
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
      .overview {
        display: flex;
        flex-direction: column;
        align-items: center;
        margin-top: 1rem;
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

      /* Gate styles */
      .gate {
        position: absolute;
        line-height: 0.4;
        background-color: lightgrey;
        border: 2px solid #lightgrey;
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10;
        /* border-radius: 4px; */
      }

      .gate-label {
        color: black;
        font-weight: bold;
        font-size: 10px;
      }

      /* Gate positioning */
      .gate-north {
        top: -2px;
        left: 50%;
        transform: translateX(-50%);
      }

      .gate-south {
        bottom: -2px;
        left: 50%;
        transform: translateX(-50%);
      }

      .gate-east {
        right: -22px;
        top: 50%;
        transform: translateY(-50%) rotate(-90deg);
        /* rotate: -90deg; */
      }

      .gate-west {
        left: -22px;
        top: 50%;
        transform: translateY(-50%) rotate(90deg);
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
  companyEmail = '';
  companyTlf = '';
  startDate = '';
  endDate = '';
  responsiblePerson = '';
  administrator = '';
  users: User[] = [];
  private availableSlotsCache: Slot[] = [];

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private storageService: StorageService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));

    // Get storage asynchronously
    this.storageService.getById(id).subscribe((storage) => {
      this.storage = storage;
      if (this.storage) {
        this.slotHeightPercent = 100 / this.storage.slots.length;
      }
    });

    // Initialize administrator field with logged-in user
    const currentUser = this.authService.getCurrentUser();
    this.administrator = currentUser ? currentUser.username : '';

    // Load users for responsible person dropdown
    this.authService.getAllUsers().subscribe((users) => {
      this.users = users;
    });
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
    this.router.navigate(['/search']);
  }

  selectSlot(slot: Slot) {
    if (this.datesChosen() && this.isAvailable(slot)) {
      // If clicking the same slot, deselect it
      if (this.selected() && this.selected()!.id === slot.id) {
        this.selected.set(null);
        this.rentFormOpen.set(false);
        this.confirmation.set(null);
      } else {
        // Select the new slot
        this.selected.set(slot);
        this.rentFormOpen.set(false);
        this.confirmation.set(null);
      }
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
    this.responsiblePerson = '';
    this.refreshAvailableSlots();
  }

  confirmRent() {
    if (
      !this.selected() ||
      !this.companyName ||
      !this.responsiblePerson ||
      !this.companyEmail ||
      !this.startDate ||
      !this.endDate ||
      !this.companyTlf
    )
      return;
    const bookingRequest = {
      storageId: this.storage.id,
      slotId: this.selected()!.id,
      booking: {
        startDate: this.startDate,
        endDate: this.endDate,
        responsiblePerson: this.responsiblePerson,
        companyName: this.companyName,
        companyEmail: this.companyEmail,
        administrator: this.administrator,
        companyTlf: this.companyTlf,
      },
    };

    this.storageService.addBooking(bookingRequest).subscribe((response) => {
      if (response.success) {
        this.confirmation.set({
          slotName: this.selected()!.name || `Slot ${this.selected()!.id}`,
          company: this.companyName,
          start: this.startDate,
          end: this.endDate,
        });
        this.rentFormOpen.set(false);
        this.companyName = '';
        this.responsiblePerson = '';
        this.refreshAvailableSlots();
        this.router.navigate(['/storage']);
      } else {
        console.error('Failed to add booking:', response.error);
        // You might want to show an error message to the user
      }
    });
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

  getDateRange(): { start: Date; end: Date } | undefined {
    if (!this.datesChosen()) return undefined;
    return {
      start: new Date(this.startDate),
      end: new Date(this.endDate),
    };
  }

  getSlotsForRendering(slots: Slot[]) {
    const half = Math.ceil(slots.length / 2);
    const left = slots.slice(0, half).reverse(); // left col reversed
    const right = slots.slice(half); // right col normal
    const result: Slot[] = [];

    for (let i = 0; i < half; i++) {
      if (left[i]) result.push(left[i]);
      if (right[i]) result.push(right[i]);
    }
    return result;
  }

  getGateWidth(): number {
    if (!this.storage) return 0;
    return Math.max(20, this.scaleWidth(this.storage.gateWidth));
  }

  getGateHeight(): number {
    if (!this.storage) return 0;
    return Math.max(20, this.scaleLength(this.storage.gateHeight));
  }
}
