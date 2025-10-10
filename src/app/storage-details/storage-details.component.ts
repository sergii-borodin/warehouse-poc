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
          @if (requiredSlotCount > 0) {
          <div class="slot-requirement-info">
            <span class="info-icon">ℹ️</span>
            <span class="info-text">
              {{ requiredSlotCount }} slot{{ requiredSlotCount > 1 ? 's' : '' }} highlighted to meet
              your space requirement
            </span>
          </div>
          }
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
                [selectedSlots]="selectedSlots()"
                [autoSelectCount]="requiredSlotCount"
                (slotClicked)="selectSlot($event)"
                (selectedSlotsChange)="onSelectedSlotsChange($event)"
              ></app-slot-grid>
            </div>
          </div>
        </div>

        <div class="controls">
          @if (selectedSlots().length > 0) {
          <div class="selected-info">
            <h3>Selected: {{ getSelectedSlotNames() }}</h3>
            <p>
              {{ selectedSlots().length }} slot{{ selectedSlots().length > 1 ? 's' : '' }} selected
              and available
            </p>
            @if (storage && storage.slotVolume) {
            <div class="requirement-details">
              <small>
                Total area: {{ selectedSlots().length }} slot{{
                  selectedSlots().length > 1 ? 's' : ''
                }}
                × {{ storage.slotVolume }}m² = {{ selectedSlots().length * storage.slotVolume }}m²
              </small>
            </div>
            }
            <button (click)="openRentForm()">
              Rent {{ selectedSlots().length }} slot{{ selectedSlots().length > 1 ? 's' : '' }}
            </button>
          </div>
          } @if (rentFormOpen()) {
          <div class="rent-form">
            <h3>
              Rent Slot{{ selectedSlots().length > 1 ? 's' : '' }}: {{ getSelectedSlotNames() }}
            </h3>
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
            ✅ {{ confirmation()!.totalSlots }} Slot{{
              confirmation()!.totalSlots > 1 ? 's' : ''
            }}
            ({{ confirmation()!.slotIds.join(', ') }})
            {{ confirmation()!.totalSlots > 1 ? 'have' : 'has' }} been rented by "{{
              confirmation()!.company
            }}"
            <br />
            From: {{ confirmation()!.start }} To: {{ confirmation()!.end }}
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

      /* Slot requirement info */
      .slot-requirement-info {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.75rem 1rem;
        background: #e3f2fd;
        border: 1px solid #0b63d1;
        border-radius: 6px;
        margin: 1rem 0;
      }

      .info-icon {
        font-size: 1.2rem;
      }

      .info-text {
        color: #0b63d1;
        font-weight: 600;
        font-size: 0.95rem;
      }

      /* Requirement details in selected info */
      .requirement-details {
        margin-top: 0.5rem;
        padding: 0.5rem;
        background: #f8f9fa;
        border-radius: 4px;
      }

      .requirement-details small {
        color: #6c757d;
        font-size: 0.85rem;
      }

      .selected-info {
        background: #fff;
        padding: 1.5rem;
        border-radius: 8px;
        border: 1px solid #e9ecef;
      }

      .selected-info h3 {
        margin-top: 0;
        color: #0b63d1;
      }

      .selected-info button {
        margin-top: 1rem;
        width: 100%;
        padding: 0.75rem;
        background: #0b63d1;
        color: white;
        border: none;
        border-radius: 6px;
        cursor: pointer;
        font-size: 1rem;
        font-weight: 600;
      }

      .selected-info button:hover:not(:disabled) {
        background: #094a9d;
      }

      .selected-info button:disabled {
        background: #ccc;
        cursor: not-allowed;
      }
    `,
  ],
})
export class StorageDetailComponent implements OnInit {
  faArrowUp = faArrowUp;
  storage: any;
  slotHeightPercent = 0;

  selectedSlots = signal<Slot[]>([]); // Array of selected slots for multi-selection
  rentFormOpen = signal(false);
  confirmation = signal<{
    slotNames: string[];
    slotIds: number[];
    company: string;
    start: string;
    end: string;
    totalSlots: number;
  } | null>(null);

  companyName = '';
  companyEmail = '';
  companyTlf = '';
  startDate = '';
  endDate = '';
  responsiblePerson = '';
  administrator = '';
  users: User[] = [];
  private availableSlotsCache: Slot[] = [];
  requiredSlotCount = 0; // Number of slots to auto-select based on meters filter

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private storageService: StorageService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));

    // Read query params first
    const qp = this.route.snapshot.queryParamMap;
    const start = qp.get('start');
    const end = qp.get('end');
    const requiredSlots = qp.get('requiredSlots');

    if (start && end) {
      this.startDate = start;
      this.endDate = end;
    }

    // Read required slot count from query params
    if (requiredSlots) {
      this.requiredSlotCount = Number(requiredSlots);
    }

    // Get storage asynchronously
    this.storageService.getById(id).subscribe((storage) => {
      this.storage = storage;
      if (this.storage) {
        this.slotHeightPercent = 100 / this.storage.slots.length;

        // Refresh available slots after storage is loaded
        if (this.startDate && this.endDate) {
          this.refreshAvailableSlots();
        }

        // Note: Auto-selection will be handled by slot-grid component via selectedSlotsChange event
      }
    });

    // Initialize administrator field with logged-in user
    const currentUser = this.authService.getCurrentUser();
    this.administrator = currentUser ? currentUser.username : '';

    // Load users for responsible person dropdown
    this.authService.getAllUsers().subscribe((users) => {
      this.users = users;
    });
  }

  scaleWidth(width: number): number {
    return width / 2;
  }

  scaleLength(length: number): number {
    return length / 2;
  }

  /**
   * Handle selectedSlots change event from slot-grid component
   * This receives auto-selected slots from the slot-grid
   */
  onSelectedSlotsChange(slots: Slot[]): void {
    this.selectedSlots.set(slots);
  }

  /**
   * Get the IDs of all auto-selected available slots
   */
  getAutoSelectedSlotIds(): number[] {
    if (!this.storage || !this.requiredSlotCount || this.requiredSlotCount === 0) {
      return [];
    }

    const availableSlots = this.getSlotsForRendering(this.storage.slots);
    const selectedIds: number[] = [];

    for (const slot of availableSlots) {
      if (selectedIds.length >= this.requiredSlotCount) break;
      if (this.isAvailable(slot)) {
        selectedIds.push(slot.id);
      }
    }

    return selectedIds;
  }

  back() {
    this.router.navigate(['/search']);
  }

  selectSlot(slot: Slot) {
    // This method is now just for backward compatibility
    // The actual selection logic is handled by slot-grid component
    // and communicated back via onSelectedSlotsChange event

    // Clear form and confirmation when selection changes
    this.rentFormOpen.set(false);
    this.confirmation.set(null);
  }

  /**
   * Check if a slot is in the selected slots array
   */
  isSlotSelected(slotId: number): boolean {
    return this.selectedSlots().some((s) => s.id === slotId);
  }

  /**
   * Get comma-separated list of selected slot names/IDs
   */
  getSelectedSlotNames(): string {
    return this.selectedSlots()
      .map((slot) => slot.name || slot.id.toString())
      .join(', ');
  }

  /**
   * Get comma-separated list of selected slot IDs only
   */
  getSelectedSlotIds(): string {
    return this.selectedSlots()
      .map((slot) => slot.id.toString())
      .join(', ');
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
      this.selectedSlots().length === 0 ||
      !this.companyName ||
      !this.responsiblePerson ||
      !this.companyEmail ||
      !this.startDate ||
      !this.endDate ||
      !this.companyTlf
    )
      return;

    // Book all selected slots
    const bookingPromises = this.selectedSlots().map((slot) => {
      const bookingRequest = {
        storageId: this.storage.id,
        slotId: slot.id,
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
      return this.storageService.addBooking(bookingRequest);
    });

    // Wait for all bookings to complete
    let completedCount = 0;
    const totalCount = bookingPromises.length;

    bookingPromises.forEach((bookingObservable) => {
      bookingObservable.subscribe((response) => {
        if (response.success) {
          completedCount++;

          // When all bookings are complete, show confirmation
          if (completedCount === totalCount) {
            const slotNames = this.selectedSlots().map((s) => s.name || `Slot ${s.id}`);
            const slotIds = this.selectedSlots().map((s) => s.id);

            this.confirmation.set({
              slotNames: slotNames,
              slotIds: slotIds,
              company: this.companyName,
              start: this.startDate,
              end: this.endDate,
              totalSlots: totalCount,
            });

            this.rentFormOpen.set(false);
            this.companyName = '';
            this.responsiblePerson = '';
            this.selectedSlots.set([]); // Clear selection
            this.refreshAvailableSlots();
            this.router.navigate(['/storage']);
          }
        } else {
          console.error('Failed to add booking:', response.error);
        }
      });
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
