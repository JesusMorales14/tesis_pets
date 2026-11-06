import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { routes } from '@app/app.routes';
import { IonicModule } from '@ionic/angular';

import { PredictTodayComponent } from './predict-today';

describe('PredictTodayComponent', () => {
  let component: PredictTodayComponent;
  let fixture: ComponentFixture<PredictTodayComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [PredictTodayComponent, IonicModule.forRoot()],
      providers: [provideRouter(routes), provideHttpClient()]
    }).compileComponents();

    fixture = TestBed.createComponent(PredictTodayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
