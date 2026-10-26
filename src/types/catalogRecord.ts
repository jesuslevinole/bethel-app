import type { CatalogItem } from './catalogItem';

// Forma común de cualquier catálogo para la pantalla genérica de Catálogos.
// Cada catálogo usa solo los campos opcionales que declara en catalogDefinitions.ts.
export interface CatalogRecord extends CatalogItem {
  accountNumber?: string;
  classId?: string;
  order?: number;
  phone?: string;
  // 1 = primer semestre, 2 = segundo (materias).
  semester?: number;
  usesBank?: boolean;
}

export interface CatalogFormValues {
  accountNumber: string;
  classId: string;
  name: string;
  order: string;
  phone: string;
  semester: string;
  usesBank: boolean;
}

export type CatalogKey =
  | 'banks'
  | 'books'
  | 'classes'
  | 'expenseCategories'
  | 'incomeTypes'
  | 'paymentTypes'
  | 'subjects'
  | 'teachers';

export type CatalogExtraFieldName = 'accountNumber' | 'classId' | 'order' | 'phone' | 'semester' | 'usesBank';

export interface CatalogExtraField {
  kind: 'class' | 'number' | 'semester' | 'text' | 'toggle';
  label: string;
  name: CatalogExtraFieldName;
  placeholder?: string;
}
