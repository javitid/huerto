import { Component } from '@angular/core';
import { Observable } from 'rxjs';
import { User } from 'firebase/auth';
import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent {
  readonly user$: Observable<User | null>;

  constructor(private authService: AuthService) {
    this.user$ = this.authService.user$;
  }

  logout(): Promise<void> {
    return this.authService.logout();
  }
}
