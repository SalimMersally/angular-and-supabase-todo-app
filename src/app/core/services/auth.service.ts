import { Injectable, signal, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, from, BehaviorSubject } from 'rxjs';
import { User, AuthError, Session } from '@supabase/supabase-js';
import { SupabaseService } from './supabase.service';

export interface SignUpData {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

export interface SignInData {
  email: string;
  password: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private supabase = inject(SupabaseService);
  private router = inject(Router);

  private userSubject = new BehaviorSubject<User | null>(null);
  public user$ = this.userSubject.asObservable();

  currentUser = signal<User | null>(null);
  isAuthenticated = signal<boolean>(false);
  isLoading = signal<boolean>(true);

  constructor() {
    this.initializeAuth();
  }

  private async initializeAuth(): Promise<void> {
    try {
      const {
        data: { session },
      } = await this.supabase.auth.getSession();
      this.handleAuthState(session);

      this.supabase.auth.onAuthStateChange((event, session) => {
        this.handleAuthState(session);
      });
    } catch (error) {
      console.error('Error initializing auth:', error);
    } finally {
      this.isLoading.set(false);
    }
  }

  private handleAuthState(session: Session | null): void {
    const user = session?.user ?? null;
    this.currentUser.set(user);
    this.userSubject.next(user);
    this.isAuthenticated.set(!!user);
  }

  signUp(data: SignUpData): Observable<{ user: User | null; error: AuthError | null }> {
    return from(
      this.supabase.auth
        .signUp({
          email: data.email,
          password: data.password,
          options: {
            data: {
              first_name: data.firstName,
              last_name: data.lastName,
            },
          },
        })
        .then((response) => ({
          user: response.data.user,
          error: response.error,
        }))
    );
  }

  signIn(data: SignInData): Observable<{ user: User | null; error: AuthError | null }> {
    return from(
      this.supabase.auth
        .signInWithPassword({
          email: data.email,
          password: data.password,
        })
        .then((response) => ({
          user: response.data.user,
          error: response.error,
        }))
    );
  }

  signOut(): Observable<{ error: AuthError | null }> {
    return from(this.supabase.auth.signOut());
  }

  async navigateToSignIn(): Promise<void> {
    await this.router.navigate(['/auth/sign-in']);
  }

  async navigateToSignUp(): Promise<void> {
    await this.router.navigate(['/auth/sign-up']);
  }

  async navigateToHome(): Promise<void> {
    await this.router.navigate(['/']);
  }

  async navigateToGoodbye(): Promise<void> {
    await this.router.navigate(['/goodbye']);
  }
}
