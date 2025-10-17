import { Component, Input, Output, EventEmitter, OnInit, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Slot } from '../../shared/models';

// Re-export for backward compatibility
export type { Slot };

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
        <div class="slot-content">
          <div class="slot-name">{{ getSlotName(slot) }}</div>
          <div class="slot-status">
            {{ getSlotStatusText(slot) }}
          </div>
        </div>
        <button
          class="calendar-btn"
          (click)="onViewCalendar($event, slot)"
          title="View booking calendar"
        >
          📅
        </button>
      </div>
      }
    </div>
  `,
  styles: [
    `
      .slot-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        padding: 1rem;
        gap: 1rem;
        /* width: 100%; */
      }
      .slot {
        width: 20rem;
        /* width: 3rem; */
        position: relative;
        border: 1px solid #ccc;
        border-radius: 4px;
        padding: 0.5rem;
        background: #fff;
        text-align: center;
        transition: all 0.2s ease;
        display: flex;
        align-items: center;
        justify-content: space-between;
      }

      .slot-content {
        flex: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
      }

      .calendar-btn {
        background: white;
        border: 2px solid #e2e8f0;
        border-radius: 6px;
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all 0.2s ease;
        font-size: 1rem;
        padding: 0;
        flex-shrink: 0;
      }

      .calendar-btn:hover {
        background: #0b63d1;
        border-color: #0b63d1;
        transform: scale(1.1);
        box-shadow: 0 2px 8px rgba(11, 99, 209, 0.3);
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

      .slot.unavailable .calendar-btn {
        opacity: 0.6;
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

      .slot.selected .calendar-btn {
        background: white;
        border-color: white;
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
  @Input() autoSelectCount?: number; // Number of available slots to auto-select
  @Input() selectedSlots?: Slot[]; // Array of selected slots for multi-selection

  @Output() slotClicked = new EventEmitter<Slot>();
  @Output() selectedSlotsChange = new EventEmitter<Slot[]>(); // Emit when selection changes
  @Output() viewCalendar = new EventEmitter<Slot>(); // Emit when user wants to view slot calendar

  private hasUserInteracted = false; // Track if user has manually selected/deselected

  onSlotClick(slot: Slot) {
    if (this.clickable && this.isSlotAvailable(slot)) {
      // Mark that user has manually interacted with slots
      this.hasUserInteracted = true;

      // Toggle slot selection
      const currentSelected = this.selectedSlots || [];
      const isAlreadySelected = currentSelected.some((s) => s.id === slot.id);

      let newSelection: Slot[];
      if (isAlreadySelected) {
        // Deselect the slot
        newSelection = currentSelected.filter((s) => s.id !== slot.id);
      } else {
        // Select the slot (add to array)
        newSelection = [...currentSelected, slot];
      }

      // Emit the new selection
      this.selectedSlotsChange.emit(newSelection);

      // Also emit individual slot click for backward compatibility
      this.slotClicked.emit(slot);
    }
  }

  onViewCalendar(event: Event, slot: Slot) {
    event.stopPropagation();
    this.viewCalendar.emit(slot);
  }

  isSlotSelected(slot: Slot): boolean {
    // Check if slot is in the selectedSlots array
    return this.selectedSlots ? this.selectedSlots.some((s) => s.id === slot.id) : false;
  }

  ngOnInit() {
    // Auto-select the specified number of available slots only if user hasn't interacted
    if (this.autoSelectCount && this.autoSelectCount > 0 && !this.hasUserInteracted) {
      this.initializeAutoSelection(this.autoSelectCount);
    }
  }

  ngOnChanges() {
    // Only re-initialize auto-selection if user hasn't manually interacted
    // This prevents re-auto-selecting when user deselects all slots
    if (this.autoSelectCount && this.autoSelectCount > 0 && !this.hasUserInteracted) {
      this.initializeAutoSelection(this.autoSelectCount);
    }
  }

  /**
   * Initialize selectedSlots array with first N available slots
   * This transforms autoSelectCount into actual selectedSlots
   */
  private initializeAutoSelection(count: number) {
    const autoSelected: Slot[] = [];

    for (const slot of this.slots) {
      if (autoSelected.length >= count) break;

      if (this.isSlotAvailable(slot)) {
        autoSelected.push(slot);
      }
    }

    // Emit the auto-selected slots back to parent component
    this.selectedSlotsChange.emit(autoSelected);
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
