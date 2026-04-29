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

export const DASHBOARD_FILE_ANALYSIS_SECTIONS = {
  Summary: 'Resumen',
  Profile: 'Perfil',
  Experience: 'Experiencia',
  Education: 'Formacion',
  Skills: 'Habilidades'
} as const;

export type DashboardFileAnalysisSection =
  typeof DASHBOARD_FILE_ANALYSIS_SECTIONS[keyof typeof DASHBOARD_FILE_ANALYSIS_SECTIONS];

export interface DashboardFileAnalysisField {
  section: DashboardFileAnalysisSection;
  label: string;
  value: string;
}

export interface DashboardFileAnalysisRecommendation {
  title: string;
  detail: string;
  severity: 'high' | 'medium' | 'info';
}

export interface DashboardFileAnalysisResult {
  fileName: string;
  analyzed: boolean;
  message?: string;
  fields?: DashboardFileAnalysisField[];
  recommendations?: DashboardFileAnalysisRecommendation[];
  metadata?: {
    userId: string;
    contentType: string;
    size: number;
  };
}
