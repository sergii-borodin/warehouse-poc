import { Component } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { StorageService } from '../services/storage.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faTemperatureArrowUp } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-storage-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, FontAwesomeModule],
  template: `
    <div class="wrap">
      <h2>Storages</h2>
      <div class="filters">
        <label>
          <input type="checkbox" [(ngModel)]="filterHeating" (ngModelChange)="applyFilters()" />
          Heating only
        </label>
      </div>
      <div class="tabs">
        @for (s of filteredStorages; track s.id) {
        <button (click)="open(s.id)" [class.active]="s.id === activeId">
          @if(s.heating){
          <div class="heating-badge"><fa-icon [icon]="faTemperatureArrowUp"></fa-icon></div>
          }
          {{ s.name }}
        </button>
        }
      </div>
      <div class="hint">Click a storage to view details</div>
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
export class StorageListComponent {
  faTemperatureArrowUp = faTemperatureArrowUp;
  storages: any[];
  filteredStorages: any[] = [];
  activeId?: number;
  filterHeating = false;

  constructor(private router: Router, private storageService: StorageService) {
    this.storages = this.storageService.getAll();
    this.filteredStorages = [...this.storages];
  }

  open(id: number) {
    this.activeId = id;
    this.router.navigate(['/storage', id]);
  }

  applyFilters() {
    this.filteredStorages = this.storages.filter((s) => (this.filterHeating ? s.heating : true));
  }
}
