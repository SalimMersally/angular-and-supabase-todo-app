import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';
import { map, filter, take } from 'rxjs/operators';
import { toObservable } from '@angular/core/rxjs-interop';
import { combineLatest } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return combineLatest([authService.user$, toObservable(authService.isLoading)]).pipe(
    filter(([user, isLoading]) => !isLoading),
    take(1),
    map(([user, isLoading]) => {
      if (user) {
        return true;
      } else {
        router.navigate(['/auth/sign-in']);
        return false;
      }
    })
  );
};

export const guestGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return combineLatest([authService.user$, toObservable(authService.isLoading)]).pipe(
    filter(([user, isLoading]) => !isLoading),
    take(1),
    map(([user, isLoading]) => {
      if (!user) {
        return true;
      } else {
        router.navigate(['/']);
        return false;
      }
    })
  );
};
