import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { MyDataExport } from '../models/my-data-export';

export interface User {
  id: number;
  nombre: string;
  email: string;
  role: 'user' | 'admin';
}

export interface AuthResponse {
  token: string;
  user: User;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);

  private readonly API = environment.apiUrl;
  private userSubject = new BehaviorSubject<User | null>(this.loadUser());
  user$ = this.userSubject.asObservable();

  get currentUser(): User | null { return this.userSubject.value; }
  get isLoggedIn(): boolean { return !!this.userSubject.value; }
  get isAdmin(): boolean { return this.userSubject.value?.role === 'admin'; }
  get token(): string | null { return localStorage.getItem('vet_token'); }

  login(email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API}/auth/login`, { email, password }).pipe(
      tap(r => this.saveSession(r))
    );
  }

  register(
    nombre: string, email: string, password: string, adminCode = '', acceptedPrivacy = false,
  ): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API}/auth/register`, {
      nombre, email, password, admin_code: adminCode, accepted_privacy: acceptedPrivacy,
    }).pipe(tap(r => this.saveSession(r)));
  }

  changePassword(currentPassword: string, newPassword: string): Observable<{ message: string }> {
    return this.http.put<{ message: string }>(
      `${this.API}/auth/change-password`,
      { current_password: currentPassword, new_password: newPassword },
    );
  }

  exportMyData(): Observable<MyDataExport> {
    return this.http.get<MyDataExport>(`${this.API}/auth/me/export`);
  }

  deleteMyAccount(): Observable<{ ok: boolean }> {
    return this.http.delete<{ ok: boolean }>(`${this.API}/auth/me`);
  }

  logout(): void {
    localStorage.removeItem('vet_token');
    localStorage.removeItem('vet_user');
    this.userSubject.next(null);
  }

  private saveSession(r: AuthResponse): void {
    localStorage.setItem('vet_token', r.token);
    localStorage.setItem('vet_user', JSON.stringify(r.user));
    this.userSubject.next(r.user);
  }

  private loadUser(): User | null {
    const saved = localStorage.getItem('vet_user');
    return saved ? JSON.parse(saved) : null;
  }
}
