import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
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
import { getFirebaseApp, hasFirebaseConfig } from '../firebase/firebase-app';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly configReady = hasFirebaseConfig();
  private readonly userSubject = new BehaviorSubject<User | null>(null);
  private readonly readySubject = new BehaviorSubject<boolean>(false);
  private readonly auth = this.configReady ? getAuth(getFirebaseApp()) : null;

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
      throw new Error('auth.configGoogle');
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
      throw new Error('auth.configGuest');
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
}
