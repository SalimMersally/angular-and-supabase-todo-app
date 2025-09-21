import { Routes } from '@angular/router';
import { authGuard, guestGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./todo/todo-table/todo-table.component').then((m) => m.TodoTableComponent),
    canActivate: [authGuard],
  },
  {
    path: 'auth/sign-up',
    loadComponent: () => import('./auth/sign-up/sign-up.component').then((m) => m.SignUpComponent),
    canActivate: [guestGuard],
  },
  {
    path: 'auth/sign-in',
    loadComponent: () => import('./auth/sign-in/sign-in.component').then((m) => m.SignInComponent),
    canActivate: [guestGuard],
  },
  {
    path: 'goodbye',
    loadComponent: () => import('./auth/goodbye/goodbye.component').then((m) => m.GoodbyeComponent),
  },
  {
    path: '**',
    redirectTo: '',
  },
];
