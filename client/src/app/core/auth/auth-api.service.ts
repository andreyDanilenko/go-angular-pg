import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiClient } from '../api/api-client.service';

export type RequestCodeInput = {
  email: string;
  password: string;
};

export type ConfirmCodeInput = {
  email: string;
  code: string;
};

type MessageResponse = {
  message: string;
};

type ConfirmCodeResponse = {
  token: string;
};

@Injectable({ providedIn: 'root' })
export class AuthApi {
  private readonly api = inject(ApiClient);

  requestCode(input: RequestCodeInput): Observable<MessageResponse> {
    return this.api.post<MessageResponse, RequestCodeInput>('auth', input);
  }

  confirmCode(input: ConfirmCodeInput): Observable<ConfirmCodeResponse> {
    return this.api.post<ConfirmCodeResponse, ConfirmCodeInput>('confirm', input);
  }
}
