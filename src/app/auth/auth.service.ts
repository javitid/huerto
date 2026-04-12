import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { initializeApp, getApp, getApps } from 'firebase/app';
import {
  GoogleAuthProvider,
  User,
  browserLocalPersistence,
  getAuth,
  onAuthStateChanged,
  setPersistence,
  signInAnonymously,
  signInWithPopup,
  signOut
} from 'firebase/auth';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly firebaseConfig = environment.firebase;
  private readonly configReady = this.hasFirebaseConfig();
  private readonly userSubject = new BehaviorSubject<User | null>(null);
  private readonly readySubject = new BehaviorSubject<boolean>(false);
  private readonly auth = this.configReady ? getAuth(this.getFirebaseApp()) : null;

  readonly user$ = this.userSubject.asObservable();
  readonly ready$ = this.readySubject.asObservable();

  constructor(private router: Router) {
    if (!this.auth) {
      this.readySubject.next(true);
      return;
    }

    onAuthStateChanged(this.auth, (user) => {
      this.userSubject.next(user);
      this.readySubject.next(true);
    });
  }

  async signInWithGoogle(): Promise<User> {
    if (!this.auth) {
      throw new Error('Configura Firebase en los archivos environment para habilitar el acceso con Google.');
    }

    await setPersistence(this.auth, browserLocalPersistence);

    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({
      prompt: 'select_account'
    });

    const credential = await signInWithPopup(this.auth, provider);
    this.userSubject.next(credential.user);

    return credential.user;
  }

  async signInAsGuest(): Promise<User> {
    if (!this.auth) {
      throw new Error('Configura Firebase en los archivos environment para habilitar el acceso anónimo.');
    }

    await setPersistence(this.auth, browserLocalPersistence);

    const credential = await signInAnonymously(this.auth);
    this.userSubject.next(credential.user);

    return credential.user;
  }

  async logout(): Promise<void> {
    if (this.auth) {
      await signOut(this.auth);
    }

    this.userSubject.next(null);
    await this.router.navigate(['/login']);
  }

  private hasFirebaseConfig(): boolean {
    return Object.values(this.firebaseConfig).every((value) => value.trim().length > 0);
  }

  private getFirebaseApp() {
    if (getApps().length > 0) {
      return getApp();
    }

    return initializeApp(this.firebaseConfig);
  }
}
