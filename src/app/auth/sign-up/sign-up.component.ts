import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { MessageModule } from 'primeng/message';
import { MessageService } from 'primeng/api';
import { AuthService, SignUpData } from '../../core/services/auth.service';

@Component({
  selector: 'app-sign-up',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DialogModule,
    ButtonModule,
    InputTextModule,
    PasswordModule,
    MessageModule,
  ],
  templateUrl: './sign-up.component.html',
})
export class SignUpComponent {
  private authService = inject(AuthService);
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private messageService = inject(MessageService);

  signUpForm: FormGroup;
  isLoading = signal(false);
  errorMessage = signal<string | null>(null);

  constructor() {
    this.signUpForm = this.fb.group(
      {
        firstName: ['', [Validators.required, Validators.minLength(2)]],
        lastName: ['', [Validators.required, Validators.minLength(2)]],
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', [Validators.required]],
      },
      { validators: this.passwordMatchValidator }
    );
  }

  private passwordMatchValidator(group: FormGroup) {
    const password = group.get('password')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { passwordMismatch: true };
  }

  onSubmit() {
    if (this.signUpForm.invalid) {
      this.signUpForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);

    const formValue = this.signUpForm.value;
    const signUpData: SignUpData = {
      email: formValue.email,
      password: formValue.password,
      firstName: formValue.firstName,
      lastName: formValue.lastName,
    };

    this.authService.signUp(signUpData).subscribe({
      next: ({ user, error }) => {
        this.isLoading.set(false);

        if (error) {
          this.errorMessage.set(error.message);
          this.messageService.add({
            severity: 'error',
            summary: 'Sign Up Failed',
            detail: error.message,
          });
        } else if (user) {
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Account created successfully! Please check your email to verify your account.',
            life: 5000,
          });
          setTimeout(() => {
            this.router.navigate(['/auth/sign-in']);
          }, 3000);
        }
      },
      error: (error: any) => {
        this.isLoading.set(false);
        const errorMsg = 'An unexpected error occurred. Please try again.';
        this.errorMessage.set(errorMsg);
        this.messageService.add({
          severity: 'error',
          summary: 'Sign Up Error',
          detail: errorMsg,
        });
        console.error('Sign up error:', error);
      },
    });
  }

  navigateToSignIn() {
    this.router.navigate(['/auth/sign-in']);
  }

  get firstName() {
    return this.signUpForm.get('firstName');
  }

  get lastName() {
    return this.signUpForm.get('lastName');
  }

  get email() {
    return this.signUpForm.get('email');
  }

  get password() {
    return this.signUpForm.get('password');
  }

  get confirmPassword() {
    return this.signUpForm.get('confirmPassword');
  }
}
