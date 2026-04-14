import { Injectable } from '@angular/core';

export type BackendErrorState = {
  status: number | null;
  message: string | null;
};

@Injectable({
  providedIn: 'root'
})
export class BackendErrorStateService {
  private state: BackendErrorState = {
    status: null,
    message: null
  };

  setError(state: BackendErrorState): void {
    this.state = state;
  }

  getError(): BackendErrorState {
    return this.state;
  }

  clear(): void {
    this.state = {
      status: null,
      message: null
    };
  }
}
