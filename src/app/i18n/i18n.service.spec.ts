import { I18nService } from './i18n.service';

describe('I18nService', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('defaults to spanish when there is no saved language', () => {
    const service = new I18nService();

    expect(service.currentLanguage).toBe('es');
    expect(service.translate('login.googleCta')).toBe('Entrar con Google');
    expect(document.documentElement.lang).toBe('es');
  });

  it('persists the selected language and uses its translations', () => {
    const service = new I18nService();

    service.setLanguage('en');

    expect(localStorage.getItem('huerto.language')).toBe('en');
    expect(service.currentLanguage).toBe('en');
    expect(service.translate('login.googleCta')).toBe('Continue with Google');
    expect(document.documentElement.lang).toBe('en');
  });

  it('falls back to the key when the translation does not exist', () => {
    const service = new I18nService();

    expect(service.translate('missing.key')).toBe('missing.key');
  });

  it('restores a saved language from localStorage', () => {
    localStorage.setItem('huerto.language', 'en');

    const service = new I18nService();

    expect(service.currentLanguage).toBe('en');
    expect(service.translate('dashboard.logout')).toBe('Sign out');
  });
});
