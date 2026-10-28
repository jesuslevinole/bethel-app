import {
  ArrowDownToLine,
  ArrowUpFromLine,
  BookOpenCheck,
  History,
  Library,
  PackageCheck,
  PackageX,
  Plus,
  ShoppingBag,
} from 'lucide-react';
import { useState } from 'react';
import { usePermissions, useRowPermissions } from '../features/auth/hooks/usePermissions';
import { buildMovementExportColumns, BOOK_STOCK_EXPORT_COLUMNS } from '../features/book-inventory/bookExport';
import { toBookStockRows } from '../features/book-inventory/bookRows';
import { computeBookStock, LOW_STOCK } from '../features/book-inventory/bookStock';
import BookForm from '../features/book-inventory/components/BookForm';
import BookMovementTable from '../features/book-inventory/components/BookMovementTable';
import BookStockTable from '../features/book-inventory/components/BookStockTable';
import LoadOrderFormBanner from '../features/book-inventory/components/LoadOrderFormBanner';
import MovementForm from '../features/book-inventory/components/MovementForm';
import { deleteManualMovement, isOrderFormPending } from '../features/book-inventory/services/bookRecords';
import { booksService } from '../services/booksService';
import ConfirmDialog from '../shared/components/ConfirmDialog';
import EmptyState from '../shared/components/EmptyState';
import ExportButton from '../shared/components/ExportButton';
import FilterChips from '../shared/components/FilterChips';
import ListSkeleton from '../shared/components/ListSkeleton';
import SearchInput from '../shared/components/SearchInput';
import SegmentedTabs from '../shared/components/SegmentedTabs';
import StatCard from '../shared/components/StatCard';
import ViewHeader from '../shared/components/ViewHeader';
import { useLiveCollection, useLiveData } from '../shared/data/liveCollections';
import { useStudentDirectory } from '../shared/data/useScopedData';
import { exportToExcel } from '../shared/export/exportToExcel';
import { UserFacingError } from '../utils/userFacingError';
import type { Book, BookMovement } from '../types/index';
import { toSelectOptions } from '../utils/options';
import { pluralize } from '../utils/plural';
import { buildNameMap } from '../utils/relations';
import { matchesSearch } from '../utils/search';
import '../features/book-inventory/components/BookInventory.css';

type InventorySection = 'movements' | 'stock';

interface MovementEditor {
  bookId: string;
  kind: 'in' | 'out';
  movement: BookMovement | null;
}

const SECTIONS = [
  { icon: Library, label: 'Existencias', value: 'stock' as const },
  { icon: History, label: 'Movimientos', value: 'movements' as const },
];

const BookInventoryView = () => {
  const permissions = usePermissions();
  const rowPermissions = useRowPermissions('bookInventory');
  const { data: books, isLoading: isLoadingBooks } = useLiveCollection('books');
  const { data: movements, isLoading: isLoadingMovements } = useLiveCollection('bookMovements');
  const classes = useLiveData('classes');
  const { data: students } = useStudentDirectory();
  const [section, setSection] = useState<InventorySection>('stock');
  const [search, setSearch] = useState('');
  const [classFilter, setClassFilter] = useState('');
  const [bookEditor, setBookEditor] = useState<{ book: Book | null } | null>(null);
  const [movementEditor, setMovementEditor] = useState<MovementEditor | null>(null);
  const [bookToDelete, setBookToDelete] = useState<Book | null>(null);
  const [movementToDelete, setMovementToDelete] = useState<BookMovement | null>(null);

  const canCreate = permissions.can('bookInventory', 'create');
  const stockByBook = computeBookStock(movements);
  const classNames = buildNameMap(classes);
  const studentNames = buildNameMap(students);
  const allRows = toBookStockRows(books, stockByBook, classNames);
  const stockRows = allRows.filter(
    (row) =>
      (!classFilter || row.book.classId === classFilter) && matchesSearch([row.book.name, row.book.code ?? ''], search),
  );
  const visibleMovements = movements.filter((movement) => {
    const book = books.find((candidate) => candidate.id === movement.bookId);
    return (!classFilter || book?.classId === classFilter) && matchesSearch([movement.bookName], search);
  });
  const totalStock = allRows.reduce((sum, row) => sum + Math.max(row.stock.stock, 0), 0);
  const totalSold = allRows.reduce((sum, row) => sum + row.stock.sold, 0);
  const lowStockCount = allRows.filter((row) => row.stock.in > 0 && row.stock.stock <= LOW_STOCK).length;
  const showLoadBanner = canCreate && !isLoadingBooks && isOrderFormPending(books);
  const isLoading = isLoadingBooks || isLoadingMovements;

  const handleDeleteBook = async (book: Book) => {
    if (movements.some((movement) => movement.bookId === book.id)) {
      throw new UserFacingError('Este libro tiene movimientos. Bórralos primero o deja el libro sin cambios.');
    }
    await booksService.delete(book.id);
  };

  const handleExport = () =>
    section === 'stock'
      ? exportToExcel('Inventario de libros', BOOK_STOCK_EXPORT_COLUMNS, stockRows)
      : exportToExcel('Movimientos de libros', buildMovementExportColumns(studentNames), visibleMovements);

  return (
    <div className="view">
      <ViewHeader
        subtitle="Entran con su pedido; salen al venderse en Pagos o por daño o regalo."
        title="Inventario de libros"
      >
        <SearchInput label="Buscar libro" onChange={setSearch} placeholder="Libro o código…" value={search} />
        {permissions.can('bookInventory', 'export') && (
          <ExportButton disabled={books.length === 0} onExport={handleExport} />
        )}
        {canCreate && (
          <>
            <button className="btn btn-secondary" onClick={() => setBookEditor({ book: null })} type="button">
              <Plus size={18} />
              Agregar libro
            </button>
            <button
              className="btn btn-secondary"
              onClick={() => setMovementEditor({ bookId: '', kind: 'out', movement: null })}
              type="button"
            >
              <ArrowUpFromLine size={18} />
              Registrar salida
            </button>
            <button
              className="btn btn-primary"
              onClick={() => setMovementEditor({ bookId: '', kind: 'in', movement: null })}
              type="button"
            >
              <ArrowDownToLine size={18} />
              Registrar entrada
            </button>
          </>
        )}
      </ViewHeader>
      {showLoadBanner && <LoadOrderFormBanner books={books} classes={classes} />}
      <div className="inventory-stats">
        <StatCard detail="en el catálogo" icon={BookOpenCheck} label="Libros" value={String(books.length)} />
        <StatCard
          detail="sumando todos los libros"
          icon={PackageCheck}
          label="En existencia"
          value={String(totalStock)}
        />
        <StatCard detail="desde Pagos" icon={ShoppingBag} label="Vendidos" value={String(totalSold)} />
        <StatCard
          detail={`con ${LOW_STOCK} o menos`}
          icon={PackageX}
          label="Por agotarse"
          value={pluralize(lowStockCount, 'libro', 'libros')}
        />
      </div>
      <div className="view-toolbar">
        <SegmentedTabs label="Qué ver" onChange={setSection} tabs={SECTIONS} value={section} />
        <FilterChips
          allLabel="Todas las clases"
          label="Filtrar por clase"
          onChange={setClassFilter}
          options={toSelectOptions(classes)}
          value={classFilter}
        />
      </div>
      <section className="panel panel-body-flush">
        {isLoading && <ListSkeleton rows={8} />}
        {!isLoading && section === 'stock' && stockRows.length === 0 && (
          <EmptyState icon={Library} text="Agrega un libro o carga los del formulario de pedido." title="Sin libros" />
        )}
        {!isLoading && section === 'stock' && stockRows.length > 0 && (
          <BookStockTable
            canMove={canCreate}
            onDelete={setBookToDelete}
            onEdit={(book) => setBookEditor({ book })}
            onMove={(book, kind) => setMovementEditor({ bookId: book.id, kind, movement: null })}
            rowPermissions={rowPermissions}
            rows={stockRows}
          />
        )}
        {!isLoading && section === 'movements' && visibleMovements.length === 0 && (
          <EmptyState
            icon={History}
            text="Aquí aparecen las entradas, las salidas y las ventas hechas en Pagos."
            title="Sin movimientos todavía"
          />
        )}
        {!isLoading && section === 'movements' && visibleMovements.length > 0 && (
          <BookMovementTable
            movements={visibleMovements}
            onDelete={setMovementToDelete}
            onEdit={(movement) =>
              setMovementEditor({ bookId: movement.bookId, kind: movement.kind === 'in' ? 'in' : 'out', movement })
            }
            rowPermissions={rowPermissions}
            studentNames={studentNames}
          />
        )}
      </section>
      {bookEditor && (
        <BookForm
          book={bookEditor.book}
          books={books}
          classes={classes}
          key={bookEditor.book?.id ?? 'new'}
          onClose={() => setBookEditor(null)}
        />
      )}
      {movementEditor && (
        <MovementForm
          books={books}
          defaultBookId={movementEditor.bookId}
          key={movementEditor.movement?.id ?? `${movementEditor.kind}-${movementEditor.bookId}`}
          kind={movementEditor.kind}
          movement={movementEditor.movement}
          onClose={() => setMovementEditor(null)}
          stockByBook={stockByBook}
        />
      )}
      {bookToDelete && (
        <ConfirmDialog
          confirmLabel="Eliminar libro"
          description={`Se eliminará "${bookToDelete.name}" del catálogo de libros.`}
          item={bookToDelete}
          onCancel={() => setBookToDelete(null)}
          onConfirm={handleDeleteBook}
          title="Eliminar libro"
        />
      )}
      {movementToDelete && (
        <ConfirmDialog
          confirmLabel="Eliminar movimiento"
          description={`Se quitará este movimiento de ${movementToDelete.quantity} "${movementToDelete.bookName}" y el stock se recalcula.`}
          item={movementToDelete}
          onCancel={() => setMovementToDelete(null)}
          onConfirm={deleteManualMovement}
          title="Eliminar movimiento"
        />
      )}
    </div>
  );
};

export default BookInventoryView;
