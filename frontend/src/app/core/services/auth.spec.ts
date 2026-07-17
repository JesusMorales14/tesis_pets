import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';

import { AuthService, AuthResponse } from './auth';
import { environment } from '../../../environments/environment';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  const mockResponse: AuthResponse = {
    token: 'fake-jwt-token',
    user: { id: 1, nombre: 'Ana', email: 'ana@test.com', role: 'user' },
  };

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('starts logged out when there is no saved session', () => {
    expect(service.isLoggedIn).toBeFalse();
    expect(service.currentUser).toBeNull();
  });

  it('logs in, persists the session, and exposes the user', () => {
    service.login('ana@test.com', 'secret').subscribe();

    const req = httpMock.expectOne(`${environment.apiUrl}/auth/login`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ email: 'ana@test.com', password: 'secret' });
    req.flush(mockResponse);

    expect(service.isLoggedIn).toBeTrue();
    expect(service.currentUser?.email).toBe('ana@test.com');
    expect(service.token).toBe('fake-jwt-token');
    expect(localStorage.getItem('vet_token')).toBe('fake-jwt-token');
  });

  it('sends accepted_privacy with the registration request', () => {
    service.register('Ana', 'ana@test.com', 'secret123', '', true).subscribe();

    const req = httpMock.expectOne(`${environment.apiUrl}/auth/register`);
    expect(req.request.body).toEqual({
      nombre: 'Ana', email: 'ana@test.com', password: 'secret123',
      admin_code: '', accepted_privacy: true,
    });
    req.flush(mockResponse);
  });

  it('identifies admin users via isAdmin', () => {
    service.login('vet@test.com', 'secret').subscribe();
    const req = httpMock.expectOne(`${environment.apiUrl}/auth/login`);
    req.flush({ ...mockResponse, user: { ...mockResponse.user, role: 'admin' } });

    expect(service.isAdmin).toBeTrue();
  });

  it('regular users are not admins', () => {
    service.login('ana@test.com', 'secret').subscribe();
    const req = httpMock.expectOne(`${environment.apiUrl}/auth/login`);
    req.flush(mockResponse);

    expect(service.isAdmin).toBeFalse();
  });

  it('clears the session and storage on logout', () => {
    service.login('ana@test.com', 'secret').subscribe();
    httpMock.expectOne(`${environment.apiUrl}/auth/login`).flush(mockResponse);
    expect(service.isLoggedIn).toBeTrue();

    service.logout();

    expect(service.isLoggedIn).toBeFalse();
    expect(service.currentUser).toBeNull();
    expect(localStorage.getItem('vet_token')).toBeNull();
    expect(localStorage.getItem('vet_user')).toBeNull();
  });

  it('sends the change-password request with both passwords', () => {
    service.login('ana@test.com', 'secret').subscribe();
    httpMock.expectOne(`${environment.apiUrl}/auth/login`).flush(mockResponse);

    service.changePassword('secret', 'newSecret123').subscribe();

    const req = httpMock.expectOne(`${environment.apiUrl}/auth/change-password`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual({
      current_password: 'secret',
      new_password: 'newSecret123',
    });
    req.flush({ message: 'ok' });
  });

  it('restores the session from localStorage on a fresh instance (e.g. page reload)', () => {
    localStorage.setItem('vet_user', JSON.stringify(mockResponse.user));

    // AuthService reads localStorage in its constructor, so a genuinely new
    // instance is needed to exercise that path (not the cached singleton).
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    const freshService = TestBed.inject(AuthService);

    expect(freshService.currentUser).toEqual(mockResponse.user);
  });
});
