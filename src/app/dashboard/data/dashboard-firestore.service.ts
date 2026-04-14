import { Injectable } from '@angular/core';
import { addDoc, collection, doc, getFirestore, onSnapshot, orderBy, query, QueryDocumentSnapshot, Timestamp, updateDoc } from 'firebase/firestore';
import { Observable, of } from 'rxjs';
import { getFirebaseApp, hasFirebaseConfig } from '../../firebase/firebase-app';
import { CreateDashboardTaskInput, DashboardTask, DashboardTaskStatus, UpdateDashboardTaskInput } from '../model/dashboard.types';

type FirestoreTask = Partial<DashboardTask> & { deletedAt?: unknown };

@Injectable({
  providedIn: 'root'
})
export class DashboardFirestoreService {
  private readonly firestore = hasFirebaseConfig() ? getFirestore(getFirebaseApp()) : null;

  async createTask(userId: string | null, task: CreateDashboardTaskInput): Promise<void> {
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
    if (!this.firestore || !userId) {
      throw new Error('dashboard.firestore.errors.config');
    }

    const firestore = this.firestore;

    await updateDoc(doc(firestore, 'users', userId, 'tasks', taskId), {
      status
    });
  }

  async updateTask(userId: string | null, taskId: string, task: UpdateDashboardTaskInput): Promise<void> {
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
    if (!this.firestore || !userId) {
      throw new Error('dashboard.firestore.errors.config');
    }

    const firestore = this.firestore;

    await updateDoc(doc(firestore, 'users', userId, 'tasks', taskId), {
      deletedAt: new Date()
    });
  }

  watchTasks(userId: string | null): Observable<DashboardTask[]> {
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
}
