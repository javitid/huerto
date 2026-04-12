import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { filter, take } from 'rxjs';
import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  isLoading = false;
  isGuestLoading = false;
  errorMessage = '';

  constructor(
    private router: Router,
    private authService: AuthService
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
    this.errorMessage = '';
    this.isLoading = true;

    try {
      await this.authService.signInWithGoogle();
      await this.router.navigate(['/dashboard']);
    } catch (error) {
      this.errorMessage = error instanceof Error
        ? error.message
        : 'No se pudo iniciar sesión con Google. Inténtalo de nuevo.';
    } finally {
      this.isLoading = false;
    }
  }

  async signInAsGuest(): Promise<void> {
    this.errorMessage = '';
    this.isGuestLoading = true;

    try {
      await this.authService.signInAsGuest();
      await this.router.navigate(['/dashboard']);
    } catch (error) {
      this.errorMessage = error instanceof Error
        ? error.message
        : 'No se pudo iniciar la sesión como invitado. Inténtalo de nuevo.';
    } finally {
      this.isGuestLoading = false;
    }
  }
}
