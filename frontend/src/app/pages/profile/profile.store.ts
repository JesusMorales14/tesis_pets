import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { Appointment } from '@core/models/appointment';
import { DiagnosisHistoryEntry, Pet, PetBody, Vaccination, VaccinationBody } from '@core/models/pet';
import { AppointmentService } from '@core/services/appointment';
import { DiagnosisFlowService } from '@core/services/diagnosis-flow';
import { PetService } from '@core/services/pet';
import { PetImageService } from '@core/services/pet-image';
import { VaccinationStatus, vaccinationStatus } from '@core/utils/vaccination-status';

/**
 * Estado y casos de uso de "Mi cuenta" (patrón Facade/Store).
 *
 * Centraliza los datos del usuario (citas, mascotas, vacunas, historial e
 * imágenes) para que los subcomponentes solo se ocupen de mostrarlos. Se
 * provee a nivel de la página (`providers: [ProfileStore]`): cada visita
 * tiene su propia instancia y se destruye con la página.
 */
@Injectable()
export class ProfileStore {
  private readonly appointmentApi = inject(AppointmentService);
  private readonly petApi = inject(PetService);
  private readonly petImages = inject(PetImageService);
  private readonly flow = inject(DiagnosisFlowService);

  // ── Estado ─────────────────────────────────────────────────────────────
  readonly appointments = signal<Appointment[]>([]);
  readonly isLoadingAppointments = signal(false);

  readonly pets = signal<Pet[]>([]);
  readonly isLoadingPets = signal(false);
  readonly expandedPetId = signal<number | null>(null);
  readonly vaccinations = signal<Partial<Record<number, Vaccination[]>>>({});
  readonly histories = signal<Partial<Record<number, DiagnosisHistoryEntry[]>>>({});
  readonly loadingHistoryFor = signal<number | null>(null);
  readonly images = signal<Partial<Record<number, string>>>({});

  /** Peor estado de vacunación por mascota (insignia en la cabecera de la tarjeta). */
  readonly vaccinationBadges = computed(() => {
    const badges: Partial<Record<number, VaccinationStatus | null>> = {};
    for (const [id, list = []] of Object.entries(this.vaccinations())) {
      const statuses = list.map(vaccinationStatus);
      badges[+id] = statuses.includes('vencida') ? 'vencida' : statuses.includes('proxima') ? 'proxima' : null;
    }
    return badges;
  });

  // ── Carga ──────────────────────────────────────────────────────────────
  loadAll(): void {
    this.loadAppointments();
    this.loadPets();
  }

  reset(): void {
    this.appointments.set([]);
    this.pets.set([]);
    this.images.set({});
    this.vaccinations.set({});
    this.histories.set({});
    this.expandedPetId.set(null);
  }

  loadAppointments(): void {
    this.isLoadingAppointments.set(true);
    this.appointmentApi.getMyAppointments().subscribe({
      next: (list) => {
        this.appointments.set(list);
        this.isLoadingAppointments.set(false);
      },
      error: () => this.isLoadingAppointments.set(false),
    });
  }

  loadPets(): void {
    this.isLoadingPets.set(true);
    this.petApi.getPets().subscribe({
      next: (pets) => {
        this.pets.set(pets);
        this.isLoadingPets.set(false);
        this.syncWithPets(pets);
        // Se cargan de una vez (no solo al expandir) para mostrar el aviso
        // de vacuna vencida/próxima en la cabecera de cada mascota.
        pets.forEach((pet) => this.loadVaccinations(pet.id));
        void this.loadImages(pets);
      },
      error: () => this.isLoadingPets.set(false),
    });
  }

  loadVaccinations(petId: number): void {
    this.petApi.getVaccinations(petId).subscribe({
      next: (list) => this.vaccinations.update((v) => ({ ...v, [petId]: list })),
    });
  }

  togglePet(petId: number): void {
    if (this.expandedPetId() === petId) {
      this.expandedPetId.set(null);
      return;
    }
    this.expandedPetId.set(petId);
    // Siempre se pide de nuevo: puede haber diagnósticos nuevos.
    this.loadHistory(petId);
  }

  onImageError(pet: Pet): void {
    this.images.update((imgs) => ({ ...imgs, [pet.id]: this.petImages.fallbackFor(pet) }));
  }

  // ── Comandos (devuelven el Observable para que la vista maneje el error) ──
  createPet(body: PetBody): Observable<Pet> {
    return this.afterSuccess(this.petApi.createPet(body), () => this.loadPets());
  }

  updatePet(petId: number, body: PetBody): Observable<Pet> {
    return this.afterSuccess(this.petApi.updatePet(petId, body), () => this.loadPets());
  }

  deletePet(pet: Pet): Observable<unknown> {
    return this.afterSuccess(this.petApi.deletePet(pet.id), () => {
      // Un diagnóstico en curso para esta mascota ya no puede asociarse a ella.
      if (this.flow.state?.petId === pet.id) this.flow.clear();
      // Se vuelve a pedir la lista para mostrar exactamente lo guardado.
      this.loadPets();
    });
  }

  createVaccination(petId: number, body: VaccinationBody): Observable<Vaccination> {
    return this.afterSuccess(this.petApi.createVaccination(petId, body), () => this.loadVaccinations(petId));
  }

  deleteVaccination(petId: number, vaccinationId: number): Observable<unknown> {
    return this.afterSuccess(this.petApi.deleteVaccination(petId, vaccinationId), () =>
      this.loadVaccinations(petId),
    );
  }

  // ── Internos ───────────────────────────────────────────────────────────
  private loadHistory(petId: number): void {
    this.loadingHistoryFor.set(petId);
    this.petApi.getDiagnoses(petId).subscribe({
      next: (entries) => {
        this.histories.update((h) => ({ ...h, [petId]: entries }));
        this.loadingHistoryFor.set(null);
      },
      error: () => this.loadingHistoryFor.set(null),
    });
  }

  /** Todo lo indexado por id de mascota se rehace con las mascotas reales. */
  private syncWithPets(pets: Pet[]): void {
    const ids = new Set(pets.map((p) => p.id));
    this.vaccinations.update((v) => Object.fromEntries(Object.entries(v).filter(([id]) => ids.has(+id))));
    this.histories.set({});
    this.images.set({});
    const expanded = this.expandedPetId();
    if (expanded !== null && !ids.has(expanded)) this.expandedPetId.set(null);
    else if (expanded !== null) this.loadHistory(expanded);
  }

  private async loadImages(pets: Pet[]): Promise<void> {
    for (const pet of pets) {
      const url = await this.petImages.imageFor(pet);
      this.images.update((imgs) => ({ ...imgs, [pet.id]: url }));
    }
  }

  /** Ejecuta `effect` cuando la petición termina bien, sin alterar el flujo. */
  private afterSuccess<T>(source: Observable<T>, effect: () => void): Observable<T> {
    return source.pipe(tap({ complete: effect }));
  }
}
