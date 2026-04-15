import { Component, signal } from '@angular/core';
import { catchError, map, Observable, of, switchMap } from 'rxjs';
import { User } from 'firebase/auth';
import { AuthService } from '../../auth/auth.service';
import { I18nService } from '../../i18n/i18n.service';
import { DashboardFirestoreService } from '../data/dashboard-firestore.service';
import { DashboardTask, DashboardTaskStatus, DashboardViewModel } from '../model/dashboard.types';

@Component({
    selector: 'app-dashboard',
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.scss'],
    standalone: false
})
export class DashboardComponent {
  readonly dashboardTaskStatus = DashboardTaskStatus;
  readonly user$: Observable<User | null>;
  readonly dashboardData$: Observable<DashboardViewModel>;
  readonly taskTitle = signal('');
  readonly taskArea = signal('');
  readonly taskStatus = signal<DashboardTaskStatus>(DashboardTaskStatus.Pending);
  readonly createTaskPending = signal(false);
  readonly createTaskError = signal('');
  readonly createTaskSuccess = signal('');
  readonly taskMutationPendingId = signal<string | null>(null);
  readonly taskMutationError = signal('');
  readonly editingTaskId = signal<string | null>(null);
  readonly editTaskTitle = signal('');
  readonly editTaskArea = signal('');

  constructor(
    private authService: AuthService,
    private dashboardFirestore: DashboardFirestoreService,
    public i18n: I18nService
  ) {
    this.user$ = this.authService.user$;
    this.dashboardData$ = this.user$.pipe(
      switchMap((user) => this.dashboardFirestore.watchTasks(user?.uid ?? null)),
      map((tasks) => ({
        pendingTasks: tasks.filter((task) => task.status === DashboardTaskStatus.Pending).length,
        inProgressTasks: tasks.filter((task) => task.status === DashboardTaskStatus.InProgress).length,
        completedTasks: tasks.filter((task) => task.status === DashboardTaskStatus.Done).length,
        tasks
      })),
      catchError(() => of({
        pendingTasks: 0,
        inProgressTasks: 0,
        completedTasks: 0,
        tasks: []
      }))
    );
  }

  logout(): Promise<void> {
    return this.authService.logout();
  }

  isGuestUser(user: User | null): boolean {
    return !!user?.isAnonymous;
  }

  async createTask(user: User | null): Promise<void> {
    this.createTaskError.set('');
    this.createTaskSuccess.set('');

    if (this.isGuestUser(user)) {
      this.createTaskError.set(this.i18n.translate('dashboard.firestore.form.guest.error'));
      return;
    }

    const title = this.taskTitle().trim();
    const area = this.taskArea().trim();

    if (!title || !area) {
      this.createTaskError.set(this.i18n.translate('dashboard.firestore.errors.required'));
      return;
    }

    this.createTaskPending.set(true);

    try {
      await this.dashboardFirestore.createTask(user?.uid ?? null, {
        title,
        area,
        status: this.taskStatus()
      });
      this.taskTitle.set('');
      this.taskArea.set('');
      this.taskStatus.set(DashboardTaskStatus.Pending);
      this.createTaskSuccess.set(this.i18n.translate('dashboard.firestore.form.success'));
    } catch (error) {
      this.createTaskError.set(
        error instanceof Error
          ? this.i18n.translate(error.message)
          : this.i18n.translate('dashboard.firestore.errors.save')
      );
    } finally {
      this.createTaskPending.set(false);
    }
  }

  setTaskStatus(status: string): void {
    if (status === DashboardTaskStatus.Done || status === DashboardTaskStatus.InProgress) {
      this.taskStatus.set(status);
      return;
    }

    this.taskStatus.set(DashboardTaskStatus.Pending);
  }

  async updateTaskStatus(userId: string | null, taskId: string, status: string): Promise<void> {
    const normalizedStatus = this.normalizeTaskStatus(status);
    this.taskMutationError.set('');
    this.taskMutationPendingId.set(taskId);

    try {
      await this.dashboardFirestore.updateTaskStatus(userId, taskId, normalizedStatus);
    } catch (error) {
      this.taskMutationError.set(
        error instanceof Error
          ? this.i18n.translate(error.message)
          : this.i18n.translate('dashboard.firestore.errors.update')
      );
    } finally {
      this.taskMutationPendingId.set(null);
    }
  }

  startEditingTask(task: DashboardTask): void {
    this.taskMutationError.set('');
    this.editingTaskId.set(task.id);
    this.editTaskTitle.set(task.title);
    this.editTaskArea.set(task.area);
  }

  cancelEditingTask(): void {
    this.editingTaskId.set(null);
    this.editTaskTitle.set('');
    this.editTaskArea.set('');
  }

  async saveTask(userId: string | null, taskId: string): Promise<void> {
    this.taskMutationError.set('');

    const title = this.editTaskTitle().trim();
    const area = this.editTaskArea().trim();

    if (!title || !area) {
      this.taskMutationError.set(this.i18n.translate('dashboard.firestore.errors.required'));
      return;
    }

    this.taskMutationPendingId.set(taskId);

    try {
      await this.dashboardFirestore.updateTask(userId, taskId, { title, area });
      this.cancelEditingTask();
    } catch (error) {
      this.taskMutationError.set(
        error instanceof Error
          ? this.i18n.translate(error.message)
          : this.i18n.translate('dashboard.firestore.errors.update')
      );
    } finally {
      this.taskMutationPendingId.set(null);
    }
  }

  async deleteTask(userId: string | null, taskId: string): Promise<void> {
    this.taskMutationError.set('');
    this.taskMutationPendingId.set(taskId);

    try {
      await this.dashboardFirestore.deleteTask(userId, taskId);

      if (this.editingTaskId() === taskId) {
        this.cancelEditingTask();
      }
    } catch (error) {
      this.taskMutationError.set(
        error instanceof Error
          ? this.i18n.translate(error.message)
          : this.i18n.translate('dashboard.firestore.errors.delete')
      );
    } finally {
      this.taskMutationPendingId.set(null);
    }
  }

  getStatusSelectClasses(status: DashboardTaskStatus): string {
    if (status === DashboardTaskStatus.Done) {
      return 'border-emerald-300/20 bg-emerald-300/10 text-emerald-100 focus-visible:ring-emerald-200/40';
    }

    if (status === DashboardTaskStatus.InProgress) {
      return 'border-sky-300/20 bg-sky-300/10 text-sky-100 focus-visible:ring-sky-200/40';
    }

    return 'border-amber-300/20 bg-amber-300/10 text-amber-100 focus-visible:ring-amber-200/40';
  }

  private normalizeTaskStatus(status: string): DashboardTaskStatus {
    if (status === DashboardTaskStatus.Done || status === DashboardTaskStatus.InProgress) {
      return status;
    }

    return DashboardTaskStatus.Pending;
  }
}
