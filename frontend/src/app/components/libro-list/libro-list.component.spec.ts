// Test unitario del LibroListComponent
// Verifica que el componente se crea y funciona correctamente
// Usamos spies (dobles de prueba) para no hacer llamadas HTTP reales

import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';

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

  // "Spies": versiones falsas de los servicios que devuelven datos fijos
  // Así el test no depende del backend real
  let libroServiceSpy: jasmine.SpyObj<LibroService>;
  let autorServiceSpy: jasmine.SpyObj<AutorService>;

  beforeEach(async () => {
    // Creamos los spies con los métodos que usa el componente
    libroServiceSpy = jasmine.createSpyObj('LibroService', ['getLibros', 'eliminarLibro']);
    autorServiceSpy = jasmine.createSpyObj('AutorService', ['getAutores']);

    // Configuramos qué devuelven cuando se los llama
    // of() crea un Observable que emite el valor inmediatamente (como si fuera HTTP exitoso)
    libroServiceSpy.getLibros.and.returnValue(of(librosFalsos));
    autorServiceSpy.getAutores.and.returnValue(of(autoresFalsos));

    await TestBed.configureTestingModule({
      imports: [LibroListComponent],
      providers: [
        // Proveemos los spies en lugar de los servicios reales
        { provide: LibroService, useValue: libroServiceSpy },
        { provide: AutorService, useValue: autorServiceSpy },
        // Para que RouterLink y routerNavigate funcionen en los tests
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
    expect(libroServiceSpy.getLibros).toHaveBeenCalled();
    expect(autorServiceSpy.getAutores).toHaveBeenCalled();

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

    // Verificamos que se volvió a llamar a getLibros (2 veces: ngOnInit + limpiarFiltros)
    expect(libroServiceSpy.getLibros).toHaveBeenCalledTimes(2);
  });
});
