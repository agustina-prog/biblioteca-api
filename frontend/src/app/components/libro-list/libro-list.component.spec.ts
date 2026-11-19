// Test unitario del LibroListComponent — API Vitest (Angular 22)
// Usa spies para no hacer llamadas HTTP reales al backend

import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { expect, describe, it, beforeEach, vi } from 'vitest';

import { LibroListComponent } from './libro-list.component';
import { LibroService } from '../../services/libro.service';
import { AutorService } from '../../services/autor.service';
import { Libro } from '../../models/libro.model';
import { Autor } from '../../models/autor.model';

describe('LibroListComponent', () => {

  // Datos de prueba
  const librosFalsos: Libro[] = [
    { id: 1, titulo: 'Cien años de soledad', genero: 'Ficción', anio_publicacion: 1967, disponible: true, autor_id: 1 }
  ];
  const autoresFalsos: Autor[] = [
    { id: 1, nombre: 'Gabriel García Márquez', nacionalidad: 'Colombiano' }
  ];

  // Servicios falsos: en lugar de hacer HTTP real, devuelven datos fijos con of()
  const libroServiceFalso = {
    getLibros: vi.fn().mockReturnValue(of(librosFalsos)),
    eliminarLibro: vi.fn().mockReturnValue(of({}))
  };
  const autorServiceFalso = {
    getAutores: vi.fn().mockReturnValue(of(autoresFalsos))
  };

  beforeEach(async () => {
    // Reiniciamos los contadores de llamada antes de cada test
    libroServiceFalso.getLibros.mockClear();
    autorServiceFalso.getAutores.mockClear();

    await TestBed.configureTestingModule({
      imports: [LibroListComponent],
      providers: [
        // Proveemos los servicios falsos en lugar de los reales
        { provide: LibroService, useValue: libroServiceFalso },
        { provide: AutorService, useValue: autorServiceFalso },
        // Necesario para que RouterLink funcione en el componente
        provideRouter([])
      ]
    }).compileComponents();
  });

  // Test 1: el componente se crea sin errores
  it('debería crearse correctamente', () => {
    const fixture = TestBed.createComponent(LibroListComponent);
    const componente = fixture.componentInstance;
    expect(componente).toBeTruthy();
  });

  // Test 2: al iniciar, carga los libros y los autores desde el servicio
  it('debería cargar libros y autores al inicializar', () => {
    const fixture = TestBed.createComponent(LibroListComponent);
    fixture.detectChanges(); // Dispara el ngOnInit

    const componente = fixture.componentInstance;

    // Verificamos que los servicios fueron llamados
    expect(libroServiceFalso.getLibros).toHaveBeenCalled();
    expect(autorServiceFalso.getAutores).toHaveBeenCalled();

    // Verificamos que los datos se guardaron en el componente
    expect(componente.libros.length).toBe(1);
    expect(componente.autores.length).toBe(1);
    expect(componente.libros[0].titulo).toBe('Cien años de soledad');
  });

  // Test 3: limpiarFiltros() resetea los valores correctamente
  it('debería limpiar los filtros y recargar los libros', () => {
    const fixture = TestBed.createComponent(LibroListComponent);
    fixture.detectChanges();

    const componente = fixture.componentInstance;

    // Simulamos que el usuario aplicó filtros
    componente.filtroBusqueda = 'Algo';
    componente.filtroAutorId = 1;

    // Limpiamos los filtros
    componente.limpiarFiltros();

    // Verificamos que los filtros se borraron
    expect(componente.filtroBusqueda).toBe('');
    expect(componente.filtroAutorId).toBeUndefined();

    // ngOnInit + limpiarFiltros = 2 llamadas a getLibros
    expect(libroServiceFalso.getLibros).toHaveBeenCalledTimes(2);
  });
});
