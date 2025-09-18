import { Component } from '@angular/core';
import { RouterModule, Router } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterModule],
  template: `
    <div class="container">
      <h1>Jutlandia — POC</h1>

      <div class="grid-square">
        @for (t of tabs; track t) {
        <button class="tab" (click)="go(t)">{{ t }}</button>
        }
      </div>
    </div>
  `,
  styles: [
    `
      .container {
        padding: 1.5rem;
        font-family: Arial, sans-serif;
      }
      h1 {
        margin-bottom: 1rem;
      }
      .grid-square {
        display: flex;
        gap: 1rem;
        justify-items: space-between;
        border: 1px solid #e2e8f0;
        padding: 0.5rem;
      }
      .tab {
        width: 10rem;
        height: 10rem;
        background: #0b63d1;
        color: white;
        border: none;
        border-radius: 6px;
        padding: 0.75rem;
        font-weight: 600;
        cursor: pointer;
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
        transition: transform 0.12s ease;
      }
      .tab:hover {
        transform: translateY(-2px);
      }
    `,
  ],
})
export class HomeComponent {
  tabs = ['Terminal', 'Stevedoring', 'Logistics', 'Chemicals', 'Warehouse'];

  constructor(private router: Router) {}

  go(title: string) {
    if (title === 'Warehouse') {
      this.router.navigate(['/search']);
    } else {
      alert(`${title} route not implemented in POC.`);
    }
  }
}
