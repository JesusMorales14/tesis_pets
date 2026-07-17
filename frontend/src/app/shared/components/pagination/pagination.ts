import { Component, EventEmitter, Input, Output } from '@angular/core';

import { IonicModule } from '@ionic/angular';

export const PAGINATION_ELLIPSIS = -1;

@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [IonicModule],
  templateUrl: './pagination.html',
  styleUrls: ['./pagination.scss'],
})
export class PaginationComponent {
  @Input() totalItems = 0;
  @Input() pageSize = 10;
  @Input() page = 1;
  @Output() pageChange = new EventEmitter<number>();

  readonly ELLIPSIS = PAGINATION_ELLIPSIS;

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.totalItems / this.pageSize));
  }

  /** Números de página a renderizar, con elipsis para rangos largos: 1 … 4 5 6 … 12 */
  get pageItems(): number[] {
    const total = this.totalPages;
    const current = Math.min(Math.max(this.page, 1), total);
    const around = 1;

    let start = Math.max(2, current - around);
    let end = Math.min(total - 1, current + around);

    // Un elipsis solo tiene sentido si oculta 2+ páginas; si el hueco es de
    // una sola página, se muestra ese número en vez de "…" (que no ahorra espacio).
    if (start === 3) start = 2;
    if (end === total - 2) end = total - 1;

    const items: number[] = [1];
    if (start > 2) items.push(this.ELLIPSIS);
    for (let p = start; p <= end; p++) items.push(p);
    if (end < total - 1) items.push(this.ELLIPSIS);
    if (total > 1) items.push(total);

    return items;
  }

  goTo(target: number): void {
    if (target < 1 || target > this.totalPages || target === this.page) return;
    this.pageChange.emit(target);
  }
}
