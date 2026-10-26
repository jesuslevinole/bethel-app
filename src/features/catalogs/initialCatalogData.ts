import type { CatalogKey, CatalogRecord, NewRecord } from '../../types/index';
import { CURRICULUM } from './curriculum';

// className se cambia por el classId real al cargar (ver services/seedCatalogs.ts).
export type SeedRecord = NewRecord<CatalogRecord> & { className?: string };

const CLASS_NAMES = ['Primer', 'Segundo', 'Tercer', 'Cuarto'];

// Datos de la hoja "CONFIGURACION" de Bethel. Los maestros venían repetidos (uno por materia):
// aquí van una sola vez, porque las materias se asignan en "Materias por maestro".
export const INITIAL_CATALOG_DATA: Record<CatalogKey, SeedRecord[]> = {
  banks: [
    { accountNumber: '', name: 'Banesco' },
    { accountNumber: '10111', name: 'Mercantil' },
    { accountNumber: '', name: 'Venezuela' },
  ],
  books: Array.from({ length: 16 }, (_, index) => ({
    className: CLASS_NAMES[index % CLASS_NAMES.length],
    name: `Libro ${index + 1}`,
  })),
  classes: CLASS_NAMES.map((name, index) => ({ name, order: index + 1 })),
  expenseCategories: [
    ...Array.from({ length: 10 }, (_, index) => ({ name: `Categoría ${index + 1}` })),
    { name: 'Pagos maestros' },
  ],
  incomeTypes: [
    { name: 'Cash', usesBank: false },
    { name: 'Check', usesBank: false },
    { name: 'Deposit direct', usesBank: true },
  ],
  paymentTypes: [{ name: 'Graduación' }, { name: 'Inscripción' }, { name: 'Libros' }, { name: 'Mensualidad' }],
  subjects: CURRICULUM.map(({ className, names, semester }) => ({ className, name: names[0], semester })),
  teachers: [
    'Aminta Figueroa',
    'Aneudys Rodríguez',
    'Griselda Martínez',
    'Oswaldo Ramírez',
    'Jackeline Toledo',
    'Rodys Morales',
    'Jennifer Fernández',
    'Juan Aponte',
    'Felipe Vinueza',
    'Viridiana Cruz',
    'Vasti Cruz',
    'Claudia Bonilla',
    'Rev. Isaac Cruz',
    'Manuel Cruz',
    'Cynthia Ríos',
    'Kenia Aponte',
  ].map((name) => ({ name, phone: '' })),
};
