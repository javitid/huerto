import { BehaviorSubject } from 'rxjs';

jest.mock('../auth/auth.service', () => ({
  AuthService: class {},
}));

import { DashboardComponent } from './dashboard.component';

describe('DashboardComponent', () => {
  it('exposes the auth service user observable', () => {
    const user$ = new BehaviorSubject({ uid: '123' });
    const authService = {
      user$,
      logout: jest.fn(),
    };
    const i18n = {};

    const component = new DashboardComponent(authService as never, i18n as never);

    expect(component.user$).toBe(user$);
  });

  it('delegates logout to the auth service', async () => {
    const authService = {
      user$: new BehaviorSubject(null),
      logout: jest.fn().mockResolvedValue(undefined),
    };
    const i18n = {};

    const component = new DashboardComponent(authService as never, i18n as never);

    await component.logout();

    expect(authService.logout).toHaveBeenCalled();
  });
});
