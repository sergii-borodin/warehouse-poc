import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChartConfiguration, ChartOptions } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import { StorageService } from '../services/storage.service';

interface StorageStats {
  id: number;
  name: string;
  totalSlots: number;
  availableSlots: number;
  utilizationRate: number;
  frostFreeSlots: number;
  nonFrostFreeSlots: number;
}

@Component({
  selector: 'app-timeline',
  standalone: true,
  imports: [CommonModule, FormsModule, BaseChartDirective],
  template: `
    <div class="page">
      <div class="page-header">
        <h2>Storage Analytics & Timeline</h2>
        <div class="date-selector">
          <label for="startDate">View statistics for date range:</label>
          <div class="date-inputs">
            <input
              type="date"
              id="startDate"
              [(ngModel)]="selectedStartDate"
              (ngModelChange)="onStartDateChange()"
              [max]="maxDate"
            />
            <span class="date-separator">to</span>
            <input
              type="date"
              id="endDate"
              [(ngModel)]="selectedEndDate"
              (ngModelChange)="onEndDateChange()"
              [min]="selectedStartDate"
              [max]="maxDate"
            />
          </div>
          <button class="today-btn" (click)="setToday()">Today</button>
          <button class="preset-btn" (click)="setNextWeek()">Next Week</button>
          <button class="preset-btn" (click)="setNextMonth()">Next Month</button>
          <span class="date-display">{{ formatSelectedDateRange() }}</span>
        </div>
      </div>

      <div class="stats-grid">
        <div class="stat-card">
          <h3>Overall Utilization</h3>
          <div class="stat-value">{{ overallUtilization }}%</div>
          <div class="stat-detail">
            {{ totalAvailableSlots }}/{{ totalSlots }} slots available for selected period
          </div>
        </div>

        <div class="stat-card">
          <h3>Total Storages</h3>
          <div class="stat-value">{{ storages.length }}</div>
          <div class="stat-detail">{{ frostFreeWarehouses }} with frost free</div>
        </div>

        <div class="stat-card">
          <h3>Most Utilized</h3>
          <div class="stat-value">{{ mostUtilizedWarehouse?.name || 'N/A' }}</div>
          <div class="stat-detail">
            {{ mostUtilizedWarehouse?.utilizationRate || 0 }}% utilization
          </div>
        </div>
      </div>

      <div class="charts-row-primary">
        <div class="chart-container">
          <h3>Warehouse Utilization (selected period)</h3>
          <canvas
            baseChart
            [data]="utilizationChartData"
            [options]="utilizationChartOptions"
            [type]="'bar'"
          >
          </canvas>
        </div>

        <div class="chart-container chart-container-wide">
          <h3>Slot Availability Timeline</h3>
          <p class="chart-subtitle">{{ timelineChartSubtitle }}</p>
          <canvas
            baseChart
            [data]="timelineChartData"
            [options]="timelineChartOptions"
            [type]="'line'"
          >
          </canvas>
        </div>
      </div>

      <div class="charts-row-secondary">
        <div class="chart-container">
          <h3>Frost-free vs Non-Frost-free Distribution</h3>
          <canvas
            baseChart
            [data]="frostFreeChartData"
            [options]="frostFreeChartOptions"
            [type]="'doughnut'"
          >
          </canvas>
        </div>

        <div class="chart-container">
          <h3>Warehouse Capacity Overview</h3>
          <canvas
            baseChart
            [data]="capacityChartData"
            [options]="capacityChartOptions"
            [type]="'radar'"
          >
          </canvas>
        </div>
      </div>

      <div class="warehouse-list">
        <h3>Warehouse Details (for selected period)</h3>
        <div class="warehouse-cards">
          <div class="warehouse-card" *ngFor="let storage of storageStats">
            <div class="warehouse-header">
              <h4>{{ storage.name }}</h4>
              <div
                class="utilization-badge"
                [class.high]="storage.utilizationRate > 70"
                [class.medium]="storage.utilizationRate > 40 && storage.utilizationRate <= 70"
                [class.low]="storage.utilizationRate <= 40"
              >
                {{ storage.utilizationRate }}%
              </div>
            </div>
            <div class="warehouse-details">
              <div class="detail-item">
                <span class="label">Available:</span>
                <span class="value">{{ storage.availableSlots }}/{{ storage.totalSlots }}</span>
              </div>
              <div class="detail-item">
                <span class="label">Frost-Free:</span>
                <span class="value">{{ storage.frostFreeSlots }} slots</span>
              </div>
              <div class="detail-item">
                <span class="label">Non-Frost-Free:</span>
                <span class="value">{{ storage.nonFrostFreeSlots }} slots</span>
              </div>
            </div>
          </div>
        </div>
      </div>
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
      }

      .page-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 2rem;
        padding: 1rem;
        background: white;
        border-radius: 12px;
        border: 1px solid #e2e8f0;
        box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
        flex-wrap: wrap;
        gap: 1rem;
      }

      .page-header h2 {
        margin: 0;
        color: #1f2937;
        font-size: 1.5rem;
        font-weight: 700;
      }

      .date-selector {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        flex-wrap: wrap;
      }

      .date-selector label {
        color: #374151;
        font-weight: 600;
        font-size: 0.95rem;
      }

      .date-inputs {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
        padding: 0.5rem;
        border-radius: 8px;
        border: 1px solid #e2e8f0;
      }

      .date-separator {
        color: #6b7280;
        font-weight: 500;
        font-size: 0.875rem;
      }

      .date-selector input[type='date'] {
        padding: 0.625rem;
        border: 1px solid #e2e8f0;
        border-radius: 8px;
        font-size: 0.9rem;
        color: #374151;
        transition: all 0.2s ease;
        background: white;
      }

      .date-selector input[type='date']:focus {
        outline: none;
        border-color: #0b63d1;
        box-shadow: 0 0 0 3px rgba(11, 99, 209, 0.1);
      }

      .today-btn,
      .preset-btn {
        padding: 0.625rem 1rem;
        background: linear-gradient(135deg, #0b63d1 0%, #1d4ed8 100%);
        color: white;
        border: none;
        border-radius: 8px;
        font-size: 0.875rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        box-shadow: 0 2px 4px rgba(11, 99, 209, 0.3);
        white-space: nowrap;
      }

      .preset-btn {
        background: white;
        color: #0b63d1;
        border: 1px solid #e2e8f0;
        box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
      }

      .today-btn:hover,
      .preset-btn:hover {
        box-shadow: 0 10px 25px -5px rgba(11, 99, 209, 0.4), 0 8px 10px -6px rgba(11, 99, 209, 0.2);
        transform: translateY(-2px);
      }

      .preset-btn:hover {
        border-color: #0b63d1;
        background: #f8fafc;
      }

      .date-display {
        color: #0b63d1;
        font-weight: 600;
        font-size: 0.95rem;
        padding: 0.5rem 1rem;
        background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
        border-radius: 8px;
        border: 1px solid #e2e8f0;
      }

      @media (max-width: 768px) {
        .page-header {
          flex-direction: column;
          align-items: flex-start;
          padding: 0.875rem;
        }

        .page-header h2 {
          font-size: 1.25rem;
        }

        .date-selector {
          width: 100%;
        }

        .date-inputs {
          flex-direction: column;
          align-items: stretch;
        }

        .date-separator {
          text-align: center;
        }

        .stat-card {
          padding: 1rem;
        }
      }

      .stats-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 1rem;
        margin-bottom: 2rem;
      }

      .stat-card {
        background: white;
        border: 1px solid #e2e8f0;
        border-radius: 12px;
        padding: 1.25rem;
        text-align: center;
        box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      }

      .stat-card:hover {
        border-color: #0b63d1;
        box-shadow: 0 10px 25px -5px rgba(11, 99, 209, 0.2), 0 8px 10px -6px rgba(11, 99, 209, 0.1);
        transform: translateY(-4px);
      }

      .stat-card h3 {
        margin: 0 0 0.75rem 0;
        color: #374151;
        font-size: 0.875rem;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }

      .stat-value {
        font-size: 2.25rem;
        font-weight: 700;
        color: #0b63d1;
        margin-bottom: 0.5rem;
        line-height: 1.2;
      }

      .stat-detail {
        color: #6b7280;
        font-size: 0.875rem;
        line-height: 1.5;
      }

      .charts-row-primary,
      .charts-row-secondary {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 1.5rem;
        margin-bottom: 2rem;
      }

      @media (max-width: 1024px) {
        .charts-row-primary,
        .charts-row-secondary {
          grid-template-columns: 1fr;
        }
      }

      .chart-container {
        background: white;
        border: 1px solid #e2e8f0;
        border-radius: 12px;
        padding: 1.25rem;
        box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
        min-height: 400px;
        display: flex;
        flex-direction: column;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      }

      .chart-container h3 {
        margin: 0 0 1rem 0;
        color: #1f2937;
        font-size: 1.1rem;
        font-weight: 700;
        flex-shrink: 0;
        padding-bottom: 0.75rem;
        border-bottom: 2px solid #e2e8f0;
      }

      .chart-container-wide h3 {
        margin-bottom: 0.5rem;
        padding-bottom: 0;
        border-bottom: none;
      }

      .chart-subtitle {
        margin: 0 0 1rem 0;
        padding-bottom: 0.75rem;
        border-bottom: 2px solid #e2e8f0;
        color: #6b7280;
        font-size: 0.8125rem;
        font-weight: 500;
        font-style: italic;
      }

      .chart-container canvas {
        flex: 1;
      }

      .warehouse-list {
        background: white;
        border: 1px solid #e2e8f0;
        border-radius: 12px;
        padding: 1.25rem;
        box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      }

      .warehouse-list h3 {
        margin: 0 0 1.5rem 0;
        color: #1f2937;
        font-size: 1.25rem;
        font-weight: 700;
        padding-bottom: 0.75rem;
        border-bottom: 2px solid #e2e8f0;
      }

      .warehouse-cards {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        gap: 1rem;
      }

      .warehouse-card {
        border: 1px solid #e2e8f0;
        border-radius: 8px;
        padding: 1rem;
        background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      }

      .warehouse-card:hover {
        border-color: #0b63d1;
        box-shadow: 0 4px 6px rgba(11, 99, 209, 0.1);
        transform: translateY(-2px);
      }

      .warehouse-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1rem;
      }

      .warehouse-header h4 {
        margin: 0;
        color: #1f2937;
        font-size: 1rem;
        font-weight: 700;
      }

      .utilization-badge {
        padding: 0.375rem 0.75rem;
        border-radius: 12px;
        font-size: 0.8125rem;
        font-weight: 700;
        color: white;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      }

      .utilization-badge.high {
        background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      }

      .utilization-badge.medium {
        background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
      }

      .utilization-badge.low {
        background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
      }

      .warehouse-details {
        display: flex;
        flex-direction: column;
        gap: 0.625rem;
      }

      .detail-item {
        display: flex;
        justify-content: space-between;
        font-size: 0.875rem;
        padding: 0.5rem;
        background: white;
        border-radius: 6px;
        border: 1px solid #e2e8f0;
      }

      .detail-item .label {
        color: #6b7280;
        font-weight: 500;
      }

      .detail-item .value {
        color: #1f2937;
        font-weight: 700;
      }
    `,
  ],
})
export class TimelineComponent implements OnInit {
  storages: any[] = [];
  storageStats: StorageStats[] = [];

  // Date range selection
  selectedStartDate: string = '';
  selectedEndDate: string = '';
  maxDate: string = '';
  timelineChartSubtitle: string = '';

  // Overall statistics
  totalSlots = 0;
  totalAvailableSlots = 0;
  overallUtilization = 0;
  frostFreeWarehouses = 0;
  mostUtilizedWarehouse: StorageStats | null = null;

  // Chart data
  utilizationChartData: ChartConfiguration<'bar'>['data'] = {
    labels: [],
    datasets: [],
  };

  frostFreeChartData: ChartConfiguration<'doughnut'>['data'] = {
    labels: ['Frost-Free', 'Non-Frost-Free'],
    datasets: [
      {
        data: [0, 0],
        backgroundColor: ['#0b63d1', '#6b7280'],
        borderWidth: 0,
      },
    ],
  };

  timelineChartData: ChartConfiguration<'line'>['data'] = {
    labels: [],
    datasets: [],
  };

  capacityChartData: ChartConfiguration<'radar'>['data'] = {
    labels: ['Total Capacity', 'Available Slots', 'Frost-Free Slots', 'Utilization Rate'],
    datasets: [],
  };

  // Chart options
  utilizationChartOptions: ChartOptions<'bar'> = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        ticks: {
          callback: function (value) {
            return value + '%';
          },
        },
      },
    },
  };

  frostFreeChartOptions: ChartOptions<'doughnut'> = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom',
      },
    },
  };

  timelineChartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        position: 'top',
      },
      tooltip: {
        mode: 'index',
        intersect: false,
      },
    },
    scales: {
      x: {
        ticks: {
          maxRotation: 45,
          minRotation: 45,
          autoSkip: true,
          maxTicksLimit: 15,
        },
      },
      y: {
        beginAtZero: true,
        ticks: {
          precision: 0,
        },
      },
    },
    interaction: {
      mode: 'nearest',
      axis: 'x',
      intersect: false,
    },
  };

  capacityChartOptions: ChartOptions<'radar'> = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
    },
    scales: {
      r: {
        beginAtZero: true,
      },
    },
  };

  constructor(private storageService: StorageService) {}

  ngOnInit() {
    // Set default date range to today
    const today = new Date();
    this.selectedStartDate = this.formatDateForInput(today);
    this.selectedEndDate = this.formatDateForInput(today);

    // Set max date to 1 year from now
    const maxDate = new Date();
    maxDate.setFullYear(maxDate.getFullYear() + 1);
    this.maxDate = this.formatDateForInput(maxDate);

    this.storages = this.storageService.getAll();
    this.calculateStatistics();
    this.setupCharts();
  }

  onStartDateChange() {
    // If start date is after end date, adjust end date to match start date
    if (this.selectedStartDate && this.selectedEndDate) {
      const startDate = new Date(this.selectedStartDate);
      const endDate = new Date(this.selectedEndDate);

      if (startDate > endDate) {
        this.selectedEndDate = this.selectedStartDate;
      }
    }

    this.calculateStatistics();
    this.setupCharts();
  }

  onEndDateChange() {
    // If end date is before start date, adjust start date to match end date
    if (this.selectedStartDate && this.selectedEndDate) {
      const startDate = new Date(this.selectedStartDate);
      const endDate = new Date(this.selectedEndDate);

      if (endDate < startDate) {
        this.selectedStartDate = this.selectedEndDate;
      }
    }

    this.calculateStatistics();
    this.setupCharts();
  }

  onDateChange() {
    this.calculateStatistics();
    this.setupCharts();
  }

  setToday() {
    const today = new Date();
    this.selectedStartDate = this.formatDateForInput(today);
    this.selectedEndDate = this.formatDateForInput(today);
    this.onDateChange();
  }

  setNextWeek() {
    const today = new Date();
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);

    this.selectedStartDate = this.formatDateForInput(today);
    this.selectedEndDate = this.formatDateForInput(nextWeek);
    this.onDateChange();
  }

  setNextMonth() {
    const today = new Date();
    const nextMonth = new Date(today);
    nextMonth.setMonth(today.getMonth() + 1);

    this.selectedStartDate = this.formatDateForInput(today);
    this.selectedEndDate = this.formatDateForInput(nextMonth);
    this.onDateChange();
  }

  formatDateForInput(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  formatSelectedDateRange(): string {
    if (!this.selectedStartDate || !this.selectedEndDate) return '';

    const startDate = new Date(this.selectedStartDate + 'T00:00:00');
    const endDate = new Date(this.selectedEndDate + 'T00:00:00');

    if (this.selectedStartDate === this.selectedEndDate) {
      return startDate.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    }

    return `${startDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })} - ${endDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })}`;
  }

  formatDate(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString + 'T00:00:00');
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }

  private isSlotAvailableOnDate(slot: any, date: Date): boolean {
    if (!slot.bookings || slot.bookings.length === 0) return true;

    const checkDate = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();

    return !slot.bookings.some((booking: any) => {
      const bookingStart = new Date(booking.startDate);
      const bookingEnd = new Date(booking.endDate);
      const startTime = new Date(
        bookingStart.getFullYear(),
        bookingStart.getMonth(),
        bookingStart.getDate()
      ).getTime();
      const endTime = new Date(
        bookingEnd.getFullYear(),
        bookingEnd.getMonth(),
        bookingEnd.getDate()
      ).getTime();

      return checkDate >= startTime && checkDate <= endTime;
    });
  }

  private isSlotAvailableForDateRange(slot: any, startDate: Date, endDate: Date): boolean {
    if (!slot.bookings || slot.bookings.length === 0) return true;

    return !slot.bookings.some((booking: any) => {
      const bookingStart = new Date(booking.startDate);
      const bookingEnd = new Date(booking.endDate);
      return this.rangesOverlap(startDate, endDate, bookingStart, bookingEnd);
    });
  }

  private rangesOverlap(aStart: Date, aEnd: Date, bStart: Date, bEnd: Date): boolean {
    const aS = new Date(aStart.getFullYear(), aStart.getMonth(), aStart.getDate()).getTime();
    const aE = new Date(aEnd.getFullYear(), aEnd.getMonth(), aEnd.getDate()).getTime();
    const bS = new Date(bStart.getFullYear(), bStart.getMonth(), bStart.getDate()).getTime();
    const bE = new Date(bEnd.getFullYear(), bEnd.getMonth(), bEnd.getDate()).getTime();
    return aS <= bE && bS <= aE;
  }

  private calculateStatistics() {
    const startDateObj = new Date(this.selectedStartDate + 'T00:00:00');
    const endDateObj = new Date(this.selectedEndDate + 'T00:00:00');

    this.storageStats = this.storages.map((storage) => {
      const totalSlots = storage.slots?.length || 0;
      const availableSlots =
        storage.slots?.filter((slot: any) =>
          this.isSlotAvailableForDateRange(slot, startDateObj, endDateObj)
        ).length || 0;

      const utilizationRate = totalSlots > 0 ? Math.round((availableSlots / totalSlots) * 100) : 0;

      const frostFreeSlots = storage.frostFree ? totalSlots : 0;
      const nonFrostFreeSlots = storage.frostFree ? 0 : totalSlots;

      return {
        id: storage.id,
        name: storage.name,
        totalSlots,
        availableSlots,
        utilizationRate,
        frostFreeSlots,
        nonFrostFreeSlots,
      };
    });

    // Calculate overall statistics
    this.totalSlots = this.storageStats.reduce((sum, stat) => sum + stat.totalSlots, 0);
    this.totalAvailableSlots = this.storageStats.reduce(
      (sum, stat) => sum + stat.availableSlots,
      0
    );
    this.overallUtilization =
      this.totalSlots > 0 ? Math.round((this.totalAvailableSlots / this.totalSlots) * 100) : 0;

    this.frostFreeWarehouses = this.storages.filter((s) => s.frostFree).length;
    this.mostUtilizedWarehouse = this.storageStats.reduce((max, current) =>
      current.utilizationRate > max.utilizationRate ? current : max
    );
  }

  private setupCharts() {
    // Utilization chart
    this.utilizationChartData = {
      labels: this.storageStats.map((stat) => stat.name),
      datasets: [
        {
          data: this.storageStats.map((stat) => stat.utilizationRate),
          backgroundColor: this.storageStats.map((stat) =>
            stat.utilizationRate > 70
              ? '#10b981'
              : stat.utilizationRate > 40
              ? '#f59e0b'
              : '#dc2626'
          ),
          borderWidth: 0,
        },
      ],
    };

    // Frost-free distribution chart
    const totalFrostFreeSlots = this.storageStats.reduce(
      (sum, stat) => sum + stat.frostFreeSlots,
      0
    );
    const totalNonFrostFreeSlots = this.storageStats.reduce(
      (sum, stat) => sum + stat.nonFrostFreeSlots,
      0
    );

    this.frostFreeChartData = {
      labels: ['Frost-free', 'Non-Frost-free'],
      datasets: [
        {
          data: [totalFrostFreeSlots, totalNonFrostFreeSlots],
          backgroundColor: ['#0b63d1', '#6b7280'],
          borderWidth: 0,
        },
      ],
    };

    // Timeline chart - determine if we should show 6-month forecast or custom range
    const timelineLabels = [];
    const timelineData = [];

    // Check if user selected a custom date range (not today)
    const today = this.formatDateForInput(new Date());
    const isDefaultToday = this.selectedStartDate === today && this.selectedEndDate === today;

    if (isDefaultToday) {
      // Default behavior: Show 6-month forecast from today
      this.timelineChartSubtitle = `6-month forecast from ${this.formatDate(this.selectedEndDate)}`;
      const startDate = new Date(this.selectedEndDate + 'T00:00:00');

      // Show data points weekly for 6 months (approximately 26 weeks)
      const numberOfWeeks = 26;
      for (let i = 0; i < numberOfWeeks; i++) {
        const date = new Date(startDate);
        date.setDate(startDate.getDate() + i * 7); // Weekly intervals

        // Format label to show month and week
        const monthYear = date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
        const weekOfMonth = Math.ceil(date.getDate() / 7);
        timelineLabels.push(`${monthYear} W${weekOfMonth}`);

        // Calculate actual availability for this date
        let totalAvailableForDate = 0;
        this.storages.forEach((storage) => {
          const availableSlotsForDate =
            storage.slots?.filter((slot: any) => this.isSlotAvailableOnDate(slot, date)).length ||
            0;
          totalAvailableForDate += availableSlotsForDate;
        });

        timelineData.push(totalAvailableForDate);
      }
    } else {
      // Custom range: Show data for the selected date range
      this.timelineChartSubtitle = `Availability from ${this.formatDate(
        this.selectedStartDate
      )} to ${this.formatDate(this.selectedEndDate)}`;

      const startDate = new Date(this.selectedStartDate + 'T00:00:00');
      const endDate = new Date(this.selectedEndDate + 'T00:00:00');

      // Calculate the number of days in the range
      const daysDiff =
        Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;

      // Determine interval based on range length
      let intervalDays = 1; // Daily by default
      let maxDataPoints = 30; // Maximum number of data points to show

      if (daysDiff > maxDataPoints) {
        // Use weekly intervals for longer ranges
        intervalDays = Math.ceil(daysDiff / maxDataPoints);
      }

      // Generate data points
      for (let i = 0; i < daysDiff; i += intervalDays) {
        const date = new Date(startDate);
        date.setDate(startDate.getDate() + i);

        // Don't go beyond end date
        if (date > endDate) break;

        // Format label based on interval
        let label;
        if (intervalDays === 1) {
          // Daily view: show short date
          label = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        } else {
          // Weekly or longer view: show month and week
          const monthYear = date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
          const weekOfMonth = Math.ceil(date.getDate() / 7);
          label = `${monthYear} W${weekOfMonth}`;
        }
        timelineLabels.push(label);

        // Calculate actual availability for this date
        let totalAvailableForDate = 0;
        this.storages.forEach((storage) => {
          const availableSlotsForDate =
            storage.slots?.filter((slot: any) => this.isSlotAvailableOnDate(slot, date)).length ||
            0;
          totalAvailableForDate += availableSlotsForDate;
        });

        timelineData.push(totalAvailableForDate);
      }
    }

    this.timelineChartData = {
      labels: timelineLabels,
      datasets: [
        {
          label: 'Available Slots',
          data: timelineData,
          borderColor: '#0b63d1',
          backgroundColor: 'rgba(11, 99, 209, 0.1)',
          tension: 0.4,
          fill: true,
        },
      ],
    };

    // Capacity radar chart
    this.capacityChartData = {
      labels: ['Total Capacity', 'Available Slots', 'Frost-free Slots', 'Utilization Rate'],
      datasets: [
        {
          label: 'Overall Capacity',
          data: [
            this.totalSlots,
            this.totalAvailableSlots,
            this.storageStats.reduce((sum, stat) => sum + stat.frostFreeSlots, 0),
            this.overallUtilization,
          ],
          borderColor: '#0b63d1',
          backgroundColor: 'rgba(11, 99, 209, 0.2)',
          pointBackgroundColor: '#0b63d1',
        },
      ],
    };
  }
}
