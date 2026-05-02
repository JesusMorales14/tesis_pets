import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';

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
  private readonly API = 'http://localhost:8000';
  private userSubject = new BehaviorSubject<User | null>(this.loadUser());
  user$ = this.userSubject.asObservable();

  constructor(private http: HttpClient) {}

  get currentUser(): User | null { return this.userSubject.value; }
  get isLoggedIn(): boolean { return !!this.userSubject.value; }
  get isAdmin(): boolean { return this.userSubject.value?.role === 'admin'; }
  get token(): string | null { return localStorage.getItem('vet_token'); }

  login(email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API}/auth/login`, { email, password }).pipe(
      tap(r => this.saveSession(r))
    );
  }

  register(nombre: string, email: string, password: string, adminCode = ''): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API}/auth/register`, {
      nombre, email, password, admin_code: adminCode,
    }).pipe(tap(r => this.saveSession(r)));
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
