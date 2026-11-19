// Test unitario del AutorService
// Verifica que el servicio obtiene autores correctamente del backend

import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';

import { AutorService } from './autor.service';
import { Autor } from '../models/autor.model';

describe('AutorService', () => {
  let servicio: AutorService;
  let controladorHttp: HttpTestingController;

  const URL_BASE = 'http://127.0.0.1:5000';

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        AutorService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });

    servicio = TestBed.inject(AutorService);
    controladorHttp = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    controladorHttp.verify();
  });

  // Test 1: el servicio se crea correctamente
  it('debería crearse correctamente', () => {
    expect(servicio).toBeTruthy();
  });

  // Test 2: getAutores() devuelve una lista de autores
  it('debería obtener la lista de autores desde el backend', () => {
    // Simulamos la respuesta del backend con 2 autores
    const autoresFalsos: Autor[] = [
      { id: 1, nombre: 'Gabriel García Márquez', nacionalidad: 'Colombiano' },
      { id: 2, nombre: 'Jorge Luis Borges', nacionalidad: 'Argentino' }
    ];

    servicio.getAutores().subscribe(autores => {
      // Verificamos que llegan 2 autores
      expect(autores.length).toBe(2);
      // Verificamos el nombre del segundo autor
      expect(autores[1].nombre).toBe('Jorge Luis Borges');
    });

    // Interceptamos la petición y la respondemos con datos falsos
    const peticion = controladorHttp.expectOne(`${URL_BASE}/autores`);
    expect(peticion.request.method).toBe('GET');
    peticion.flush(autoresFalsos);
  });

  // Test 3: crearAutor() hace un POST al backend con los datos correctos
  it('debería crear un nuevo autor con POST', () => {
    const nuevoAutor: Autor = { nombre: 'Julio Cortázar', nacionalidad: 'Argentino' };
    const respuestaBackend: Autor = { id: 3, nombre: 'Julio Cortázar', nacionalidad: 'Argentino' };

    servicio.crearAutor(nuevoAutor).subscribe(autor => {
      // El backend devuelve el autor con el ID asignado
      expect(autor.id).toBe(3);
      expect(autor.nombre).toBe('Julio Cortázar');
    });

    const peticion = controladorHttp.expectOne(`${URL_BASE}/autores`);
    expect(peticion.request.method).toBe('POST');
    // Verificamos que el cuerpo del POST tiene los datos del autor
    expect(peticion.request.body).toEqual(nuevoAutor);
    peticion.flush(respuestaBackend);
  });
});
