import type { CatalogItem } from './catalogItem';

// Libro del programa y la clase (nivel) que lo usa. code y price son del inventario de libros
// (formulario de pedido de libros); el cobro del programa sigue en Costos del curso de cada período.
export interface Book extends CatalogItem {
  classId: string;
  code?: string;
  // Libro opcional de referencia (en el formulario va con †: no se acepta devolución).
  isOptional?: boolean;
  price?: number;
}
