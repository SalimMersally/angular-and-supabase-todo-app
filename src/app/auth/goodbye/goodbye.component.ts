import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-goodbye',
  standalone: true,
  imports: [ButtonModule],
  templateUrl: './goodbye.component.html',
})
export class GoodbyeComponent implements OnInit {
  private router = inject(Router);

  ngOnInit() {
    setTimeout(() => {
      this.router.navigate(['/auth/sign-in']);
    }, 5000);
  }

  navigateToSignIn() {
    this.router.navigate(['/auth/sign-in']);
  }
}
