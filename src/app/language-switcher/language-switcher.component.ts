import { Component, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { I18nService, Language } from '../i18n/i18n.service';

type LanguageOption = {
  code: Language;
  shortCode: 'ES' | 'EN';
  flag: '🇪🇸' | '🇺🇸';
};

@Component({
  selector: 'app-language-switcher',
  templateUrl: './language-switcher.component.html',
  styleUrls: ['./language-switcher.component.scss'],
  standalone: false
})
export class LanguageSwitcherComponent implements OnDestroy {
  readonly languageOptions: LanguageOption[] = [
    { code: 'es', shortCode: 'ES', flag: '🇪🇸' },
    { code: 'en', shortCode: 'EN', flag: '🇺🇸' },
  ];

  selectedLanguage: Language;
  private readonly languageSubscription: Subscription;

  constructor(private i18n: I18nService) {
    this.selectedLanguage = this.i18n.currentLanguage;
    this.languageSubscription = this.i18n.language$.subscribe((language) => {
      this.selectedLanguage = language;
    });
  }

  setLanguage(language: Language): void {
    this.i18n.setLanguage(language);
  }

  ngOnDestroy(): void {
    this.languageSubscription.unsubscribe();
  }
}
