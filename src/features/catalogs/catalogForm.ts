import type { CatalogFormValues, CatalogRecord, NewRecord } from '../../types/index';
import type { CatalogDefinition } from './catalogDefinitions';

export const toCatalogFormValues = (item: CatalogRecord | null, suggestedOrder: number): CatalogFormValues => ({
  accountNumber: item?.accountNumber ?? '',
  classId: item?.classId ?? '',
  name: item?.name ?? '',
  order: String(item?.order ?? suggestedOrder),
  phone: item?.phone ?? '',
  semester: item?.semester ? String(item.semester) : '',
  usesBank: item?.usesBank ?? false,
});

// Solo guarda los campos que declara el catálogo (un banco no lleva "orden", una clase no lleva "cuenta").
export const toCatalogRecordData = (values: CatalogFormValues, definition: CatalogDefinition) => {
  const recordData: NewRecord<CatalogRecord> = { name: values.name.trim() };
  definition.extraFields.forEach((field) => {
    if (field.name === 'usesBank') recordData.usesBank = values.usesBank;
    if (field.name === 'order') recordData.order = Number.parseInt(values.order, 10) || 0;
    if (field.name === 'accountNumber') recordData.accountNumber = values.accountNumber.trim();
    if (field.name === 'phone') recordData.phone = values.phone.trim();
    if (field.name === 'classId') recordData.classId = values.classId;
    if (field.name === 'semester') recordData.semester = Number.parseInt(values.semester, 10);
  });
  return recordData;
};

export const getNextOrder = (items: CatalogRecord[]) =>
  items.reduce((highest, item) => Math.max(highest, item.order ?? 0), 0) + 1;

export const isDuplicateName = (items: CatalogRecord[], name: string, ownId?: string) =>
  items.some((item) => item.id !== ownId && item.name.trim().toLowerCase() === name.trim().toLowerCase());

// Campos obligatorios además del nombre: la clase de materias y libros, y el semestre de las materias.
export const findMissingExtraField = (values: CatalogFormValues, definition: CatalogDefinition) =>
  definition.extraFields.find(
    (field) => (field.kind === 'class' && !values.classId) || (field.kind === 'semester' && !values.semester),
  );
