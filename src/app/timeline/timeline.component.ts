import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
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
  imports: [CommonModule, BaseChartDirective],
  template: `
    <div class="page">
      <h2>Storage Analytics & Timeline</h2>

      <div class="stats-grid">
        <div class="stat-card">
          <h3>Overall Utilization</h3>
          <div class="stat-value">{{ overallUtilization }}%</div>
          <div class="stat-detail">{{ totalAvailableSlots }}/{{ totalSlots }} slots available</div>
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

      <div class="charts-grid">
        <div class="chart-container">
          <h3>Warehouse Utilization</h3>
          <canvas
            baseChart
            [data]="utilizationChartData"
            [options]="utilizationChartOptions"
            [type]="'bar'"
          >
          </canvas>
        </div>

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
          <h3>Slot Availability Timeline</h3>
          <canvas
            baseChart
            [data]="timelineChartData"
            [options]="timelineChartOptions"
            [type]="'line'"
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
        <h3>Warehouse Details</h3>
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
      .page {
        padding: 1rem;
        max-width: 1400px;
        margin: 0 auto;
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
        border-radius: 8px;
        padding: 1.5rem;
        text-align: center;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      }

      .stat-card h3 {
        margin: 0 0 0.5rem 0;
        color: #374151;
        font-size: 0.9rem;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }

      .stat-value {
        font-size: 2rem;
        font-weight: bold;
        color: #0b63d1;
        margin-bottom: 0.25rem;
      }

      .stat-detail {
        color: #6b7280;
        font-size: 0.875rem;
      }

      .charts-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
        gap: 1.5rem;
        margin-bottom: 2rem;
      }

      .chart-container {
        background: white;
        border: 1px solid #e2e8f0;
        border-radius: 8px;
        padding: 1.5rem;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      }

      .chart-container h3 {
        margin: 0 0 1rem 0;
        color: #374151;
        font-size: 1.1rem;
        font-weight: 600;
      }

      .warehouse-list {
        background: white;
        border: 1px solid #e2e8f0;
        border-radius: 8px;
        padding: 1.5rem;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      }

      .warehouse-list h3 {
        margin: 0 0 1rem 0;
        color: #374151;
        font-size: 1.2rem;
        font-weight: 600;
      }

      .warehouse-cards {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        gap: 1rem;
      }

      .warehouse-card {
        border: 1px solid #e2e8f0;
        border-radius: 6px;
        padding: 1rem;
        background: #f8fafc;
      }

      .warehouse-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 0.75rem;
      }

      .warehouse-header h4 {
        margin: 0;
        color: #374151;
        font-size: 1rem;
      }

      .utilization-badge {
        padding: 0.25rem 0.5rem;
        border-radius: 4px;
        font-size: 0.75rem;
        font-weight: 600;
        color: white;
      }

      .utilization-badge.high {
        background-color: #10b981;
      }

      .utilization-badge.medium {
        background-color: #f59e0b;
      }

      .utilization-badge.low {
        background-color: #dc2626;
      }

      .warehouse-details {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
      }

      .detail-item {
        display: flex;
        justify-content: space-between;
        font-size: 0.875rem;
      }

      .detail-item .label {
        color: #6b7280;
      }

      .detail-item .value {
        color: #374151;
        font-weight: 500;
      }
    `,
  ],
})
export class TimelineComponent implements OnInit {
  storages: any[] = [];
  storageStats: StorageStats[] = [];

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
    plugins: {
      legend: {
        position: 'top',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
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
    this.storages = this.storageService.getAll();
    this.calculateStatistics();
    this.setupCharts();
  }

  private calculateStatistics() {
    this.storageStats = this.storages.map((storage) => {
      const totalSlots = storage.slots?.length || 0;
      const availableSlots =
        storage.slots?.filter((slot: any) => !slot.bookings || slot.bookings.length === 0).length ||
        0;

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

    // Timeline chart (simulated data for the next 7 days)
    const timelineLabels = [];
    const timelineData = [];
    const today = new Date();

    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      timelineLabels.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));

      // Simulate availability data (in real app, this would come from actual booking data)
      const simulatedAvailability = Math.max(0, this.totalAvailableSlots - i * 2);
      timelineData.push(simulatedAvailability);
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
