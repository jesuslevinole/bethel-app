import { COLLECTIONS } from '../../../lib/firebase/collections';
import {
  createInChunks,
  newDocumentId,
  updateInChunks,
  type CreateOperation,
  type UpdateOperation,
} from '../../../shared/data/batchWrites';
import type { CatalogKey, SchoolClass, Subject } from '../../../types/index';
import { normalizeText } from '../../../utils/search';
import { CURRICULUM } from '../curriculum';
import { INITIAL_CATALOG_DATA } from '../initialCatalogData';

// Clases por nombre normalizado: las que ya existen y las que se crean en esta misma carga (con id generado).
const buildClassIds = (existingClasses: SchoolClass[], seedsClasses: boolean) => {
  const classIds = new Map(existingClasses.map((schoolClass) => [normalizeText(schoolClass.name), schoolClass.id]));
  const classOperations: CreateOperation[] = seedsClasses
    ? INITIAL_CATALOG_DATA.classes.map((data) => {
        const id = newDocumentId(COLLECTIONS.classes);
        classIds.set(normalizeText(data.name), id);
        return { collectionName: COLLECTIONS.classes, data: { ...data }, id };
      })
    : [];
  return { classIds, classOperations };
};

// Llena SOLO los catálogos vacíos con los datos de la hoja (nunca duplica uno que ya tiene datos).
// Materias y libros quedan ligados a su clase; si la clase no existe, quedan sin clase.
export const seedEmptyCatalogs = async (emptyKeys: CatalogKey[], existingClasses: SchoolClass[]) => {
  const { classIds, classOperations } = buildClassIds(existingClasses, emptyKeys.includes('classes'));
  const otherOperations: CreateOperation[] = emptyKeys
    .filter((catalogKey) => catalogKey !== 'classes')
    .flatMap((catalogKey) =>
      INITIAL_CATALOG_DATA[catalogKey].map(({ className, ...data }) => ({
        collectionName: COLLECTIONS[catalogKey],
        data: className ? { ...data, classId: classIds.get(normalizeText(className)) ?? '' } : { ...data },
      })),
    );
  await createInChunks([...classOperations, ...otherOperations]);
};

// La entrada del plan de estudios con ese nombre (o uno de sus otros nombres), sin importar acentos ni mayúsculas.
const findCurriculumEntry = (subjectName: string) => {
  const subjectKey = normalizeText(subjectName);
  return CURRICULUM.find((entry) => entry.names.some((name) => normalizeText(name) === subjectKey)) ?? null;
};

export interface SubjectCompletion {
  changes: { classId?: string; semester?: number };
  subject: Subject;
}

// Materias guardadas sin clase o sin semestre a las que el plan de la hoja les da uno.
// Solo se llena lo que falta: una clase ya elegida a mano no se cambia.
export const getSubjectsToComplete = (subjects: Subject[], classes: SchoolClass[]): SubjectCompletion[] =>
  subjects.flatMap((subject) => {
    if (subject.classId && subject.semester) return [];
    const entry = findCurriculumEntry(subject.name);
    if (!entry) return [];
    const sheetClassId =
      classes.find((schoolClass) => normalizeText(schoolClass.name) === normalizeText(entry.className))?.id ?? '';
    const changes: SubjectCompletion['changes'] = {};
    if (!subject.classId && sheetClassId) changes.classId = sheetClassId;
    if (!subject.semester) changes.semester = entry.semester;
    return Object.keys(changes).length > 0 ? [{ changes, subject }] : [];
  });

export const completeSubjectsFromSheet = async (subjects: Subject[], classes: SchoolClass[]) => {
  const operations: UpdateOperation[] = getSubjectsToComplete(subjects, classes).map(({ changes, subject }) => ({
    collectionName: COLLECTIONS.subjects,
    data: changes,
    id: subject.id,
  }));
  await updateInChunks(operations);
};
