import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { AuthService } from '@core/services/auth';
import { MyDataExport } from '@core/models/my-data-export';
import { SEVERITY_LABELS } from '@core/models/symptom';

@Component({
  selector: 'app-my-data-export',
  templateUrl: './my-data-export.html',
  styleUrls: ['./my-data-export.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule],
})
export class MyDataExportComponent implements OnInit {
  private auth = inject(AuthService);
  private router = inject(Router);

  data: MyDataExport | null = null;
  isLoading = true;
  errorMsg = '';

  readonly todayLabel = new Date().toLocaleDateString('es-PE', {
    day: 'numeric', month: 'long', year: 'numeric',
  });

  ngOnInit() {
    if (!this.auth.isLoggedIn) {
      this.router.navigate(['/profile']);
      return;
    }
    this.auth.exportMyData().subscribe({
      next: (data) => { this.data = data; this.isLoading = false; },
      error: () => {
        this.isLoading = false;
        this.errorMsg = 'No se pudieron cargar tus datos. Intenta de nuevo.';
      },
    });
  }

  exportPdf() {
    window.print();
  }

  goBack() {
    this.router.navigate(['/profile']);
  }

  formatDate(iso: string | null): string {
    if (!iso) return '—';
    const d = new Date(iso);
    return d.toLocaleDateString('es-PE', { day: 'numeric', month: 'long', year: 'numeric' });
  }

  formatSimpleDate(dateStr: string): string {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('es-PE', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  symptomEntries(sintomas: Record<string, number>): Array<{ key: string; severidad: string }> {
    return Object.entries(sintomas)
      .filter(([, v]) => v > 0)
      .map(([key, v]) => ({ key: key.replace(/_/g, ' '), severidad: SEVERITY_LABELS[v] ?? '' }));
  }

  metodoPagoLabel(metodo: string): string {
    return metodo === 'yape' ? 'Yape' : 'Transferencia bancaria';
  }
}
