import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, map, Observable, ReplaySubject, Subject, tap } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ALLOW_ANONYMOUS_HEADER } from '../interceptors/auth.interceptor';
import { User } from '../models/user.model';

interface TokenPayload {
  userId: string;
  exp: Date
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private _isAuthenticated$ = new ReplaySubject<boolean>(1);

  public get isAuthenticated$(): Observable<boolean> {
    return this._isAuthenticated$;
  }

  private _user$ = new ReplaySubject<User>(1);

  private _token$ = new ReplaySubject<string>(1);

  public get token$(): Observable<string> {
    return this._token$;
  }

  constructor(private http: HttpClient) {
    const token = this.getToken();
    if (token !== null) {
      if (token.exp > new Date()) {
        //Token is still valid
        this._token$.next(this.getTokenString()!);
        this._isAuthenticated$.next(true);
      }
    }
  }

  private getTokenString() {
    return localStorage.getItem("habit-token");
  }

  private getToken() {
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
    return this.http.post<{ user: User, token: string }>(
      `${environment.apiUrl}/users/login`,
      { token: ssoToken },
      { headers: ALLOW_ANONYMOUS_HEADER}
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
}
