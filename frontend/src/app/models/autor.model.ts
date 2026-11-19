/**
 * Modelo que representa un Autor.
 * Coincide exactamente con la tabla 'autores' de SQLite en Flask.
 */
export interface Autor {
  id?: number; // Opcional al crear uno nuevo, asignado por SQLite
  nombre: string;
  nacionalidad: string;
}
