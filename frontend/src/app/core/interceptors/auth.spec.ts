import { TestBed } from '@angular/core/testing';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { authInterceptor } from './auth';
import { environment } from '../../../environments/environment';

describe('authInterceptor', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
      ],
    });
    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('attaches the Authorization header when a token exists', () => {
    localStorage.setItem('vet_token', 'fake-jwt-token');
    http.get(`${environment.apiUrl}/pets`).subscribe();
    const req = httpMock.expectOne(`${environment.apiUrl}/pets`);
    expect(req.request.headers.get('Authorization')).toBe('Bearer fake-jwt-token');
    req.flush([]);
  });

  it('does not attach the header when no token is present', () => {
    http.get(`${environment.apiUrl}/payment-config`).subscribe();
    const req = httpMock.expectOne(`${environment.apiUrl}/payment-config`);
    expect(req.request.headers.has('Authorization')).toBeFalse();
    req.flush({});
  });

  it('leaves requests to other origins untouched', () => {
    localStorage.setItem('vet_token', 'fake-jwt-token');
    http.get('https://unrelated.example.com/x').subscribe();
    const req = httpMock.expectOne('https://unrelated.example.com/x');
    expect(req.request.headers.has('Authorization')).toBeFalse();
    req.flush({});
  });
});
