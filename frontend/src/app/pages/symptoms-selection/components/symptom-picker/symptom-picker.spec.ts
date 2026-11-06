import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { routes } from '@app/app.routes';
import { IonicModule } from '@ionic/angular';

import { SymptomPickerComponent } from './symptom-picker';

describe('SymptomPickerComponent', () => {
  let component: SymptomPickerComponent;
  let fixture: ComponentFixture<SymptomPickerComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [SymptomPickerComponent, IonicModule.forRoot()],
      providers: [provideRouter(routes), provideHttpClient()]
    }).compileComponents();

    fixture = TestBed.createComponent(SymptomPickerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
