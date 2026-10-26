import { Pencil, Trash2 } from 'lucide-react';

interface RowActionsProps {
  canDelete?: boolean;
  canEdit?: boolean;
  itemLabel: string;
  onDelete: () => void;
  onEdit: () => void;
}

// Editar / eliminar de una fila. Cada botón aparece solo si el rol tiene ese permiso.
const RowActions = ({ canDelete = true, canEdit = true, itemLabel, onDelete, onEdit }: RowActionsProps) => {
  if (!canEdit && !canDelete) return null;

  return (
    <div className="row-actions">
      {canEdit && (
        <button aria-label={`Editar ${itemLabel}`} className="btn btn-icon" onClick={onEdit} title="Editar" type="button">
          <Pencil size={17} />
        </button>
      )}
      {canDelete && (
        <button
          aria-label={`Eliminar ${itemLabel}`}
          className="btn btn-icon is-danger"
          onClick={onDelete}
          title="Eliminar"
          type="button"
        >
          <Trash2 size={17} />
        </button>
      )}
    </div>
  );
};

export default RowActions;
