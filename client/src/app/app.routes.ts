import { Routes } from '@angular/router';
import { AuthLayoutComponent } from './layouts/auth-layout/auth-layout.component';
import { NoAuthGuard } from './pages/guard/not-auth-guard';
import { AuthGuard } from './pages/guard/auth-guard';
import { AuthComponent } from './pages/auth/auth.component';
import { MainLayoutComponent } from './layouts/main-layout/main-layout.component';
import { HomeComponent } from './pages/main/main.component';
import { ProfilePageComponent } from './pages/profile/profile-page.component';
import { MessengerPageComponent } from './pages/chat-page/chat-page.component';
import { ArticlesPageComponent } from './pages/articles-page/articles-page.component';
import { ArticlePageComponent } from './pages/article-page/article-page.component';
import { ProfileEditComponent } from './pages/profile-edit/profile-edit.component';
import { ChallengeProfilePageComponent } from './pages/challenge-profile-page/challenge-profile-page.component';
import { ChallengeCatalogPageComponent } from './pages/challenge-main-page/challenge-catalog-page.component';

export const routes: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [AuthGuard],
    children: [
      { path: '', component: HomeComponent },
    ]
  },
  {
    path: 'auth',
    component: AuthLayoutComponent,
    canActivate: [NoAuthGuard],
    children: [
      { path: 'login', component: AuthComponent },
      { path: '', redirectTo: 'login', pathMatch: 'full' }
    ]
  },
  {
    path: 'messenger',
    canActivate: [AuthGuard],
    children: [
      { path: '', component: MessengerPageComponent },
    ]
  },
  {
    path: 'articles',
    component: MainLayoutComponent,
    canActivate: [AuthGuard],
    children: [
      { path: '', component: ArticlesPageComponent },
      { path: ':id', component: ArticlePageComponent },
      // { path: 'create', component: PostEditorComponent },
      // { path: ':id', component: PostEditorComponent },
      // { path: ':id/edit', component: PostEditorComponent }
    ]
  },
  {
    path: 'challenger',
    // component: MainLayoutComponent,
    canActivate: [AuthGuard],
    children: [
      { path: 'profile', component: ChallengeProfilePageComponent },
      { path: 'catalog', component: ChallengeCatalogPageComponent },
      // { path: 'create', component: PostEditorComponent },
      // { path: ':id', component: PostEditorComponent },
      // { path: ':id/edit', component: PostEditorComponent }
    ]
  },
  {
    path: 'profile',
    component: MainLayoutComponent,
    canActivate: [AuthGuard],
    children: [
      { path: '', component: ProfilePageComponent },
      { path: 'edit', component: ProfileEditComponent },
    ]
  },
  { path: '**', redirectTo: '' }
];
