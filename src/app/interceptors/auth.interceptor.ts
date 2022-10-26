import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse,
  HTTP_INTERCEPTORS
} from '@angular/common/http';
import { map, Observable, switchMap, take, throwError, withLatestFrom, catchError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

const WHITELIST_HEADER_NAME = "X-Auth-Ignore";

export const ALLOW_ANONYMOUS_HEADER = { [WHITELIST_HEADER_NAME]: "true" };

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(private auth: AuthService, private router: Router) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {

    if (request.headers.get(WHITELIST_HEADER_NAME) !== null) {
      return next.handle(request.clone({
        headers: request.headers.delete(WHITELIST_HEADER_NAME)
      }));
    }

    return this.auth.isAuthenticated$.pipe(
      take(1),
      withLatestFrom(this.auth.token$),
      switchMap(([isAuthenticated, token]) => {

        if (isAuthenticated) {
          console.log("Adding auth token", request.url);
          return next.handle(
            request.clone({
              headers: request.headers.set("Authorization", `Bearer ${token}`)
            })
          ).pipe(
            catchError((err: HttpErrorResponse) => {
              // If the request was not authenticated, attempt to refresh the token and try again.
              if (err.status == 401) {
                return this.auth.refreshSession().pipe(
                  catchError((refreshError: HttpErrorResponse) => {
                    // The refresh token is expired
                    if (refreshError.status == 401)
                      this.auth.logout();
                    return throwError(refreshError);
                  }),
                  withLatestFrom(this.auth.token$),
                  // Try again with new token
                  switchMap(token => next.handle(
                    request.clone({
                      headers: request.headers.set("Authorization", `Bearer ${token}`)
                    }))
                ));
              }
              else
                return throwError(() => err);
            })
          );
        }
        console.log("Not authenticated");

        return throwError(() =>
          new Error("Cannot perform HTTP request to " + request.url + " without first being authenticated."));
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