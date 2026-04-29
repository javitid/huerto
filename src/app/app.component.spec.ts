import { AppComponent } from './app.component';

describe('AppComponent', () => {
  it('creates the app', () => {
    const component = new AppComponent();

    expect(component).toBeTruthy();
    expect(component.title).toBe('Huerto');
  });
});
