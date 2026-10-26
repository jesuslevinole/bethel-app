import type { CatalogItem } from './catalogItem';

// Clase = nivel del programa (Primer, Segundo, Tercer, Cuarto). `order` define el orden en listas.
export interface SchoolClass extends CatalogItem {
  order: number;
}
