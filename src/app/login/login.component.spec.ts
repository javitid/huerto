import { BehaviorSubject } from 'rxjs';

jest.mock('../auth/auth.service', () => ({
  AuthService: class {},
}));

import { LoginComponent } from './login.component';

describe('LoginComponent', () => {
  let router: { navigate: jest.Mock };
  let authService: {
    ready$: BehaviorSubject<boolean>;
    user$: BehaviorSubject<unknown | null>;
    signInWithGoogle: jest.Mock;
    signInAsGuest: jest.Mock;
  };
  let i18n: { translate: jest.Mock };

  beforeEach(() => {
    router = {
      navigate: jest.fn().mockResolvedValue(true),
    };
    authService = {
      ready$: new BehaviorSubject(true),
      user$: new BehaviorSubject<unknown | null>(null),
      signInWithGoogle: jest.fn().mockResolvedValue(undefined),
      signInAsGuest: jest.fn().mockResolvedValue(undefined),
    };
    i18n = {
      translate: jest.fn((key: string) => `translated:${key}`),
    };
  });

  it('redirects to dashboard on init when a user already exists', () => {
    authService.user$.next({ uid: '123' });
    const component = new LoginComponent(router as never, authService as never, i18n as never);

    component.ngOnInit();

    expect(router.navigate).toHaveBeenCalledWith(['/dashboard']);
  });

  it('navigates after a successful google sign-in', async () => {
    const component = new LoginComponent(router as never, authService as never, i18n as never);

    await component.signInWithGoogle();

    expect(authService.signInWithGoogle).toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(['/dashboard']);
    expect(component.isLoading()).toBe(false);
    expect(component.errorMessage()).toBe('');
  });

  it('translates the google sign-in error key when the sign-in fails', async () => {
    authService.signInWithGoogle.mockRejectedValue(new Error('auth.configGoogle'));
    const component = new LoginComponent(router as never, authService as never, i18n as never);

    await component.signInWithGoogle();

    expect(component.errorMessage()).toBe('translated:auth.configGoogle');
    expect(component.isLoading()).toBe(false);
  });

  it('navigates after a successful guest sign-in', async () => {
    const component = new LoginComponent(router as never, authService as never, i18n as never);

    await component.signInAsGuest();

    expect(authService.signInAsGuest).toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(['/dashboard']);
    expect(component.isGuestLoading()).toBe(false);
  });
});
