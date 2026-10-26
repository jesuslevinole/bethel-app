import { Library, Plus, Trash2 } from 'lucide-react';
import MoneyInput from '../../../shared/components/MoneyInput';
import type { Book, CourseBookRow } from '../../../types/index';
import { getBooksTotal } from '../../../utils/courseCost';
import { formatMoney } from '../../../utils/money';
import { addCatalogBooks, countMissingCatalogBooks, createBookRow } from '../courseCostForm';

interface BookListEditorProps {
  books: CourseBookRow[];
  // Libros del catálogo para la clase elegida.
  catalogBooks: Book[];
  onChange: (books: CourseBookRow[]) => void;
}

// Tantos libros como haga falta: cada fila con nombre y monto, y el total se suma solo.
const BookListEditor = ({ books, catalogBooks, onChange }: BookListEditorProps) => {
  const booksTotal = getBooksTotal(books);
  const missingCount = countMissingCatalogBooks(books, catalogBooks);

  const handleBookChange = (rowId: string, changes: Partial<CourseBookRow>) => {
    onChange(books.map((book) => (book.rowId === rowId ? { ...book, ...changes } : book)));
  };

  const handleRemoveBook = (rowId: string) => {
    const remainingBooks = books.filter((book) => book.rowId !== rowId);
    onChange(remainingBooks.length > 0 ? remainingBooks : [createBookRow()]);
  };

  return (
    <div className="form-column">
      <div className="book-list-header">
        <h3 className="form-section-title">Libros</h3>
        {missingCount > 0 && (
          <button className="btn btn-ghost" onClick={() => onChange(addCatalogBooks(books, catalogBooks))} type="button">
            <Library size={17} />
            {missingCount === 1 ? 'Traer 1 libro del catálogo' : `Traer ${missingCount} libros del catálogo`}
          </button>
        )}
      </div>
      <ol className="book-list">
        {books.map((book, index) => (
          <li className="book-row" key={book.rowId}>
            <span className="book-row-number">{index + 1}</span>
            <input
              aria-label={`Libro ${index + 1}`}
              className="input"
              onChange={(event) => handleBookChange(book.rowId, { title: event.target.value })}
              placeholder={`Libro ${index + 1}`}
              value={book.title}
            />
            <MoneyInput
              ariaLabel={`Monto del libro ${index + 1}`}
              onChange={(amount) => handleBookChange(book.rowId, { amount })}
              value={book.amount}
            />
            <button
              aria-label={`Quitar libro ${index + 1}`}
              className="btn btn-icon is-danger"
              onClick={() => handleRemoveBook(book.rowId)}
              type="button"
            >
              <Trash2 size={17} />
            </button>
          </li>
        ))}
      </ol>
      <div className="book-list-footer">
        <button className="btn btn-ghost" onClick={() => onChange([...books, createBookRow()])} type="button">
          <Plus size={18} />
          Agregar libro
        </button>
        <span className="book-list-total">
          Total libros
          <strong>{formatMoney(booksTotal)}</strong>
        </span>
      </div>
    </div>
  );
};

export default BookListEditor;
