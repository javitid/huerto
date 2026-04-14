import { FirebaseApp, getApp, getApps, initializeApp } from 'firebase/app';
import { environment } from '../../environments/environment';

export function hasFirebaseConfig(): boolean {
  return Object.values(environment.firebase).every((value) => value.trim().length > 0);
}

export function getFirebaseApp(): FirebaseApp {
  if (getApps().length > 0) {
    return getApp();
  }

  return initializeApp(environment.firebase);
}
