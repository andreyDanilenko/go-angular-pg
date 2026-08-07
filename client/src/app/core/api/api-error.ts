import { HttpErrorResponse } from '@angular/common/http';

type ApiErrorBody = {
  message?: string;
};

export function getApiErrorMessage(
  error: unknown,
  fallback: string,
): string {
  if (!(error instanceof HttpErrorResponse)) {
    return fallback;
  }

  const body = error.error as ApiErrorBody | null;
  return body?.message?.trim() || fallback;
}
