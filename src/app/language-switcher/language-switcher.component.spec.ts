import { BehaviorSubject } from 'rxjs';
import { LanguageSwitcherComponent } from './language-switcher.component';

describe('LanguageSwitcherComponent', () => {
  it('initializes the selected language from the i18n service', () => {
    const i18n = {
      currentLanguage: 'en',
      language$: new BehaviorSubject<'es' | 'en'>('en'),
      setLanguage: jest.fn(),
    };

    const component = new LanguageSwitcherComponent(i18n as never);

    expect(component.selectedLanguage).toBe('en');
    expect(component.languageOptions).toEqual([
      { code: 'es', shortCode: 'ES', flag: '🇪🇸' },
      { code: 'en', shortCode: 'EN', flag: '🇺🇸' },
    ]);
  });

  it('updates the selected language when the observable emits', () => {
    const language$ = new BehaviorSubject<'es' | 'en'>('es');
    const i18n = {
      currentLanguage: 'es',
      language$,
      setLanguage: jest.fn(),
    };

    const component = new LanguageSwitcherComponent(i18n as never);
    language$.next('en');

    expect(component.selectedLanguage).toBe('en');
  });

  it('delegates language changes to the i18n service', () => {
    const i18n = {
      currentLanguage: 'es',
      language$: new BehaviorSubject<'es' | 'en'>('es'),
      setLanguage: jest.fn(),
    };

    const component = new LanguageSwitcherComponent(i18n as never);
    component.setLanguage('en');

    expect(i18n.setLanguage).toHaveBeenCalledWith('en');
  });
});
