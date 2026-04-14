import { BackendErrorComponent } from './backend-error.component';

describe('BackendErrorComponent', () => {
  it('exposes the saved backend status', () => {
    const backendErrorState = {
      getError: jest.fn().mockReturnValue({ status: 503, message: 'API unavailable' })
    };
    const i18n = {
      translate: jest.fn()
    };

    const component = new BackendErrorComponent(backendErrorState as never, i18n as never);

    expect(component.status).toBe(503);
    expect(component.message).toBe('API unavailable');
  });

  it('falls back to the translated default message when no message is available', () => {
    const backendErrorState = {
      getError: jest.fn().mockReturnValue({ status: null, message: null })
    };
    const i18n = {
      translate: jest.fn().mockReturnValue('translated default')
    };

    const component = new BackendErrorComponent(backendErrorState as never, i18n as never);

    expect(component.message).toBe('translated default');
    expect(i18n.translate).toHaveBeenCalledWith('errors.backend.defaultMessage');
  });
});
