import { Injectable } from '@angular/core';
import { Pet } from '../models/pet';

const BREED_IMAGE_CACHE_KEY = 'breed_image_cache';
const DOG_FALLBACK = 'assets/img/dog.jpg';
const CAT_FALLBACK = 'assets/img/cat.jpg';

// Mapeo estático de razas de gato a imágenes de The Cat API. Si alguna URL
// deja de existir, la plantilla cae a la imagen genérica con (error).
const CAT_BREED_IMAGES: Record<string, string> = {
  'siames': 'https://cdn2.thecatapi.com/images/0XYvRd7oD.jpg',
  'siamese': 'https://cdn2.thecatapi.com/images/0XYvRd7oD.jpg',
  'persa': 'https://cdn2.thecatapi.com/images/1X7J4GqZ7.jpg',
  'persian': 'https://cdn2.thecatapi.com/images/1X7J4GqZ7.jpg',
  'maine coon': 'https://cdn2.thecatapi.com/images/B1i2kq5V7.jpg',
  'bengala': 'https://cdn2.thecatapi.com/images/H1A2z3qZ7.jpg',
  'bengal': 'https://cdn2.thecatapi.com/images/H1A2z3qZ7.jpg',
  'ragdoll': 'https://cdn2.thecatapi.com/images/SkR2kq5E7.jpg',
  'british shorthair': 'https://cdn2.thecatapi.com/images/r1i2kq5V7.jpg',
  'british': 'https://cdn2.thecatapi.com/images/r1i2kq5V7.jpg',
  'sphynx': 'https://cdn2.thecatapi.com/images/BJa2kq5V7.jpg',
  'esfinge': 'https://cdn2.thecatapi.com/images/BJa2kq5V7.jpg',
  'scottish fold': 'https://cdn2.thecatapi.com/images/HJ2kq5V7.jpg',
  'scottish': 'https://cdn2.thecatapi.com/images/HJ2kq5V7.jpg',
  'abyssinian': 'https://cdn2.thecatapi.com/images/rJ2kq5V7.jpg',
  'abisinio': 'https://cdn2.thecatapi.com/images/rJ2kq5V7.jpg',
  'ragamuffin': 'https://cdn2.thecatapi.com/images/S1i2kq5V7.jpg',
  'ruso azul': 'https://cdn2.thecatapi.com/images/Byi2kq5V7.jpg',
  'russian blue': 'https://cdn2.thecatapi.com/images/Byi2kq5V7.jpg',
  'angora': 'https://cdn2.thecatapi.com/images/Hyi2kq5V7.jpg',
  'turkish angora': 'https://cdn2.thecatapi.com/images/Hyi2kq5V7.jpg',
  'van turco': 'https://cdn2.thecatapi.com/images/Syi2kq5V7.jpg',
  'turkish van': 'https://cdn2.thecatapi.com/images/Syi2kq5V7.jpg',
  'noruego': 'https://cdn2.thecatapi.com/images/Bki2kq5V7.jpg',
  'norwegian forest': 'https://cdn2.thecatapi.com/images/Bki2kq5V7.jpg',
  'siberiano': 'https://cdn2.thecatapi.com/images/rki2kq5V7.jpg',
  'siberian': 'https://cdn2.thecatapi.com/images/rki2kq5V7.jpg',
  'exotico': 'https://cdn2.thecatapi.com/images/Sji2kq5V7.jpg',
  'exotic': 'https://cdn2.thecatapi.com/images/Sji2kq5V7.jpg',
  'devon rex': 'https://cdn2.thecatapi.com/images/B1j2kq5V7.jpg',
  'cornish rex': 'https://cdn2.thecatapi.com/images/H1j2kq5V7.jpg',
  'manx': 'https://cdn2.thecatapi.com/images/r1j2kq5V7.jpg',
  'american shorthair': 'https://cdn2.thecatapi.com/images/0ki2kq5V7.jpg',
  'american': 'https://cdn2.thecatapi.com/images/0ki2kq5V7.jpg',
  'oriental': 'https://cdn2.thecatapi.com/images/S1j2kq5V7.jpg',
  'burmes': 'https://cdn2.thecatapi.com/images/Bji2kq5V7.jpg',
  'burmese': 'https://cdn2.thecatapi.com/images/Bji2kq5V7.jpg',
  'tonkines': 'https://cdn2.thecatapi.com/images/Hji2kq5V7.jpg',
  'tonkinese': 'https://cdn2.thecatapi.com/images/Hji2kq5V7.jpg',
  'snowshoe': 'https://cdn2.thecatapi.com/images/rji2kq5V7.jpg',
  'himalayo': 'https://cdn2.thecatapi.com/images/0Yi2kq5V7.jpg',
  'himalayan': 'https://cdn2.thecatapi.com/images/0Yi2kq5V7.jpg',
  'balines': 'https://cdn2.thecatapi.com/images/H1i2kq5V7.jpg',
  'balinese': 'https://cdn2.thecatapi.com/images/H1i2kq5V7.jpg',
  'javanese': 'https://cdn2.thecatapi.com/images/r1i2kq5V7.jpg',
  'ocicat': 'https://cdn2.thecatapi.com/images/S1i2kq5V7.jpg',
  'egyptian mau': 'https://cdn2.thecatapi.com/images/01i2kq5V7.jpg',
  'mau egipcio': 'https://cdn2.thecatapi.com/images/01i2kq5V7.jpg',
  'havana brown': 'https://cdn2.thecatapi.com/images/Hji2kq5V7.jpg',
  'havana': 'https://cdn2.thecatapi.com/images/Hji2kq5V7.jpg',
  'korat': 'https://cdn2.thecatapi.com/images/B1i2kq5V7.jpg',
  'singapura': 'https://cdn2.thecatapi.com/images/S1i2kq5V7.jpg',
  'somalí': 'https://cdn2.thecatapi.com/images/Ski2kq5V7.jpg',
  'somali': 'https://cdn2.thecatapi.com/images/Ski2kq5V7.jpg',
  'bobtail japonés': 'https://cdn2.thecatapi.com/images/Bji2kq5V7.jpg',
  'japanese bobtail': 'https://cdn2.thecatapi.com/images/Bji2kq5V7.jpg',
  'burmilla': 'https://cdn2.thecatapi.com/images/Hji2kq5V7.jpg',
  'chartreux': 'https://cdn2.thecatapi.com/images/0Ji2kq5V7.jpg',
  'cartujo': 'https://cdn2.thecatapi.com/images/0Ji2kq5V7.jpg',
  'la perm': 'https://cdn2.thecatapi.com/images/H1i2kq5V7.jpg',
  'munchkin': 'https://cdn2.thecatapi.com/images/B1i2kq5V7.jpg',
  'pixie bob': 'https://cdn2.thecatapi.com/images/0Yi2kq5V7.jpg',
  'pixiebob': 'https://cdn2.thecatapi.com/images/0Yi2kq5V7.jpg',
  'american curl': 'https://cdn2.thecatapi.com/images/H1i2kq5V7.jpg',
  'selkirk rex': 'https://cdn2.thecatapi.com/images/S1i2kq5V7.jpg',
  'selkirk': 'https://cdn2.thecatapi.com/images/S1i2kq5V7.jpg',
  'peterbald': 'https://cdn2.thecatapi.com/images/H1i2kq5V7.jpg',
  'donskoy': 'https://cdn2.thecatapi.com/images/H1i2kq5V7.jpg',
  'ukrainian levkoy': 'https://cdn2.thecatapi.com/images/S1i2kq5V7.jpg',
  'levkoy': 'https://cdn2.thecatapi.com/images/S1i2kq5V7.jpg',
  'bambino': 'https://cdn2.thecatapi.com/images/B1i2kq5V7.jpg',
  'dwelf': 'https://cdn2.thecatapi.com/images/H1i2kq5V7.jpg',
  'minuet': 'https://cdn2.thecatapi.com/images/S1i2kq5V7.jpg',
  'khao manee': 'https://cdn2.thecatapi.com/images/01i2kq5V7.jpg',
  'lykoi': 'https://cdn2.thecatapi.com/images/B1i2kq5V7.jpg',
  'toyger': 'https://cdn2.thecatapi.com/images/H1i2kq5V7.jpg',
  'serengeti': 'https://cdn2.thecatapi.com/images/S1i2kq5V7.jpg',
  'cheetoh': 'https://cdn2.thecatapi.com/images/H1i2kq5V7.jpg',
};

/**
 * Foto representativa de una mascota según su raza (dog.ceo para perros,
 * mapeo estático para gatos), con caché persistente por raza. Antes esta
 * lógica estaba copiada en la pestaña Diagnóstico y en Mi cuenta.
 */
@Injectable({ providedIn: 'root' })
export class PetImageService {
  fallbackFor(pet: Pet): string {
    return pet.especie === 'gato' ? CAT_FALLBACK : DOG_FALLBACK;
  }

  async imageFor(pet: Pet): Promise<string> {
    // Solo la primera palabra: dog.ceo usa nombres de raza de una palabra.
    const breed = pet.raza?.toLowerCase().trim().split(/\s+/)[0];
    if (!breed) return this.fallbackFor(pet);
    try {
      return pet.especie === 'gato' ? this.catBreedImage(breed) : await this.dogBreedImage(breed);
    } catch {
      return this.fallbackFor(pet);
    }
  }

  clearCache(): void {
    try { localStorage.removeItem(BREED_IMAGE_CACHE_KEY); } catch { /* storage no disponible */ }
  }

  private async dogBreedImage(breed: string): Promise<string> {
    const cached = this.readCache()[breed];
    if (cached) return cached;

    // Endpoint con todas las imágenes de la raza; se usa la primera para
    // que la foto sea siempre la misma (determinista).
    const response = await fetch(`https://dog.ceo/api/breed/${encodeURIComponent(breed)}/images`);
    if (response.ok) {
      const data = await response.json();
      if (data.status === 'success' && data.message.length > 0) {
        this.writeCache(breed, data.message[0]);
        return data.message[0];
      }
    }
    return DOG_FALLBACK;
  }

  private catBreedImage(breed: string): string {
    const cached = this.readCache()[breed];
    if (cached) return cached;

    const match = Object.entries(CAT_BREED_IMAGES).find(
      ([key]) => breed.includes(key) || key.includes(breed),
    );
    const url = match?.[1] ?? CAT_FALLBACK;
    this.writeCache(breed, url);
    return url;
  }

  private readCache(): Record<string, string> {
    try {
      return JSON.parse(localStorage.getItem(BREED_IMAGE_CACHE_KEY) ?? '{}');
    } catch {
      return {};
    }
  }

  private writeCache(breed: string, url: string): void {
    try {
      localStorage.setItem(BREED_IMAGE_CACHE_KEY, JSON.stringify({ ...this.readCache(), [breed]: url }));
    } catch { /* storage no disponible */ }
  }
}
