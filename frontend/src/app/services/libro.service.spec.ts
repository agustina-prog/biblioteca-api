// Test unitario del LibroService — API Vitest (Angular 22)
// Verifica que el servicio llama a las URLs correctas del backend

import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { expect, describe, it, beforeEach, afterEach } from 'vitest';

import { LibroService } from './libro.service';
import { Libro } from '../models/libro.model';

describe('LibroService', () => {
  let servicio: LibroService;
  let controladorHttp: HttpTestingController;

  const URL_BASE = 'http://127.0.0.1:5000';

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        LibroService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });
    servicio = TestBed.inject(LibroService);
    controladorHttp = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    controladorHttp.verify();
  });

  // Test 1: el servicio se crea correctamente
  it('debería crearse correctamente', () => {
    expect(servicio).toBeTruthy();
  });

  // Test 2: getLibros() llama a la URL correcta y devuelve la lista
  it('debería obtener la lista de libros desde el backend', () => {
    const librosFalsos: Libro[] = [
      { id: 1, titulo: 'Cien años de soledad', genero: 'Ficción', anio_publicacion: 1967, disponible: true, autor_id: 1 },
      { id: 2, titulo: 'El Aleph', genero: 'Ficción', anio_publicacion: 1949, disponible: true, autor_id: 2 }
    ];

    servicio.getLibros().subscribe(libros => {
      expect(libros.length).toBe(2);
      expect(libros[0].titulo).toBe('Cien años de soledad');
    });

    // Sin filtros, la URL es exactamente /libros (sin query params)
    const peticion = controladorHttp.expectOne(`${URL_BASE}/libros`);
    expect(peticion.request.method).toBe('GET');
    peticion.flush(librosFalsos);
  });

  // Test 3: getLibroById(id) llama a la URL con el ID correcto
  it('debería obtener un libro por su ID', () => {
    const libroFalso: Libro = {
      id: 1, titulo: 'Cien años de soledad', genero: 'Ficción',
      anio_publicacion: 1967, disponible: true, autor_id: 1
    };

    servicio.getLibroById(1).subscribe(libro => {
      expect(libro.titulo).toBe('Cien años de soledad');
    });

    const peticion = controladorHttp.expectOne(`${URL_BASE}/libros/1`);
    expect(peticion.request.method).toBe('GET');
    peticion.flush(libroFalso);
  });
});
