import { BehaviorSubject } from 'rxjs';
import { LanguageSwitcherComponent } from './language-switcher.component';

describe('LanguageSwitcherComponent', () => {
  it('exposes the available language options', () => {
    const i18n = {
      language$: new BehaviorSubject<'es' | 'en'>('en'),
      setLanguage: jest.fn(),
    };

    const component = new LanguageSwitcherComponent(i18n as never);

    expect(component.languageOptions).toEqual([
      { code: 'es', shortCode: 'ES', flag: '🇪🇸' },
      { code: 'en', shortCode: 'EN', flag: '🇺🇸' },
    ]);
  });

  it('delegates language changes to the i18n service', () => {
    const i18n = {
      language$: new BehaviorSubject<'es' | 'en'>('es'),
      setLanguage: jest.fn(),
    };

    const component = new LanguageSwitcherComponent(i18n as never);
    component.setLanguage('en');

    expect(i18n.setLanguage).toHaveBeenCalledWith('en');
  });
});
