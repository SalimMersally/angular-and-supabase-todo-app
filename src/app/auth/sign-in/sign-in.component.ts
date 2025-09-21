import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { MessageModule } from 'primeng/message';
import { MessageService } from 'primeng/api';
import { AuthService, SignInData } from '../../core/services/auth.service';

@Component({
  selector: 'app-sign-in',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
    PasswordModule,
    MessageModule,
  ],
  templateUrl: './sign-in.component.html',
})
export class SignInComponent {
  private authService = inject(AuthService);
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private messageService = inject(MessageService);

  signInForm: FormGroup;
  isLoading = signal(false);
  errorMessage = signal<string | null>(null);

  constructor() {
    this.signInForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]],
    });
  }

  onSubmit() {
    if (this.signInForm.invalid) {
      this.signInForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);

    const formValue = this.signInForm.value;
    const signInData: SignInData = {
      email: formValue.email,
      password: formValue.password,
    };

    this.authService.signIn(signInData).subscribe({
      next: ({ user, error }) => {
        this.isLoading.set(false);

        if (error) {
          this.errorMessage.set(error.message);
          this.messageService.add({
            severity: 'error',
            summary: 'Sign In Failed',
            detail: error.message,
          });
        } else if (user) {
          this.messageService.add({
            severity: 'success',
            summary: 'Welcome!',
            detail: 'Successfully signed in.',
          });
          this.router.navigate(['/']);
        }
      },
      error: (error: any) => {
        this.isLoading.set(false);
        const errorMsg = 'An unexpected error occurred. Please try again.';
        this.errorMessage.set(errorMsg);
        this.messageService.add({
          severity: 'error',
          summary: 'Sign In Error',
          detail: errorMsg,
        });
        console.error('Sign in error:', error);
      },
    });
  }

  navigateToSignUp() {
    this.router.navigate(['/auth/sign-up']);
  }

  get email() {
    return this.signInForm.get('email');
  }

  get password() {
    return this.signInForm.get('password');
  }
}
