import { Component, inject } from '@angular/core';
import {
  Router,
  RouterLink,
  RouterLinkActive,
  RouterOutlet
} from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  private readonly router = inject(Router);

  get currentPageTitle(): string {
    const path = this.router.url.split(/[?#]/)[0].replace(/\/+$/, '');

    const pageTitles: Record<string, string> = {
      '': 'Overview',
      '/tickets': 'All tickets',
      '/customers': 'Customers',
      '/reports': 'Reports'
    };

    return pageTitles[path] ?? 'Overview';
  }
}
