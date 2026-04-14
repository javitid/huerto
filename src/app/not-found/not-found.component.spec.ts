import { NotFoundComponent } from './not-found.component';

describe('NotFoundComponent', () => {
  it('creates successfully', () => {
    const i18n = {
      translate: jest.fn()
    };

    const component = new NotFoundComponent(i18n as never);

    expect(component).toBeTruthy();
  });
});
