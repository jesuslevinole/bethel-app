import {
  Banknote,
  BookOpen,
  Building2,
  Library,
  Layers,
  Receipt,
  Tags,
  UserRound,
  type LucideIcon,
} from 'lucide-react';
import { COLLECTIONS } from '../../lib/firebase/collections';
import { banksService } from '../../services/banksService';
import { booksService } from '../../services/booksService';
import { classesService } from '../../services/classesService';
import type { CollectionService } from '../../services/createCollectionService';
import { expenseCategoriesService } from '../../services/expenseCategoriesService';
import { incomeTypesService } from '../../services/incomeTypesService';
import { paymentTypesService } from '../../services/paymentTypesService';
import { subjectsService } from '../../services/subjectsService';
import { teachersService } from '../../services/teachersService';
import type { ReferenceCheck } from '../../shared/data/references';
import type { CatalogExtraField, CatalogKey, CatalogRecord } from '../../types/index';

export interface CatalogDefinition {
  description: string;
  extraFields: CatalogExtraField[];
  group: 'Académicos' | 'Finanzas';
  icon: LucideIcon;
  key: CatalogKey;
  nameLabel: string;
  references: ReferenceCheck[];
  service: CollectionService<CatalogRecord>;
  singular: string;
  title: string;
}

const CLASS_FIELD: CatalogExtraField = { kind: 'class', label: 'Clase', name: 'classId' };
const SEMESTER_FIELD: CatalogExtraField = { kind: 'semester', label: 'Semestre', name: 'semester' };

// Catálogos que van ligados a una clase (materias, libros).
export const hasClassField = (definition: CatalogDefinition) =>
  definition.extraFields.some((field) => field.kind === 'class');

export const hasSemesterField = (definition: CatalogDefinition) =>
  definition.extraFields.some((field) => field.kind === 'semester');

// Un catálogo nuevo se agrega aquí (y su colección en COLLECTIONS, SOURCES y las reglas).
export const CATALOG_DEFINITIONS: CatalogDefinition[] = [
  {
    description: 'Niveles del programa. El orden define cómo aparecen en las listas.',
    extraFields: [{ kind: 'number', label: 'Orden', name: 'order', placeholder: '1' }],
    group: 'Académicos',
    icon: Layers,
    key: 'classes',
    nameLabel: 'Clase',
    references: [
      { collectionName: COLLECTIONS.courseCosts, field: 'classId', label: 'Costos del curso', operator: '==' },
      { collectionName: COLLECTIONS.teacherAssignments, field: 'classId', label: 'Materias por maestro', operator: '==' },
      { collectionName: COLLECTIONS.enrollments, field: 'classId', label: 'Inscripciones', operator: '==' },
      { collectionName: COLLECTIONS.subjects, field: 'classId', label: 'Materias', operator: '==' },
      { collectionName: COLLECTIONS.books, field: 'classId', label: 'Libros', operator: '==' },
    ],
    service: classesService,
    singular: 'clase',
    title: 'Clases',
  },
  {
    description: 'Materias del programa: la clase (año) y el semestre en que se dan. Al asignar materias a un maestro se muestran las de su clase.',
    extraFields: [CLASS_FIELD, SEMESTER_FIELD],
    group: 'Académicos',
    icon: BookOpen,
    key: 'subjects',
    nameLabel: 'Materia',
    references: [
      {
        collectionName: COLLECTIONS.teacherAssignments,
        field: 'subjectIds',
        label: 'Materias por maestro',
        operator: 'array-contains',
      },
    ],
    service: subjectsService,
    singular: 'materia',
    title: 'Materias',
  },
  {
    description: 'Libros del programa y la clase que los usa. En Costos del curso se cargan con el precio de cada período.',
    extraFields: [CLASS_FIELD],
    group: 'Académicos',
    icon: Library,
    key: 'books',
    nameLabel: 'Libro',
    references: [],
    service: booksService,
    singular: 'libro',
    title: 'Libros',
  },
  {
    description: 'Maestros del instituto. Cada uno aparece una sola vez.',
    extraFields: [{ kind: 'text', label: 'Teléfono', name: 'phone', placeholder: 'Opcional' }],
    group: 'Académicos',
    icon: UserRound,
    key: 'teachers',
    nameLabel: 'Nombre',
    references: [
      { collectionName: COLLECTIONS.teacherAssignments, field: 'teacherId', label: 'Materias por maestro', operator: '==' },
    ],
    service: teachersService,
    singular: 'maestro',
    title: 'Maestros',
  },
  {
    description: 'Conceptos por los que paga un alumno.',
    extraFields: [],
    group: 'Finanzas',
    icon: Receipt,
    key: 'paymentTypes',
    nameLabel: 'Descripción',
    references: [],
    service: paymentTypesService,
    singular: 'tipo de pago',
    title: 'Tipos de pago',
  },
  {
    description: 'Forma en que entra el dinero. Marca las que llegan a una cuenta de banco.',
    extraFields: [{ kind: 'toggle', label: 'Llega al banco', name: 'usesBank' }],
    group: 'Finanzas',
    icon: Banknote,
    key: 'incomeTypes',
    nameLabel: 'Descripción',
    references: [],
    service: incomeTypesService,
    singular: 'tipo de ingreso',
    title: 'Tipos de ingreso',
  },
  {
    description: 'Bancos y cuentas donde se depositan los pagos.',
    extraFields: [{ kind: 'text', label: 'Cuenta', name: 'accountNumber', placeholder: 'Opcional' }],
    group: 'Finanzas',
    icon: Building2,
    key: 'banks',
    nameLabel: 'Banco',
    references: [],
    service: banksService,
    singular: 'banco',
    title: 'Bancos',
  },
  {
    description: 'Categorías para clasificar los gastos.',
    extraFields: [],
    group: 'Finanzas',
    icon: Tags,
    key: 'expenseCategories',
    nameLabel: 'Categoría',
    references: [],
    service: expenseCategoriesService,
    singular: 'categoría',
    title: 'Categorías de gasto',
  },
];
