import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { ChartData, ChartDataset, ChartOptions, TooltipItem } from 'chart.js';
import { DashboardTask, DashboardTaskStatus } from '../../model/dashboard.types';
import { I18nService } from '../../../i18n/i18n.service';
import { createTaskTypeChartOptions } from './task-type-chart.config';

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

  readonly chartBrushes = ['#f59e0b', '#38bdf8', '#34d399'];
  readonly chartGridStroke = 'rgba(148, 163, 184, 0.16)';
  readonly lineChartType = 'line' as const;
  readonly minVisiblePoints = 3;
  readonly chartOptions: ChartOptions<'line'>;

  chartData: TaskTypeChartRow[] = [];
  visibleChartData: TaskTypeChartRow[] = [];
  lineChartData: ChartData<'line'> = {
    labels: [],
    datasets: []
  };
  visibleStartIndex = 0;
  visiblePointCount = 0;

  constructor(public i18n: I18nService) {
    this.chartOptions = createTaskTypeChartOptions({
      chartBrushes: this.chartBrushes,
      chartGridStroke: this.chartGridStroke,
      getChartTitle: () => this.i18n.translate('dashboard.chart.chartTitle'),
      getSubtitle: () => this.i18n.translate('dashboard.chart.subtitle'),
      getXAxisTitle: () => this.i18n.translate('dashboard.chart.xAxisTitle'),
      getYAxisTitle: () => this.i18n.translate('dashboard.chart.yAxisTitle'),
      getTooltipTitle: (items) => this.getTooltipTitle(items),
      getTooltipLabel: (item) => this.getTooltipLabel(item)
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if ('tasks' in changes) {
      this.rebuildChart(this.tasks ?? []);
    }
  }

  get canZoomIn(): boolean {
    return this.visibleChartData.length > this.minVisiblePoints;
  }

  get canZoomOut(): boolean {
    return this.visibleChartData.length < this.chartData.length;
  }

  zoomIn(): void {
    this.applyZoom(0.7);
  }

  zoomOut(): void {
    this.applyZoom(1 / 0.7);
  }

  getStatusLabel(value: DashboardTaskStatus | number): string {
    if (value === DashboardTaskStatus.Pending || Number(value) === 0) {
      return this.i18n.translate('dashboard.firestore.status.pending');
    }

    if (value === DashboardTaskStatus.InProgress || Number(value) === 1) {
      return this.i18n.translate('dashboard.firestore.status.in-progress');
    }

    if (value === DashboardTaskStatus.Done || Number(value) === 2) {
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
      this.resetVisibleRange();
      this.syncVisibleChart();
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

    this.resetVisibleRange();
    this.syncVisibleChart();
  }

  private getChartStartDate(currentDate: Date): Date {
    return new Date(currentDate.getFullYear(), 3, 12);
  }

  private applyZoom(factor: number): void {
    if (this.chartData.length === 0) {
      return;
    }

    const currentCount = this.visibleChartData.length || this.chartData.length;
    const nextCount = this.clamp(Math.round(currentCount * factor), this.minVisiblePoints, this.chartData.length);
    const currentCenter = this.visibleStartIndex + (currentCount / 2);
    const nextStart = this.clamp(
      Math.round(currentCenter - (nextCount / 2)),
      0,
      Math.max(this.chartData.length - nextCount, 0)
    );

    this.visibleStartIndex = nextStart;
    this.visiblePointCount = nextCount;
    this.syncVisibleChart();
  }

  private clamp(value: number, min: number, max: number): number {
    return Math.min(Math.max(value, min), max);
  }

  private resetVisibleRange(): void {
    this.visibleStartIndex = 0;
    this.visiblePointCount = this.chartData.length;
  }

  private syncVisibleChart(): void {
    this.visibleChartData = this.chartData.slice(
      this.visibleStartIndex,
      this.visibleStartIndex + this.visiblePointCount
    );

    this.lineChartData = {
      labels: this.visibleChartData.map((row) => row.day),
      datasets: this.buildDatasets()
    };
  }

  private buildDatasets(): ChartDataset<'line', number[]>[] {
    return [
      {
        label: this.getStatusLabel(DashboardTaskStatus.Pending),
        data: this.visibleChartData.map((row) => row.pendingCount),
        borderColor: this.chartBrushes[0],
        backgroundColor: this.chartBrushes[0]
      },
      {
        label: this.getStatusLabel(DashboardTaskStatus.InProgress),
        data: this.visibleChartData.map((row) => row.inProgressCount),
        borderColor: this.chartBrushes[1],
        backgroundColor: this.chartBrushes[1]
      },
      {
        label: this.getStatusLabel(DashboardTaskStatus.Done),
        data: this.visibleChartData.map((row) => row.doneCount),
        borderColor: this.chartBrushes[2],
        backgroundColor: this.chartBrushes[2]
      }
    ];
  }

  private getTooltipTitle(items: TooltipItem<'line'>[]): string {
    if (items.length === 0) {
      return '';
    }

    return this.visibleChartData[items[0].dataIndex]?.fullDate ?? '';
  }

  private getTooltipLabel(item: TooltipItem<'line'>): string {
    return `${item.dataset.label}: ${item.formattedValue}`;
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
