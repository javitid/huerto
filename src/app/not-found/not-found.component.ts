import { Component } from '@angular/core';
import { I18nService } from '../i18n/i18n.service';

@Component({
  selector: 'app-not-found',
  templateUrl: './not-found.component.html',
  styleUrls: ['./not-found.component.scss'],
  standalone: false
})
export class NotFoundComponent {
  constructor(public i18n: I18nService) {}
}
