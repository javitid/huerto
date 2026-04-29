import { ChangeDetectionStrategy, Component } from '@angular/core';
import { User } from 'firebase/auth';
import {
  DASHBOARD_FILE_ANALYSIS_SECTIONS,
  DashboardFileAnalysisField,
  DashboardTask,
  DashboardTaskStatus
} from '../model/dashboard.types';
import { DashboardFacade } from './dashboard.facade';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardComponent {
  readonly analysisSections = DASHBOARD_FILE_ANALYSIS_SECTIONS;

  constructor(public readonly facade: DashboardFacade) {}

  get dashboardTaskStatus(): typeof this.facade.dashboardTaskStatus {
    return this.facade.dashboardTaskStatus;
  }

  get showInvoiceAnalysis() {
    return this.facade.showInvoiceAnalysis;
  }

  get statusOptions() {
    return this.facade.statusOptions;
  }

  get user$() {
    return this.facade.user$;
  }

  get dashboardData$() {
    return this.facade.dashboardData$;
  }

  get taskTitle() {
    return this.facade.taskTitle;
  }

  get taskArea() {
    return this.facade.taskArea;
  }

  get taskStatus() {
    return this.facade.taskStatus;
  }

  get createTaskPending() {
    return this.facade.createTaskPending;
  }

  get createTaskError() {
    return this.facade.createTaskError;
  }

  get createTaskSuccess() {
    return this.facade.createTaskSuccess;
  }

  get taskMutationPendingId() {
    return this.facade.taskMutationPendingId;
  }

  get taskMutationError() {
    return this.facade.taskMutationError;
  }

  get editingTaskId() {
    return this.facade.editingTaskId;
  }

  get editTaskTitle() {
    return this.facade.editTaskTitle;
  }

  get editTaskArea() {
    return this.facade.editTaskArea;
  }

  get activeTaskFilter() {
    return this.facade.activeTaskFilter;
  }

  get selectedUploadFile() {
    return this.facade.selectedUploadFile;
  }

  get uploadPending() {
    return this.facade.uploadPending;
  }

  get uploadError() {
    return this.facade.uploadError;
  }

  get uploadSuccess() {
    return this.facade.uploadSuccess;
  }

  get uploadResultSummary() {
    return this.facade.uploadResultSummary;
  }

  get uploadAnalysisResult() {
    return this.facade.uploadAnalysisResult;
  }

  logout(): Promise<void> {
    return this.facade.logout();
  }

  isGuestUser(user: User | null): boolean {
    return this.facade.isGuestUser(user);
  }

  canUploadFiles(user: User | null): boolean {
    return this.facade.canUploadFiles(user);
  }

  createTask(user: User | null): Promise<void> {
    return this.facade.createTask(user);
  }

  onUploadFileSelected(event: Event): void {
    this.facade.onUploadFileSelected(event);
  }

  uploadSelectedFile(user: User | null, input?: HTMLInputElement): Promise<void> {
    return this.facade.uploadSelectedFile(user, input);
  }

  getAnalysisFields(section: DashboardFileAnalysisField['section']): DashboardFileAnalysisField[] {
    return this.facade.getAnalysisFields(section);
  }

  setTaskStatus(status: string): void {
    this.facade.setTaskStatus(status);
  }

  updateTaskStatus(userId: string | null, taskId: string, status: string): Promise<void> {
    return this.facade.updateTaskStatus(userId, taskId, status);
  }

  startEditingTask(task: DashboardTask): void {
    this.facade.startEditingTask(task);
  }

  cancelEditingTask(): void {
    this.facade.cancelEditingTask();
  }

  saveTask(userId: string | null, taskId: string): Promise<void> {
    return this.facade.saveTask(userId, taskId);
  }

  deleteTask(userId: string | null, taskId: string): Promise<void> {
    return this.facade.deleteTask(userId, taskId);
  }

  toggleTaskFilter(status: DashboardTaskStatus): void {
    this.facade.toggleTaskFilter(status);
  }

  isTaskFilterActive(status: DashboardTaskStatus): boolean {
    return this.facade.isTaskFilterActive(status);
  }

  getVisibleTasks(tasks: DashboardTask[]): DashboardTask[] {
    return this.facade.getVisibleTasks(tasks);
  }

  getTaskFilterCardClasses(status: DashboardTaskStatus): string {
    return this.facade.getTaskFilterCardClasses(status);
  }

  getStatusSelectClasses(status: DashboardTaskStatus): string {
    return this.facade.getStatusSelectClasses(status);
  }
}
