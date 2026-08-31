import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'cocktails', pathMatch: 'full' },
  {
    path: 'mocktails',
    loadComponent: () => import('./mocktails/mocktails').then((m) => m.Mocktails),
  },
  {
    path: 'cocktails',
    loadComponent: () => import('./cocktails/cocktails').then((m) => m.Cocktails),
  },
  { path: 'mixes', redirectTo: 'cocktails', pathMatch: 'full' },
  { path: 'admin', loadComponent: () => import('./admin/admin').then((m) => m.Admin) },
  { path: '**', redirectTo: 'cocktails' },
];
