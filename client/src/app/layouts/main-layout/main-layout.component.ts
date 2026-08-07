import { ChangeDetectionStrategy, Component, DestroyRef, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { HeaderComponent } from '../../components/shared/header/header.component';
import { SessionService } from '../../core/session/session.service';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MainLayoutComponent implements OnInit {
  private readonly session = inject(SessionService);
  private readonly destroyRef = inject(DestroyRef);

  ngOnInit(): void {
    if (!this.session.user()) {
      this.session.load().pipe(takeUntilDestroyed(this.destroyRef)).subscribe();
    }
  }
}
