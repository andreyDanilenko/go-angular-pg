import { Component, Input } from '@angular/core';
import type { ChallengeProfileInfo } from '../../../types/profile';

@Component({
  selector: 'app-challenge-profile-bio',
  standalone: true,
  imports: [],
  template: `
    <div class="profile">
      <img
        [src]="profile?.avatar || 'https://placehold.co/120x120'"
        alt="Аватар пользователя"
        class="profile-avatar"
        [class.placeholder]="!profile?.avatar">

      <h1 class="profile-name" [class.placeholder]="!profile?.name">
        {{ profile?.name || 'Имя пользователя' }}
      </h1>

      <p class="profile-username" [class.placeholder]="!profile?.username">
        {{ profile?.username ? '@' + profile?.username : '@username' }}
      </p>

      <p class="profile-bio" [class.placeholder]="!profile?.bio">
        {{ profile?.bio || 'Пользователь пока не добавил информацию о себе.' }}
      </p>
    </div>
  `,
  styles: [`
    .profile {
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    .profile-avatar {
        width: 120px;
        height: 120px;
        border-radius: 50%;
        object-fit: cover;
        border: 5px solid var(--md-sys-color-surface-variant);
        margin-bottom: 20px;
        box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1);
    }

    .profile-avatar.placeholder {
        filter: grayscale(1);
        opacity: 0.7;
    }

    .profile-name {
        font-size: 32px;
        font-weight: 700;
        margin-bottom: 10px;
        text-align: center;
        color: var(--md-sys-color-on-surface);
    }

    .profile-name.placeholder {
        color: var(--md-sys-color-outline);
        opacity: 0.6;
    }

    .profile-username {
        color: var(--md-sys-color-on-surface-variant);
        font-size: 18px;
        margin-bottom: 25px;
    }

    .profile-username.placeholder {
        opacity: 0.5;
    }

    .profile-bio {
        text-align: center;
        max-width: 700px;
        margin-bottom: 40px;
        font-size: 16px;
        color: var(--md-sys-color-on-surface-variant);
        line-height: 1.8;
    }

    .profile-bio.placeholder {
        color: var(--md-sys-color-outline);
        font-style: italic;
        opacity: 0.7;
    }
  `]
})
export class ChallengeProfileBioComponent {
  @Input() profile: ChallengeProfileInfo | null = null;
}
