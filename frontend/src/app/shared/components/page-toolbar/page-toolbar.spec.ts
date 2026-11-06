import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { PageToolbarComponent } from './page-toolbar';

describe('PageToolbarComponent', () => {
  let fixture: ComponentFixture<PageToolbarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PageToolbarComponent, IonicModule.forRoot()],
      providers: [provideRouter([])],
    }).compileComponents();
    fixture = TestBed.createComponent(PageToolbarComponent);
    fixture.componentRef.setInput('title', 'Mi cuenta');
  });

  it('muestra el título como encabezado principal', () => {
    fixture.detectChanges();
    const h1: HTMLElement = fixture.nativeElement.querySelector('h1');
    expect(h1.textContent?.trim()).toBe('Mi cuenta');
  });

  it('solo muestra el botón volver si hay ruta de regreso', () => {
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('ion-button')).toBeNull();

    fixture.componentRef.setInput('backLink', '/tabs/tab1');
    fixture.detectChanges();
    const btn: HTMLElement = fixture.nativeElement.querySelector('ion-button');
    expect(btn.textContent?.trim()).toBe('Volver');
  });
});
