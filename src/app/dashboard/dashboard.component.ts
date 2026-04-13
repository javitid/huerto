import { Component } from '@angular/core';
import { Observable } from 'rxjs';
import { User } from 'firebase/auth';
import { AuthService } from '../auth/auth.service';
import { I18nService } from '../i18n/i18n.service';

@Component({
    selector: 'app-dashboard',
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.scss'],
    standalone: false
})
export class DashboardComponent {
  readonly user$: Observable<User | null>;

  constructor(
    private authService: AuthService,
    public i18n: I18nService
  ) {
    this.user$ = this.authService.user$;
  }

  logout(): Promise<void> {
    return this.authService.logout();
  }
}
