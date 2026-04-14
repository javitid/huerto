import { firstValueFrom } from 'rxjs';
import { DashboardFirestoreService } from './dashboard-firestore.service';
import { DashboardTaskStatus } from '../model/dashboard.types';

const mockGetFirestore = jest.fn();
const mockAddDoc = jest.fn();
const mockCollection = jest.fn();
const mockDoc = jest.fn();
const mockOrderBy = jest.fn();
const mockQuery = jest.fn();
const mockOnSnapshot = jest.fn();
const mockUpdateDoc = jest.fn();
const mockGetApps = jest.fn();
const mockGetApp = jest.fn();
const mockInitializeApp = jest.fn();
const mockTimestampToDate = jest.fn();

jest.mock('firebase/app', () => ({
  getApps: (...args: unknown[]) => mockGetApps(...args),
  getApp: (...args: unknown[]) => mockGetApp(...args),
  initializeApp: (...args: unknown[]) => mockInitializeApp(...args)
}));

jest.mock('firebase/firestore', () => ({
  addDoc: (...args: unknown[]) => mockAddDoc(...args),
  getFirestore: (...args: unknown[]) => mockGetFirestore(...args),
  collection: (...args: unknown[]) => mockCollection(...args),
  doc: (...args: unknown[]) => mockDoc(...args),
  orderBy: (...args: unknown[]) => mockOrderBy(...args),
  query: (...args: unknown[]) => mockQuery(...args),
  onSnapshot: (...args: unknown[]) => mockOnSnapshot(...args),
  updateDoc: (...args: unknown[]) => mockUpdateDoc(...args),
  Timestamp: {
    prototype: {
      toDate: (...args: unknown[]) => mockTimestampToDate(...args)
    }
  }
}));

describe('DashboardFirestoreService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetApps.mockReturnValue([]);
    mockInitializeApp.mockReturnValue({ name: 'firebase-app' });
    mockGetFirestore.mockReturnValue({ name: 'firestore' });
    mockCollection.mockReturnValue({ name: 'tasks-collection' });
    mockDoc.mockReturnValue({ name: 'task-doc' });
    mockOrderBy.mockReturnValue({ name: 'createdAt-desc' });
    mockQuery.mockReturnValue({ name: 'tasks-query' });
    mockTimestampToDate.mockReturnValue(new Date('2026-04-15T00:05:00.000Z'));
  });

  it('creates a firestore task for the current user', async () => {
    mockAddDoc.mockResolvedValue(undefined);
    const service = new DashboardFirestoreService();

    await service.createTask('user-123', {
      title: ' Review irrigation ',
      area: ' Greenhouse ',
      status: DashboardTaskStatus.Pending
    });

    expect(mockCollection).toHaveBeenCalledWith({ name: 'firestore' }, 'users', 'user-123', 'tasks');
    expect(mockAddDoc).toHaveBeenCalledWith({ name: 'tasks-collection' }, {
      title: 'Review irrigation',
      area: 'Greenhouse',
      status: DashboardTaskStatus.Pending,
      createdAt: expect.any(Date)
    });
  });

  it('returns an empty list when no user id is available', async () => {
    const service = new DashboardFirestoreService();

    await expect(firstValueFrom(service.watchTasks(null))).resolves.toEqual([]);
    expect(mockOnSnapshot).not.toHaveBeenCalled();
  });

  it('updates the status of an existing firestore task', async () => {
    mockUpdateDoc.mockResolvedValue(undefined);
    const service = new DashboardFirestoreService();

    await service.updateTaskStatus('user-123', 'task-1', DashboardTaskStatus.Done);

    expect(mockDoc).toHaveBeenCalledWith({ name: 'firestore' }, 'users', 'user-123', 'tasks', 'task-1');
    expect(mockUpdateDoc).toHaveBeenCalledWith({ name: 'task-doc' }, {
      status: DashboardTaskStatus.Done
    });
  });

  it('updates the editable fields of an existing task', async () => {
    mockUpdateDoc.mockResolvedValue(undefined);
    const service = new DashboardFirestoreService();

    await service.updateTask('user-123', 'task-1', {
      title: ' Updated title ',
      area: ' Updated area '
    });

    expect(mockUpdateDoc).toHaveBeenCalledWith({ name: 'task-doc' }, {
      title: 'Updated title',
      area: 'Updated area'
    });
  });

  it('marks a task as deleted', async () => {
    mockUpdateDoc.mockResolvedValue(undefined);
    const service = new DashboardFirestoreService();

    await service.deleteTask('user-123', 'task-1');

    expect(mockUpdateDoc).toHaveBeenCalledWith({ name: 'task-doc' }, {
      deletedAt: expect.any(Date)
    });
  });

  it('maps firestore task documents into dashboard tasks', async () => {
    mockOnSnapshot.mockImplementation((_query, next) => {
      next({
        docs: [
          {
            id: 'task-1',
            data: () => ({
              title: 'Check irrigation pump',
              area: 'North greenhouse',
              createdAt: { toDate: mockTimestampToDate },
              status: DashboardTaskStatus.InProgress
            })
          },
          {
            id: 'task-2',
            data: () => ({
              title: 'Harvest lettuce',
              area: 'Plot 3'
            })
          },
          {
            id: 'task-3',
            data: () => ({
              title: 'Deleted task',
              area: 'Old plot',
              deletedAt: new Date('2026-04-15T00:05:00.000Z')
            })
          }
        ]
      });

      return jest.fn();
    });

    const service = new DashboardFirestoreService();

    await expect(firstValueFrom(service.watchTasks('user-123'))).resolves.toEqual([
      {
        id: 'task-1',
        title: 'Check irrigation pump',
        area: 'North greenhouse',
        createdAt: new Date('2026-04-15T00:05:00.000Z'),
        status: DashboardTaskStatus.InProgress
      },
      {
        id: 'task-2',
        title: 'Harvest lettuce',
        area: 'Plot 3',
        createdAt: null,
        status: DashboardTaskStatus.Pending
      }
    ]);
    expect(mockCollection).toHaveBeenCalledWith({ name: 'firestore' }, 'users', 'user-123', 'tasks');
  });
});
