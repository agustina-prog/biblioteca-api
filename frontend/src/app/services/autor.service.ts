import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Autor } from '../models/autor.model';

@Injectable({
  providedIn: 'root'
})
export class AutorService {
  private http = inject(HttpClient);
  private apiUrl = 'http://127.0.0.1:5000/autores';

  // GET /autores -> Listar todos los autores
  getAutores(): Observable<Autor[]> {
    return this.http.get<Autor[]>(this.apiUrl);
  }

  // GET /autores/:id -> Obtener un autor por ID
  getAutorById(id: number): Observable<Autor> {
    return this.http.get<Autor>(`${this.apiUrl}/${id}`);
  }

  // POST /autores -> Crear un autor nuevo
  crearAutor(autor: Autor): Observable<any> {
    return this.http.post<any>(this.apiUrl, autor);
  }

  // PUT /autores/:id -> Actualizar un autor existente
  actualizarAutor(id: number, autor: Autor): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, autor);
  }

  // DELETE /autores/:id -> Eliminar un autor
  eliminarAutor(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }
}
