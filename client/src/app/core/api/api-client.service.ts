import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ApiClient {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl;

  get<Response>(path: string): Observable<Response> {
    return this.http.get<Response>(this.url(path));
  }

  post<Response, Body extends object>(path: string, body: Body): Observable<Response> {
    return this.http.post<Response>(this.url(path), body);
  }

  put<Response, Body extends object>(path: string, body: Body): Observable<Response> {
    return this.http.put<Response>(this.url(path), body);
  }

  delete<Response>(path: string): Observable<Response> {
    return this.http.delete<Response>(this.url(path));
  }

  private url(path: string): string {
    return `${this.baseUrl}/${path.replace(/^\//, '')}`;
  }
}
