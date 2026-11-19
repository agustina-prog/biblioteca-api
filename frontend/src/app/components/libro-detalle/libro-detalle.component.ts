import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { LibroService } from '../../services/libro.service';
import { Libro } from '../../models/libro.model';

@Component({
  selector: 'app-libro-detalle',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './libro-detalle.component.html',
  styleUrl: './libro-detalle.component.css'
})
export class LibroDetalleComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private libroService = inject(LibroService);

  libro: Libro | null = null;
  cargando: boolean = true;
  error: string | null = null;

  ngOnInit(): void {
    // Obtenemos el parámetro 'id' de la URL (/libros/:id)
    const idParam = this.route.snapshot.paramMap.get('id');
    const id = Number(idParam);

    if (isNaN(id) || id <= 0) {
      this.error = 'El ID de libro proporcionado no es válido.';
      this.cargando = false;
      return;
    }

    this.cargarDetalle(id);
  }

  cargarDetalle(id: number): void {
    this.cargando = true;
    this.libroService.getLibroById(id).subscribe({
      next: (data) => {
        this.libro = data;
        this.cargando = false;
      },
      error: (err) => {
        this.error = 'No se encontró el libro solicitado o el servidor no respondió.';
        this.cargando = false;
        console.error('Error al cargar detalle:', err);
      }
    });
  }

  eliminarLibro(): void {
    if (!this.libro || !this.libro.id) return;

    const confirmar = confirm(`¿Estás seguro de que querés eliminar "${this.libro.titulo}"?`);
    if (!confirmar) return;

    this.libroService.eliminarLibro(this.libro.id).subscribe({
      next: () => {
        alert('Libro eliminado correctamente.');
        this.router.navigate(['/libros']);
      },
      error: (err) => {
        alert('Error al intentar eliminar el libro.');
        console.error(err);
      }
    });
  }
}
