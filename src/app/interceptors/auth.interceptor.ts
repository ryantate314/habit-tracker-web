import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse,
  HTTP_INTERCEPTORS
} from '@angular/common/http';
import { map, Observable, switchMap, throwError, withLatestFrom } from 'rxjs';
import { AuthService } from '../services/auth.service';

const WHITELIST_HEADER_NAME = "X-Auth-Ignore";

export const ALLOW_ANONYMOUS_HEADER = { [WHITELIST_HEADER_NAME]: "true" };

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(private auth: AuthService) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {

    if (request.headers.get(WHITELIST_HEADER_NAME) !== null) {
      return next.handle(request.clone({
        headers: request.headers.delete(WHITELIST_HEADER_NAME)
      }));
    }

    return this.auth.isAuthenticated$.pipe(
      withLatestFrom(this.auth.token$),
      switchMap(([isAuthenticated, token]) => {

        if (isAuthenticated) {
          console.log("Adding auth token");
          return next.handle(
            request.clone({
              headers: request.headers.set("Authorization", `Bearer ${token}`)
            })
          );
        }
        console.log("Not authenticated");

        return throwError(() =>
          new Error("Cannot perform HTTP request without first being authenticated."));
      })
    );
  }

  protected ignoreRequest(request: HttpRequest<unknown>): boolean {
    if (request.headers.get(WHITELIST_HEADER_NAME) !== null) {
      request.headers.delete(WHITELIST_HEADER_NAME);
      return true;
    }
    return false;
  }
}

export const AUTH_INTERCEPTOR = {
  provide: HTTP_INTERCEPTORS,
  useClass: AuthInterceptor,
  multi: true
};