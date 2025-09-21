import { Component, inject, computed } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { ThemeService } from '../../theme/theme.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  standalone: true,
  imports: [ButtonModule],
})
export class NavbarComponent {
  readonly appName = 'Todo App';
  private themeService = inject(ThemeService);
  public authService = inject(AuthService);

  isDark = computed(() => this.themeService.isDark());

  toggleTheme() {
    this.themeService.toggleTheme();
  }

  signOut() {
    this.authService.signOut().subscribe({
      next: () => {
        this.authService.navigateToGoodbye();
      },
      error: (error: any) => {
        console.error('Sign out error:', error);
      },
    });
  }

  navigateToSignIn() {
    this.authService.navigateToSignIn();
  }

  navigateToHome() {
    this.authService.navigateToHome();
  }
}
