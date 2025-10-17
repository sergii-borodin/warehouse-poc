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
import { SlotCalendarComponent } from '../components/slot-calendar/slot-calendar.component';

@Component({
  selector: 'app-storage-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, FontAwesomeModule, SlotGridComponent, SlotCalendarComponent],
  template: `
    <div class="page">
      <button class="back" (click)="back()">← Back to Search</button>

      @if (storage) {

      <header class="page-header">
        <h1>{{ storage.name }}</h1>
        <p class="storage-details-meta">
          Storage Type: <span class="highlight">{{ storage.storageType }}</span> @if
          (storage.gateHeight && storage.gateWidth) { • Gate:
          <span class="highlight">{{ storage.gateHeight }}m × {{ storage.gateWidth }}m</span> } @if
          (storage.slotVolume) { • Slot Volume:
          <span class="highlight">{{ storage.slotVolume }}m²</span>
          }
        </p>
      </header>

      <div class="content">
        <section class="overview">
          <h2 class="section-title">Storage Layout</h2>
          @if (requiredSlotCount > 0) {
          <div class="slot-requirement-info">
            <span class="info-icon">ℹ️</span>
            <span class="info-text">
              {{ requiredSlotCount }} slot{{ requiredSlotCount > 1 ? 's' : '' }} highlighted to meet
              your space requirement
            </span>
          </div>
          }
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
                (viewCalendar)="onViewSlotCalendar($event)"
              ></app-slot-grid>
            </div>
          </div>
        </section>

        @if (selectedSlotForCalendar) {
        <app-slot-calendar
          [slot]="selectedSlotForCalendar"
          [initialDate]="getInitialCalendarDate()"
          (close)="closeSlotCalendar()"
        ></app-slot-calendar>
        }

        <section class="controls">
          <h2 class="section-title">Booking Details</h2>
          @if (selectedSlots().length > 0) {
          <div class="selected-info">
            <h3>Selected Slots</h3>
            <p class="slot-names">{{ getSelectedSlotNames() }}</p>
            <p class="slot-count">
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
            <div class="dates-section">
              <label class="dates-label">Booking Period</label>
              <div class="dates">
                <div>From: {{ startDate }}</div>
                <div>To: {{ endDate }}</div>
              </div>
            </div>
            <div class="form-actions">
              <button (click)="confirmRent()">Confirm</button>
              <button (click)="cancelRent()">Cancel</button>
            </div>
          </div>
          } @if (confirmation()) {
          <div class="confirmation">
            <strong>Booking Confirmed!</strong>
            <p>
              ✅ {{ confirmation()!.totalSlots }} Slot{{
                confirmation()!.totalSlots > 1 ? 's' : ''
              }}
              ({{ confirmation()!.slotIds.join(', ') }})
              {{ confirmation()!.totalSlots > 1 ? 'have' : 'has' }} been rented by "{{
                confirmation()!.company
              }}"
            </p>
            <p class="confirmation-dates">
              From: <strong>{{ confirmation()!.start }}</strong> To:
              <strong>{{ confirmation()!.end }}</strong>
            </p>
          </div>
          } @if (selectedSlots().length === 0 && !rentFormOpen() && !confirmation()) {
          <div class="empty-state">
            <p>Select slots from the storage layout to start booking</p>
          </div>
          }
        </section>
      </div>
      }
    </div>
  `,
  styles: [
    `
      * {
        box-sizing: border-box;
      }

      .page {
        padding: 1rem;
        max-width: 100%;
        overflow-x: hidden;
        min-height: 100vh;
        box-sizing: border-box;
      }
      .back {
        margin-bottom: 1rem;
        padding: 0.75rem 1.5rem;
        background: white;
        color: #0b63d1;
        border: 1px solid #e2e8f0;
        border-radius: 12px;
        cursor: pointer;
        font-size: 0.95rem;
        font-weight: 600;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
      }
      .back:hover {
        border-color: #0b63d1;
        box-shadow: 0 10px 25px -5px rgba(11, 99, 209, 0.2), 0 8px 10px -6px rgba(11, 99, 209, 0.1);
        transform: translateY(-2px);
      }

      .page-header {
        margin-bottom: 2rem;
        padding: 1.5rem;
        background: white;
        border-radius: 12px;
        border: 1px solid #e2e8f0;
        box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
      }

      .page-header h1 {
        margin: 0 0 0.5rem 0;
        color: #1f2937;
        font-size: 1.75rem;
        font-weight: 700;
      }

      .storage-details-meta {
        margin: 0;
        color: #6b7280;
        font-size: 0.9rem;
        line-height: 1.6;
      }

      .storage-details-meta .highlight {
        color: #0b63d1;
        font-weight: 600;
      }

      .section-title {
        margin: 0 0 1rem 0;
        color: #1f2937;
        font-size: 1.125rem;
        font-weight: 700;
        padding-bottom: 0.5rem;
        border-bottom: 2px solid #e2e8f0;
      }

      .content {
        display: flex;
        flex-direction: row;
        align-items: flex-start;
        justify-content: space-around;
        gap: 2rem;
        max-width: 100%;
        overflow-x: hidden;
      }

      @media (max-width: 1200px) {
        .content {
          flex-direction: column;
          align-items: center;
        }
      }
      .storage-rect {
        gap: 1rem;
        padding: 1.5rem;
        border: 2px solid #e2e8f0;
        border-radius: 12px;
        position: relative;
        background: white;
        box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
        max-width: 100%;
      }
      .rent-form {
        background: white;
        padding: 1.25rem;
        border-radius: 12px;
        border: 1px solid #e2e8f0;
        box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
        width: 100%;
      }
      .rent-form h3 {
        margin-top: 0;
        margin-bottom: 1.25rem;
        color: #1f2937;
        font-size: 1rem;
        font-weight: 700;
        padding-bottom: 0.75rem;
        border-bottom: 2px solid #e2e8f0;
      }
      .rent-form label {
        display: block;
        margin-bottom: 0.875rem;
        color: #374151;
        font-weight: 500;
        font-size: 0.875rem;
      }
      .rent-form input,
      .rent-form select {
        width: 100%;
        padding: 0.625rem;
        border: 1px solid #e2e8f0;
        border-radius: 8px;
        font-size: 0.875rem;
        margin-top: 0.25rem;
        transition: all 0.2s ease;
      }
      .rent-form input:focus,
      .rent-form select:focus {
        outline: none;
        border-color: #0b63d1;
        box-shadow: 0 0 0 3px rgba(11, 99, 209, 0.1);
      }
      .rent-form input[readonly] {
        background-color: #f8fafc;
        color: #6b7280;
      }
      .dates-section {
        margin-bottom: 0.875rem;
      }
      .dates-label {
        display: block;
        margin-bottom: 0.5rem;
        color: #374151;
        font-weight: 500;
        font-size: 0.875rem;
      }
      .dates {
        margin: 0;
        padding: 0.875rem;
        background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
        border-radius: 8px;
        font-size: 0.875rem;
        color: #374151;
        line-height: 1.5;
        border: 1px solid #e2e8f0;
      }
      .dates div {
        margin: 0.25rem 0;
        font-weight: 500;
      }
      .dates div:first-child {
        margin-top: 0;
      }
      .dates div:last-child {
        margin-bottom: 0;
      }
      .form-actions {
        margin-top: 1.25rem;
        display: flex;
        gap: 0.75rem;
      }
      .form-actions button {
        flex: 1;
        padding: 0.625rem;
        border: none;
        border-radius: 8px;
        font-size: 0.9rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      }
      .form-actions button:first-child {
        background: linear-gradient(135deg, #0b63d1 0%, #1d4ed8 100%);
        color: white;
        box-shadow: 0 2px 4px rgba(11, 99, 209, 0.3);
      }
      .form-actions button:first-child:hover {
        box-shadow: 0 10px 25px -5px rgba(11, 99, 209, 0.4), 0 8px 10px -6px rgba(11, 99, 209, 0.2);
        transform: translateY(-2px);
      }
      .form-actions button:last-child {
        background: white;
        color: #6b7280;
        border: 1px solid #e2e8f0;
      }
      .form-actions button:last-child:hover {
        border-color: #d1d5db;
        background: #f8fafc;
      }
      .confirmation {
        background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
        border: 2px solid #10b981;
        padding: 1.25rem;
        border-radius: 12px;
        font-size: 0.875rem;
        color: #065f46;
        box-shadow: 0 1px 3px 0 rgba(16, 185, 129, 0.2);
        width: 100%;
        line-height: 1.6;
      }

      .confirmation strong {
        display: block;
        font-size: 1rem;
        margin-bottom: 0.75rem;
        color: #047857;
      }

      .confirmation p {
        margin: 0.5rem 0;
      }

      .confirmation-dates {
        margin-top: 0.75rem;
        padding-top: 0.75rem;
        border-top: 1px solid #10b981;
        font-size: 0.8125rem;
      }

      .confirmation-dates strong {
        display: inline;
        font-size: inherit;
        margin: 0;
      }

      .empty-state {
        padding: 2rem 1.5rem;
        text-align: center;
        background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
        border: 2px dashed #d1d5db;
        border-radius: 12px;
        color: #6b7280;
      }

      .empty-state p {
        margin: 0;
        font-size: 0.95rem;
        line-height: 1.6;
      }
      .overview {
        display: flex;
        flex-direction: column;
        align-items: center;
        flex: 1 1 auto;
        min-width: 0;
      }
      .visual-area {
        width: 100%;
        display: flex;
        justify-content: center;
        align-items: flex-start;
      }
      .controls {
        flex: 0 0 auto;
        width: 400px;
        min-width: 350px;
        max-width: 450px;
        display: flex;
        flex-direction: column;
        align-items: stretch;
        gap: 1rem;
        background: white;
        padding: 1.5rem;
        border-radius: 12px;
        border: 1px solid #e2e8f0;
        box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
      }

      .controls .section-title {
        margin-bottom: 1.25rem;
      }

      @media (max-width: 1200px) {
        .page-header h1 {
          font-size: 1.5rem;
        }

        .controls {
          width: 100%;
          max-width: 500px;
        }
      }
      .slots-grid {
        width: 21rem;
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 1rem;
      }
      .slot {
        width: 10rem;
        border: 1px solid #e2e8f0;
        border-radius: 8px;
        padding: 0.5rem;
        background: white;
        text-align: center;
        transition: all 0.2s ease;
      }
      .slot.available {
        background: #d1fae5;
        border-color: #10b981;
        color: #065f46;
      }
      .slot.unavailable {
        background: #fee2e2;
        border-color: #ef4444;
        color: #991b1b;
      }

      /* Gate styles */
      .gate {
        position: absolute;
        line-height: 0.4;
        background: linear-gradient(135deg, #d1d5db 0%, #9ca3af 100%);
        border: 2px solid #6b7280;
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10;
        border-radius: 6px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      }

      .gate-label {
        color: #1f2937;
        font-weight: bold;
        font-size: 10px;
        text-transform: uppercase;
        letter-spacing: 0.5px;
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
        gap: 0.75rem;
        padding: 1rem;
        background: white;
        border: 2px solid #0b63d1;
        border-radius: 12px;
        margin: 0.5rem 0 1rem 0;
        box-shadow: 0 1px 3px 0 rgba(11, 99, 209, 0.1);
        max-width: 100%;
      }

      .info-icon {
        font-size: 1.5rem;
      }

      .info-text {
        color: #0b63d1;
        font-weight: 600;
        font-size: 0.9rem;
        line-height: 1.4;
        flex: 1;
      }

      /* Requirement details in selected info */
      .requirement-details {
        margin-top: 0.625rem;
        padding: 0.625rem 0.75rem;
        background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
        border-radius: 8px;
        border: 1px solid #e2e8f0;
      }

      .requirement-details small {
        color: #6b7280;
        font-size: 0.8125rem;
        line-height: 1.5;
      }

      .selected-info {
        background: white;
        padding: 1.25rem;
        border-radius: 12px;
        border: 1px solid #e2e8f0;
        box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
        width: 100%;
      }

      .selected-info h3 {
        margin-top: 0;
        color: #0b63d1;
        font-size: 1rem;
        margin-bottom: 0.75rem;
        line-height: 1.4;
        font-weight: 700;
      }

      .selected-info .slot-names {
        color: #1f2937;
        font-size: 0.95rem;
        margin: 0 0 0.5rem 0;
        font-weight: 600;
        line-height: 1.5;
      }

      .selected-info .slot-count {
        color: #6b7280;
        font-size: 0.875rem;
        margin: 0 0 0.5rem 0;
        line-height: 1.5;
      }

      .selected-info button {
        margin-top: 0.875rem;
        width: 100%;
        padding: 0.75rem;
        background: linear-gradient(135deg, #0b63d1 0%, #1d4ed8 100%);
        color: white;
        border: none;
        border-radius: 8px;
        cursor: pointer;
        font-size: 0.95rem;
        font-weight: 600;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        box-shadow: 0 2px 4px rgba(11, 99, 209, 0.3);
      }

      .selected-info button:hover:not(:disabled) {
        box-shadow: 0 10px 25px -5px rgba(11, 99, 209, 0.4), 0 8px 10px -6px rgba(11, 99, 209, 0.2);
        transform: translateY(-2px);
      }

      .selected-info button:disabled {
        background: #d1d5db;
        cursor: not-allowed;
        box-shadow: none;
        transform: none;
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

  // Calendar modal state
  selectedSlotForCalendar?: Slot;

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

  /**
   * Open the calendar modal for a specific slot
   */
  onViewSlotCalendar(slot: Slot) {
    this.selectedSlotForCalendar = slot;
  }

  /**
   * Close the calendar modal
   */
  closeSlotCalendar() {
    this.selectedSlotForCalendar = undefined;
  }

  /**
   * Get the initial date to show in the calendar
   */
  getInitialCalendarDate(): Date {
    if (this.startDate) {
      return new Date(this.startDate);
    }
    return new Date();
  }
}
