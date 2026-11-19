import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private http = inject(HttpClient);
  private apiUrl = 'http://127.0.0.1:5000/chat';

  /**
   * Envía la consulta del usuario a Flask para que Gemini la procese
   * con el contexto real de SQLite.
   */
  enviarMensaje(mensaje: string): Observable<{ respuesta: string }> {
    return this.http.post<{ respuesta: string }>(this.apiUrl, { mensaje });
  }
}
