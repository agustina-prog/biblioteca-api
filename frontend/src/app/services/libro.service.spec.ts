// Test unitario del LibroService — Vitest con Angular 22
// Sin imports de globals (describe/it/expect están disponibles automáticamente)

import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';

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

  // Test 2: getLibros() llama a la URL correcta
  it('debería llamar a GET /libros al pedir la lista', () => {
    const librosFalsos: Libro[] = [
      { id: 1, titulo: 'Cien años de soledad', genero: 'Ficción', anio_publicacion: 1967, disponible: true, autor_id: 1 }
    ];

    servicio.getLibros().subscribe(libros => {
      expect(libros.length).toBe(1);
      expect(libros[0].titulo).toBe('Cien años de soledad');
    });

    const peticion = controladorHttp.expectOne(`${URL_BASE}/libros`);
    expect(peticion.request.method).toBe('GET');
    peticion.flush(librosFalsos);
  });

  // Test 3: getLibroById(id) llama a la URL correcta con el ID
  it('debería llamar a GET /libros/1 al pedir un libro por ID', () => {
    const libroFalso: Libro = {
      id: 1, titulo: 'El Aleph', genero: 'Ficción',
      anio_publicacion: 1949, disponible: true, autor_id: 2
    };

    servicio.getLibroById(1).subscribe(libro => {
      expect(libro.titulo).toBe('El Aleph');
    });

    const peticion = controladorHttp.expectOne(`${URL_BASE}/libros/1`);
    expect(peticion.request.method).toBe('GET');
    peticion.flush(libroFalso);
  });
});
