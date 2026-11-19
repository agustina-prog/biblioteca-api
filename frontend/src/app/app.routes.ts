import { Routes } from '@angular/router';
import { LibroListComponent } from './components/libro-list/libro-list.component';
import { LibroDetalleComponent } from './components/libro-detalle/libro-detalle.component';
import { AutorListComponent } from './components/autor-list/autor-list.component';

export const routes: Routes = [
  // Ruta por defecto: redirige al catálogo de libros
  { path: '', redirectTo: 'libros', pathMatch: 'full' },

  // Listado de libros con filtros y búsqueda
  { path: 'libros', component: LibroListComponent },

  // Detalle individual de un libro
  { path: 'libros/:id', component: LibroDetalleComponent },

  // Gestión de Autores (Entidad principal)
  { path: 'autores', component: AutorListComponent },

  // Ruta comodín para redirigir URLs no existentes
  { path: '**', redirectTo: 'libros' }
];
