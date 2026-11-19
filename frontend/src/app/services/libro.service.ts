import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Libro } from '../models/libro.model';

@Injectable({
  providedIn: 'root'
})
export class LibroService {
  private http = inject(HttpClient);
  private apiUrl = 'http://127.0.0.1:5000/libros';

  /**
   * GET /libros
   * Permite filtrar opcionalmente por autor_id y por texto de búsqueda (título o género).
   */
  getLibros(autorId?: number, busqueda?: string): Observable<Libro[]> {
    let params = new HttpParams();

    if (autorId) {
      params = params.set('autor_id', autorId.toString());
    }

    if (busqueda && busqueda.trim()) {
      params = params.set('busqueda', busqueda.trim());
    }

    return this.http.get<Libro[]>(this.apiUrl, { params });
  }

  // GET /libros/:id -> Ver detalle de un libro
  getLibroById(id: number): Observable<Libro> {
    return this.http.get<Libro>(`${this.apiUrl}/${id}`);
  }

  // POST /libros -> Crear libro nuevo
  crearLibro(libro: Libro): Observable<any> {
    return this.http.post<any>(this.apiUrl, libro);
  }

  // PUT /libros/:id -> Actualizar libro existente
  actualizarLibro(id: number, libro: Libro): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, libro);
  }

  // DELETE /libros/:id -> Eliminar libro
  eliminarLibro(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }
}
