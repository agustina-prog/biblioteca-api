import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { LibroService } from '../../services/libro.service';
import { AutorService } from '../../services/autor.service';
import { Libro } from '../../models/libro.model';
import { Autor } from '../../models/autor.model';

@Component({
  selector: 'app-libro-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './libro-list.component.html',
  styleUrl: './libro-list.component.css'
})
export class LibroListComponent implements OnInit {
  private libroService = inject(LibroService);
  private autorService = inject(AutorService);

  // Datos
  libros: Libro[] = [];
  autores: Autor[] = [];

  // Filtros
  filtroAutorId: number | undefined = undefined;
  filtroBusqueda: string = '';

  // Estados visuales de la vista
  cargando: boolean = true;
  error: string | null = null;
  mensajeExito: string | null = null;

  ngOnInit(): void {
    this.cargarAutores();
    this.cargarLibros();
  }

  // Carga el listado de autores para llenar el <select> del filtro
  cargarAutores(): void {
    this.autorService.getAutores().subscribe({
      next: (data) => {
        this.autores = data;
      },
      error: (err) => {
        console.error('Error al cargar autores:', err);
      }
    });
  }

  // Carga los libros aplicando los filtros actuales si existen
  cargarLibros(): void {
    this.cargando = true;
    this.error = null;

    this.libroService.getLibros(this.filtroAutorId, this.filtroBusqueda).subscribe({
      next: (data) => {
        this.libros = data;
        this.cargando = false;
      },
      error: (err) => {
        this.error = 'No se pudo conectar con el servidor. Verificá que el backend Flask esté iniciado en http://127.0.0.1:5000';
        this.cargando = false;
        console.error('Error al cargar libros:', err);
      }
    });
  }

  // Se ejecuta al presionar "Filtrar" o presionar Enter en la búsqueda
  aplicarFiltros(): void {
    this.cargarLibros();
  }

  // Limpia los campos de filtro y recarga la lista completa
  limpiarFiltros(): void {
    this.filtroAutorId = undefined;
    this.filtroBusqueda = '';
    this.cargarLibros();
  }

  // Elimina un libro previa confirmación del usuario
  eliminarLibro(id: number, titulo: string): void {
    const confirmar = confirm(`¿Estás seguro de que querés eliminar el libro "${titulo}"?`);
    if (!confirmar) return;

    this.libroService.eliminarLibro(id).subscribe({
      next: () => {
        this.mensajeExito = `El libro "${titulo}" fue eliminado correctamente.`;
        // Ocultamos el mensaje de éxito después de 4 segundos
        setTimeout(() => this.mensajeExito = null, 4000);
        // Recargamos el listado
        this.cargarLibros();
      },
      error: (err) => {
        this.error = 'No se pudo eliminar el libro. Ocurrió un error en el servidor.';
        console.error('Error al eliminar libro:', err);
      }
    });
  }
}
