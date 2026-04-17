import { Component, signal } from '@angular/core';
import { catchError, map, Observable, of, switchMap } from 'rxjs';
import { User } from 'firebase/auth';
import { AuthService } from '../../auth/auth.service';
import { I18nService } from '../../i18n/i18n.service';
import { DashboardFirestoreService } from '../data/dashboard-firestore.service';
import { DashboardFileAnalysisService } from '../data/dashboard-file-analysis.service';
import { DashboardFileAnalysisResult, DashboardTask, DashboardTaskStatus, DashboardViewModel } from '../model/dashboard.types';

@Component({
    selector: 'app-dashboard',
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.scss'],
    standalone: false
})
export class DashboardComponent {
  readonly dashboardTaskStatus = DashboardTaskStatus;
  readonly statusOptions = [
    { value: DashboardTaskStatus.Pending, labelKey: 'dashboard.firestore.status.pending' },
    { value: DashboardTaskStatus.InProgress, labelKey: 'dashboard.firestore.status.in-progress' },
    { value: DashboardTaskStatus.Done, labelKey: 'dashboard.firestore.status.done' }
  ];
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
  readonly activeTaskFilter = signal<DashboardTaskStatus | null>(null);
  readonly selectedUploadFile = signal<File | null>(null);
  readonly uploadPending = signal(false);
  readonly uploadError = signal('');
  readonly uploadSuccess = signal('');
  readonly uploadResultSummary = signal('');
  readonly uploadAnalysisResult = signal<DashboardFileAnalysisResult | null>(null);

  constructor(
    private authService: AuthService,
    private dashboardFirestore: DashboardFirestoreService,
    private dashboardFileAnalysis: DashboardFileAnalysisService,
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

  canUploadFiles(user: User | null): boolean {
    return this.dashboardFileAnalysis.canAnalyzeFiles(user);
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

  onUploadFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement | null;
    const file = input?.files?.item(0) ?? null;

    this.uploadError.set('');
    this.uploadSuccess.set('');
    this.uploadResultSummary.set('');
    this.uploadAnalysisResult.set(null);
    this.selectedUploadFile.set(file);
  }

  async uploadSelectedFile(user: User | null, input?: HTMLInputElement): Promise<void> {
    this.uploadError.set('');
    this.uploadSuccess.set('');
    this.uploadResultSummary.set('');
    this.uploadAnalysisResult.set(null);

    if (!this.canUploadFiles(user)) {
      this.uploadError.set(this.i18n.translate('dashboard.analysis.errors.unauthorized'));
      return;
    }

    const file = this.selectedUploadFile();

    if (!file) {
      this.uploadError.set(this.i18n.translate('dashboard.analysis.errors.required'));
      return;
    }

    this.uploadPending.set(true);

    try {
      const result = await this.dashboardFileAnalysis.analyzeFile(user, file);
      this.selectedUploadFile.set(null);
      if (input) {
        input.value = '';
      }
      this.uploadSuccess.set(this.i18n.translate('dashboard.analysis.success'));
      this.uploadResultSummary.set(result.message || '');
      this.uploadAnalysisResult.set(result);
    } catch (error) {
      this.uploadError.set(
        error instanceof Error
          ? this.i18n.translate(error.message)
          : this.i18n.translate('dashboard.analysis.errors.save')
      );
    } finally {
      this.uploadPending.set(false);
    }
  }

  getAnalysisFields(section: string): Array<{ label: string; value: string }> {
    return this.uploadAnalysisResult()?.fields?.filter((field) => field.section === section) ?? [];
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

  toggleTaskFilter(status: DashboardTaskStatus): void {
    this.activeTaskFilter.update((currentStatus) => currentStatus === status ? null : status);
  }

  isTaskFilterActive(status: DashboardTaskStatus): boolean {
    return this.activeTaskFilter() === status;
  }

  getVisibleTasks(tasks: DashboardTask[]): DashboardTask[] {
    const activeFilter = this.activeTaskFilter();

    if (!activeFilter) {
      return tasks;
    }

    return tasks.filter((task) => task.status === activeFilter);
  }

  getTaskFilterCardClasses(status: DashboardTaskStatus): string {
    const baseClasses = 'rounded-3xl border p-6 text-left backdrop-blur transition duration-150 ease-in-out focus-visible:ring-4 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950';

    if (this.isTaskFilterActive(status)) {
      if (status === DashboardTaskStatus.Done) {
        return `${baseClasses} border-emerald-300/40 bg-emerald-300/16 shadow-lg shadow-emerald-950/20 focus-visible:ring-emerald-200/50`;
      }

      if (status === DashboardTaskStatus.InProgress) {
        return `${baseClasses} border-sky-300/40 bg-sky-300/16 shadow-lg shadow-sky-950/20 focus-visible:ring-sky-200/50`;
      }

      return `${baseClasses} border-amber-300/40 bg-amber-300/16 shadow-lg shadow-amber-950/20 focus-visible:ring-amber-200/50`;
    }

    if (status === DashboardTaskStatus.Done) {
      return `${baseClasses} border-white/10 bg-white/5 hover:border-emerald-300/25 hover:bg-emerald-300/10 focus-visible:ring-emerald-200/40`;
    }

    if (status === DashboardTaskStatus.InProgress) {
      return `${baseClasses} border-white/10 bg-white/5 hover:border-sky-300/25 hover:bg-sky-300/10 focus-visible:ring-sky-200/40`;
    }

    return `${baseClasses} border-white/10 bg-white/5 hover:border-amber-300/25 hover:bg-amber-300/10 focus-visible:ring-amber-200/40`;
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
