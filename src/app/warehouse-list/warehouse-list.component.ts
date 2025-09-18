import { Component } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { WarehouseService } from '../services/warehouse.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faTemperatureArrowUp } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-warehouse-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, FontAwesomeModule],
  template: `
    <div class="wrap">
      <h2>Warehouses</h2>
      <div class="filters">
        <label>
          <input type="checkbox" [(ngModel)]="filterHeating" (ngModelChange)="applyFilters()" />
          Heating only
        </label>
      </div>
      <div class="tabs">
        @for (w of filteredWarehouses; track w.id) {
        <button (click)="open(w.id)" [class.active]="w.id === activeId">
          @if(w.heating){
          <div class="heating-badge"><fa-icon [icon]="faTemperatureArrowUp"></fa-icon></div>
          }
          {{ w.name }}
        </button>
        }
      </div>
      <div class="hint">Click a warehouse to view details</div>
    </div>
  `,
  styles: [
    `
      .wrap {
        padding: 1rem;
        font-family: Arial, sans-serif;
      }
      .tabs {
        display: flex;
        gap: 5%;
        margin: 1rem 0;
        flex-wrap: wrap;
      }
      .tabs button {
        position: relative;
        width: 30%;
        height: 8rem;
        padding: 0.6rem 0.9rem;
        border-radius: 6px;
        border: 1px solid rgb(88, 122, 180);
        background: #eaf4ff;
        cursor: pointer;
      }
      .tabs button.active {
        background: #0b63d1;
        color: white;
      }
      .filters {
        margin: 0.5rem 0 0.5rem;
      }
      .heating-badge {
        position: absolute;
        display: flex;
        justify-content: center;
        align-items: center;
        width: 20px;
        height: 20px;
        right: -5px;
        top: -5px;
        border-radius: 50%;
        background-color: tomato;
      }
      .hint {
        color: #666;
      }
    `,
  ],
})
export class WarehouseListComponent {
  faTemperatureArrowUp = faTemperatureArrowUp;
  warehouses: any[];
  filteredWarehouses: any[] = [];
  activeId?: number;
  filterHeating = false;

  constructor(private router: Router, private warehouseService: WarehouseService) {
    this.warehouses = this.warehouseService.getAll();
    this.filteredWarehouses = [...this.warehouses];
  }

  open(id: number) {
    this.activeId = id;
    this.router.navigate(['/warehouse', id]);
  }

  applyFilters() {
    this.filteredWarehouses = this.warehouses.filter((w) =>
      this.filterHeating ? w.heating : true
    );
  }
}
