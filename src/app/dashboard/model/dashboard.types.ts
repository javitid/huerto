export enum DashboardTaskStatus {
  Pending = 'pending',
  InProgress = 'in-progress',
  Done = 'done'
}

export interface DashboardTask {
  id: string;
  title: string;
  area: string;
  createdAt: Date | null;
  status: DashboardTaskStatus;
}

export interface CreateDashboardTaskInput {
  title: string;
  area: string;
  status: DashboardTaskStatus;
}

export interface UpdateDashboardTaskInput {
  title: string;
  area: string;
}

export interface DashboardViewModel {
  pendingTasks: number;
  inProgressTasks: number;
  completedTasks: number;
  tasks: DashboardTask[];
}

export interface DashboardFileAnalysisResult {
  fileName: string;
  analyzed: boolean;
  message?: string;
  fields?: Array<{
    section?: string;
    label: string;
    value: string;
  }>;
  recommendations?: Array<{
    title: string;
    detail: string;
    severity: 'high' | 'medium' | 'info';
  }>;
  metadata?: {
    userId: string;
    contentType: string;
    size: number;
  };
}
