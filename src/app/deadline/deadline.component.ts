import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { StorageService } from '../services/storage.service';
import { StorageUnit, Slot, SlotBooking } from '../shared/models';

interface ExpiringBooking {
  storageName: string;
  slotId: number;
  slotName?: string;
  booking: SlotBooking;
  daysUntilExpiry: number;
  storageId: number;
}

@Component({
  selector: 'app-deadline',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="page">
      <div class="header">
        <h1>Deadline Management</h1>
        <p>Slots with bookings expiring soon - contact clients for renewal</p>
      </div>

      @if (expiringBookings.length === 0) {
      <div class="no-bookings">
        <div class="icon">✅</div>
        <h3>No Expiring Bookings</h3>
        <p>All current bookings are still active with time remaining.</p>
      </div>
      } @else {
      <div class="bookings-list">
        @for (booking of expiringBookings; track booking.storageId + '-' + booking.slotId + '-' +
        booking.booking.startDate + '-' + booking.booking.endDate) {
        <div class="booking-card" [class.urgent]="booking.daysUntilExpiry <= 3">
          <div class="booking-header">
            <h3>{{ booking.storageName }} - Slot {{ booking.slotId }}</h3>
            <div class="urgency-badge" [class.urgent]="booking.daysUntilExpiry <= 3">
              @if (booking.daysUntilExpiry <= 0) {
              <span class="expired">EXPIRED</span>
              } @else if (booking.daysUntilExpiry <= 3) {
              <span class="urgent">{{ booking.daysUntilExpiry }} day(s) left</span>
              } @else {
              <span class="warning">{{ booking.daysUntilExpiry }} days left</span>
              }
            </div>
          </div>

          <ul class="booking-details">
            <li class="detail-row">
              <span class="label">Booking Period:</span>
              <span class="value"
                >{{ formatDate(booking.booking.startDate) }} -
                {{ formatDate(booking.booking.endDate) }}</span
              >
            </li>
            <li class="detail-row">
              <span class="label">Expires:</span>
              <span class="value">{{ formatDate(booking.booking.endDate) }}</span>
            </li>
            <li class="detail-row">
              <span class="label">Responsible person:</span>
              <span class="value capitalize">{{ booking.booking.responsiblePerson }}</span>
            </li>
            <li class="detail-row">
              <span class="label ">Administrator:</span>
              <span class="value capitalize">{{ booking.booking.administrator }}</span>
            </li>
            <li class="detail-row">
              <span class="label">Client Email:</span>
              <a href="mailto:{{ booking.booking.companyEmail }}"
                ><span class="value email-value">{{ booking.booking.companyEmail }}</span></a
              >
            </li>
            <li class="detail-row">
              <span class="label">Client TLF:</span>
              <span class="value">{{ booking.booking.companyTlf }}</span>
            </li>
            <li class="detail-row">
              <span class="label">Storage Address:</span>
              <span class="value">{{ getStorageAddress(booking.storageId) }}</span>
            </li>
          </ul>

          <div class="action">
            <button class="action-btn" (click)="viewStorage(booking.storageId)">
              👁️ View Storage
            </button>
          </div>
        </div>
        }
      </div>
      }
    </div>
  `,
  styles: [
    `
      .page {
        padding: 2rem;
        max-width: 1200px;
        margin: 0 auto;
      }

      .header {
        text-align: center;
        margin-bottom: 2rem;
      }

      .header h1 {
        color: #0b63d1;
        margin-bottom: 0.5rem;
      }

      .header p {
        color: #6b7280;
        font-size: 1.1rem;
      }

      .no-bookings {
        text-align: center;
        padding: 3rem;
        background: #f8f9fa;
        border-radius: 8px;
        border: 2px solid #e9ecef;
      }

      .no-bookings .icon {
        font-size: 3rem;
        margin-bottom: 1rem;
      }

      .no-bookings h3 {
        color: #28a745;
        margin-bottom: 0.5rem;
      }

      .no-bookings p {
        color: #6c757d;
      }

      .bookings-list {
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }

      .booking-card {
        background: white;
        border: 2px solid #e5e7eb;
        border-radius: 8px;
        padding: 1.5rem;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        transition: all 0.2s ease;
      }

      .booking-card:hover {
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
        transform: translateY(-2px);
      }

      .booking-card.urgent {
        border-color: #dc2626;
        background: #fef2f2;
      }

      .booking-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1rem;
      }

      .booking-header h3 {
        margin: 0;
        color: #1f2937;
        font-size: 1.25rem;
      }

      .urgency-badge {
        padding: 0.5rem 1rem;
        border-radius: 20px;
        font-weight: bold;
        font-size: 0.875rem;
      }

      .urgency-badge.urgent {
        background: #dc2626;
        color: white;
      }

      .urgency-badge:not(.urgent) {
        background: #f59e0b;
        color: white;
      }

      .expired {
        /* background: #6b7280 !important; */
        color: white !important;
      }

      .booking-details {
        margin-bottom: 1.5rem;
      }

      .detail-row {
        display: flex;
        justify-content: space-between;
        margin-bottom: 0.5rem;
        padding: 0.25rem 0;
      }

      .detail-row:last-child {
        margin-bottom: 0;
      }

      .label {
        font-weight: 600;
        color: #374151;
        min-width: 120px;
      }

      .value {
        color: #6b7280;
        text-align: right;
        flex: 1;
      }
      .capitalize {
        text-transform: capitalize;
      }
      .email-value {
        text-decoration: underline;
        color: #0b63d1;
        cursor: pointer;
      }
      .action {
        display: flex;
        justify-content: center;
      }
      .action-btn {
        padding: 0.75rem 1.5rem;
        border: none;
        border-radius: 6px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s ease;
        text-decoration: none;
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        background: lightgrey;
      }
      .action-btn:hover {
        background: grey;
        transform: translateY(-1px);
      }
      .btn-primary:hover {
        background: #1d4ed8;
        transform: translateY(-1px);
      }

      .btn-secondary {
        background: #6b7280;
        color: white;
      }

      .btn-secondary:hover {
        background: #4b5563;
        transform: translateY(-1px);
      }

      @media (max-width: 768px) {
        .booking-header {
          flex-direction: column;
          align-items: flex-start;
          gap: 1rem;
        }

        .detail-row {
          flex-direction: column;
          gap: 0.25rem;
        }

        .value {
          text-align: left;
        }

        .actions {
          flex-direction: column;
        }
      }
    `,
  ],
})
export class DeadlineComponent implements OnInit {
  expiringBookings: ExpiringBooking[] = [];
  storages: StorageUnit[] = [];

  constructor(private storageService: StorageService) {}

  ngOnInit() {
    this.loadExpiringBookings();
  }

  loadExpiringBookings() {
    this.storages = this.storageService.getAll();
    this.expiringBookings = [];

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (const storage of this.storages) {
      for (const slot of storage.slots) {
        if (slot.bookings) {
          for (const booking of slot.bookings) {
            const endDate = new Date(booking.endDate);
            endDate.setHours(0, 0, 0, 0);

            // Check if booking is currently active (today is within the booking range)
            const startDate = new Date(booking.startDate);
            startDate.setHours(0, 0, 0, 0);

            if (today >= startDate && today <= endDate) {
              const daysUntilExpiry = Math.ceil(
                (endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
              );

              this.expiringBookings.push({
                storageName: storage.name,
                slotId: slot.id,
                slotName: slot.name,
                booking: booking,
                daysUntilExpiry: daysUntilExpiry,
                storageId: storage.id,
              });
            }
          }
        }
      }
    }

    // Sort by days until expiry (ascending - closest to expiry first)
    this.expiringBookings.sort((a, b) => a.daysUntilExpiry - b.daysUntilExpiry);
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  getStorageAddress(storageId: number): string {
    const storage = this.storages.find((s) => s.id === storageId);
    return storage ? storage.address : 'Unknown';
  }

  contactClient(booking: ExpiringBooking) {
    // In a real application, this would open an email client or contact form
    alert(
      `Contact client for ${booking.storageName} - Slot ${
        booking.slotId
      }\nBooking expires: ${this.formatDate(booking.booking.endDate)}`
    );
  }

  viewStorage(storageId: number) {
    // Navigate to storage detail page
    window.location.href = `/storage/${storageId}`;
  }
}
