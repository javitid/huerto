import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BaseChartDirective } from 'ng2-charts';
import { SelectModule } from 'primeng/select';
import { DashboardComponent } from './page/dashboard.component';
import { DashboardRoutingModule } from './dashboard-routing.module';
import { TranslatePipe } from '../i18n/translate.pipe';
import { DashboardTaskDatePipe } from './pipes/dashboard-task-date.pipe';
import { TaskTypeChartComponent } from './components/task-type-chart/task-type-chart.component';

@NgModule({
  declarations: [DashboardComponent, TaskTypeChartComponent],
  imports: [
    CommonModule,
    FormsModule,
    BaseChartDirective,
    SelectModule,
    TranslatePipe,
    DashboardTaskDatePipe,
    DashboardRoutingModule
  ]
})
export class DashboardModule {}
