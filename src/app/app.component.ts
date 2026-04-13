import { Component, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { I18nService, Language } from './i18n/i18n.service';

type LanguageOption = {
  code: Language;
  shortCode: 'ES' | 'EN';
  flag: '🇪🇸' | '🇺🇸';
};

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
    standalone: false
})
export class AppComponent implements OnDestroy {
  title = 'Huerto';

  readonly languageOptions: LanguageOption[] = [
    { code: 'es', shortCode: 'ES', flag: '🇪🇸' },
    { code: 'en', shortCode: 'EN', flag: '🇺🇸' },
  ];
  private readonly languageSubscription: Subscription;
  selectedLanguage: Language;

  constructor(public i18n: I18nService) {
    this.selectedLanguage = this.i18n.currentLanguage;
    this.languageSubscription = this.i18n.language$.subscribe((language) => {
      this.selectedLanguage = language;
      document.documentElement.lang = language;
    });
  }

  setLanguage(language: Language): void {
    this.i18n.setLanguage(language);
  }

  ngOnDestroy(): void {
    this.languageSubscription.unsubscribe();
  }
}
