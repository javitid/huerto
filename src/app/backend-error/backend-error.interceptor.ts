import { Injectable } from '@angular/core';
import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest
} from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { BackendErrorStateService } from './backend-error-state.service';

@Injectable()
export class BackendErrorInterceptor implements HttpInterceptor {
  constructor(
    private readonly router: Router,
    private readonly backendErrorState: BackendErrorStateService
  ) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    return next.handle(request).pipe(
      catchError((error: unknown) => {
        if (error instanceof HttpErrorResponse) {
          this.backendErrorState.setError({
            status: error.status || null,
            message: this.resolveMessage(error)
          });

          if (this.router.url !== '/server-error') {
            void this.router.navigate(['/server-error']);
          }
        }

        return throwError(() => error);
      })
    );
  }

  private resolveMessage(error: HttpErrorResponse): string | null {
    if (typeof error.error === 'string' && error.error.trim().length > 0) {
      return error.error;
    }

    if (error.error && typeof error.error.message === 'string' && error.error.message.trim().length > 0) {
      return error.error.message;
    }

    return error.message || null;
  }
}
