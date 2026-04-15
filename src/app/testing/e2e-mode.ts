export interface E2EAuthUser {
  uid: string;
  displayName: string;
  email: string | null;
  isAnonymous: boolean;
}

const E2E_AUTH_USER_KEY = 'huerto.e2e.authUser';
const E2E_TASKS_KEY_PREFIX = 'huerto.e2e.tasks.';

function getStorage(): Storage | null {
  if (typeof window === 'undefined') {
    return null;
  }

  return window.localStorage;
}

export function getE2EAuthUser(): E2EAuthUser | null {
  const storage = getStorage();

  if (!storage) {
    return null;
  }

  const rawUser = storage.getItem(E2E_AUTH_USER_KEY);

  if (!rawUser) {
    return null;
  }

  try {
    const parsed = JSON.parse(rawUser) as Partial<E2EAuthUser>;

    if (!parsed.uid) {
      return null;
    }

    return {
      uid: parsed.uid,
      displayName: parsed.displayName ?? 'Usuario e2e',
      email: parsed.email ?? null,
      isAnonymous: !!parsed.isAnonymous
    };
  } catch {
    return null;
  }
}

export function getE2ETasksStorageKey(userId: string): string {
  return `${E2E_TASKS_KEY_PREFIX}${userId}`;
}
