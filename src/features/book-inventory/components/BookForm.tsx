import type { FormEvent } from 'react';
import ClassSelect from '../../../shared/components/ClassSelect';
import Field from '../../../shared/components/Field';
import Modal from '../../../shared/components/Modal';
import MoneyInput from '../../../shared/components/MoneyInput';
import { useAsyncAction } from '../../../shared/hooks/useAsyncAction';
import { useFormFields } from '../../../shared/hooks/useFormFields';
import type { Book, SchoolClass } from '../../../types/index';
import { normalizeText } from '../../../utils/search';
import { saveBook } from '../services/bookRecords';

interface BookFormProps {
  book: Book | null;
  books: Book[];
  classes: SchoolClass[];
  onClose: () => void;
}

interface BookFormValues {
  classId: string;
  code: string;
  isOptional: boolean;
  name: string;
  price: number;
}

// Libro del inventario: nombre, código de clase, clase que lo usa y precio de venta.
const BookForm = ({ book, books, classes, onClose }: BookFormProps) => {
  const { setField, values } = useFormFields<BookFormValues>({
    classId: book?.classId ?? '',
    code: book?.code ?? '',
    isOptional: book?.isOptional ?? false,
    name: book?.name ?? '',
    price: book?.price ?? 0,
  });
  const { error, isRunning, run, setError } = useAsyncAction();

  const handleSave = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const name = values.name.trim();
    if (!name) {
      setError('Escribe el nombre del libro.');
      return;
    }
    const isDuplicate = books.some(
      (other) => other.id !== book?.id && normalizeText(other.name) === normalizeText(name),
    );
    if (isDuplicate) {
      setError('Ya hay un libro con ese nombre.');
      return;
    }
    const data = {
      classId: values.classId,
      code: values.code.trim().toUpperCase(),
      isOptional: values.isOptional,
      name,
      price: values.price,
    };
    if (await run(() => saveBook(book, data))) onClose();
  };

  return (
    <Modal
      onClose={onClose}
      subtitle="El precio es el que se cobra al vender el libro en Pagos."
      title={book ? 'Editar libro' : 'Agregar libro'}
    >
      <form className="modal-form" noValidate onSubmit={handleSave}>
        <div className="modal-body">
          <div className="form-grid">
            <Field className="span-all" htmlFor="book-name" label="Libro">
              <input
                autoFocus
                className="input"
                id="book-name"
                onChange={(event) => setField('name', event.target.value)}
                value={values.name}
              />
            </Field>
            <Field hint="Como en el formulario de pedido (BIB318S…)." htmlFor="book-code" label="Código">
              <input
                className="input"
                id="book-code"
                onChange={(event) => setField('code', event.target.value)}
                value={values.code}
              />
            </Field>
            <Field htmlFor="book-class" label="Clase">
              <ClassSelect
                classes={classes}
                id="book-class"
                onChange={(classId) => setField('classId', classId)}
                value={values.classId}
              />
            </Field>
            <Field htmlFor="book-price" label="Precio del libro">
              <MoneyInput id="book-price" onChange={(price) => setField('price', price)} value={values.price} />
            </Field>
            <label className="book-form-toggle">
              <input
                checked={values.isOptional}
                onChange={(event) => setField('isOptional', event.target.checked)}
                type="checkbox"
              />
              Libro opcional de referencia (no se acepta devolución)
            </label>
          </div>
          {error && <p className="form-alert">{error}</p>}
        </div>
        <footer className="modal-footer">
          <button className="btn btn-secondary" disabled={isRunning} onClick={onClose} type="button">
            Cancelar
          </button>
          <button className="btn btn-primary" disabled={isRunning} type="submit">
            {isRunning ? 'Guardando…' : 'Guardar libro'}
          </button>
        </footer>
      </form>
    </Modal>
  );
};

export default BookForm;
