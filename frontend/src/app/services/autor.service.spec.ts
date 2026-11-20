// Test unitario del AutorService — Vitest con Angular 22
// Sin imports de globals (describe/it/expect están disponibles automáticamente)

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

  // Test 2: getAutores() llama a GET /autores
  it('debería llamar a GET /autores y devolver la lista', () => {
    const autoresFalsos: Autor[] = [
      { id: 1, nombre: 'Gabriel García Márquez', nacionalidad: 'Colombiano' },
      { id: 2, nombre: 'Jorge Luis Borges', nacionalidad: 'Argentino' }
    ];

    servicio.getAutores().subscribe(autores => {
      expect(autores.length).toBe(2);
      expect(autores[1].nombre).toBe('Jorge Luis Borges');
    });

    const peticion = controladorHttp.expectOne(`${URL_BASE}/autores`);
    expect(peticion.request.method).toBe('GET');
    peticion.flush(autoresFalsos);
  });

  // Test 3: crearAutor() hace un POST con los datos correctos
  it('debería llamar a POST /autores con los datos del autor nuevo', () => {
    const nuevoAutor: Autor = { nombre: 'Julio Cortázar', nacionalidad: 'Argentino' };
    const respuestaBackend: Autor = { id: 3, nombre: 'Julio Cortázar', nacionalidad: 'Argentino' };

    servicio.crearAutor(nuevoAutor).subscribe(autor => {
      expect(autor.id).toBe(3);
    });

    const peticion = controladorHttp.expectOne(`${URL_BASE}/autores`);
    expect(peticion.request.method).toBe('POST');
    expect(peticion.request.body).toEqual(nuevoAutor);
    peticion.flush(respuestaBackend);
  });
});
