import { Component, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { filter, take } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { I18nService } from '../i18n/i18n.service';

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss'],
    standalone: false
})
export class LoginComponent implements OnInit {
  readonly isLoading = signal(false);
  readonly isGuestLoading = signal(false);
  readonly errorMessage = signal('');

  constructor(
    private router: Router,
    private authService: AuthService,
    public i18n: I18nService
  ) { }

  ngOnInit(): void {
    this.authService.ready$.pipe(
      filter((ready) => ready),
      take(1)
    ).subscribe(() => {
      this.authService.user$.pipe(take(1)).subscribe((user) => {
        if (user) {
          this.router.navigate(['/dashboard']);
        }
      });
    });
  }

  async signInWithGoogle(): Promise<void> {
    this.errorMessage.set('');
    this.isLoading.set(true);

    try {
      await this.authService.signInWithGoogle();
      await this.router.navigate(['/dashboard']);
    } catch (error) {
      this.errorMessage.set(
        error instanceof Error
          ? this.i18n.translate(error.message)
          : this.i18n.translate('login.errors.google')
      );
    } finally {
      this.isLoading.set(false);
    }
  }

  async signInAsGuest(): Promise<void> {
    this.errorMessage.set('');
    this.isGuestLoading.set(true);

    try {
      await this.authService.signInAsGuest();
      await this.router.navigate(['/dashboard']);
    } catch (error) {
      this.errorMessage.set(
        error instanceof Error
          ? this.i18n.translate(error.message)
          : this.i18n.translate('login.errors.guest')
      );
    } finally {
      this.isGuestLoading.set(false);
    }
  }
}
