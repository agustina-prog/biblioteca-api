// Test unitario del LibroService
// Verifica que el servicio llama a las URLs correctas del backend

import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';

import { LibroService } from './libro.service';
import { Libro } from '../models/libro.model';

describe('LibroService', () => {
  let servicio: LibroService;
  let controladorHttp: HttpTestingController;

  // URL base del backend
  const URL_BASE = 'http://127.0.0.1:5000';

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        LibroService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });

    // Obtenemos el servicio y el controlador de HTTP falso
    servicio = TestBed.inject(LibroService);
    controladorHttp = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    // Verificamos que no haya peticiones HTTP sin resolver
    controladorHttp.verify();
  });

  // Test 1: el servicio se crea correctamente
  it('debería crearse correctamente', () => {
    expect(servicio).toBeTruthy();
  });

  // Test 2: getLibros() llama a la URL correcta y devuelve la lista
  it('debería obtener la lista de libros desde el backend', () => {
    // Datos de ejemplo que simula la respuesta del backend
    const librosFalsos: Libro[] = [
      { id: 1, titulo: 'Cien años de soledad', genero: 'Ficción', anio_publicacion: 1967, disponible: true, autor_id: 1 },
      { id: 2, titulo: 'El Aleph', genero: 'Ficción', anio_publicacion: 1949, disponible: true, autor_id: 2 }
    ];

    // Llamamos al método que queremos probar
    servicio.getLibros().subscribe(libros => {
      // Verificamos que devuelve 2 libros
      expect(libros.length).toBe(2);
      // Verificamos que el primer libro tiene el título correcto
      expect(libros[0].titulo).toBe('Cien años de soledad');
    });

    // Interceptamos la petición HTTP y respondemos con datos falsos
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
