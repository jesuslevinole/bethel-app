import { COLLECTIONS } from '../../../lib/firebase/collections';
import { bookMovementsService } from '../../../services/bookMovementsService';
import { booksService } from '../../../services/booksService';
import { createInChunks, updateInChunks } from '../../../shared/data/batchWrites';
import type { Book, BookMovement, NewRecord, SchoolClass } from '../../../types/index';
import { normalizeText } from '../../../utils/search';
import { BOOK_ORDER_FORM } from '../bookOrderForm';

export type BookData = Pick<Book, 'classId' | 'code' | 'isOptional' | 'name' | 'price'>;

export const saveBook = async (book: Book | null, data: BookData) => {
  if (book) await booksService.update(book.id, data);
  else await booksService.create(data);
};

// Entrada o salida hecha a mano (las ventas las escribe Pagos).
export const saveManualMovement = async (movement: BookMovement | null, data: NewRecord<BookMovement>) => {
  if (movement) await bookMovementsService.update(movement.id, data);
  else await bookMovementsService.create(data);
};

export const deleteManualMovement = async (movement: BookMovement) => {
  await bookMovementsService.delete(movement.id);
};

export interface OrderFormLoadResult {
  added: number;
  updated: number;
}

// Carga el formulario de pedido de libros: agrega los que faltan y completa código y precio de los que ya
// están (por código o por el mismo nombre). No cambia un precio que ya se puso a mano.
export const loadBookOrderForm = async (books: Book[], classes: SchoolClass[]): Promise<OrderFormLoadResult> => {
  const orderedClasses = [...classes].sort((first, second) => first.order - second.order);
  const classByYear = new Map(orderedClasses.map((schoolClass, index) => [index + 1, schoolClass.id]));
  const byCode = new Map(books.filter((book) => book.code).map((book) => [normalizeText(book.code ?? ''), book]));
  const byName = new Map(books.map((book) => [normalizeText(book.name), book]));
  const toCreate: Record<string, unknown>[] = [];
  const toUpdate: { changes: Record<string, unknown>; id: string }[] = [];

  BOOK_ORDER_FORM.forEach((formBook) => {
    const existing = byCode.get(normalizeText(formBook.code)) ?? byName.get(normalizeText(formBook.name));
    const classId = classByYear.get(formBook.year) ?? '';
    if (!existing) {
      toCreate.push({
        classId,
        code: formBook.code,
        isOptional: formBook.isOptional,
        name: formBook.name,
        price: formBook.price,
      });
      return;
    }
    const changes: Record<string, unknown> = {};
    if (!existing.code) changes.code = formBook.code;
    if (existing.price === undefined) changes.price = formBook.price;
    if (existing.isOptional === undefined) changes.isOptional = formBook.isOptional;
    if (!existing.classId && classId) changes.classId = classId;
    if (Object.keys(changes).length > 0) toUpdate.push({ changes, id: existing.id });
  });

  await createInChunks(toCreate.map((data) => ({ collectionName: COLLECTIONS.books, data })));
  await updateInChunks(toUpdate.map(({ changes, id }) => ({ collectionName: COLLECTIONS.books, data: changes, id })));
  return { added: toCreate.length, updated: toUpdate.length };
};

// ¿Al catálogo le faltan libros del formulario o sus códigos y precios?
export const isOrderFormPending = (books: Book[]) => {
  const codes = new Set(books.map((book) => normalizeText(book.code ?? '')).filter(Boolean));
  const names = new Set(books.map((book) => normalizeText(book.name)));
  return BOOK_ORDER_FORM.some(
    (formBook) => !codes.has(normalizeText(formBook.code)) && !names.has(normalizeText(formBook.name)),
  );
};
