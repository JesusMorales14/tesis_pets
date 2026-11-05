import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { AuthService } from '@core/services/auth';
import { MyDataExport, MyDataPet, MyDataAppointment, MyDataVaccination, MyDataDiagnosis } from '@core/models/my-data-export';
import { SEVERITY_LABELS } from '@core/data/symptoms.data';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

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
    if (!this.data) return;
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    let y = 20;

    // Título
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('CityVet - Exportación de Datos Personales', pageWidth / 2, y, { align: 'center' });
    y += 8;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Fecha de exportación: ${this.todayLabel}`, pageWidth / 2, y, { align: 'center' });
    y += 12;

    // Datos del usuario (cuenta)
    if (this.data?.cuenta) {
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('1. Información de la Cuenta', 14, y);
      y += 7;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.text(`Nombre: ${this.data.cuenta.nombre}`, 14, y);
      y += 6;
      doc.text(`Email: ${this.data.cuenta.email}`, 14, y);
      y += 6;
      // No hay campo role en cuenta, asumimos 'user' por defecto
      doc.text(`Rol: Usuario`, 14, y);
      y += 6;
      if (this.data.cuenta.creada_el) {
        doc.text(`Cuenta creada: ${this.formatDate(this.data.cuenta.creada_el)}`, 14, y);
        y += 6;
      }
      y += 6;
    }

    // Mascotas
    if (this.data?.mascotas?.length) {
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text(`2. Mascotas (${this.data.mascotas.length})`, 14, y);
      y += 7;
      this.data.mascotas.forEach((pet: MyDataPet, i: number) => {
        if (y > 270) { doc.addPage(); y = 20; }
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text(`${i + 1}. ${pet.nombre}`, 14, y);
        y += 6;
        doc.setFont('helvetica', 'normal');
        doc.text(`Especie: ${pet.especie}${pet.raza ? ' · Raza: ' + pet.raza : ''}${pet.edad_meses ? ' · Edad: ' + pet.edad_meses + ' meses' : ''}${pet.peso_kg ? ' · Peso: ' + pet.peso_kg + ' kg' : ''}`, 18, y);
        y += 6;

        // Vacunas
        if (pet.vacunas?.length) {
          doc.text('Vacunas:', 18, y);
          y += 5;
          pet.vacunas.forEach((v: MyDataVaccination) => {
            if (y > 270) { doc.addPage(); y = 20; }
            doc.text(`- ${v.nombre}: ${this.vaccineLabel(v)}`, 22, y);
            y += 5;
          });
          y += 3;
        }

        // Historial de diagnósticos
        if (pet.historial_diagnosticos?.length) {
          doc.text('Historial de diagnósticos:', 18, y);
          y += 5;
          pet.historial_diagnosticos.forEach((d: MyDataDiagnosis) => {
            if (y > 270) { doc.addPage(); y = 20; }
            const prob = Math.round((d.probabilidad ?? 0) * 100);
            doc.text(`- ${this.formatDiagnostico(d.diagnostico)} (${prob}%, ${d.gravedad}) - ${this.formatDate(d.created_at)}`, 22, y);
            y += 5;
            if (d.sintomas) {
              const sint = Object.entries(d.sintomas).filter(([, v]) => v > 0).map(([k]) => k.replace(/_/g, ' ')).join(', ');
              if (sint) doc.text(`  Síntomas: ${sint}`, 26, y);
              y += 5;
            }
          });
          y += 3;
        }
        y += 4;
      });
    }

    // Citas
    if (this.data?.citas?.length) {
      if (y > 200) { doc.addPage(); y = 20; }
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text(`3. Citas (${this.data.citas.length})`, 14, y);
      y += 7;
      this.data.citas.forEach((c: MyDataAppointment, i: number) => {
        if (y > 270) { doc.addPage(); y = 20; }
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text(`${i + 1}. ${this.formatSimpleDate(c.fecha)} ${c.hora} — ${c.estado.toUpperCase()}`, 14, y);
        y += 5;
        doc.setFont('helvetica', 'normal');
        doc.text(`Especie: ${c.especie} | Diagnóstico: ${this.formatDiagnostico(c.diagnostico)}`, 18, y);
        y += 5;
        doc.text(`Método: ${this.metodoPagoLabel(c.metodo_pago)} | Pago: ${c.pago_estado}`, 18, y);
        y += 5;
        if (c.comprobante_url) doc.text('Comprobante: Subido', 18, y);
        y += 7;
      });
    }

    // Footer
    const totalPages = doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'italic');
      doc.text(
        `CityVet - Exportación bajo Ley N.° 29733 - Página ${i} de ${totalPages}`,
        pageWidth / 2,
        290,
        { align: 'center' }
      );
    }

    doc.save(`cityvet-datos-${Date.now()}.pdf`);
  }

  goBack() {
    this.router.navigate(['/profile']);
  }

  /** Formatea el diagnóstico reemplazando guiones bajos por espacios */
  formatDiagnostico(diagnostico: string): string {
    return (diagnostico ?? '').replace(/_/g, ' ');
  }

  formatDate(iso: string | null): string {
    if (!iso) return '—';
    const d = new Date(iso);
    return d.toLocaleDateString('es-PE', { day: 'numeric', month: 'long', year: 'numeric' });
  }

  /** "aplicada 24 oct 2026 · refuerzo 24 oct 2027" o "programada para 13 nov 2026". */
  vaccineLabel(v: MyDataVaccination): string {
    if (v.estado === 'programada') {
      return v.fecha_programada ? `programada para ${this.formatSimpleDate(v.fecha_programada)}` : 'programada';
    }
    const aplicada = v.fecha_aplicacion ? `aplicada ${this.formatSimpleDate(v.fecha_aplicacion)}` : 'aplicada';
    return v.fecha_proxima ? `${aplicada} · refuerzo ${this.formatSimpleDate(v.fecha_proxima)}` : aplicada;
  }

  // Fechas sin hora ('YYYY-MM-DD'): se leen como medianoche local. Con
  // new Date('YYYY-MM-DD') serían medianoche UTC, un día antes en Perú.
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
