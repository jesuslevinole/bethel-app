import RowActions from '../../../shared/components/RowActions';
import type { CatalogRecord, RowPermissions } from '../../../types/index';
import { getSemesterLabel } from '../../../utils/classDays';
import { hasClassField, type CatalogDefinition } from '../catalogDefinitions';

interface CatalogItemRowProps {
  classNames: Map<string, string>;
  definition: CatalogDefinition;
  item: CatalogRecord;
  onDelete: (item: CatalogRecord) => void;
  onEdit: (item: CatalogRecord) => void;
  rowPermissions: RowPermissions;
}

// Texto corto con los campos extra del catálogo (cuenta, teléfono, orden…).
const getDetailText = (definition: CatalogDefinition, item: CatalogRecord, classNames: Map<string, string>) =>
  definition.extraFields
    .map((field) => {
      if (field.name === 'classId') return (item.classId && classNames.get(item.classId)) || 'Sin clase';
      if (field.name === 'semester') return getSemesterLabel(item.semester) || 'Sin semestre';
      if (field.name === 'usesBank') return item.usesBank ? 'Llega al banco' : 'Sin banco';
      if (field.name === 'order') return `Orden ${item.order ?? '—'}`;
      const textValue = String(item[field.name] ?? '').trim();
      return textValue ? `${field.label} ${textValue}` : '';
    })
    .filter(Boolean)
    .join(', ');

const CatalogItemRow = ({ classNames, definition, item, onDelete, onEdit, rowPermissions }: CatalogItemRowProps) => {
  const detailText = getDetailText(definition, item, classNames);

  return (
    <div className="catalog-row">
      <span className="catalog-row-name">{item.name}</span>
      {detailText && (
        <span className={`catalog-row-detail${hasClassField(definition) ? ' is-always-visible' : ''}`}>{detailText}</span>
      )}
      <RowActions
        canDelete={rowPermissions.canDelete}
        canEdit={rowPermissions.canEdit}
        itemLabel={item.name}
        onDelete={() => onDelete(item)}
        onEdit={() => onEdit(item)}
      />
    </div>
  );
};

export default CatalogItemRow;
