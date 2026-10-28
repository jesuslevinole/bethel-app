import {
  collection,
  onSnapshot,
  query,
  where,
  type Query,
  type QueryConstraint,
  type Unsubscribe,
} from 'firebase/firestore';
import { useCallback, useSyncExternalStore } from 'react';
import { db } from '../../config/firebase';
import { COLLECTIONS, type CollectionName } from '../../lib/firebase/collections';
import { typedConverter } from '../../lib/firebase/typedConverter';
import type {
  AcademicPeriod,
  AdmissionApplication,
  AppUser,
  Bank,
  Book,
  BookMovement,
  CourseCost,
  Enrollment,
  EnrollmentRequest,
  Expense,
  ExpenseCategory,
  IncomeType,
  Payment,
  PaymentType,
  Role,
  SchoolClass,
  Student,
  Subject,
  Teacher,
  TeacherAssignment,
} from '../../types/index';
import {
  compareByDateDesc,
  compareByName,
  compareByOrder,
  compareByPaymentDesc,
  compareByStartDateDesc,
} from '../../utils/sorting';

// Un onSnapshot por fuente para toda la app (cada documento leído se cobra).
// El listener sigue abierto 15 min después de que la última vista lo suelta, así cambiar de
// pantalla no vuelve a descargar nada.
//  - SOURCES: colecciones completas (catálogos, alumnos, períodos, roles, usuarios). Una nueva se agrega aquí.
//  - PERIOD_SOURCES: colecciones que crecen cada año; se escuchan SOLO del período elegido
//    (where periodId ==), nunca completas. Con un rol de "propios" se agrega el filtro del dueño
//    (studentId / teacherId): sin él, las reglas de Firestore rechazan la consulta.
//  - RANGE_SOURCES: dinero que entra y sale (pagos y gastos) entre dos fechas (Estado de cuenta, Gastos).
//  - useLiveFilteredCollection: una colección de SOURCES filtrada por un campo (lo propio de un estudiante).
// Las vistas no llaman esto directo para colecciones con permisos: usan shared/data/useScopedData.ts.

interface LiveCollectionTypes {
  academicPeriods: AcademicPeriod;
  admissionApplications: AdmissionApplication;
  appUsers: AppUser;
  banks: Bank;
  bookMovements: BookMovement;
  books: Book;
  classes: SchoolClass;
  enrollmentRequests: EnrollmentRequest;
  expenseCategories: ExpenseCategory;
  incomeTypes: IncomeType;
  paymentTypes: PaymentType;
  roles: Role;
  students: Student;
  subjects: Subject;
  teachers: Teacher;
}

interface PeriodCollectionTypes {
  courseCosts: CourseCost;
  enrollments: Enrollment;
  payments: Payment;
  teacherAssignments: TeacherAssignment;
}

interface RangeCollectionTypes {
  expenses: Expense;
  payments: Payment;
}

export type LiveCollectionKey = keyof LiveCollectionTypes;
export type PeriodCollectionKey = keyof PeriodCollectionTypes;
export type RangeCollectionKey = keyof RangeCollectionTypes;

interface SourceConfig<T> {
  collectionName: CollectionName;
  compare: (first: T, second: T) => number;
}

const SOURCES: { [Key in LiveCollectionKey]: SourceConfig<LiveCollectionTypes[Key]> } = {
  academicPeriods: { collectionName: COLLECTIONS.academicPeriods, compare: compareByStartDateDesc },
  admissionApplications: { collectionName: COLLECTIONS.admissionApplications, compare: compareByDateDesc },
  appUsers: { collectionName: COLLECTIONS.appUsers, compare: compareByName },
  banks: { collectionName: COLLECTIONS.banks, compare: compareByName },
  bookMovements: { collectionName: COLLECTIONS.bookMovements, compare: compareByDateDesc },
  books: { collectionName: COLLECTIONS.books, compare: compareByName },
  classes: { collectionName: COLLECTIONS.classes, compare: compareByOrder },
  enrollmentRequests: { collectionName: COLLECTIONS.enrollmentRequests, compare: compareByDateDesc },
  expenseCategories: { collectionName: COLLECTIONS.expenseCategories, compare: compareByName },
  incomeTypes: { collectionName: COLLECTIONS.incomeTypes, compare: compareByName },
  paymentTypes: { collectionName: COLLECTIONS.paymentTypes, compare: compareByName },
  roles: { collectionName: COLLECTIONS.roles, compare: compareByName },
  students: { collectionName: COLLECTIONS.students, compare: compareByName },
  subjects: { collectionName: COLLECTIONS.subjects, compare: compareByName },
  teachers: { collectionName: COLLECTIONS.teachers, compare: compareByName },
};

const PERIOD_SOURCES: { [Key in PeriodCollectionKey]: SourceConfig<PeriodCollectionTypes[Key]> } = {
  courseCosts: { collectionName: COLLECTIONS.courseCosts, compare: compareByDateDesc },
  enrollments: { collectionName: COLLECTIONS.enrollments, compare: compareByDateDesc },
  payments: { collectionName: COLLECTIONS.payments, compare: compareByPaymentDesc },
  teacherAssignments: { collectionName: COLLECTIONS.teacherAssignments, compare: compareByDateDesc },
};

const RANGE_SOURCES: { [Key in RangeCollectionKey]: SourceConfig<RangeCollectionTypes[Key]> } = {
  expenses: { collectionName: COLLECTIONS.expenses, compare: compareByDateDesc },
  payments: { collectionName: COLLECTIONS.payments, compare: compareByPaymentDesc },
};

const KEEP_ALIVE_MS = 15 * 60_000;

export interface LiveCollectionState<T> {
  data: T[];
  error: string | null;
  isLoading: boolean;
}

interface LiveEntry {
  listeners: Set<() => void>;
  releaseTimer: number | null;
  start: (entry: LiveEntry) => Unsubscribe;
  state: LiveCollectionState<unknown>;
  unsubscribe: Unsubscribe | null;
}

const LOADING_STATE: LiveCollectionState<unknown> = { data: [], error: null, isLoading: true };
const EMPTY_STATE: LiveCollectionState<unknown> = { data: [], error: null, isLoading: false };

const entries = new Map<string, LiveEntry>();

const notifyListeners = (entry: LiveEntry) => {
  entry.listeners.forEach((listener) => listener());
};

const createStarter =
  <T extends { id: string }>(sourceQuery: Query<T>, compare: (first: T, second: T) => number, label: string) =>
  (entry: LiveEntry) =>
    onSnapshot(
      sourceQuery,
      (snapshot) => {
        const documents = snapshot.docs.map((document) => document.data()).sort(compare);
        entry.state = { data: documents, error: null, isLoading: false };
        notifyListeners(entry);
      },
      (error) => {
        console.error(`Listener de ${label}:`, error);
        entry.state = { ...entry.state, error: error.code, isLoading: false };
        notifyListeners(entry);
      },
    );

const getEntry = (cacheKey: string, start: LiveEntry['start']) => {
  const existingEntry = entries.get(cacheKey);
  if (existingEntry) return existingEntry;
  const newEntry: LiveEntry = { listeners: new Set(), releaseTimer: null, start, state: LOADING_STATE, unsubscribe: null };
  entries.set(cacheKey, newEntry);
  return newEntry;
};

const stopListener = (entry: LiveEntry) => {
  entry.unsubscribe?.();
  entry.unsubscribe = null;
  entry.state = LOADING_STATE;
};

const subscribeToEntry = (entry: LiveEntry, onChange: () => void) => {
  if (entry.releaseTimer !== null) {
    window.clearTimeout(entry.releaseTimer);
    entry.releaseTimer = null;
  }
  entry.listeners.add(onChange);
  if (!entry.unsubscribe) entry.unsubscribe = entry.start(entry);

  return () => {
    entry.listeners.delete(onChange);
    if (entry.listeners.size > 0) return;
    entry.releaseTimer = window.setTimeout(() => {
      entry.releaseTimer = null;
      stopListener(entry);
    }, KEEP_ALIVE_MS);
  };
};

const getCollectionEntry = <Key extends LiveCollectionKey>(key: Key) => {
  const { collectionName, compare } = SOURCES[key];
  return getEntry(key, (entry) => {
    const typedCollection = collection(db, collectionName).withConverter(typedConverter<LiveCollectionTypes[Key]>());
    return createStarter(typedCollection, compare, collectionName)(entry);
  });
};

// Filtro del dueño para roles con "ver solo los propios" (p. ej. teacherId == el maestro del usuario).
export interface OwnerFilter {
  field: 'studentId' | 'teacherId';
  value: string;
}

const getPeriodEntry = <Key extends PeriodCollectionKey>(key: Key, periodId: string, ownerFilter: OwnerFilter | null) => {
  const { collectionName, compare } = PERIOD_SOURCES[key];
  const ownerKey = ownerFilter ? `|${ownerFilter.field}=${ownerFilter.value}` : '';
  return getEntry(`${key}|${periodId}${ownerKey}`, (entry) => {
    const typedCollection = collection(db, collectionName).withConverter(typedConverter<PeriodCollectionTypes[Key]>());
    const constraints = [where('periodId', '==', periodId)];
    if (ownerFilter) constraints.push(where(ownerFilter.field, '==', ownerFilter.value));
    return createStarter(query(typedCollection, ...constraints), compare, `${collectionName} (${periodId}${ownerKey})`)(entry);
  });
};

const getRangeEntry = <Key extends RangeCollectionKey>(key: Key, startDate: string, endDate: string) => {
  const { collectionName, compare } = RANGE_SOURCES[key];
  return getEntry(`${key}|${startDate}..${endDate}`, (entry) => {
    const typedCollection = collection(db, collectionName).withConverter(typedConverter<RangeCollectionTypes[Key]>());
    const constraints = [where('date', '>=', startDate), where('date', '<=', endDate)];
    return createStarter(query(typedCollection, ...constraints), compare, `${collectionName} (${startDate}..${endDate})`)(entry);
  });
};

const getFilteredEntry = <Key extends LiveCollectionKey>(key: Key, field: string, value: string) => {
  const { collectionName, compare } = SOURCES[key];
  return getEntry(`${key}|${field}=${value}`, (entry) => {
    const typedCollection = collection(db, collectionName).withConverter(typedConverter<LiveCollectionTypes[Key]>());
    const constraints: QueryConstraint[] = [where(field, '==', value)];
    return createStarter(query(typedCollection, ...constraints), compare, `${collectionName} (${field}=${value})`)(entry);
  });
};

// enabled = false no abre el listener (el rol no puede leer esa colección) y devuelve una lista vacía.
export const useLiveCollection = <Key extends LiveCollectionKey>(key: Key, enabled = true) => {
  const subscribe = useCallback(
    (onChange: () => void) => (enabled ? subscribeToEntry(getCollectionEntry(key), onChange) : () => undefined),
    [enabled, key],
  );
  const getSnapshot = useCallback(
    () => (enabled ? getCollectionEntry(key).state : EMPTY_STATE) as LiveCollectionState<LiveCollectionTypes[Key]>,
    [enabled, key],
  );
  return useSyncExternalStore(subscribe, getSnapshot);
};

// Solo los datos, para cuando la vista no necesita el estado de carga.
export const useLiveData = <Key extends LiveCollectionKey>(key: Key) => useLiveCollection(key).data;

// Registros de UN período académico (y de un dueño, si se pasa ownerFilter).
// Sin período elegido devuelve una lista vacía (no "cargando").
export const useLivePeriodCollection = <Key extends PeriodCollectionKey>(
  key: Key,
  periodId: string | null,
  ownerFilter: OwnerFilter | null = null,
) => {
  const ownerField = ownerFilter?.field ?? null;
  const ownerValue = ownerFilter?.value ?? null;
  const subscribe = useCallback(
    (onChange: () => void) => {
      if (!periodId) return () => undefined;
      const filter = ownerField && ownerValue ? { field: ownerField, value: ownerValue } : null;
      return subscribeToEntry(getPeriodEntry(key, periodId, filter), onChange);
    },
    [key, ownerField, ownerValue, periodId],
  );
  const getSnapshot = useCallback(() => {
    if (!periodId) return EMPTY_STATE as LiveCollectionState<PeriodCollectionTypes[Key]>;
    const filter = ownerField && ownerValue ? { field: ownerField, value: ownerValue } : null;
    return getPeriodEntry(key, periodId, filter).state as LiveCollectionState<PeriodCollectionTypes[Key]>;
  }, [key, ownerField, ownerValue, periodId]);
  return useSyncExternalStore(subscribe, getSnapshot);
};

// Pagos o gastos con fecha entre startDate y endDate (AAAA-MM-DD, ambos incluidos).
// Sin fechas (o enabled = false) devuelve una lista vacía.
export const useLiveRangeCollection = <Key extends RangeCollectionKey>(
  key: Key,
  startDate: string,
  endDate: string,
  enabled = true,
) => {
  const isActive = enabled && Boolean(startDate) && Boolean(endDate) && startDate <= endDate;
  const subscribe = useCallback(
    (onChange: () => void) =>
      isActive ? subscribeToEntry(getRangeEntry(key, startDate, endDate), onChange) : () => undefined,
    [endDate, isActive, key, startDate],
  );
  const getSnapshot = useCallback(
    () =>
      (isActive ? getRangeEntry(key, startDate, endDate).state : EMPTY_STATE) as LiveCollectionState<
        RangeCollectionTypes[Key]
      >,
    [endDate, isActive, key, startDate],
  );
  return useSyncExternalStore(subscribe, getSnapshot);
};

// Documentos de una colección de SOURCES con field == value (p. ej. las solicitudes de inscripción de un alumno).
// Sin valor devuelve una lista vacía.
export const useLiveFilteredCollection = <Key extends LiveCollectionKey>(key: Key, field: string, value: string | null) => {
  const subscribe = useCallback(
    (onChange: () => void) => (value ? subscribeToEntry(getFilteredEntry(key, field, value), onChange) : () => undefined),
    [field, key, value],
  );
  const getSnapshot = useCallback(
    () =>
      (value ? getFilteredEntry(key, field, value).state : EMPTY_STATE) as LiveCollectionState<LiveCollectionTypes[Key]>,
    [field, key, value],
  );
  return useSyncExternalStore(subscribe, getSnapshot);
};

// Al cerrar sesión: corta todos los listeners antes del signOut para que no fallen por permisos.
export const resetLiveCollections = () => {
  entries.forEach((entry) => {
    if (entry.releaseTimer !== null) window.clearTimeout(entry.releaseTimer);
    entry.releaseTimer = null;
    stopListener(entry);
    notifyListeners(entry);
  });
  entries.clear();
};
