import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { DecimalPipe, TitleCasePipe } from '@angular/common';
import { Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { MyDataExport } from '@core/models/my-data-export';
import { AuthService } from '@core/services/auth';
import { DialogService } from '@core/services/dialog';
import { PageToolbarComponent } from '@shared/components/page-toolbar/page-toolbar';
import { DiagnosisLabelPipe } from '@shared/pipes';
import {
  formatCalendarDate,
  formatLongTimestamp,
  paymentLabel,
  symptomEntries,
  vaccineLabel,
} from './my-data-export.formatters';
import { downloadMyDataPdf } from './my-data-export.pdf';

/** Derecho de acceso (Ley N.° 29733): ver y descargar todos los datos guardados. */
@Component({
  selector: 'app-my-data-export',
  templateUrl: './my-data-export.html',
  styleUrls: ['./my-data-export.scss'],
  standalone: true,
  imports: [IonicModule, DecimalPipe, TitleCasePipe, DiagnosisLabelPipe, PageToolbarComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MyDataExportComponent implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly dialog = inject(DialogService);

  protected readonly data = signal<MyDataExport | null>(null);
  protected readonly isLoading = signal(true);
  protected readonly isGeneratingPdf = signal(false);
  protected readonly errorMsg = signal('');

  protected readonly todayLabel = new Date().toLocaleDateString('es-PE', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  // Formateadores compartidos con el PDF.
  protected readonly formatDate = formatLongTimestamp;
  protected readonly formatSimpleDate = formatCalendarDate;
  protected readonly vaccineLabel = vaccineLabel;
  protected readonly symptomEntries = symptomEntries;
  protected readonly paymentLabel = paymentLabel;

  ngOnInit(): void {
    if (!this.auth.isLoggedIn) {
      void this.router.navigate(['/profile']);
      return;
    }
    this.auth.exportMyData().subscribe({
      next: (data) => {
        this.data.set(data);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
        this.errorMsg.set('No se pudieron cargar tus datos. Intenta de nuevo.');
      },
    });
  }

  protected async exportPdf(): Promise<void> {
    const data = this.data();
    if (!data || this.isGeneratingPdf()) return;
    this.isGeneratingPdf.set(true);
    try {
      await downloadMyDataPdf(data, this.todayLabel);
    } catch {
      await this.dialog.error('No se pudo generar el PDF. Intenta de nuevo.');
    } finally {
      this.isGeneratingPdf.set(false);
    }
  }
}
