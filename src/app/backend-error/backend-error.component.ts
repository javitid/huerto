import { Component } from '@angular/core';
import { BackendErrorStateService } from './backend-error-state.service';
import { I18nService } from '../i18n/i18n.service';

@Component({
  selector: 'app-backend-error',
  templateUrl: './backend-error.component.html',
  styleUrls: ['./backend-error.component.scss'],
  standalone: false
})
export class BackendErrorComponent {
  constructor(
    private readonly backendErrorState: BackendErrorStateService,
    public i18n: I18nService
  ) {}

  get status(): number | null {
    return this.backendErrorState.getError().status;
  }

  get message(): string {
    return this.backendErrorState.getError().message ?? this.i18n.translate('errors.backend.defaultMessage');
  }
}
