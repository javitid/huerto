import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import en from '../../assets/i18n/en.json';
import es from '../../assets/i18n/es.json';

export type Language = 'es' | 'en';

type TranslationTree = {
  [key: string]: string | TranslationTree;
};

const STORAGE_KEY = 'huerto.language';

const translations: Record<Language, TranslationTree> = {
  es,
  en,
};

@Injectable({
  providedIn: 'root'
})
export class I18nService {
  private readonly languageSubject = new BehaviorSubject<Language>(this.getInitialLanguage());

  readonly language$ = this.languageSubject.asObservable();

  get currentLanguage(): Language {
    return this.languageSubject.value;
  }

  setLanguage(language: Language): void {
    localStorage.setItem(STORAGE_KEY, language);
    this.languageSubject.next(language);
  }

  translate(key: string): string {
    const languageTable = translations[this.currentLanguage];
    const fallbackTable = translations.es;
    return this.readValue(languageTable, key) ?? this.readValue(fallbackTable, key) ?? key;
  }

  private getInitialLanguage(): Language {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'es' || saved === 'en') {
      return saved;
    }

    return 'es';
  }

  private readValue(table: TranslationTree, key: string): string | null {
    const parts = key.split('.');
    let current: string | TranslationTree | undefined = table;

    for (const part of parts) {
      if (!current || typeof current === 'string') {
        return null;
      }

      current = current[part];
    }

    return typeof current === 'string' ? current : null;
  }
}
