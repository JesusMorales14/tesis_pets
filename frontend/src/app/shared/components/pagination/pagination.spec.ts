import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { PaginationComponent, PAGINATION_ELLIPSIS } from './pagination';

describe('PaginationComponent', () => {
  let component: PaginationComponent;
  let fixture: ComponentFixture<PaginationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PaginationComponent, IonicModule.forRoot()],
    }).compileComponents();

    fixture = TestBed.createComponent(PaginationComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('computes totalPages from totalItems and pageSize', () => {
    component.totalItems = 95;
    component.pageSize = 10;
    expect(component.totalPages).toBe(10);
  });

  it('always reports at least 1 page, even with zero items', () => {
    component.totalItems = 0;
    component.pageSize = 10;
    expect(component.totalPages).toBe(1);
  });

  it('lists every page without ellipsis when the range is short', () => {
    component.totalItems = 40;
    component.pageSize = 10;
    component.page = 1;
    expect(component.pageItems).toEqual([1, 2, 3, 4]);
  });

  it('inserts an ellipsis on both sides when the current page is in the middle of a long range', () => {
    component.totalItems = 200;
    component.pageSize = 10;
    component.page = 10;
    expect(component.pageItems).toEqual([
      1,
      PAGINATION_ELLIPSIS,
      9,
      10,
      11,
      PAGINATION_ELLIPSIS,
      20,
    ]);
  });

  it('does not show a leading ellipsis when near the first page', () => {
    component.totalItems = 200;
    component.pageSize = 10;
    component.page = 2;
    expect(component.pageItems).toEqual([1, 2, 3, PAGINATION_ELLIPSIS, 20]);
  });

  it('emits pageChange when navigating to a valid, different page', () => {
    component.totalItems = 50;
    component.pageSize = 10;
    component.page = 1;
    const emitted: number[] = [];
    component.pageChange.subscribe((p) => emitted.push(p));

    component.goTo(3);

    expect(emitted).toEqual([3]);
  });

  it('does not emit pageChange for out-of-range targets', () => {
    component.totalItems = 50;
    component.pageSize = 10;
    component.page = 1;
    const emitted: number[] = [];
    component.pageChange.subscribe((p) => emitted.push(p));

    component.goTo(0);
    component.goTo(99);
    component.goTo(1); // same as current page

    expect(emitted).toEqual([]);
  });
});
