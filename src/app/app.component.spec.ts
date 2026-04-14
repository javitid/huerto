import { BehaviorSubject } from 'rxjs';
import { AppComponent } from './app.component';

describe('AppComponent', () => {
  it('creates the app and sets the document language from i18n', () => {
    const language$ = new BehaviorSubject<'es' | 'en'>('es');
    const i18n = { language$ };

    const component = new AppComponent(i18n as never);

    expect(component).toBeTruthy();
    expect(component.title).toBe('Huerto');
    expect(document.documentElement.lang).toBe('es');

    language$.next('en');

    expect(document.documentElement.lang).toBe('en');

    component.ngOnDestroy();
  });
});
