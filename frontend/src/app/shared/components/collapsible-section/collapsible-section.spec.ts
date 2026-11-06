import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { CollapsibleSectionComponent } from './collapsible-section';

@Component({
  standalone: true,
  imports: [CollapsibleSectionComponent],
  template: `
    <app-collapsible-section heading="Mis citas" icon="calendar-outline" [count]="3" [(expanded)]="open">
      <p class="content">Contenido</p>
    </app-collapsible-section>
  `,
})
class HostComponent {
  open = true;
}

describe('CollapsibleSectionComponent', () => {
  let fixture: ComponentFixture<HostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HostComponent, IonicModule.forRoot()],
    }).compileComponents();
    fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
  });

  it('expone el estado con aria-expanded y pliega el contenido', () => {
    const header: HTMLButtonElement = fixture.nativeElement.querySelector('button.section-header');
    expect(header.getAttribute('aria-expanded')).toBe('true');
    expect(fixture.nativeElement.querySelector('.content')).not.toBeNull();

    header.click();
    fixture.detectChanges();

    expect(header.getAttribute('aria-expanded')).toBe('false');
    expect(fixture.nativeElement.querySelector('.content')).toBeNull();
    expect(fixture.componentInstance.open).toBeFalse();
  });

  it('muestra el contador', () => {
    expect(fixture.nativeElement.querySelector('.badge').textContent.trim()).toBe('3');
  });
});
