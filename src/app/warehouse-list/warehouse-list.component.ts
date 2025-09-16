import { Component } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { WarehouseService } from '../services/warehouse.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-warehouse-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="wrap">
      <h2>Warehouses</h2>
      <div class="tabs">
        @for (w of warehouses; track w.id) {
        <button (click)="open(w.id)" [class.active]="w.id === activeId">
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
        gap: 0.5rem;
        margin: 1rem 0;
        flex-wrap: wrap;
      }
      .tabs button {
        padding: 0.6rem 0.9rem;
        border-radius: 6px;
        border: 1px solid #bfd7ff;
        background: #eaf4ff;
        cursor: pointer;
      }
      .tabs button.active {
        background: #0b63d1;
        color: white;
      }
      .hint {
        color: #666;
      }
    `,
  ],
})
export class WarehouseListComponent {
  warehouses: any[];
  activeId?: string;

  constructor(private router: Router, private warehouseService: WarehouseService) {
    this.warehouses = this.warehouseService.getAll();
  }

  open(id: string) {
    this.activeId = id;
    this.router.navigate(['/warehouse', id]);
  }
}
