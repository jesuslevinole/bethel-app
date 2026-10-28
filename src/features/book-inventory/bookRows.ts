import type { Book, BookStock } from '../../types/index';
import { getRelationName } from '../../utils/relations';
import { EMPTY_STOCK } from './bookStock';

export interface BookStockRow {
  book: Book;
  className: string;
  stock: BookStock;
}

export const toBookStockRows = (books: Book[], stockByBook: Map<string, BookStock>, classNames: Map<string, string>) =>
  books.map((book) => ({
    book,
    className: book.classId ? getRelationName(classNames, book.classId) : '—',
    stock: stockByBook.get(book.id) ?? EMPTY_STOCK,
  }));
