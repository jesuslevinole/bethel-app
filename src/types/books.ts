import type { CatalogItem } from './catalogItem';

// Libro del programa y la clase (nivel) que lo usa. El precio va en Costos del curso de cada período.
export interface Book extends CatalogItem {
  classId: string;
}
