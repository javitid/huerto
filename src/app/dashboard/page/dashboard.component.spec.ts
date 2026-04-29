import { BehaviorSubject, firstValueFrom, of } from 'rxjs';
import { DashboardTask, DashboardTaskStatus } from '../model/dashboard.types';

jest.mock('../../auth/auth.service', () => ({
  AuthService: class {},
}));

jest.mock('../data/dashboard-firestore.service', () => ({
  DashboardFirestoreService: class {},
}));

jest.mock('../data/dashboard-file-analysis.service', () => ({
  DashboardFileAnalysisService: class {},
}));

import { DashboardComponent } from './dashboard.component';
import { DashboardFacade } from './dashboard.facade';

describe('DashboardComponent', () => {
  function createDashboardFirestoreMock() {
    return {
      createTask: jest.fn(),
      deleteTask: jest.fn(),
      updateTask: jest.fn(),
      updateTaskStatus: jest.fn(),
      watchTasks: jest.fn().mockReturnValue(of([]))
    };
  }

  function createTask(overrides: Partial<DashboardTask> = {}): DashboardTask {
    return {
      id: 'task-1',
      title: 'Review irrigation',
      area: 'Greenhouse',
      createdAt: new Date('2026-04-15T00:05:00.000Z'),
      status: DashboardTaskStatus.Pending,
      ...overrides
    };
  }

  function createDashboardFileAnalysisMock() {
    return {
      canAnalyzeFiles: jest.fn().mockReturnValue(true),
      analyzeFile: jest.fn(),
    };
  }

  function createComponent(overrides: {
    authService?: {
      user$: BehaviorSubject<any>;
      logout: jest.Mock;
    };
    dashboardFirestore?: ReturnType<typeof createDashboardFirestoreMock>;
    dashboardFileAnalysis?: ReturnType<typeof createDashboardFileAnalysisMock>;
    i18n?: { translate?: jest.Mock };
  } = {}) {
    const authService = overrides.authService ?? {
      user$: new BehaviorSubject({ uid: '123' }),
      logout: jest.fn(),
    };
    const dashboardFirestore = overrides.dashboardFirestore ?? createDashboardFirestoreMock();
    const dashboardFileAnalysis = overrides.dashboardFileAnalysis ?? createDashboardFileAnalysisMock();
    const i18n = {
      translate: jest.fn((key: string) => `translated:${key}`),
      ...overrides.i18n
    };
    const facade = new DashboardFacade(
      authService as never,
      dashboardFirestore as never,
      dashboardFileAnalysis as never,
      i18n as never
    );

    return {
      component: new DashboardComponent(facade),
      dashboardFirestore,
      dashboardFileAnalysis,
      authService
    };
  }

  it('exposes the auth service user observable', () => {
    const user$ = new BehaviorSubject({ uid: '123' });
    const { component } = createComponent({
      authService: {
        user$,
        logout: jest.fn()
      }
    });

    expect(component.user$).toBe(user$);
  });

  it('loads firestore tasks for the current user', async () => {
    const { component, dashboardFirestore } = createComponent();

    await firstValueFrom(component.dashboardData$);

    expect(dashboardFirestore.watchTasks).toHaveBeenCalledWith('123');
  });

  it('delegates logout to the auth service', async () => {
    const logout = jest.fn().mockResolvedValue(undefined);
    const { component } = createComponent({
      authService: {
        user$: new BehaviorSubject(null),
        logout
      }
    });

    await component.logout();

    expect(logout).toHaveBeenCalled();
  });

  it('creates a task and clears the form on success', async () => {
    const dashboardFirestore = createDashboardFirestoreMock();
    dashboardFirestore.createTask.mockResolvedValue(undefined);
    const { component } = createComponent({
      authService: {
        user$: new BehaviorSubject({ uid: '123', isAnonymous: false }),
        logout: jest.fn()
      },
      dashboardFirestore
    });
    component.taskTitle.set('Review irrigation');
    component.taskArea.set('Greenhouse');
    component.taskStatus.set(DashboardTaskStatus.InProgress);

    await component.createTask({ uid: '123', isAnonymous: false } as never);

    expect(dashboardFirestore.createTask).toHaveBeenCalledWith('123', {
      title: 'Review irrigation',
      area: 'Greenhouse',
      status: DashboardTaskStatus.InProgress
    });
    expect(component.taskTitle()).toBe('');
    expect(component.taskArea()).toBe('');
    expect(component.taskStatus()).toBe(DashboardTaskStatus.Pending);
    expect(component.createTaskSuccess()).toBe('translated:dashboard.firestore.form.success');
  });

  it('shows a validation error when required fields are missing', async () => {
    const { component, dashboardFirestore } = createComponent({
      authService: {
        user$: new BehaviorSubject({ uid: '123', isAnonymous: false }),
        logout: jest.fn()
      }
    });

    await component.createTask({ uid: '123', isAnonymous: false } as never);

    expect(dashboardFirestore.createTask).not.toHaveBeenCalled();
    expect(component.createTaskError()).toBe('translated:dashboard.firestore.errors.required');
  });

  it('does not create a task for guest users', async () => {
    const { component, dashboardFirestore } = createComponent({
      authService: {
        user$: new BehaviorSubject({ uid: 'guest-123', isAnonymous: true }),
        logout: jest.fn()
      }
    });
    component.taskTitle.set('Review irrigation');
    component.taskArea.set('Greenhouse');

    await component.createTask({ uid: 'guest-123', isAnonymous: true } as never);

    expect(dashboardFirestore.createTask).not.toHaveBeenCalled();
    expect(component.createTaskError()).toBe('translated:dashboard.firestore.form.guest.error');
  });

  it('updates the status of a task', async () => {
    const dashboardFirestore = createDashboardFirestoreMock();
    dashboardFirestore.updateTaskStatus.mockResolvedValue(undefined);
    const { component } = createComponent({ dashboardFirestore });

    await component.updateTaskStatus('123', 'task-1', DashboardTaskStatus.Done);

    expect(dashboardFirestore.updateTaskStatus).toHaveBeenCalledWith('123', 'task-1', DashboardTaskStatus.Done);
    expect(component.taskMutationPendingId()).toBeNull();
  });

  it('starts and saves task editing', async () => {
    const dashboardFirestore = createDashboardFirestoreMock();
    dashboardFirestore.updateTask.mockResolvedValue(undefined);
    const { component } = createComponent({ dashboardFirestore });
    component.startEditingTask(createTask({ title: 'Old title', area: 'Old area' }));
    component.editTaskTitle.set('New title');
    component.editTaskArea.set('New area');

    await component.saveTask('123', 'task-1');

    expect(dashboardFirestore.updateTask).toHaveBeenCalledWith('123', 'task-1', {
      title: 'New title',
      area: 'New area'
    });
    expect(component.editingTaskId()).toBeNull();
  });

  it('shows a validation error when saving an edited task with empty fields', async () => {
    const { component, dashboardFirestore } = createComponent();
    component.startEditingTask(createTask());
    component.editTaskTitle.set(' ');
    component.editTaskArea.set(' ');

    await component.saveTask('123', 'task-1');

    expect(dashboardFirestore.updateTask).not.toHaveBeenCalled();
    expect(component.taskMutationError()).toBe('translated:dashboard.firestore.errors.required');
  });

  it('deletes a task', async () => {
    const dashboardFirestore = createDashboardFirestoreMock();
    dashboardFirestore.deleteTask.mockResolvedValue(undefined);
    const { component } = createComponent({ dashboardFirestore });

    await component.deleteTask('123', 'task-1');

    expect(dashboardFirestore.deleteTask).toHaveBeenCalledWith('123', 'task-1');
    expect(component.taskMutationPendingId()).toBeNull();
  });

  it('toggles the active task filter and keeps only one active at a time', () => {
    const { component } = createComponent();

    expect(component.activeTaskFilter()).toBeNull();

    component.toggleTaskFilter(DashboardTaskStatus.Pending);
    expect(component.activeTaskFilter()).toBe(DashboardTaskStatus.Pending);
    expect(component.isTaskFilterActive(DashboardTaskStatus.Pending)).toBe(true);
    expect(component.isTaskFilterActive(DashboardTaskStatus.Done)).toBe(false);

    component.toggleTaskFilter(DashboardTaskStatus.Done);
    expect(component.activeTaskFilter()).toBe(DashboardTaskStatus.Done);
    expect(component.isTaskFilterActive(DashboardTaskStatus.Pending)).toBe(false);
    expect(component.isTaskFilterActive(DashboardTaskStatus.Done)).toBe(true);

    component.toggleTaskFilter(DashboardTaskStatus.Done);
    expect(component.activeTaskFilter()).toBeNull();
  });

  it('returns all tasks when there is no active filter and only matching tasks when a filter is active', () => {
    const tasks = [
      createTask({ id: 'task-1', status: DashboardTaskStatus.Pending }),
      createTask({ id: 'task-2', status: DashboardTaskStatus.InProgress }),
      createTask({ id: 'task-3', status: DashboardTaskStatus.Done })
    ];
    const { component } = createComponent();

    expect(component.getVisibleTasks(tasks)).toEqual(tasks);

    component.toggleTaskFilter(DashboardTaskStatus.InProgress);

    expect(component.getVisibleTasks(tasks)).toEqual([
      expect.objectContaining({ id: 'task-2', status: DashboardTaskStatus.InProgress })
    ]);
  });

  it('returns pressed styles for the active filter card and idle styles for the others', () => {
    const { component } = createComponent();

    const idlePendingClasses = component.getTaskFilterCardClasses(DashboardTaskStatus.Pending);
    expect(idlePendingClasses).toContain('bg-white/5');
    expect(idlePendingClasses).toContain('hover:border-amber-300/25');

    component.toggleTaskFilter(DashboardTaskStatus.Pending);

    const activePendingClasses = component.getTaskFilterCardClasses(DashboardTaskStatus.Pending);
    const idleDoneClasses = component.getTaskFilterCardClasses(DashboardTaskStatus.Done);

    expect(activePendingClasses).toContain('bg-amber-300/16');
    expect(activePendingClasses).toContain('border-amber-300/40');
    expect(idleDoneClasses).toContain('hover:border-emerald-300/25');
    expect(idleDoneClasses).toContain('bg-white/5');
  });

  it('enables file uploads only for allowed authenticated dashboard users', () => {
    const dashboardFileAnalysis = createDashboardFileAnalysisMock();
    dashboardFileAnalysis.canAnalyzeFiles.mockImplementation((user: { email?: string | null } | null) => user?.email === 'file-analysis@huerto.local');
    const { component } = createComponent({ dashboardFileAnalysis });

    expect(component.canUploadFiles({ uid: '123', email: 'file-analysis@huerto.local' } as never)).toBe(true);
    expect(component.canUploadFiles({ uid: '123', email: 'other@huerto.local' } as never)).toBe(false);
  });

  it('uploads the selected file for the allowed user and clears the selection', async () => {
    const dashboardFileAnalysis = createDashboardFileAnalysisMock();
    dashboardFileAnalysis.canAnalyzeFiles.mockReturnValue(true);
    dashboardFileAnalysis.analyzeFile.mockResolvedValue({
      fileName: 'orchard-plan.pdf',
      analyzed: true,
      message: 'Resumen listo',
      fields: [{ section: 'Resumen', label: 'Nombre completo', value: 'Ana Perez' }]
    });
    const { component } = createComponent({
      authService: {
        user$: new BehaviorSubject({ uid: '123', email: 'file-analysis@huerto.local' }),
        logout: jest.fn()
      },
      dashboardFileAnalysis
    });
    const file = new File(['hello'], 'orchard-plan.pdf');
    const input = { value: 'occupied' } as HTMLInputElement;
    const files = {
      item: jest.fn().mockReturnValue(file)
    } as unknown as FileList;

    component.onUploadFileSelected({ target: { files } } as unknown as Event);
    await component.uploadSelectedFile({ uid: '123', email: 'file-analysis@huerto.local' } as never, input);

    expect(dashboardFileAnalysis.analyzeFile).toHaveBeenCalledWith({ uid: '123', email: 'file-analysis@huerto.local' }, file);
    expect(component.selectedUploadFile()).toBeNull();
    expect(input.value).toBe('');
    expect(component.uploadSuccess()).toBe('translated:dashboard.analysis.success');
    expect(component.uploadResultSummary()).toBe('Resumen listo');
    expect(component.getAnalysisFields('Resumen')).toEqual([{ label: 'Nombre completo', value: 'Ana Perez', section: 'Resumen' }]);
  });

  it('shows an upload error for users outside the allowlist', async () => {
    const dashboardFileAnalysis = createDashboardFileAnalysisMock();
    dashboardFileAnalysis.canAnalyzeFiles.mockReturnValue(false);
    const { component } = createComponent({
      authService: {
        user$: new BehaviorSubject({ uid: 'other-user', email: 'other@huerto.local' }),
        logout: jest.fn()
      },
      dashboardFileAnalysis
    });
    component.selectedUploadFile.set(new File(['hello'], 'orchard-plan.pdf'));

    await component.uploadSelectedFile({ uid: 'other-user', email: 'other@huerto.local' } as never);

    expect(dashboardFileAnalysis.analyzeFile).not.toHaveBeenCalled();
    expect(component.uploadError()).toBe('translated:dashboard.analysis.errors.unauthorized');
  });
});
