import { Pipe, PipeTransform } from '@angular/core';
import { I18nService } from '../../i18n/i18n.service';

@Pipe({
  name: 'dashboardTaskDate',
  standalone: true,
  pure: false
})
export class DashboardTaskDatePipe implements PipeTransform {
  constructor(private readonly i18n: I18nService) {}

  transform(value: Date | null): string {
    if (!(value instanceof Date) || Number.isNaN(value.getTime())) {
      return this.i18n.translate('dashboard.firestore.noDate');
    }

    return this.i18n.currentLanguage === 'en'
      ? this.formatEnglish(value)
      : this.formatSpanish(value);
  }

  private formatSpanish(value: Date): string {
    const formatter = new Intl.DateTimeFormat('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23'
    });

    const parts = formatter.formatToParts(value);
    const day = parts.find((part) => part.type === 'day')?.value ?? '';
    const month = this.capitalize(parts.find((part) => part.type === 'month')?.value ?? '');
    const year = parts.find((part) => part.type === 'year')?.value ?? '';
    const hour = parts.find((part) => part.type === 'hour')?.value ?? '';
    const minute = parts.find((part) => part.type === 'minute')?.value ?? '';

    return `${day} de ${month} de ${year} - ${hour}:${minute}`;
  }

  private formatEnglish(value: Date): string {
    const date = new Intl.DateTimeFormat('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    }).format(value);
    const time = new Intl.DateTimeFormat('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23'
    }).format(value);

    return `${date} - ${time}`;
  }

  private capitalize(value: string): string {
    if (!value) {
      return value;
    }

    return value.charAt(0).toUpperCase() + value.slice(1);
  }
}
