import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { routes } from '@app/app.routes';
import { IonicModule } from '@ionic/angular';

import { PrecisonComponent } from './precison';

describe('PrecisonComponent', () => {
  let component: PrecisonComponent;
  let fixture: ComponentFixture<PrecisonComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [PrecisonComponent, IonicModule.forRoot()],
      providers: [provideRouter(routes), provideHttpClient()]
    }).compileComponents();

    fixture = TestBed.createComponent(PrecisonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
