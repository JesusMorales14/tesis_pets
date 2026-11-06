import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { RECEIPT_ACCEPT, describeReceiptFile, validateReceiptFile } from '@core/utils/receipt-file';

/**
 * Selección del comprobante de pago. Valida tipo y tamaño al elegirlo y
 * emite el archivo (o el error) al contenedor, que es quien lo envía.
 */
@Component({
  selector: 'app-receipt-upload',
  templateUrl: './receipt-upload.html',
  styleUrls: ['./receipt-upload.scss'],
  standalone: true,
  imports: [IonicModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReceiptUploadComponent {
  readonly file = input<File | null>(null);
  readonly disabled = input(false);

  readonly fileChange = output<File | null>();
  readonly invalidFile = output<string>();

  protected readonly accept = RECEIPT_ACCEPT;
  protected readonly details = computed(() => {
    const f = this.file();
    return f ? describeReceiptFile(f) : '';
  });

  protected onSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;
    input.value = ''; // permite volver a elegir el mismo archivo tras quitarlo
    if (!file) return;

    const error = validateReceiptFile(file);
    if (error) {
      this.invalidFile.emit(error);
      return;
    }
    this.fileChange.emit(file);
  }
}
