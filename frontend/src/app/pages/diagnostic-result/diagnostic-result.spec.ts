import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { routes } from '@app/app.routes';
import { IonicModule } from '@ionic/angular';

import { DiagnosticResultComponent } from './diagnostic-result';

describe('DiagnosticResultComponent', () => {
  let component: DiagnosticResultComponent;
  let fixture: ComponentFixture<DiagnosticResultComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [DiagnosticResultComponent, IonicModule.forRoot()],
      providers: [provideRouter(routes), provideHttpClient()]
    }).compileComponents();

    fixture = TestBed.createComponent(DiagnosticResultComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
