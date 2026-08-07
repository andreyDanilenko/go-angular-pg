import { Routes } from '@angular/router';

import { authGuard, guestGuard } from './core/auth/auth.guard';

export const routes: Routes = [
  {
    path: 'auth',
    canActivate: [guestGuard],
    loadComponent: () =>
      import('./layouts/auth-layout/auth-layout.component').then(
        ({ AuthLayoutComponent }) => AuthLayoutComponent,
      ),
    children: [
      {
        path: 'login',
        loadComponent: () =>
          import('./pages/auth/auth.component').then(
            ({ AuthComponent }) => AuthComponent,
          ),
      },
      { path: '', pathMatch: 'full', redirectTo: 'login' },
    ],
  },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./layouts/main-layout/main-layout.component').then(
        ({ MainLayoutComponent }) => MainLayoutComponent,
      ),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'articles' },
      {
        path: 'articles',
        loadComponent: () =>
          import('./pages/articles-page/articles-page.component').then(
            ({ ArticlesPageComponent }) => ArticlesPageComponent,
          ),
      },
      {
        path: 'articles/create',
        loadComponent: () =>
          import('./pages/article-create/article-create.component').then(
            ({ ArticleCreateComponent }) => ArticleCreateComponent,
          ),
      },
      {
        path: 'articles/:id/edit',
        loadComponent: () =>
          import('./pages/article-edit/article-edit.component').then(
            ({ ArticleEditComponent }) => ArticleEditComponent,
          ),
      },
      {
        path: 'articles/:id',
        loadComponent: () =>
          import('./pages/article-page/article-page.component').then(
            ({ ArticlePageComponent }) => ArticlePageComponent,
          ),
      },
      {
        path: 'profile',
        loadComponent: () =>
          import('./pages/profile/profile-page.component').then(
            ({ ProfilePageComponent }) => ProfilePageComponent,
          ),
      },
      {
        path: 'profile/edit',
        loadComponent: () =>
          import('./pages/profile-edit/profile-edit.component').then(
            ({ ProfileEditComponent }) => ProfileEditComponent,
          ),
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
