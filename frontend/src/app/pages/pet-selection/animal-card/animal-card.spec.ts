import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { routes } from '@app/app.routes';
import { IonicModule } from '@ionic/angular';

import { AnimalCardComponent } from './animal-card';

describe('AnimalCardComponent', () => {
  let component: AnimalCardComponent;
  let fixture: ComponentFixture<AnimalCardComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [AnimalCardComponent, IonicModule.forRoot()],
      providers: [provideRouter(routes), provideHttpClient()]
    }).compileComponents();

    fixture = TestBed.createComponent(AnimalCardComponent);
    component = fixture.componentInstance;
    component.animal = {
      id: 'perro',
      name: 'Perro',
      subtitle: 'Diagnóstico canino',
      icon: 'paw-outline',
      color: '#2f6df6',
      gradient: 'linear-gradient(135deg, #2f6df6 0%, #185fa5 100%)',
      imagePlaceholder: '',
      imageUrl: '',
    };
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
