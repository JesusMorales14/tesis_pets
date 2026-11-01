export interface MyDataVaccination {
  id: number;
  nombre: string;
  estado: 'aplicada' | 'programada';
  fecha_aplicacion: string | null;
  fecha_programada: string | null;
  fecha_proxima: string | null;
  notas: string | null;
}

export interface MyDataDiagnosis {
  diagnostico: string;
  probabilidad: number;
  gravedad: string;
  sintomas: Record<string, number>;
  created_at: string;
}

export interface MyDataPet {
  id: number;
  nombre: string;
  especie: string;
  raza: string | null;
  edad_meses: number | null;
  peso_kg: number | null;
  vacunas: MyDataVaccination[];
  historial_diagnosticos: MyDataDiagnosis[];
}

export interface MyDataAppointment {
  id: number;
  fecha: string;
  hora: string;
  diagnostico: string;
  especie: string;
  gravedad: string;
  estado: string;
  metodo_pago: string;
  pago_estado: string;
  comprobante_url: string | null;
}

export interface MyDataExport {
  cuenta: { nombre: string; email: string; creada_el: string | null };
  mascotas: MyDataPet[];
  citas: MyDataAppointment[];
  exportado_el: string;
}
