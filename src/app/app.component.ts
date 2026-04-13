import { Component, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { I18nService } from './i18n/i18n.service';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
    standalone: false
})
export class AppComponent implements OnDestroy {
  title = 'Huerto';

  private readonly languageSubscription: Subscription;

  constructor(public i18n: I18nService) {
    this.languageSubscription = this.i18n.language$.subscribe((language) => {
      document.documentElement.lang = language;
    });
  }

  ngOnDestroy(): void {
    this.languageSubscription.unsubscribe();
  }
}
