import { TaskTypeChartComponent } from './task-type-chart.component';
import { DashboardTaskStatus } from '../../model/dashboard.types';

describe('TaskTypeChartComponent', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-04-23T10:00:00'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  function createComponent(): TaskTypeChartComponent {
    const i18n = {
      translate: jest.fn((key: string) => key),
      currentLanguage: 'es'
    };

    return new TaskTypeChartComponent(i18n as never);
  }

  it('builds daily task counts from April 12 until today using each task creation day', () => {
    const component = createComponent();

    component.tasks = [
      {
        id: '1',
        title: 'Riego 1',
        area: 'Invernadero',
        createdAt: new Date('2026-04-20T08:00:00'),
        status: DashboardTaskStatus.Pending
      },
      {
        id: '2',
        title: 'Riego 2',
        area: 'Invernadero',
        createdAt: new Date('2026-04-20T12:00:00'),
        status: DashboardTaskStatus.InProgress
      },
      {
        id: '3',
        title: 'Poda',
        area: 'Frutales',
        createdAt: new Date('2026-04-21T09:00:00'),
        status: DashboardTaskStatus.Done
      }
    ];

    component.ngOnChanges({
      tasks: {
        currentValue: component.tasks,
        previousValue: [],
        firstChange: true,
        isFirstChange: () => true
      }
    });

    expect(component.chartData[0]).toEqual({
      day: 'Abril 12',
      fullDate: 'Domingo, Abril 12',
      pendingCount: 0,
      inProgressCount: 0,
      doneCount: 0
    });

    expect(component.chartData.find((row) => row.day === 'Abril 20')).toEqual({
      day: 'Abril 20',
      fullDate: 'Lunes, Abril 20',
      pendingCount: 1,
      inProgressCount: 1,
      doneCount: 0
    });

    expect(component.chartData.find((row) => row.day === 'Abril 21')).toEqual({
      day: 'Abril 21',
      fullDate: 'Martes, Abril 21',
      pendingCount: 0,
      inProgressCount: 0,
      doneCount: 1
    });

    expect(component.chartData.at(-1)).toEqual({
      day: 'Abril 23',
      fullDate: 'Jueves, Abril 23',
      pendingCount: 0,
      inProgressCount: 0,
      doneCount: 0
    });

    expect(component.chartData).toHaveLength(12);
  });

  it('returns an empty chart state when no dated tasks exist', () => {
    const component = createComponent();

    component.tasks = [
      {
        id: '1',
        title: 'Sin fecha',
        area: 'General',
        createdAt: null,
        status: DashboardTaskStatus.Pending
      }
    ];

    component.ngOnChanges({
      tasks: {
        currentValue: component.tasks,
        previousValue: [],
        firstChange: true,
        isFirstChange: () => true
      }
    });

    expect(component.chartData).toEqual([]);
  });
});
