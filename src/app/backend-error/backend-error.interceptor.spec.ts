import { HttpErrorResponse, HttpHandler, HttpRequest } from '@angular/common/http';
import { throwError } from 'rxjs';
import { BackendErrorInterceptor } from './backend-error.interceptor';

describe('BackendErrorInterceptor', () => {
  it('stores the backend error and redirects to the error screen', (done) => {
    const router = {
      url: '/dashboard',
      navigate: jest.fn().mockResolvedValue(true)
    };
    const backendErrorState = {
      setError: jest.fn()
    };
    const interceptor = new BackendErrorInterceptor(router as never, backendErrorState as never);
    const request = new HttpRequest('GET', '/api/crops');
    const response = new HttpErrorResponse({
      status: 503,
      statusText: 'Service Unavailable',
      error: { message: 'Backend down' }
    });
    const next: HttpHandler = {
      handle: jest.fn().mockReturnValue(throwError(() => response))
    };

    interceptor.intercept(request, next).subscribe({
      error: (error) => {
        expect(error).toBe(response);
        expect(backendErrorState.setError).toHaveBeenCalledWith({
          status: 503,
          message: 'Backend down'
        });
        expect(router.navigate).toHaveBeenCalledWith(['/server-error']);
        done();
      }
    });
  });

  it('does not navigate again when already on the server error route', (done) => {
    const router = {
      url: '/server-error',
      navigate: jest.fn()
    };
    const backendErrorState = {
      setError: jest.fn()
    };
    const interceptor = new BackendErrorInterceptor(router as never, backendErrorState as never);
    const request = new HttpRequest('GET', '/api/crops');
    const response = new HttpErrorResponse({
      status: 500,
      statusText: 'Server Error'
    });
    const next: HttpHandler = {
      handle: jest.fn().mockReturnValue(throwError(() => response))
    };

    interceptor.intercept(request, next).subscribe({
      error: () => {
        expect(router.navigate).not.toHaveBeenCalled();
        done();
      }
    });
  });
});
