import { Pipe, PipeTransform } from '@angular/core';

/**
 * Convierte el identificador de un diagnóstico del modelo de IA
 * ('parvovirus_canino') en texto legible ('Parvovirus Canino').
 *
 * Reemplaza el método `formatDiagnostico()` que estaba copiado en cada
 * página: al ser un pipe puro, Angular solo lo recalcula cuando cambia el
 * valor (las llamadas a métodos en el template se ejecutan en cada ciclo
 * de detección de cambios).
 */
@Pipe({ name: 'diagnosisLabel', standalone: true })
export class DiagnosisLabelPipe implements PipeTransform {
  transform(value: string | null | undefined, titleCase = true): string {
    const text = (value ?? '').replace(/_/g, ' ').trim();
    if (!titleCase) return text;
    return text.replace(/\S+/g, (w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());
  }
}
