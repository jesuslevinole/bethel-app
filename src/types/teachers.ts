import type { CatalogItem } from './catalogItem';

export interface Teacher extends CatalogItem {
  // Creado junto con un usuario de prueba.
  isTest?: boolean;
  phone: string;
}
