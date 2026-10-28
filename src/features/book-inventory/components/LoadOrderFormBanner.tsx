import { useState } from 'react';
import { useAsyncAction } from '../../../shared/hooks/useAsyncAction';
import type { Book, SchoolClass } from '../../../types/index';
import { BOOK_ORDER_FORM } from '../bookOrderForm';
import { loadBookOrderForm, type OrderFormLoadResult } from '../services/bookRecords';

interface LoadOrderFormBannerProps {
  books: Book[];
  classes: SchoolClass[];
}

// Carga los libros del formulario de pedido (código, precio y año) en el catálogo de libros.
const LoadOrderFormBanner = ({ books, classes }: LoadOrderFormBannerProps) => {
  const { error, isRunning, run } = useAsyncAction();
  const [result, setResult] = useState<OrderFormLoadResult | null>(null);

  const handleLoad = () =>
    run(async () => {
      setResult(await loadBookOrderForm(books, classes));
    });

  if (result) {
    return (
      <p className="form-notice">
        Listo: {result.added} libros agregados y {result.updated} completados con su código y precio.
      </p>
    );
  }

  return (
    <div className="seed-banner">
      <div className="seed-banner-text">
        <span className="seed-banner-title">Carga los libros del formulario de pedido</span>
        <span className="seed-banner-detail">
          Se agregan los {BOOK_ORDER_FORM.length} libros del formulario con su código, precio y año. Los que ya tienes
          se completan sin cambiar el precio que pusiste.
        </span>
        {error && <span className="field-error">{error}</span>}
      </div>
      <button
        className="btn btn-primary"
        disabled={isRunning || classes.length === 0}
        onClick={handleLoad}
        type="button"
      >
        {isRunning ? 'Cargando…' : 'Cargar libros'}
      </button>
    </div>
  );
};

export default LoadOrderFormBanner;
