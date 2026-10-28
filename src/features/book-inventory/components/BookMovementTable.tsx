import RowActions from '../../../shared/components/RowActions';
import type { BookMovement, RowPermissions } from '../../../types/index';
import { formatDate } from '../../../utils/dateFormat';
import { useColumnLabels } from '../../customization/useColumnLabels';
import { MOVEMENT_KIND_BADGES, MOVEMENT_KIND_LABELS } from '../bookStock';
import { describeMovement } from '../movementDetail';

interface BookMovementTableProps {
  movements: BookMovement[];
  onDelete: (movement: BookMovement) => void;
  onEdit: (movement: BookMovement) => void;
  rowPermissions: RowPermissions;
  studentNames: Map<string, string>;
}

// Historial del inventario. Las ventas se corrigen desde su pago (no aquí).
const BookMovementTable = ({ movements, onDelete, onEdit, rowPermissions, studentNames }: BookMovementTableProps) => {
  const columnLabel = useColumnLabels('bookMovements');

  return (
    <div className="table-wrap">
      <table className="table table-stack">
        <thead>
          <tr>
            <th scope="col">{columnLabel('date')}</th>
            <th scope="col">{columnLabel('book')}</th>
            <th scope="col">{columnLabel('kind')}</th>
            <th className="cell-num" scope="col">
              {columnLabel('quantity')}
            </th>
            <th scope="col">{columnLabel('detail')}</th>
            <th scope="col">
              <span className="visually-hidden">Acciones</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {movements.map((movement) => (
            <tr key={movement.id}>
              <td className="cell-date" data-label={columnLabel('date')}>
                {formatDate(movement.date)}
              </td>
              <td className="cell-strong" data-label={columnLabel('book')}>
                {movement.bookName}
              </td>
              <td data-label={columnLabel('kind')}>
                <span className={MOVEMENT_KIND_BADGES[movement.kind]}>{MOVEMENT_KIND_LABELS[movement.kind]}</span>
              </td>
              <td className="cell-num" data-label={columnLabel('quantity')}>
                {movement.quantity}
              </td>
              <td className="cell-muted" data-label={columnLabel('detail')}>
                {describeMovement(movement, studentNames)}
              </td>
              <td className="cell-actions">
                {movement.kind !== 'sale' && (
                  <RowActions
                    canDelete={rowPermissions.canDelete}
                    canEdit={rowPermissions.canEdit}
                    itemLabel={`el movimiento de ${movement.bookName}`}
                    onDelete={() => onDelete(movement)}
                    onEdit={() => onEdit(movement)}
                  />
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default BookMovementTable;
