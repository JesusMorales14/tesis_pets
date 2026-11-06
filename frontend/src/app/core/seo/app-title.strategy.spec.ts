import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Meta, Title } from '@angular/platform-browser';
import { Router, TitleStrategy, provideRouter } from '@angular/router';
import { AppTitleStrategy } from './app-title.strategy';

@Component({ standalone: true, template: '' })
class DummyComponent {}

describe('AppTitleStrategy', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([
          { path: 'publica', title: 'Salud', component: DummyComponent, data: { seo: { description: 'Guía de salud' } } },
          { path: 'privada', title: 'Mi cuenta', component: DummyComponent, data: { seo: { noIndex: true } } },
        ]),
        { provide: TitleStrategy, useClass: AppTitleStrategy },
      ],
    });
  });

  it('agrega la marca al título y aplica la descripción de la ruta', async () => {
    await TestBed.inject(Router).navigateByUrl('/publica');
    expect(TestBed.inject(Title).getTitle()).toBe('Salud | CityVet');
    expect(TestBed.inject(Meta).getTag('name="description"')?.content).toBe('Guía de salud');
  });

  it('marca como noindex las pantallas privadas', async () => {
    await TestBed.inject(Router).navigateByUrl('/privada');
    expect(TestBed.inject(Meta).getTag('name="robots"')?.content).toBe('noindex, nofollow');
  });
});
