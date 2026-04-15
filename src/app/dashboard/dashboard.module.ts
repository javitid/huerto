import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SelectModule } from 'primeng/select';
import { DashboardComponent } from './page/dashboard.component';
import { DashboardRoutingModule } from './dashboard-routing.module';
import { TranslatePipe } from '../i18n/translate.pipe';
import { DashboardTaskDatePipe } from './pipes/dashboard-task-date.pipe';

@NgModule({
  declarations: [DashboardComponent],
  imports: [
    CommonModule,
    FormsModule,
    SelectModule,
    TranslatePipe,
    DashboardTaskDatePipe,
    DashboardRoutingModule
  ]
})
export class DashboardModule {}
