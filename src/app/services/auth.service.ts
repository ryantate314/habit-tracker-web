import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router, UrlSerializer } from '@angular/router';
import { BehaviorSubject, catchError, map, Observable, of, ReplaySubject, Subject, tap, throwError } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ALLOW_ANONYMOUS_HEADER } from '../interceptors/auth.interceptor';
import { User } from '../models/user.model';

interface TokenPayload {
  userId: string;
  exp: Date
}

interface Session {
  user: User;
  token: string;
  expiresIn: number;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private _isAuthenticated$ = new ReplaySubject<boolean>(1);

  public get isAuthenticated$(): Observable<boolean> {
    return this._isAuthenticated$;
  }

  private _user$ = new ReplaySubject<User | null>(1);

  private _token$ = new ReplaySubject<string>(1);

  public get token$(): Observable<string> {
    return this._token$;
  }

  constructor(private http: HttpClient, private router: Router) {
  }

  public init(): void {
    this.refreshSession()
      .subscribe();
  }

  private getTokenString() {
    return localStorage.getItem("habit-token");
  }

  private getToken(): TokenPayload | null {
    const tokenString = this.getTokenString();
    let token: TokenPayload | null = null;
    if (tokenString !== null) {
      let [header, payload, cert] = tokenString.split(".");
      const rawToken = JSON.parse(atob(payload));
      token = {
        ...rawToken,
        exp: new Date(rawToken.exp * 1000)
      };
    }
    return token;
  }

  private saveToken(token: string) {
    localStorage.setItem("habit-token", token);
  }

  public login(ssoToken: string): Observable<User> {
    return this.http.post<Session>(
      `${environment.apiUrl}/users/login`,
      { token: ssoToken },
      {
        headers: ALLOW_ANONYMOUS_HEADER,
        withCredentials: true
      }
    ).pipe(
      tap(res => {
        this.saveToken(res.token);

        this._token$.next(res.token);
        this._user$.next(res.user);
        this._isAuthenticated$.next(true);
      }),
      map(res => {
        return res.user;
      })
    );
  }

  public refreshSession(): Observable<User | null> {
    return this.http.post<Session>(
      `${environment.apiUrl}/users/refresh`,
      null,
      {
        headers: ALLOW_ANONYMOUS_HEADER,
        withCredentials: true
      }
    ).pipe(
      tap(res => {
        this._token$.next(res.token);
        this._user$.next(res.user);
        this._isAuthenticated$.next(true);
      }),
      map(session => session.user),
      catchError(err => {
        if (err instanceof HttpErrorResponse) {
          if (err.status == 401) {
            this._isAuthenticated$.next(false);
            return of(null);
          }
        }
        console.error("Error getting refresh token", err);
        return throwError(() => err);
      })
    );
  }

  public logout(): void {
    localStorage.removeItem("habit-token");
    this._isAuthenticated$.next(false);
    this._token$.next('');
    this._user$.next(null);
    this.router.navigate(['/login']);
  }
}
