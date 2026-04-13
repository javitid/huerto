import { UrlTree } from '@angular/router';
import { BehaviorSubject, firstValueFrom } from 'rxjs';

jest.mock('./auth.service', () => ({
  AuthService: class {},
}));

import { AuthGuard } from './auth.guard';

describe('AuthGuard', () => {
  it('allows navigation when a user exists and auth is ready', async () => {
    const authService = {
      user$: new BehaviorSubject({ uid: '123' }),
      ready$: new BehaviorSubject(true),
    };
    const router = {
      createUrlTree: jest.fn(),
    };

    const guard = new AuthGuard(authService as never, router as never);
    const result = await firstValueFrom(guard.canActivate());

    expect(result).toBe(true);
    expect(router.createUrlTree).not.toHaveBeenCalled();
  });

  it('redirects to login when there is no user and auth is ready', async () => {
    const loginTree = new UrlTree();
    const authService = {
      user$: new BehaviorSubject(null),
      ready$: new BehaviorSubject(true),
    };
    const router = {
      createUrlTree: jest.fn().mockReturnValue(loginTree),
    };

    const guard = new AuthGuard(authService as never, router as never);
    const result = await firstValueFrom(guard.canActivate());

    expect(router.createUrlTree).toHaveBeenCalledWith(['/login']);
    expect(result).toBe(loginTree);
  });
});
