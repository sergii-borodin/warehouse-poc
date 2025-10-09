import { Component, Input, Output, EventEmitter, OnInit, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface Slot {
  id: number;
  name?: string;
  bookings?: Array<{
    startDate: string;
    endDate: string;
  }>;
}

@Component({
  selector: 'app-slot-grid',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="slot-grid">
      @for (slot of slots; track slot.id) {
      <div
        class="slot"
        [class.available]="isSlotAvailable(slot)"
        [class.unavailable]="!isSlotAvailable(slot)"
        [class.clickable]="clickable"
        [class.selected]="isSlotSelected(slot)"
        (click)="onSlotClick(slot)"
      >
        <div class="slot-name">{{ getSlotName(slot) }}</div>
        <div class="slot-status">
          {{ getSlotStatusText(slot) }}
        </div>
      </div>
      }
    </div>
  `,
  styles: [
    `
      .slot-grid {
        display: grid;

        grid-template-columns: repeat(2, 1fr);
        gap: 10px;
        /* grid-template-rows: repeat(2, 1fr);
        grid-auto-flow: column; */
        gap: 1rem;
        width: 100%;
      }
      .slot {
        width: 10rem;
        /* width: 3rem; */

        border: 1px solid #ccc;
        border-radius: 4px;
        padding: 0.5rem;
        background: #fff;
        text-align: center;
        transition: all 0.2s ease;
      }

      .slot.clickable {
        cursor: pointer;
      }

      .slot.clickable:hover {
        /* transform: scale(1.05); */
        transform: translateY(-2px);

        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
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
        cursor: not-allowed;
      }

      .slot.selected {
        background: #0b63d1;
        border-color: #1d4ed8;
        color: white;
        box-shadow: 0 0 0 3px rgba(11, 99, 209, 0.3);
        transform: scale(1.05);
      }

      .slot.selected .slot-name {
        font-weight: bold;
      }

      .slot.selected .slot-status {
        opacity: 1;
      }

      .slot-name {
        font-weight: bold;
        margin-bottom: 0.25rem;
      }

      .slot-status {
        font-size: 0.85rem;
        opacity: 0.9;
      }

      /* Responsive design */
      @media (max-width: 768px) {
        .slot-grid {
          /* grid-template-columns: repeat(auto-fit, minmax(8rem, 1fr)); */
          grid-template-columns: repeat((2, 1fr));

          gap: 0.5rem;
        }
        .slot {
          width: 5rem;
        }
        .slot-status {
          display: none;
        }
        .slot-name {
          font-size: 0.8rem;
        }
      }
    `,
  ],
})
export class SlotGridComponent implements OnInit, OnChanges {
  @Input() slots: Slot[] = [];
  @Input() clickable = false;
  @Input() showTodayAvailability = true;
  @Input() customDateRange?: { start: Date; end: Date };
  @Input() availableText = 'Available';
  @Input() unavailableText = 'Not available';
  @Input() selectedSlot?: Slot | null;
  @Input() autoSelectCount?: number; // Number of available slots to auto-select

  @Output() slotClicked = new EventEmitter<Slot>();

  private autoSelectedSlots = new Set<number>();

  onSlotClick(slot: Slot) {
    if (this.clickable && this.isSlotAvailable(slot)) {
      this.slotClicked.emit(slot);
    }
  }

  isSlotSelected(slot: Slot): boolean {
    // Check if slot is manually selected or auto-selected
    return (
      (this.selectedSlot ? this.selectedSlot.id === slot.id : false) ||
      this.autoSelectedSlots.has(slot.id)
    );
  }

  ngOnInit() {
    // Auto-select the specified number of available slots
    if (this.autoSelectCount && this.autoSelectCount > 0) {
      this.autoSelectAvailableSlots(this.autoSelectCount);
    }
  }

  ngOnChanges() {
    // Re-calculate auto-selection when inputs change
    if (this.autoSelectCount && this.autoSelectCount > 0) {
      this.autoSelectAvailableSlots(this.autoSelectCount);
    }
  }

  private autoSelectAvailableSlots(count: number) {
    this.autoSelectedSlots.clear();
    let selectedCount = 0;

    for (const slot of this.slots) {
      if (selectedCount >= count) break;

      if (this.isSlotAvailable(slot)) {
        this.autoSelectedSlots.add(slot.id);
        selectedCount++;
      }
    }
  }

  getSlotName(slot: Slot): string {
    return slot.name || `Slot ${slot.id}`;
  }

  getSlotStatusText(slot: Slot): string {
    if (this.showTodayAvailability) {
      return this.isSlotAvailableToday(slot) ? 'Available today' : 'Not available today';
    } else if (this.customDateRange) {
      return this.isSlotAvailableForRange(
        slot,
        this.customDateRange.start,
        this.customDateRange.end
      )
        ? this.availableText
        : this.unavailableText;
    }
    return this.availableText;
  }

  isSlotAvailable(slot: Slot): boolean {
    if (this.showTodayAvailability) {
      return this.isSlotAvailableToday(slot);
    } else if (this.customDateRange) {
      return this.isSlotAvailableForRange(
        slot,
        this.customDateRange.start,
        this.customDateRange.end
      );
    }
    return true;
  }

  private isSlotAvailableToday(slot: Slot): boolean {
    const today = new Date();
    const start = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const end = start;
    const bookings = slot.bookings ?? [];
    return !bookings.some((b) =>
      this.rangesOverlap(start, end, new Date(b.startDate), new Date(b.endDate))
    );
  }

  private isSlotAvailableForRange(slot: Slot, start: Date, end: Date): boolean {
    const bookings = slot.bookings ?? [];
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
