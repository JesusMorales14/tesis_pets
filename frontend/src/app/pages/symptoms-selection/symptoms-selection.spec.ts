import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { routes } from '@app/app.routes';
import { IonicModule } from '@ionic/angular';

import { SymptomsSelectionComponent } from './symptoms-selection';

describe('SymptomsSelectionComponent', () => {
  let component: SymptomsSelectionComponent;
  let fixture: ComponentFixture<SymptomsSelectionComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [SymptomsSelectionComponent, IonicModule.forRoot()],
      providers: [provideRouter(routes), provideHttpClient()]
    }).compileComponents();

    fixture = TestBed.createComponent(SymptomsSelectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
