import type { ExportColumn } from '../../shared/export/exportToExcel';
import type { CatalogRecord } from '../../types/index';
import type { CatalogDefinition } from './catalogDefinitions';

// Nombre + los campos que declara el catálogo (clase, orden, teléfono, cuenta…).
export const getCatalogExportColumns = (
  definition: CatalogDefinition,
  classNames: Map<string, string>,
): ExportColumn<CatalogRecord>[] => [
  { header: definition.nameLabel, value: (item) => item.name, width: 34 },
  ...definition.extraFields.map<ExportColumn<CatalogRecord>>((field) => ({
    header: field.label,
    value: (item) => {
      if (field.name === 'classId') return item.classId ? (classNames.get(item.classId) ?? '') : '';
      if (field.name === 'usesBank') return item.usesBank ? 'Sí' : 'No';
      return item[field.name] ?? '';
    },
  })),
];
