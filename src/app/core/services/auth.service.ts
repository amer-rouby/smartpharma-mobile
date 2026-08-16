import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { Preferences } from '@capacitor/preferences';
import { environment } from '../../../environments/environment';
import { AuthResponse, LoginRequest, ApiResponse } from '../models/auth.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/auth`;

  private readonly currentUserSubject = new BehaviorSubject<AuthResponse | null>(null);
  readonly currentUser$ = this.currentUserSubject.asObservable();

  private token: string | null = null;

  /** Must be awaited once at app startup (see app.component.ts) before any guard or
   * interceptor runs, since Preferences reads are async but getToken() is used
   * synchronously everywhere else. */
  async init(): Promise<void> {
    const { value: token } = await Preferences.get({ key: environment.tokenKey });
    const { value: userJson } = await Preferences.get({ key: environment.userKey });
    this.token = token ?? null;
    if (userJson) {
      try {
        this.currentUserSubject.next(JSON.parse(userJson) as AuthResponse);
      } catch {
        await this.clearSession();
      }
    }
  }

  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials).pipe(
      tap((response) => {
        if (response.twoFactorRequired) {
          return;
        }
        this.setSession(response);
      })
    );
  }

  completeTwoFactorLogin(tempToken: string, code: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/2fa/login`, { tempToken, code }).pipe(
      tap((response) => {
        this.setSession(response);
      })
    );
  }

  logout(): Observable<unknown> {
    const token = this.getToken();
    if (!token) {
      return of(null).pipe(tap(() => this.clearSession()));
    }
    return this.http.post(`${this.apiUrl}/logout`, {}).pipe(
      tap(() => this.clearSession()),
      catchError(() => {
        this.clearSession();
        return of(null);
      })
    );
  }

  isLoggedIn(): boolean {
    return !!this.token;
  }

  getToken(): string | null {
    return this.token;
  }

  getCurrentUser(): AuthResponse | null {
    return this.currentUserSubject.value;
  }

  getPharmacyId(): number | null {
    return this.getCurrentUser()?.pharmacyId ?? null;
  }

  hasRole(...roles: string[]): boolean {
    const role = this.getCurrentUser()?.role;
    return !!role && roles.includes(role);
  }

  /** Updates the in-memory token/subject synchronously first, then persists to
   * Preferences in the background - the caller (login page) navigates as soon as
   * this returns, and anything reading getPharmacyId()/getCurrentUser() right
   * after (e.g. the dashboard's ngOnInit) must see the new session immediately,
   * not after an async native-bridge write resolves. */
  private setSession(response: AuthResponse): void {
    this.token = response.accessToken;
    this.currentUserSubject.next(response);
    void Preferences.set({ key: environment.tokenKey, value: response.accessToken });
    void Preferences.set({ key: environment.refreshTokenKey, value: response.refreshToken });
    void Preferences.set({ key: environment.userKey, value: JSON.stringify(response) });
  }

  private clearSession(): void {
    this.token = null;
    this.currentUserSubject.next(null);
    void Preferences.remove({ key: environment.tokenKey });
    void Preferences.remove({ key: environment.refreshTokenKey });
    void Preferences.remove({ key: environment.userKey });
  }
}
