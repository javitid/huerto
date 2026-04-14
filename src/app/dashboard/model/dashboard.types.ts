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
