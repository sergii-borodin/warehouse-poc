import { Component, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faArrowUp } from '@fortawesome/free-solid-svg-icons';
interface Slot {
  id: number;
  name: string;
  status: 'free' | 'reserved' | 'occupied';
}

interface Warehouse {
  id: number;
  name: string;
  width: number;
  length: number;
  slots: Slot[];
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

      } @if (warehouse) {
      <div class="content">
        <div class="visual-area">
          <div class="orient">
            <fa-icon [icon]="faArrowUp"></fa-icon>
            <p>North here</p>
          </div>
          <div
            class="warehouse-rect"
            [style.width.px]="scaleWidth(warehouse.width)"
            [style.height.px]="scaleLength(warehouse.length)"
          >
            @for (slot of warehouse.slots; track slot.id) {
            <div
              class="slot"
              [class.disabled]="isDisabled(slot)"
              [class.selected]="selected() && selected()!.id === slot.id"
              (click)="selectSlot(slot)"
              [style.height.%]="slotHeightPercent"
            >
              <div class="slot-inner">
                <div>{{ slot.name }}</div>
                <div class="status">{{ slot.status }}</div>
              </div>
            </div>
            }
          </div>
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
            <label>
              Start date
              <input type="date" [(ngModel)]="startDate" />
            </label>
            <label>
              End date
              <input type="date" [(ngModel)]="endDate" />
            </label>
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
      }
      .visual-area {
        /* flex: 2; */
      }
      .controls {
        flex: 1;
        display: flex;
        align-items: center;
        flex-direction: column;
        gap: 1rem;
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
export class WarehouseDetailComponent {
  faArrowUp = faArrowUp;
  warehouse: Warehouse = {
    id: 1,
    name: 'Main Warehouse',
    width: 500,
    length: 600,
    slots: [
      { id: 1, name: 'A1', status: 'free' },
      { id: 2, name: 'A2', status: 'reserved' },
      { id: 3, name: 'A3', status: 'occupied' },
      { id: 4, name: 'A4', status: 'free' },
      { id: 5, name: 'A5', status: 'occupied' },
      { id: 6, name: 'A6', status: 'free' },
    ],
  };

  slotHeightPercent = 100 / this.warehouse.slots.length; // dynamic amount of slots

  selected = signal<Slot | null>(null);
  rentFormOpen = signal(false);
  confirmation = signal<{ slotName: string; company: string; start: string; end: string } | null>(
    null
  );

  companyName = '';
  startDate = '';
  endDate = '';

  constructor(private router: Router, private route: ActivatedRoute) {}

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
    if (!this.isDisabled(slot)) {
      this.selected.set(slot);
      this.rentFormOpen.set(false);
      this.confirmation.set(null);
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
    this.startDate = '';
    this.endDate = '';
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
    this.startDate = '';
    this.endDate = '';
  }
}
