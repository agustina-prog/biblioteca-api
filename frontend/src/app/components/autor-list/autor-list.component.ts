import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AutorService } from '../../services/autor.service';
import { Autor } from '../../models/autor.model';

@Component({
  selector: 'app-autor-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './autor-list.component.html',
  styleUrl: './autor-list.component.css'
})
export class AutorListComponent implements OnInit {
  private autorService = inject(AutorService);

  autores: Autor[] = [];
  cargando: boolean = true;
  error: string | null = null;
  mensajeExito: string | null = null;

  // Modelo para el formulario de nuevo autor
  nuevoAutor: Autor = {
    nombre: '',
    nacionalidad: ''
  };
  guardando: boolean = false;

  ngOnInit(): void {
    this.cargarAutores();
  }

  cargarAutores(): void {
    this.cargando = true;
    this.error = null;

    this.autorService.getAutores().subscribe({
      next: (data) => {
        this.autores = data;
        this.cargando = false;
      },
      error: (err) => {
        this.error = 'No se pudo cargar la lista de autores desde el servidor.';
        this.cargando = false;
        console.error(err);
      }
    });
  }

  crearAutor(): void {
    if (!this.nuevoAutor.nombre.trim() || !this.nuevoAutor.nacionalidad.trim()) {
      this.error = 'Por favor completá el nombre y la nacionalidad del autor.';
      return;
    }

    this.guardando = true;
    this.error = null;

    this.autorService.crearAutor(this.nuevoAutor).subscribe({
      next: (resp) => {
        this.mensajeExito = `El autor "${this.nuevoAutor.nombre}" fue registrado con éxito.`;
        this.nuevoAutor = { nombre: '', nacionalidad: '' };
        this.guardando = false;
        this.cargarAutores();
        setTimeout(() => this.mensajeExito = null, 4000);
      },
      error: (err) => {
        this.error = err.error?.error || 'Error al intentar crear el autor.';
        this.guardando = false;
        console.error(err);
      }
    });
  }

  eliminarAutor(id: number, nombre: string): void {
    const confirmar = confirm(`¿Estás seguro de que querés eliminar al autor "${nombre}"?`);
    if (!confirmar) return;

    this.error = null;
    this.mensajeExito = null;

    this.autorService.eliminarAutor(id).subscribe({
      next: () => {
        this.mensajeExito = `El autor "${nombre}" fue eliminado correctamente.`;
        this.cargarAutores();
        setTimeout(() => this.mensajeExito = null, 4000);
      },
      error: (err) => {
        // Aquí se captura el código 400 si el autor tiene libros asociados en la BD
        this.error = err.error?.error || 'No se pudo eliminar el autor.';
        console.error(err);
      }
    });
  }
}
