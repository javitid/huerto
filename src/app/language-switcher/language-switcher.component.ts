import { ChangeDetectionStrategy, Component } from '@angular/core';
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
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LanguageSwitcherComponent {
  readonly languageOptions: LanguageOption[] = [
    { code: 'es', shortCode: 'ES', flag: '🇪🇸' },
    { code: 'en', shortCode: 'EN', flag: '🇺🇸' },
  ];

  constructor(public i18n: I18nService) {}

  setLanguage(language: Language): void {
    this.i18n.setLanguage(language);
  }
}
