import type { CatalogItem } from './catalogItem';

// Materia del programa: la clase (año) y el semestre (1 o 2) en que se da. Pueden faltar en materias
// guardadas antes de esos campos: se completan con "Completar según la hoja" en Catálogos.
export interface Subject extends CatalogItem {
  classId?: string;
  semester?: number;
}
