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
            this.addAuthorizationToken(request, token)
          ).pipe(
            catchError((err: any) => {
              // If the request was not authenticated, attempt to refresh the token and try again.
              if (err instanceof HttpErrorResponse && err.status === 401) {
                return this.handle401Error(request, next);
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

  protected handle401Error(request: HttpRequest<any>, next: HttpHandler) {
    console.log("Refreshing token");
    return this.auth.refreshSession().pipe(
      catchError((refreshError: HttpErrorResponse) => {
        console.log("Refresh token is expired");
        // The refresh token is expired
        // if (refreshError.status == 401)
        //   this.auth.logout();
        return throwError(() => refreshError);
      }),
      withLatestFrom(this.auth.token$),
      // Try again with new token
      switchMap(([_, token]) => next.handle(
        this.addAuthorizationToken(request, token)
      ))
    );
  }

  protected ignoreRequest(request: HttpRequest<any>): boolean {
    if (request.headers.get(WHITELIST_HEADER_NAME) !== null) {
      request.headers.delete(WHITELIST_HEADER_NAME);
      return true;
    }
    return false;
  }

  protected addAuthorizationToken<T>(request: HttpRequest<T>, token: string): HttpRequest<T> {
    return request.clone({
      headers: request.headers.set("Authorization", `Bearer ${token}`)
    });
  }
}

export const AUTH_INTERCEPTOR = {
  provide: HTTP_INTERCEPTORS,
  useClass: AuthInterceptor,
  multi: true
};