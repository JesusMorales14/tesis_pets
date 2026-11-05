import type { jsPDF } from 'jspdf';
import { MyDataExport } from '@core/models/my-data-export';
import { diagnosisText, formatCalendarDate, formatLongTimestamp, paymentLabel, vaccineLabel } from './my-data-export.formatters';

const MARGIN = 14;
const PAGE_BREAK_Y = 270;
const FOOTER_Y = 290;

/**
 * Genera el PDF de "Mis datos" (Ley N.° 29733).
 *
 * jsPDF (~450 KB) se carga con `import()` recién cuando el usuario pide la
 * descarga: antes se importaba de forma estática y engordaba la página
 * aunque nadie descargara nada.
 */
export async function downloadMyDataPdf(data: MyDataExport, todayLabel: string): Promise<void> {
  const { jsPDF } = await import('jspdf');
  const doc = new jsPDF();
  const writer = new PdfWriter(doc);

  writer.title('CityVet - Exportación de Datos Personales', `Fecha de exportación: ${todayLabel}`);
  writeAccount(writer, data);
  writePets(writer, data);
  writeAppointments(writer, data);
  writer.footer((page, total) => `CityVet - Exportación bajo Ley N.° 29733 - Página ${page} de ${total}`);

  doc.save(`cityvet-datos-${Date.now()}.pdf`);
}

function writeAccount(w: PdfWriter, data: MyDataExport): void {
  const c = data.cuenta;
  if (!c) return;
  w.heading('1. Información de la Cuenta');
  w.line(`Nombre: ${c.nombre}`);
  w.line(`Email: ${c.email}`);
  w.line('Rol: Usuario');
  if (c.creada_el) w.line(`Cuenta creada: ${formatLongTimestamp(c.creada_el)}`);
  w.space(6);
}

function writePets(w: PdfWriter, data: MyDataExport): void {
  if (!data.mascotas?.length) return;
  w.heading(`2. Mascotas (${data.mascotas.length})`);
  data.mascotas.forEach((pet, i) => {
    w.ensureRoom();
    w.line(`${i + 1}. ${pet.nombre}`, MARGIN, { bold: true });
    const extras = [
      pet.raza ? `Raza: ${pet.raza}` : null,
      pet.edad_meses ? `Edad: ${pet.edad_meses} meses` : null,
      pet.peso_kg ? `Peso: ${pet.peso_kg} kg` : null,
    ].filter(Boolean);
    w.line([`Especie: ${pet.especie}`, ...extras].join(' · '), 18);

    if (pet.vacunas?.length) {
      w.line('Vacunas:', 18, { step: 5 });
      pet.vacunas.forEach((v) => w.line(`- ${v.nombre}: ${vaccineLabel(v)}`, 22, { step: 5 }));
      w.space(3);
    }

    if (pet.historial_diagnosticos?.length) {
      w.line('Historial de diagnósticos:', 18, { step: 5 });
      pet.historial_diagnosticos.forEach((d) => {
        const prob = Math.round((d.probabilidad ?? 0) * 100);
        w.line(`- ${diagnosisText(d.diagnostico)} (${prob}%, ${d.gravedad}) - ${formatLongTimestamp(d.created_at)}`, 22, { step: 5 });
        const sintomas = Object.entries(d.sintomas ?? {})
          .filter(([, v]) => v > 0)
          .map(([k]) => k.replace(/_/g, ' '))
          .join(', ');
        if (sintomas) w.line(`  Síntomas: ${sintomas}`, 26, { step: 5 });
      });
      w.space(3);
    }
    w.space(4);
  });
}

function writeAppointments(w: PdfWriter, data: MyDataExport): void {
  if (!data.citas?.length) return;
  w.ensureRoom(200);
  w.heading(`3. Citas (${data.citas.length})`);
  data.citas.forEach((c, i) => {
    w.ensureRoom();
    w.line(`${i + 1}. ${formatCalendarDate(c.fecha)} ${c.hora} — ${c.estado.toUpperCase()}`, MARGIN, { bold: true, step: 5 });
    w.line(`Especie: ${c.especie} | Diagnóstico: ${diagnosisText(c.diagnostico)}`, 18, { step: 5 });
    w.line(`Método: ${paymentLabel(c.metodo_pago)} | Pago: ${c.pago_estado}`, 18, { step: 5 });
    if (c.comprobante_url) w.line('Comprobante: Subido', 18, { step: 5 });
    w.space(2);
  });
}

/** Escritura secuencial con salto de página automático. */
class PdfWriter {
  private y = 20;
  private readonly pageWidth: number;

  constructor(private readonly doc: jsPDF) {
    this.pageWidth = doc.internal.pageSize.getWidth();
  }

  title(text: string, subtitle: string): void {
    this.doc.setFontSize(18).setFont('helvetica', 'bold');
    this.doc.text(text, this.pageWidth / 2, this.y, { align: 'center' });
    this.y += 8;
    this.doc.setFontSize(10).setFont('helvetica', 'normal');
    this.doc.text(subtitle, this.pageWidth / 2, this.y, { align: 'center' });
    this.y += 12;
  }

  heading(text: string): void {
    this.doc.setFontSize(12).setFont('helvetica', 'bold');
    this.doc.text(text, MARGIN, this.y);
    this.y += 7;
  }

  line(text: string, x = MARGIN, opts: { bold?: boolean; step?: number } = {}): void {
    this.ensureRoom();
    this.doc.setFontSize(10).setFont('helvetica', opts.bold ? 'bold' : 'normal');
    this.doc.text(text, x, this.y);
    this.y += opts.step ?? 6;
  }

  space(mm: number): void {
    this.y += mm;
  }

  ensureRoom(limit = PAGE_BREAK_Y): void {
    if (this.y > limit) {
      this.doc.addPage();
      this.y = 20;
    }
  }

  footer(text: (page: number, total: number) => string): void {
    const total = this.doc.getNumberOfPages();
    for (let i = 1; i <= total; i++) {
      this.doc.setPage(i);
      this.doc.setFontSize(8).setFont('helvetica', 'italic');
      this.doc.text(text(i, total), this.pageWidth / 2, FOOTER_Y, { align: 'center' });
    }
  }
}
