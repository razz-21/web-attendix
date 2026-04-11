import { HttpErrorResponse } from "@angular/common/http";

export function getHttpErrorMessage(error: HttpErrorResponse): string {
  const body = error.error;
  if (typeof body === "object" && body !== null) {
    const e = body as { error?: unknown; message?: unknown };
    if (typeof e.error === "string") return e.error;
    if (typeof e.message === "string") return e.message;
  }
  if (typeof body === "string") return body;
  return error.message || "Request failed";
}