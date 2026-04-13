import { firstValueFrom } from 'rxjs';
import { AuthService } from './auth.service';

const mockSetPersistence = jest.fn();
const mockSignInWithPopup = jest.fn();
const mockSignInAnonymously = jest.fn();
const mockSignOut = jest.fn();
const mockOnAuthStateChanged = jest.fn();
const mockGetAuth = jest.fn();
const mockInitializeApp = jest.fn();
const mockGetApps = jest.fn();
const mockGetApp = jest.fn();

jest.mock('firebase/app', () => ({
  initializeApp: (...args: unknown[]) => mockInitializeApp(...args),
  getApps: (...args: unknown[]) => mockGetApps(...args),
  getApp: (...args: unknown[]) => mockGetApp(...args),
}));

jest.mock('firebase/auth', () => ({
  GoogleAuthProvider: jest.fn().mockImplementation(() => ({
    setCustomParameters: jest.fn(),
  })),
  browserLocalPersistence: 'browser-local-persistence',
  getAuth: (...args: unknown[]) => mockGetAuth(...args),
  onAuthStateChanged: (...args: unknown[]) => mockOnAuthStateChanged(...args),
  setPersistence: (...args: unknown[]) => mockSetPersistence(...args),
  signInWithPopup: (...args: unknown[]) => mockSignInWithPopup(...args),
  signInAnonymously: (...args: unknown[]) => mockSignInAnonymously(...args),
  signOut: (...args: unknown[]) => mockSignOut(...args),
}));

describe('AuthService', () => {
  const authInstance = { name: 'auth-instance' };
  const appInstance = { name: 'firebase-app' };
  const router = {
    navigate: jest.fn().mockResolvedValue(true),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetApps.mockReturnValue([]);
    mockInitializeApp.mockReturnValue(appInstance);
    mockGetAuth.mockReturnValue(authInstance);
    mockOnAuthStateChanged.mockImplementation((_auth, callback) => callback(null));
  });

  it('marks the service as ready after firebase auth state resolves', async () => {
    const service = new AuthService(router as never);

    await expect(firstValueFrom(service.ready$)).resolves.toBe(true);
    await expect(firstValueFrom(service.user$)).resolves.toBeNull();
    expect(mockInitializeApp).toHaveBeenCalled();
    expect(mockGetAuth).toHaveBeenCalledWith(appInstance);
  });

  it('signs in with google and updates the current user', async () => {
    const user = { uid: 'google-user' };
    mockSignInWithPopup.mockResolvedValue({ user });
    const service = new AuthService(router as never);

    await expect(service.signInWithGoogle()).resolves.toBe(user);
    await expect(firstValueFrom(service.user$)).resolves.toBe(user);
    expect(mockSetPersistence).toHaveBeenCalledWith(authInstance, 'browser-local-persistence');
    expect(mockSignInWithPopup).toHaveBeenCalled();
  });

  it('signs in as guest and updates the current user', async () => {
    const user = { uid: 'guest-user' };
    mockSignInAnonymously.mockResolvedValue({ user });
    const service = new AuthService(router as never);

    await expect(service.signInAsGuest()).resolves.toBe(user);
    await expect(firstValueFrom(service.user$)).resolves.toBe(user);
    expect(mockSetPersistence).toHaveBeenCalledWith(authInstance, 'browser-local-persistence');
    expect(mockSignInAnonymously).toHaveBeenCalledWith(authInstance);
  });

  it('signs out and redirects to login', async () => {
    const service = new AuthService(router as never);

    await service.logout();

    expect(mockSignOut).toHaveBeenCalledWith(authInstance);
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
    await expect(firstValueFrom(service.user$)).resolves.toBeNull();
  });
});
