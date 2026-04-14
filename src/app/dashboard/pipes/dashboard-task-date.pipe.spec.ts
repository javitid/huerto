import { DashboardTaskDatePipe } from './dashboard-task-date.pipe';

describe('DashboardTaskDatePipe', () => {
  it('formats dates in Spanish using day, month, year, and time', () => {
    const i18n = {
      currentLanguage: 'es',
      translate: jest.fn()
    };
    const pipe = new DashboardTaskDatePipe(i18n as never);

    expect(pipe.transform(new Date('2026-04-15T00:05:00'))).toBe('15 de Abril de 2026 - 00:05');
  });

  it('falls back when there is no valid date', () => {
    const i18n = {
      currentLanguage: 'es',
      translate: jest.fn().mockReturnValue('Fecha pendiente')
    };
    const pipe = new DashboardTaskDatePipe(i18n as never);

    expect(pipe.transform(null)).toBe('Fecha pendiente');
  });
});
