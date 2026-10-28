import { ArrowDownToLine, ArrowUpFromLine } from 'lucide-react';
import RowActions from '../../../shared/components/RowActions';
import type { Book, RowPermissions } from '../../../types/index';
import { formatMoney } from '../../../utils/money';
import { useColumnLabels } from '../../customization/useColumnLabels';
import type { BookStockRow } from '../bookRows';
import { LOW_STOCK } from '../bookStock';

interface BookStockTableProps {
  canMove: boolean;
  onDelete: (book: Book) => void;
  onEdit: (book: Book) => void;
  onMove: (book: Book, kind: 'in' | 'out') => void;
  rowPermissions: RowPermissions;
  rows: BookStockRow[];
}

const getStockClassName = (stock: number) => {
  if (stock <= 0) return 'stock-pill is-empty';
  if (stock <= LOW_STOCK) return 'stock-pill is-low';
  return 'stock-pill';
};

// Existencias de cada libro, como la hoja de AppSheet: entrada, salida, venta, stock y precio.
const BookStockTable = ({ canMove, onDelete, onEdit, onMove, rowPermissions, rows }: BookStockTableProps) => {
  const columnLabel = useColumnLabels('bookStock');

  return (
    <div className="table-wrap">
      <table className="table table-stack">
        <thead>
          <tr>
            <th scope="col">{columnLabel('code')}</th>
            <th scope="col">{columnLabel('name')}</th>
            <th scope="col">{columnLabel('className')}</th>
            <th className="cell-num" scope="col">
              {columnLabel('in')}
            </th>
            <th className="cell-num" scope="col">
              {columnLabel('out')}
            </th>
            <th className="cell-num" scope="col">
              {columnLabel('sold')}
            </th>
            <th className="cell-num" scope="col">
              {columnLabel('stock')}
            </th>
            <th className="cell-num" scope="col">
              {columnLabel('price')}
            </th>
            <th scope="col">
              <span className="visually-hidden">Acciones</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map(({ book, className, stock }) => (
            <tr key={book.id}>
              <td className="cell-id" data-label={columnLabel('code')}>
                {book.code || '—'}
              </td>
              <td className="cell-strong" data-label={columnLabel('name')}>
                {book.name}
                {book.isOptional && <span className="badge badge-muted test-data-badge">Opcional</span>}
              </td>
              <td data-label={columnLabel('className')}>{className}</td>
              <td className="cell-num" data-label={columnLabel('in')}>
                {stock.in}
              </td>
              <td className="cell-num" data-label={columnLabel('out')}>
                {stock.out}
              </td>
              <td className="cell-num" data-label={columnLabel('sold')}>
                {stock.sold}
              </td>
              <td className="cell-num" data-label={columnLabel('stock')}>
                <span className={getStockClassName(stock.stock)}>{stock.stock}</span>
              </td>
              <td className="cell-num" data-label={columnLabel('price')}>
                {book.price !== undefined ? formatMoney(book.price) : '—'}
              </td>
              <td className="cell-actions">
                <div className="book-row-actions">
                  {canMove && (
                    <>
                      <button
                        aria-label={`Registrar entrada de ${book.name}`}
                        className="btn btn-icon"
                        onClick={() => onMove(book, 'in')}
                        title="Registrar entrada"
                        type="button"
                      >
                        <ArrowDownToLine size={17} />
                      </button>
                      <button
                        aria-label={`Registrar salida de ${book.name}`}
                        className="btn btn-icon"
                        onClick={() => onMove(book, 'out')}
                        title="Registrar salida (dañado, regalado…)"
                        type="button"
                      >
                        <ArrowUpFromLine size={17} />
                      </button>
                    </>
                  )}
                  <RowActions
                    canDelete={rowPermissions.canDelete}
                    canEdit={rowPermissions.canEdit}
                    itemLabel={book.name}
                    onDelete={() => onDelete(book)}
                    onEdit={() => onEdit(book)}
                  />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default BookStockTable;
