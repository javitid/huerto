import { Injectable } from '@angular/core';
import { addDoc, collection, doc, getFirestore, onSnapshot, orderBy, query, QueryDocumentSnapshot, Timestamp, updateDoc } from 'firebase/firestore';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { getFirebaseApp, hasFirebaseConfig } from '../../firebase/firebase-app';
import { getE2EAuthUser, getE2ETasksStorageKey } from '../../testing/e2e-mode';
import { CreateDashboardTaskInput, DashboardTask, DashboardTaskStatus, UpdateDashboardTaskInput } from '../model/dashboard.types';

type FirestoreTask = Partial<DashboardTask> & { deletedAt?: unknown };
type E2EStoredTask = DashboardTask & { deletedAt?: string | null };

@Injectable({
  providedIn: 'root'
})
export class DashboardFirestoreService {
  private readonly firestore = hasFirebaseConfig() ? getFirestore(getFirebaseApp()) : null;
  private readonly e2eUser = getE2EAuthUser();
  private readonly e2eTasksSubject = new BehaviorSubject<DashboardTask[]>([]);

  constructor() {
    if (this.e2eUser) {
      this.e2eTasksSubject.next(this.readE2ETasks(this.e2eUser.uid));
    }
  }

  async createTask(userId: string | null, task: CreateDashboardTaskInput): Promise<void> {
    if (this.isE2EUser(userId)) {
      const tasks = this.readE2ETasks(userId);

      tasks.unshift({
        id: `e2e-task-${Date.now()}`,
        title: task.title.trim(),
        area: task.area.trim(),
        status: task.status,
        createdAt: new Date()
      });

      this.writeE2ETasks(userId, tasks);
      return;
    }

    if (!this.firestore || !userId) {
      throw new Error('dashboard.firestore.errors.config');
    }

    const firestore = this.firestore;

    await addDoc(collection(firestore, 'users', userId, 'tasks'), {
      title: task.title.trim(),
      area: task.area.trim(),
      status: task.status,
      createdAt: new Date()
    });
  }

  async updateTaskStatus(userId: string | null, taskId: string, status: DashboardTaskStatus): Promise<void> {
    if (this.isE2EUser(userId)) {
      const tasks = this.readE2ETasks(userId).map((task) => task.id === taskId ? { ...task, status } : task);
      this.writeE2ETasks(userId, tasks);
      return;
    }

    if (!this.firestore || !userId) {
      throw new Error('dashboard.firestore.errors.config');
    }

    const firestore = this.firestore;

    await updateDoc(doc(firestore, 'users', userId, 'tasks', taskId), {
      status
    });
  }

  async updateTask(userId: string | null, taskId: string, task: UpdateDashboardTaskInput): Promise<void> {
    if (this.isE2EUser(userId)) {
      const tasks = this.readE2ETasks(userId).map((currentTask) => (
        currentTask.id === taskId
          ? {
              ...currentTask,
              title: task.title.trim(),
              area: task.area.trim()
            }
          : currentTask
      ));
      this.writeE2ETasks(userId, tasks);
      return;
    }

    if (!this.firestore || !userId) {
      throw new Error('dashboard.firestore.errors.config');
    }

    const firestore = this.firestore;

    await updateDoc(doc(firestore, 'users', userId, 'tasks', taskId), {
      title: task.title.trim(),
      area: task.area.trim()
    });
  }

  async deleteTask(userId: string | null, taskId: string): Promise<void> {
    if (this.isE2EUser(userId)) {
      const tasks = this.readE2ETasks(userId).filter((task) => task.id !== taskId);
      this.writeE2ETasks(userId, tasks);
      return;
    }

    if (!this.firestore || !userId) {
      throw new Error('dashboard.firestore.errors.config');
    }

    const firestore = this.firestore;

    await updateDoc(doc(firestore, 'users', userId, 'tasks', taskId), {
      deletedAt: new Date()
    });
  }

  watchTasks(userId: string | null): Observable<DashboardTask[]> {
    if (this.isE2EUser(userId)) {
      this.e2eTasksSubject.next(this.readE2ETasks(userId));
      return this.e2eTasksSubject.asObservable();
    }

    if (!this.firestore || !userId) {
      return of([]);
    }

    const firestore = this.firestore;

    return new Observable<DashboardTask[]>((subscriber) => {
      const tasksQuery = query(
        collection(firestore, 'users', userId, 'tasks'),
        orderBy('createdAt', 'desc')
      );

      const unsubscribe = onSnapshot(
        tasksQuery,
        (snapshot) => {
          subscriber.next(
            snapshot.docs
              .map((taskDoc) => this.mapTask(taskDoc))
              .filter((task): task is DashboardTask => task !== null)
          );
        },
        (error) => subscriber.error(error)
      );

      return () => unsubscribe();
    });
  }

  private mapTask(doc: QueryDocumentSnapshot): DashboardTask | null {
    const data = doc.data() as FirestoreTask;

    if (this.isDeleted(data.deletedAt)) {
      return null;
    }

    return {
      id: doc.id,
      title: data.title?.trim() || 'Task without title',
      area: data.area?.trim() || 'General',
      createdAt: this.normalizeCreatedAt(data.createdAt),
      status: this.normalizeStatus(data.status)
    };
  }

  private normalizeStatus(status: FirestoreTask['status']): DashboardTaskStatus {
    if (status === DashboardTaskStatus.Done || status === DashboardTaskStatus.InProgress) {
      return status;
    }

    return DashboardTaskStatus.Pending;
  }

  private normalizeCreatedAt(createdAt: unknown): Date | null {
    if (typeof Timestamp === 'function' && createdAt instanceof Timestamp) {
      return createdAt.toDate();
    }

    if (
      typeof createdAt === 'object' &&
      createdAt !== null &&
      'toDate' in createdAt &&
      typeof createdAt.toDate === 'function'
    ) {
      const date = createdAt.toDate();
      return date instanceof Date && !Number.isNaN(date.getTime()) ? date : null;
    }

    if (createdAt instanceof Date && !Number.isNaN(createdAt.getTime())) {
      return createdAt;
    }

    return null;
  }

  private isDeleted(value: unknown): boolean {
    return this.normalizeCreatedAt(value) !== null;
  }

  private isE2EUser(userId: string | null): userId is string {
    return !!userId && userId === this.e2eUser?.uid;
  }

  private readE2ETasks(userId: string): DashboardTask[] {
    if (typeof window === 'undefined') {
      return [];
    }

    const rawTasks = window.localStorage.getItem(getE2ETasksStorageKey(userId));

    if (!rawTasks) {
      return [];
    }

    try {
      const parsedTasks = JSON.parse(rawTasks) as E2EStoredTask[];

      return parsedTasks.map((task) => ({
        ...task,
        createdAt: task.createdAt ? new Date(task.createdAt) : null
      }));
    } catch {
      return [];
    }
  }

  private writeE2ETasks(userId: string, tasks: DashboardTask[]): void {
    if (typeof window === 'undefined') {
      return;
    }

    window.localStorage.setItem(getE2ETasksStorageKey(userId), JSON.stringify(tasks));
    this.e2eTasksSubject.next(tasks);
  }
}
