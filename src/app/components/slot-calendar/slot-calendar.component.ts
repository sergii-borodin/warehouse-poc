import { Component, Input, Output, EventEmitter, OnInit, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Slot, SlotBooking } from '../../shared/models';

interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  isBooked: boolean;
  isSelected: boolean;
  bookings: SlotBooking[];
}

interface CalendarWeek {
  days: CalendarDay[];
}

interface MonthSummary {
  monthIndex: number;
  year: number;
  monthName: string;
  days: CalendarDay[];
  bookedDaysCount: number;
  availableDaysCount: number;
}

type ViewMode = 'month' | 'year';

@Component({
  selector: 'app-slot-calendar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="calendar-overlay" (click)="onOverlayClick($event)">
      <div
        class="calendar-modal"
        [class.year-view]="viewMode === 'year'"
        (click)="$event.stopPropagation()"
      >
        <div class="calendar-header">
          <h2>{{ slot?.name || 'Slot ' + slot?.id }} - Booking Calendar</h2>
          <button class="close-btn" (click)="close.emit()" title="Close">×</button>
        </div>

        <div class="view-toggle">
          <button
            class="view-btn"
            [class.active]="viewMode === 'month'"
            (click)="setViewMode('month')"
            title="Month view"
          >
            📅 Month
          </button>
          <button
            class="view-btn"
            [class.active]="viewMode === 'year'"
            (click)="setViewMode('year')"
            title="Year view"
          >
            📆 Year
          </button>
        </div>

        @if (viewMode === 'month') {
        <!-- MONTH VIEW -->
        <div class="calendar-navigation">
          <button class="nav-btn" (click)="previousMonth()" title="Previous month">
            ← Previous
          </button>
          <h3 class="month-title">{{ getMonthYearLabel() }}</h3>
          <button class="nav-btn" (click)="nextMonth()" title="Next month">Next →</button>
        </div>

        <div class="calendar-legend">
          <div class="legend-item">
            <div class="legend-color available"></div>
            <span>Available</span>
          </div>
          <div class="legend-item">
            <div class="legend-color booked"></div>
            <span>Booked</span>
          </div>
          <div class="legend-item">
            <div class="legend-color today"></div>
            <span>Today</span>
          </div>
        </div>

        <div class="calendar-grid">
          <div class="weekday-header" *ngFor="let day of weekDays">{{ day }}</div>

          <div
            class="calendar-day"
            *ngFor="let day of calendarDays"
            [class.other-month]="!day.isCurrentMonth"
            [class.today]="day.isToday"
            [class.booked]="day.isBooked"
            [class.available]="!day.isBooked && day.isCurrentMonth"
            [title]="getDayTitle(day)"
            (click)="onDayClick(day)"
          >
            <span class="day-number">{{ day.date.getDate() }}</span>
            @if (day.isBooked && day.bookings.length > 0) {
            <div class="booking-indicator">{{ day.bookings.length }}</div>
            }
          </div>
        </div>

        @if (selectedDay && selectedDay.bookings.length > 0) {
        <div class="booking-details">
          <h4>Bookings for {{ formatDate(selectedDay.date) }}</h4>
          <div class="booking-list">
            @for (booking of selectedDay.bookings; track booking.id || $index) {
            <div class="booking-card">
              <div class="booking-company">
                <strong>{{ booking.companyName }}</strong>
              </div>
              <div class="booking-info">
                <div class="info-row">
                  <span class="label">Period:</span>
                  <span class="value"
                    >{{ formatDate(booking.startDate) }} - {{ formatDate(booking.endDate) }}</span
                  >
                </div>
                <div class="info-row">
                  <span class="label">Contact:</span>
                  <span class="value">{{ booking.responsiblePerson }}</span>
                </div>
                <div class="info-row">
                  <span class="label">Email:</span>
                  <span class="value">{{ booking.companyEmail }}</span>
                </div>
                <div class="info-row">
                  <span class="label">Phone:</span>
                  <span class="value">{{ booking.companyTlf }}</span>
                </div>
              </div>
            </div>
            }
          </div>
        </div>
        } } @else {
        <!-- YEAR VIEW -->
        <div class="year-navigation">
          <button class="nav-btn" (click)="previousYear()" title="Previous year">← Previous</button>
          <h3 class="year-title">{{ currentDate.getFullYear() }}</h3>
          <button class="nav-btn" (click)="nextYear()" title="Next year">Next →</button>
        </div>

        <div class="year-grid">
          @for (month of yearMonths; track month.monthIndex) {
          <div class="month-card" (click)="goToMonth(month.monthIndex)">
            <div class="month-card-header">
              <h4>{{ month.monthName }}</h4>
            </div>
            <div class="month-mini-calendar">
              @for (day of month.days; track day.date.getTime()) {
              <div
                class="mini-day"
                [class.booked]="day.isBooked"
                [class.available]="!day.isBooked && day.isCurrentMonth"
                [class.other-month]="!day.isCurrentMonth"
                [class.today]="day.isToday"
                [title]="getDayTitle(day)"
              ></div>
              }
            </div>
            <div class="month-stats">
              <span class="stat-booked">{{ month.bookedDaysCount }} booked</span>
              <span class="stat-available">{{ month.availableDaysCount }} available</span>
            </div>
          </div>
          }
        </div>
        }
      </div>
    </div>
  `,
  styles: [
    `
      .calendar-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.6);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
        backdrop-filter: blur(4px);
        animation: fadeIn 0.2s ease;
      }

      @keyframes fadeIn {
        from {
          opacity: 0;
        }
        to {
          opacity: 1;
        }
      }

      .calendar-modal {
        background: white;
        border-radius: 16px;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        max-width: 700px;
        width: 90%;
        max-height: 90vh;
        overflow-y: auto;
        padding: 2rem;
        animation: slideUp 0.3s ease;
      }

      @keyframes slideUp {
        from {
          transform: translateY(20px);
          opacity: 0;
        }
        to {
          transform: translateY(0);
          opacity: 1;
        }
      }

      .calendar-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1.5rem;
        padding-bottom: 1rem;
        border-bottom: 2px solid #e2e8f0;
      }

      .calendar-header h2 {
        margin: 0;
        color: #1f2937;
        font-size: 1.5rem;
        font-weight: 700;
      }

      .close-btn {
        background: none;
        border: none;
        font-size: 2rem;
        color: #6b7280;
        cursor: pointer;
        width: 40px;
        height: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 8px;
        transition: all 0.2s ease;
        line-height: 1;
      }

      .close-btn:hover {
        background: #f3f4f6;
        color: #1f2937;
      }

      .calendar-navigation {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1.5rem;
      }

      .nav-btn {
        background: white;
        border: 1px solid #e2e8f0;
        border-radius: 8px;
        padding: 0.5rem 1rem;
        font-size: 0.9rem;
        font-weight: 600;
        color: #0b63d1;
        cursor: pointer;
        transition: all 0.2s ease;
      }

      .nav-btn:hover {
        background: #f8fafc;
        border-color: #0b63d1;
        transform: translateY(-1px);
        box-shadow: 0 2px 4px rgba(11, 99, 209, 0.2);
      }

      .month-title {
        margin: 0;
        font-size: 1.25rem;
        font-weight: 700;
        color: #1f2937;
      }

      .calendar-legend {
        display: flex;
        gap: 1.5rem;
        justify-content: center;
        margin-bottom: 1.5rem;
        padding: 1rem;
        background: #f8fafc;
        border-radius: 8px;
      }

      .legend-item {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-size: 0.875rem;
        color: #374151;
      }

      .legend-color {
        width: 20px;
        height: 20px;
        border-radius: 4px;
        border: 1px solid #d1d5db;
      }

      .legend-color.available {
        background: #d1fae5;
        border-color: #10b981;
      }

      .legend-color.booked {
        background: #fee2e2;
        border-color: #ef4444;
      }

      .legend-color.today {
        background: #dbeafe;
        border: 2px solid #0b63d1;
      }

      .calendar-grid {
        display: grid;
        grid-template-columns: repeat(7, 1fr);
        gap: 0.5rem;
        margin-bottom: 1.5rem;
      }

      .weekday-header {
        text-align: center;
        font-weight: 700;
        font-size: 0.875rem;
        color: #6b7280;
        padding: 0.75rem 0.5rem;
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }

      .calendar-day {
        aspect-ratio: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.2s ease;
        position: relative;
        font-size: 0.9rem;
        font-weight: 600;
        border: 2px solid transparent;
        min-height: 50px;
      }

      .calendar-day.other-month {
        opacity: 0.3;
        cursor: default;
      }

      .calendar-day.available {
        background: #d1fae5;
        border-color: #10b981;
        color: #065f46;
      }

      .calendar-day.available:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 8px rgba(16, 185, 129, 0.2);
      }

      .calendar-day.booked {
        background: #fee2e2;
        border-color: #ef4444;
        color: #991b1b;
      }

      .calendar-day.booked:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 8px rgba(239, 68, 68, 0.2);
      }

      .calendar-day.today {
        border: 2px solid #0b63d1;
        box-shadow: 0 0 0 3px rgba(11, 99, 209, 0.1);
      }

      .day-number {
        font-size: 1rem;
        margin-bottom: 0.25rem;
      }

      .booking-indicator {
        position: absolute;
        bottom: 4px;
        right: 4px;
        background: #991b1b;
        color: white;
        border-radius: 10px;
        width: 20px;
        height: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 0.75rem;
        font-weight: 700;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
      }

      .booking-details {
        margin-top: 1.5rem;
        padding-top: 1.5rem;
        border-top: 2px solid #e2e8f0;
      }

      .booking-details h4 {
        margin: 0 0 1rem 0;
        color: #1f2937;
        font-size: 1.125rem;
        font-weight: 700;
      }

      .booking-list {
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }

      .booking-card {
        background: linear-gradient(135deg, #fff5f5 0%, #fef2f2 100%);
        border: 2px solid #fecaca;
        border-radius: 12px;
        padding: 1rem;
        transition: all 0.2s ease;
      }

      .booking-card:hover {
        border-color: #ef4444;
        box-shadow: 0 4px 8px rgba(239, 68, 68, 0.1);
      }

      .booking-company {
        margin-bottom: 0.75rem;
        padding-bottom: 0.75rem;
        border-bottom: 1px solid #fecaca;
      }

      .booking-company strong {
        color: #991b1b;
        font-size: 1.125rem;
      }

      .booking-info {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
      }

      .info-row {
        display: flex;
        gap: 0.5rem;
        font-size: 0.875rem;
      }

      .info-row .label {
        font-weight: 600;
        color: #6b7280;
        min-width: 70px;
      }

      .info-row .value {
        color: #374151;
      }

      /* View Toggle */
      .view-toggle {
        display: flex;
        gap: 0.5rem;
        justify-content: center;
        margin-bottom: 1.5rem;
        padding: 0.5rem;
        background: #f8fafc;
        border-radius: 12px;
      }

      .view-btn {
        flex: 1;
        padding: 0.75rem 1.5rem;
        border: 2px solid #e2e8f0;
        border-radius: 8px;
        background: white;
        color: #6b7280;
        font-size: 0.95rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s ease;
      }

      .view-btn:hover {
        border-color: #0b63d1;
        color: #0b63d1;
      }

      .view-btn.active {
        background: linear-gradient(135deg, #0b63d1 0%, #1d4ed8 100%);
        border-color: #0b63d1;
        color: white;
        box-shadow: 0 2px 8px rgba(11, 99, 209, 0.3);
      }

      /* Year View */
      .calendar-modal.year-view {
        max-width: 1200px;
      }

      .year-navigation {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 2rem;
      }

      .year-title {
        margin: 0;
        font-size: 1.75rem;
        font-weight: 700;
        color: #1f2937;
      }

      .year-grid {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 1.5rem;
        margin-bottom: 1.5rem;
      }

      .month-card {
        background: white;
        border: 2px solid #e2e8f0;
        border-radius: 12px;
        padding: 1rem;
        cursor: pointer;
        transition: all 0.2s ease;
      }

      .month-card:hover {
        border-color: #0b63d1;
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(11, 99, 209, 0.2);
      }

      .month-card-header {
        margin-bottom: 0.75rem;
        padding-bottom: 0.5rem;
        border-bottom: 2px solid #e2e8f0;
      }

      .month-card-header h4 {
        margin: 0;
        color: #1f2937;
        font-size: 1rem;
        font-weight: 700;
        text-align: center;
      }

      .month-mini-calendar {
        display: grid;
        grid-template-columns: repeat(7, 1fr);
        gap: 2px;
        margin-bottom: 0.75rem;
      }

      .mini-day {
        aspect-ratio: 1;
        border-radius: 2px;
        transition: all 0.2s ease;
      }

      .mini-day.available {
        background: #d1fae5;
      }

      .mini-day.booked {
        background: #fee2e2;
      }

      .mini-day.other-month {
        opacity: 0.2;
      }

      .mini-day.today {
        border: 1px solid #0b63d1;
        box-shadow: 0 0 0 1px #0b63d1;
      }

      .month-stats {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding-top: 0.5rem;
        border-top: 1px solid #f3f4f6;
        font-size: 0.75rem;
      }

      .stat-booked {
        color: #ef4444;
        font-weight: 600;
      }

      .stat-available {
        color: #10b981;
        font-weight: 600;
      }

      @media (max-width: 1024px) {
        .year-grid {
          grid-template-columns: repeat(3, 1fr);
          gap: 1rem;
        }
      }

      @media (max-width: 768px) {
        .calendar-modal {
          width: 95%;
          padding: 1.5rem;
        }

        .calendar-modal.year-view {
          max-width: 95%;
        }

        .calendar-header h2 {
          font-size: 1.25rem;
        }

        .calendar-grid {
          gap: 0.25rem;
        }

        .calendar-day {
          min-height: 45px;
          font-size: 0.875rem;
        }

        .day-number {
          font-size: 0.875rem;
        }

        .nav-btn {
          padding: 0.4rem 0.75rem;
          font-size: 0.8rem;
        }

        .month-title,
        .year-title {
          font-size: 1rem;
        }

        .year-grid {
          grid-template-columns: repeat(2, 1fr);
          gap: 0.75rem;
        }

        .month-card {
          padding: 0.75rem;
        }

        .view-btn {
          padding: 0.6rem 1rem;
          font-size: 0.85rem;
        }
      }

      @media (max-width: 480px) {
        .year-grid {
          grid-template-columns: 1fr;
        }
      }
    `,
  ],
})
export class SlotCalendarComponent implements OnInit, OnChanges {
  @Input() slot?: Slot;
  @Input() initialDate?: Date;
  @Output() close = new EventEmitter<void>();

  weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  calendarDays: CalendarDay[] = [];
  currentDate: Date = new Date();
  selectedDay?: CalendarDay;

  // Year view properties
  viewMode: ViewMode = 'month';
  yearMonths: MonthSummary[] = [];

  ngOnInit() {
    if (this.initialDate) {
      this.currentDate = new Date(this.initialDate);
    }
    this.generateCalendar();
    this.generateYearView();
  }

  ngOnChanges() {
    this.generateCalendar();
    this.generateYearView();
  }

  setViewMode(mode: ViewMode) {
    this.viewMode = mode;
    if (mode === 'year') {
      this.generateYearView();
    }
  }

  goToMonth(monthIndex: number) {
    this.currentDate = new Date(this.currentDate.getFullYear(), monthIndex, 1);
    this.viewMode = 'month';
    this.generateCalendar();
  }

  previousMonth() {
    this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() - 1, 1);
    this.generateCalendar();
  }

  nextMonth() {
    this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1, 1);
    this.generateCalendar();
  }

  getMonthYearLabel(): string {
    return this.currentDate.toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric',
    });
  }

  generateCalendar() {
    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();

    // First day of the month
    const firstDay = new Date(year, month, 1);
    const startingDayOfWeek = firstDay.getDay();

    // Last day of the month
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();

    // Previous month's days
    const prevMonthLastDay = new Date(year, month, 0);
    const prevMonthDays = prevMonthLastDay.getDate();

    // Generate calendar days
    const days: CalendarDay[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Add previous month's trailing days
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const date = new Date(year, month - 1, prevMonthDays - i);
      days.push(this.createCalendarDay(date, false));
    }

    // Add current month's days
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      days.push(this.createCalendarDay(date, true));
    }

    // Add next month's leading days to complete the grid
    const remainingDays = 42 - days.length; // 6 weeks * 7 days
    for (let day = 1; day <= remainingDays; day++) {
      const date = new Date(year, month + 1, day);
      days.push(this.createCalendarDay(date, false));
    }

    this.calendarDays = days;
  }

  createCalendarDay(date: Date, isCurrentMonth: boolean): CalendarDay {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const compareDate = new Date(date);
    compareDate.setHours(0, 0, 0, 0);

    const bookings = this.getBookingsForDate(date);

    return {
      date: compareDate,
      isCurrentMonth,
      isToday: compareDate.getTime() === today.getTime(),
      isBooked: bookings.length > 0,
      isSelected: false,
      bookings,
    };
  }

  getBookingsForDate(date: Date): SlotBooking[] {
    if (!this.slot?.bookings) return [];

    const checkDate = new Date(date);
    checkDate.setHours(0, 0, 0, 0);

    return this.slot.bookings.filter((booking) => {
      const startDate = new Date(booking.startDate);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(booking.endDate);
      endDate.setHours(0, 0, 0, 0);

      return checkDate >= startDate && checkDate <= endDate;
    });
  }

  onDayClick(day: CalendarDay) {
    if (!day.isCurrentMonth) return;

    // Toggle selection
    if (this.selectedDay === day) {
      this.selectedDay = undefined;
    } else {
      this.selectedDay = day;
    }
  }

  getDayTitle(day: CalendarDay): string {
    if (!day.isBooked) {
      return `Available on ${this.formatDate(day.date)}`;
    }
    const count = day.bookings.length;
    return `${count} booking${count > 1 ? 's' : ''} on ${this.formatDate(
      day.date
    )} - Click for details`;
  }

  formatDate(dateInput: string | Date): string {
    const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  onOverlayClick(event: MouseEvent) {
    this.close.emit();
  }

  previousYear() {
    this.currentDate = new Date(this.currentDate.getFullYear() - 1, this.currentDate.getMonth(), 1);
    this.generateYearView();
  }

  nextYear() {
    this.currentDate = new Date(this.currentDate.getFullYear() + 1, this.currentDate.getMonth(), 1);
    this.generateYearView();
  }

  generateYearView() {
    const year = this.currentDate.getFullYear();
    this.yearMonths = [];

    // Generate all 12 months for the year
    for (let monthIndex = 0; monthIndex < 12; monthIndex++) {
      const monthDate = new Date(year, monthIndex, 1);
      const monthName = monthDate.toLocaleDateString('en-US', { month: 'long' });

      // Generate days for this month
      const days = this.generateMonthDays(year, monthIndex);

      // Count booked and available days
      const bookedDaysCount = days.filter((d) => d.isBooked && d.isCurrentMonth).length;
      const availableDaysCount = days.filter((d) => !d.isBooked && d.isCurrentMonth).length;

      this.yearMonths.push({
        monthIndex,
        year,
        monthName,
        days,
        bookedDaysCount,
        availableDaysCount,
      });
    }
  }

  generateMonthDays(year: number, month: number): CalendarDay[] {
    // First day of the month
    const firstDay = new Date(year, month, 1);
    const startingDayOfWeek = firstDay.getDay();

    // Last day of the month
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();

    // Previous month's days
    const prevMonthLastDay = new Date(year, month, 0);
    const prevMonthDays = prevMonthLastDay.getDate();

    // Generate calendar days
    const days: CalendarDay[] = [];

    // Add previous month's trailing days
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const date = new Date(year, month - 1, prevMonthDays - i);
      days.push(this.createCalendarDay(date, false));
    }

    // Add current month's days
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      days.push(this.createCalendarDay(date, true));
    }

    // Add next month's leading days to complete the grid
    const remainingDays = 42 - days.length; // 6 weeks * 7 days
    for (let day = 1; day <= remainingDays; day++) {
      const date = new Date(year, month + 1, day);
      days.push(this.createCalendarDay(date, false));
    }

    return days;
  }
}
