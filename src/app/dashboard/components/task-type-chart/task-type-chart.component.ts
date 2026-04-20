import { Component, Input, OnChanges, SimpleChanges, ViewChild } from '@angular/core';
import { CategoryChartType, IgxCategoryChartComponent, ToolTipType } from 'igniteui-angular-charts';
import { IgRect } from 'igniteui-angular-core';
import { DashboardTask, DashboardTaskStatus } from '../../model/dashboard.types';
import { I18nService } from '../../../i18n/i18n.service';

interface TaskTypeChartRow {
  day: string;
  fullDate: string;
  pendingCount: number;
  inProgressCount: number;
  doneCount: number;
  [seriesKey: string]: number | string;
}

@Component({
  selector: 'app-task-type-chart',
  templateUrl: './task-type-chart.component.html',
  styleUrls: ['./task-type-chart.component.scss'],
  standalone: false
})
export class TaskTypeChartComponent implements OnChanges {
  @Input() tasks: DashboardTask[] | null = [];
  @ViewChild(IgxCategoryChartComponent) private chart?: IgxCategoryChartComponent;

  readonly categoryChartType = CategoryChartType;
  readonly toolTipType = ToolTipType;
  readonly chartBrushes = ['#f59e0b', '#38bdf8', '#34d399'];
  readonly chartGridStroke = 'rgba(148, 163, 184, 0.16)';
  readonly chartGridMinorStroke = 'rgba(148, 163, 184, 0.08)';
  readonly defaultWindowRect: IgRect = {
    left: 0,
    top: 0,
    width: 1,
    height: 1
  };

  chartData: TaskTypeChartRow[] = [];

  constructor(public i18n: I18nService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if ('tasks' in changes) {
      this.rebuildChart(this.tasks ?? []);
    }
  }

  get includedProperties(): string[] {
    return ['pendingCount', 'inProgressCount', 'doneCount'];
  }

  get canZoomIn(): boolean {
    return (this.chart?.windowRect?.width ?? 1) > 0.25;
  }

  get canZoomOut(): boolean {
    return (this.chart?.windowRect?.width ?? 1) < 0.999;
  }

  readonly formatXAxisLabel = (item: unknown): string => {
    if (item && typeof item === 'object' && 'day' in item) {
      return String((item as TaskTypeChartRow).day);
    }

    return '';
  }

  zoomIn(): void {
    this.applyZoom(0.7);
  }

  zoomOut(): void {
    this.applyZoom(1 / 0.7);
  }

  getStatusLabel(value: number): string {
    if (Number(value) === 0) {
      return this.i18n.translate('dashboard.firestore.status.pending');
    }

    if (Number(value) === 1) {
      return this.i18n.translate('dashboard.firestore.status.in-progress');
    }

    if (Number(value) === 2) {
      return this.i18n.translate('dashboard.firestore.status.done');
    }

    return '';
  }

  private rebuildChart(tasks: DashboardTask[]): void {
    const validTasks = tasks
      .filter((task) => task.createdAt instanceof Date && !Number.isNaN(task.createdAt.getTime()))
      .sort((left, right) => left.createdAt!.getTime() - right.createdAt!.getTime());

    if (validTasks.length === 0) {
      this.chartData = [];
      this.resetZoom();
      return;
    }

    const rowsByDay = new Map<string, TaskTypeChartRow>();
    const currentDate = this.startOfDay(new Date());
    const chartStartDate = this.getChartStartDate(currentDate);

    for (const date of this.getDateRange(chartStartDate, currentDate)) {
      const dayKey = this.toDayKey(date);
      rowsByDay.set(dayKey, this.createRow(date));
    }

    for (const task of validTasks) {
      const createdAt = task.createdAt!;
      const dayKey = this.toDayKey(createdAt);
      const row = rowsByDay.get(dayKey);

      if (!row) {
        continue;
      }

      if (task.status === DashboardTaskStatus.Pending) {
        row.pendingCount += 1;
      }

      if (task.status === DashboardTaskStatus.InProgress) {
        row.inProgressCount += 1;
      }

      if (task.status === DashboardTaskStatus.Done) {
        row.doneCount += 1;
      }

      rowsByDay.set(dayKey, row);
    }

    this.chartData = Array.from(rowsByDay.entries())
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([, row]) => row);
  }

  private getChartStartDate(currentDate: Date): Date {
    return new Date(currentDate.getFullYear(), 3, 12);
  }

  private applyZoom(factor: number): void {
    if (!this.chart) {
      return;
    }

    const currentRect = this.chart.windowRect ?? this.defaultWindowRect;
    const nextWidth = this.clamp(currentRect.width * factor, 0.2, 1);
    const nextLeft = this.clamp(currentRect.left + ((currentRect.width - nextWidth) / 2), 0, 1 - nextWidth);

    this.chart.windowRect = {
      left: nextLeft,
      top: currentRect.top,
      width: nextWidth,
      height: currentRect.height
    };
  }

  private resetZoom(): void {
    if (!this.chart) {
      return;
    }

    this.chart.windowRect = this.defaultWindowRect;
  }

  private clamp(value: number, min: number, max: number): number {
    return Math.min(Math.max(value, min), max);
  }

  private createRow(value: Date): TaskTypeChartRow {
    return {
      day: this.formatDay(value),
      fullDate: this.formatFullDate(value),
      pendingCount: 0,
      inProgressCount: 0,
      doneCount: 0
    };
  }

  private getDateRange(start: Date, end: Date): Date[] {
    const dates: Date[] = [];
    const current = new Date(start);

    while (current.getTime() <= end.getTime()) {
      dates.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }

    return dates;
  }

  private startOfDay(value: Date): Date {
    return new Date(value.getFullYear(), value.getMonth(), value.getDate());
  }

  private toDayKey(value: Date): string {
    const year = value.getFullYear();
    const month = `${value.getMonth() + 1}`.padStart(2, '0');
    const day = `${value.getDate()}`.padStart(2, '0');

    return `${year}-${month}-${day}`;
  }

  private formatDay(value: Date): string {
    const parts = new Intl.DateTimeFormat(this.i18n.currentLanguage, {
      day: 'numeric',
      month: 'long'
    }).formatToParts(value);
    const month = parts.find((part) => part.type === 'month')?.value ?? '';
    const day = parts.find((part) => part.type === 'day')?.value ?? '';

    return `${this.capitalize(month)} ${day}`;
  }

  private formatFullDate(value: Date): string {
    const weekday = new Intl.DateTimeFormat(this.i18n.currentLanguage, {
      weekday: 'long'
    }).format(value);

    return `${this.capitalize(weekday)}, ${this.formatDay(value)}`;
  }

  private capitalize(value: string): string {
    if (!value) {
      return value;
    }

    return value.charAt(0).toUpperCase() + value.slice(1);
  }
}
