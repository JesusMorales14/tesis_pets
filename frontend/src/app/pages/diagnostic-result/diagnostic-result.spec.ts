import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { DiagnosisFlowService } from '@core/services/diagnosis-flow';
import { DiagnosticResultComponent } from './diagnostic-result';

describe('DiagnosticResultComponent', () => {
  let fixture: ComponentFixture<DiagnosticResultComponent>;
  let flow: DiagnosisFlowService;

  beforeEach(async () => {
    sessionStorage.clear();
    await TestBed.configureTestingModule({
      imports: [DiagnosticResultComponent, IonicModule.forRoot()],
      providers: [provideRouter([]), provideHttpClient()],
    }).compileComponents();

    flow = TestBed.inject(DiagnosisFlowService);
    fixture = TestBed.createComponent(DiagnosticResultComponent);
  });

  // Los web components de Ionic terminan de hidratarse de forma asíncrona:
  // se espera a que lo hagan antes de destruir el fixture para que no
  // lancen errores tardíos en el test siguiente.
  afterEach(async () => {
    await fixture.whenStable();
    await new Promise((resolve) => setTimeout(resolve, 50));
    sessionStorage.clear();
  });

  function enterWith(result: Record<string, unknown>): HTMLElement {
    flow.start('perro', null);
    flow.setResult(
      { especie: 'perro', fase: 1, gravedad: 'grave', probabilidad: 0.82, diagnostico: 'parvovirus_canino', ...result },
      [{ key: 'vomito', severity: 3, label: 'Vómito' }],
    );
    fixture.componentInstance.ionViewWillEnter();
    fixture.detectChanges();
    return fixture.nativeElement as HTMLElement;
  }

  it('muestra el diagnóstico legible y la confianza', () => {
    const el = enterWith({});
    expect(el.querySelector('#diagnosis-name')?.textContent?.trim()).toBe('Parvovirus Canino');
    expect(el.querySelector('.pct')?.textContent?.trim()).toBe('82%');
  });

  it('avisa del diagnóstico diferencial cuando el modelo duda', () => {
    const el = enterWith({ diagnostico_alternativo: 'moquillo_canino', probabilidad_alternativa: 0.4 });
    expect(el.textContent).toContain('Diagnóstico a confirmar');
    expect(el.textContent).toContain('Moquillo Canino');
  });

  it('avisa de confianza baja sin diferencial', () => {
    const el = enterWith({ probabilidad: 0.3 });
    expect(el.textContent).toContain('Confianza baja en este resultado');
  });
});
