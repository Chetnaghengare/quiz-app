import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterModule],
  template: `
    <nav>
      <a routerLink="/login">Login</a> |
      <a routerLink="/signup">Signup</a>
    </nav>

    <router-outlet></router-outlet> 
  `,
  styles: [`
    nav { padding: 10px; background: #eee; }
    a { margin-right: 15px; text-decoration: none; font-weight: bold; }
  `]
})
export class AppComponent {}
