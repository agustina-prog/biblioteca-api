import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { LibroService } from '../../services/libro.service';
import { AutorService } from '../../services/autor.service';
import { Autor } from '../../models/autor.model';
import { Libro } from '../../models/libro.model';

@Component({
  selector: 'app-libro-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './libro-form.component.html',
  styleUrl: './libro-form.component.css'
})
export class LibroFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private libroService = inject(LibroService);
  private autorService = inject(AutorService);

  // Formulario reactivo
  libroForm!: FormGroup;

  // Lista de autores cargados desde la API para el <select>
  autores: Autor[] = [];

  // Bandera para saber si estamos creando (/libros/nuevo) o editando (/libros/editar/:id)
  esModoEdicion: boolean = false;
  libroId: number | null = null;

  // Estados visuales
  cargando: boolean = false;
  guardando: boolean = false;
  error: string | null = null;
  mensajeExito: string | null = null;

  ngOnInit(): void {
    this.inicializarFormulario();
    this.cargarAutores();

    // Verificamos si en la URL viene un parámetro 'id' (modo edición)
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.esModoEdicion = true;
      this.libroId = Number(idParam);
      this.cargarDatosLibro(this.libroId);
    }
  }

  /**
   * Crea la estructura del formulario reactivo con sus validaciones.
   */
  private inicializarFormulario(): void {
    const anioActual = new Date().getFullYear();

    this.libroForm = this.fb.group({
      titulo: ['', [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(150)
      ]],
      genero: ['', [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(50)
      ]],
      anio_publicacion: [anioActual, [
        Validators.required,
        Validators.min(1000),
        Validators.max(anioActual + 1)
      ]],
      autor_id: [null, [
        Validators.required
      ]],
      disponible: [true]
    });
  }

  /**
   * Consulta a Flask la lista de autores para poblar el <select> dinámicamente.
   */
  private cargarAutores(): void {
    this.autorService.getAutores().subscribe({
      next: (data) => {
        this.autores = data;
      },
      error: (err) => {
        this.error = 'No se pudo cargar la lista de autores desde el servidor.';
        console.error(err);
      }
    });
  }

  /**
   * Si estamos en modo edición, carga los datos del libro existente y los pasa al formulario.
   */
  private cargarDatosLibro(id: number): void {
    this.cargando = true;
    this.libroService.getLibroById(id).subscribe({
      next: (libro) => {
        // patchValue rellena los campos del formulario con los datos recibidos
        this.libroForm.patchValue({
          titulo: libro.titulo,
          genero: libro.genero,
          anio_publicacion: libro.anio_publicacion,
          autor_id: libro.autor_id,
          disponible: libro.disponible
        });
        this.cargando = false;
      },
      error: (err) => {
        this.error = 'No se pudo cargar la información del libro para editar.';
        this.cargando = false;
        console.error(err);
      }
    });
  }

  /**
   * Helper para saber si un campo del formulario es inválido y ya fue tocado por el usuario.
   */
  campoInvalido(nombreCampo: string): boolean {
    const control = this.libroForm.get(nombreCampo);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  /**
   * Se ejecuta al hacer clic en "Guardar Libro".
   */
  guardar(): void {
    // Si el formulario tiene campos inválidos, avisamos claramente al usuario
    if (this.libroForm.invalid) {
      this.libroForm.markAllAsTouched();
      this.error = 'Por favor completá todos los campos obligatorios marcados en rojo antes de guardar.';
      return;
    }

    this.guardando = true;
    this.error = null;
    this.mensajeExito = null;

    // Preparamos el objeto Libro convirtiendo valores numéricos si hace falta
    const valoresForm = this.libroForm.value;
    const libroAEnviar: Libro = {
      titulo: valoresForm.titulo.trim(),
      genero: valoresForm.genero.trim(),
      anio_publicacion: Number(valoresForm.anio_publicacion),
      autor_id: Number(valoresForm.autor_id),
      disponible: Boolean(valoresForm.disponible)
    };

    if (this.esModoEdicion && this.libroId) {
      // MODO EDICIÓN -> PUT /libros/:id
      this.libroService.actualizarLibro(this.libroId, libroAEnviar).subscribe({
        next: () => {
          this.mensajeExito = '¡Libro actualizado correctamente!';
          this.guardando = false;
          // Redirigimos al catálogo tras 1.2 segundos para que el usuario lea el éxito
          setTimeout(() => this.router.navigate(['/libros']), 1200);
        },
        error: (err) => {
          this.error = err.error?.error || 'Ocurrió un error al intentar actualizar el libro.';
          this.guardando = false;
          console.error(err);
        }
      });
    } else {
      // MODO CREACIÓN -> POST /libros
      this.libroService.crearLibro(libroAEnviar).subscribe({
        next: () => {
          this.mensajeExito = '¡Libro registrado exitosamente en la biblioteca!';
          this.guardando = false;
          setTimeout(() => this.router.navigate(['/libros']), 1200);
        },
        error: (err) => {
          this.error = err.error?.error || 'Ocurrió un error al intentar guardar el libro.';
          this.guardando = false;
          console.error(err);
        }
      });
    }
  }
}
