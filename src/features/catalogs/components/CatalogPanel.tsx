import { Plus } from 'lucide-react';
import { useState } from 'react';
import { usePermissions, useRowPermissions } from '../../auth/hooks/usePermissions';
import ConfirmDialog from '../../../shared/components/ConfirmDialog';
import EmptyState from '../../../shared/components/EmptyState';
import ExportButton from '../../../shared/components/ExportButton';
import FilterChips from '../../../shared/components/FilterChips';
import ListSkeleton from '../../../shared/components/ListSkeleton';
import SearchInput from '../../../shared/components/SearchInput';
import { useLiveCollection } from '../../../shared/data/liveCollections';
import { assertNotReferenced } from '../../../shared/data/references';
import { exportToExcel } from '../../../shared/export/exportToExcel';
import type { CatalogRecord, SchoolClass } from '../../../types/index';
import { SEMESTER_OPTIONS } from '../../../utils/classDays';
import { buildNameMap } from '../../../utils/relations';
import { matchesSearch } from '../../../utils/search';
import { hasClassField, hasSemesterField, type CatalogDefinition } from '../catalogDefinitions';
import { getCatalogExportColumns } from '../catalogExport';
import CatalogItemForm from './CatalogItemForm';
import CatalogItemRow from './CatalogItemRow';

interface CatalogPanelProps {
  definition: CatalogDefinition;
  isLoading: boolean;
  items: CatalogRecord[];
}

const SEARCH_THRESHOLD = 8;
const NO_CLASS_FILTER = 'none';

// Materias y libros se ven agrupados por clase (en el orden de las clases), luego por semestre y nombre.
const sortByClass = (items: CatalogRecord[], classes: SchoolClass[]) => {
  const classOrder = new Map(classes.map((schoolClass, index) => [schoolClass.id, index]));
  const getClassPosition = (item: CatalogRecord) => classOrder.get(item.classId ?? '') ?? classes.length;
  return [...items].sort(
    (first, second) =>
      getClassPosition(first) - getClassPosition(second) ||
      (first.semester ?? 3) - (second.semester ?? 3) ||
      first.name.localeCompare(second.name, 'es', { numeric: true }),
  );
};

const matchesClassFilter = (item: CatalogRecord, classFilter: string) => {
  if (!classFilter) return true;
  if (classFilter === NO_CLASS_FILTER) return !item.classId;
  return item.classId === classFilter;
};

// editingId: null = nada abierto, 'new' = agregando, otro valor = id del elemento en edición.
const CatalogPanel = ({ definition, isLoading, items }: CatalogPanelProps) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [itemToDelete, setItemToDelete] = useState<CatalogRecord | null>(null);
  const [search, setSearch] = useState('');
  const [classFilter, setClassFilter] = useState('');
  const [semesterFilter, setSemesterFilter] = useState('');
  const { data: classes } = useLiveCollection('classes');
  const permissions = usePermissions();
  const rowPermissions = useRowPermissions('catalogs');
  const canCreate = permissions.can('catalogs', 'create');

  const usesClass = hasClassField(definition);
  const usesSemester = hasSemesterField(definition);
  const classNames = buildNameMap(classes);
  const sortedItems = usesClass ? sortByClass(items, classes) : items;
  const visibleItems = sortedItems.filter(
    (item) =>
      matchesSearch([item.name], search) &&
      (!usesClass || matchesClassFilter(item, classFilter)) &&
      (!usesSemester || !semesterFilter || String(item.semester ?? '') === semesterFilter),
  );
  const hasItemsWithoutClass = usesClass && items.some((item) => !item.classId);
  const classOptions = [
    ...classes.map((schoolClass) => ({ label: schoolClass.name, value: schoolClass.id })),
    ...(hasItemsWithoutClass ? [{ label: 'Sin clase', value: NO_CLASS_FILTER }] : []),
  ];
  const defaultClassId = classFilter === NO_CLASS_FILTER ? '' : classFilter;
  const showSearch = items.length > SEARCH_THRESHOLD;
  const showToolbar = showSearch || (usesClass && items.length > 0);
  const isEmpty = !isLoading && items.length === 0 && editingId !== 'new';

  const handleDelete = async (item: CatalogRecord) => {
    await assertNotReferenced(definition.references, item.id);
    await definition.service.delete(item.id);
  };

  const closeForm = () => setEditingId(null);

  const renderItem = (item: CatalogRecord) => {
    if (editingId === item.id) {
      return (
        <CatalogItemForm
          classes={classes}
          definition={definition}
          item={item}
          items={items}
          key={item.id}
          onClose={closeForm}
        />
      );
    }
    return (
      <CatalogItemRow
        classNames={classNames}
        definition={definition}
        item={item}
        key={item.id}
        onDelete={setItemToDelete}
        onEdit={(itemToEdit) => setEditingId(itemToEdit.id)}
        rowPermissions={rowPermissions}
      />
    );
  };

  return (
    <section className="panel">
      <header className="panel-header">
        <div>
          <h2 className="panel-title">{definition.title}</h2>
          <p className="catalog-panel-intro">{definition.description}</p>
        </div>
        <div className="catalog-panel-actions">
          {permissions.can('catalogs', 'export') && (
            <ExportButton
              disabled={visibleItems.length === 0}
              onExport={() =>
                exportToExcel(definition.title, getCatalogExportColumns(definition, classNames), visibleItems)
              }
            />
          )}
          {canCreate && (
            <button className="btn btn-primary" onClick={() => setEditingId('new')} type="button">
              <Plus size={18} />
              Agregar
            </button>
          )}
        </div>
      </header>
      {showToolbar && (
        <div className="catalog-toolbar">
          {showSearch && (
            <SearchInput
              label={`Buscar en ${definition.title.toLowerCase()}`}
              onChange={setSearch}
              placeholder={`Buscar ${definition.singular}…`}
              value={search}
            />
          )}
          {(usesClass || usesSemester) && (
            <div className="catalog-filters">
              {usesClass && (
                <FilterChips allLabel="Todas" label="Clase" onChange={setClassFilter} options={classOptions} value={classFilter} />
              )}
              {usesSemester && (
                <FilterChips
                  allLabel="Ambos semestres"
                  label="Semestre"
                  onChange={setSemesterFilter}
                  options={SEMESTER_OPTIONS}
                  value={semesterFilter}
                />
              )}
            </div>
          )}
        </div>
      )}
      {isLoading && <ListSkeleton />}
      {isEmpty && (
        <EmptyState
          icon={definition.icon}
          text={`Todavía no hay registros en ${definition.title.toLowerCase()}.`}
          title={`Sin ${definition.title.toLowerCase()} todavía`}
        />
      )}
      <div className="catalog-list">
        {editingId === 'new' && (
          <CatalogItemForm
            classes={classes}
            defaultClassId={defaultClassId}
            defaultSemester={semesterFilter}
            definition={definition}
            item={null}
            items={items}
            onClose={closeForm}
          />
        )}
        {visibleItems.map(renderItem)}
      </div>
      {!isLoading && items.length > 0 && visibleItems.length === 0 && (
        <p className="catalog-no-results">Ningún registro coincide con el filtro.</p>
      )}
      {itemToDelete && (
        <ConfirmDialog
          confirmLabel="Eliminar"
          description={`Se eliminará "${itemToDelete.name}" de ${definition.title.toLowerCase()}. Esta acción no se puede deshacer.`}
          item={itemToDelete}
          onCancel={() => setItemToDelete(null)}
          onConfirm={handleDelete}
          title={`Eliminar ${definition.singular}`}
        />
      )}
    </section>
  );
};

export default CatalogPanel;
