/**
 * Modelo que representa un Libro.
 * Coincide exactamente con la tabla 'libros' de SQLite en Flask.
 */
export interface Libro {
  id?: number;               // Opcional al crear, obligatorio al recibir de la API
  titulo: string;
  genero: string;
  anio_publicacion: number;
  disponible: boolean;
  autor_id: number;          // Clave foránea que relaciona el libro con un autor
  autor_nombre?: string;     // Viene del INNER JOIN en Flask para mostrarlo fácil en pantalla
}
