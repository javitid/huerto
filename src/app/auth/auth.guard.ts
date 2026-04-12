import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { combineLatest, filter, map, Observable, take } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(): Observable<boolean | UrlTree> {
    return combineLatest([this.authService.user$, this.authService.ready$]).pipe(
      filter(([, ready]) => ready),
      take(1),
      map(([user]) => user ? true : this.router.createUrlTree(['/login']))
    );
  }
}
