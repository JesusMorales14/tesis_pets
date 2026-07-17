import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { provideRouter, Router } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { routes } from '@app/app.routes';
import { TestBed } from '@angular/core/testing';

import { AppComponent } from './app';

describe('AppComponent', () => {

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [provideRouter(routes), provideHttpClient()],
    }).compileComponents();

    const router = TestBed.inject(Router);
    await router.navigateByUrl('/');
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

});
