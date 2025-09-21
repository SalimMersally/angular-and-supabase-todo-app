import { Component, signal, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ToastModule } from 'primeng/toast';
import { NavbarComponent } from './layout/navbar/navbar.component';
import { ThemeService } from './theme/theme.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  imports: [RouterOutlet, NavbarComponent, ToastModule],
})
export class App implements OnInit {
  protected readonly title = signal('angular-todo-app');
  private themeService = inject(ThemeService);

  ngOnInit() {
    this.themeService.theme();
  }
}
